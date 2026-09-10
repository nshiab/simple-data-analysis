import { assertEquals, assertRejects } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import { existsSync, rmSync } from "node:fs";
import {
  FakeGeminiEmbeddingFetch,
  FakeOllamaEmbeddingClient,
} from "../helpers/fakeEmbeddingClients.ts";
import {
  geminiEmbeddingOptions,
  hasGoogleEmbeddingCredentials,
} from "../helpers/realEmbeddingOptions.ts";

const geminiEmbeddings = {
  ...geminiEmbeddingOptions,
} as const;
const ollamaEmbeddings = {
  provider: "ollama",
  cache: false,
} as const;

function clearEmbeddingCaches(): void {
  for (const path of ["./.sda-cache", "./.journalism-cache"]) {
    if (existsSync(path)) {
      rmSync(path, { recursive: true });
    }
  }
}

for (const name of ["ranking_probe", "ranking$probe", "Ranking_Épreuve"]) {
  for (const vectorSearch of [false, true]) {
    Deno.test(`hybridSearch preserves FTS table name ${name} (vectorSearch=${vectorSearch})`, async () => {
      const sdb = new SimpleDB();
      try {
        const table = sdb.newTable(name);
        await table.loadArray([
          { id: "a", text: "zebra" },
          { id: "b", text: "other" },
        ]).run();

        const result = table.hybridSearch("zebra", "id", "text", 1, {
          bm25: true,
          vectorSearch,
          outputTable: "result",
          embeddings: {
            provider: "ollama",
            model: "fts-table-name-test",
            cache: false,
            ollama: new FakeOllamaEmbeddingClient(
              "http://fts.local:11434",
              [1, 0],
            ),
          },
        });

        const rows = await result.getData();
        assertEquals(rows.map((row) => row.id), ["a"]);
      } finally {
        await sdb.close();
      }
    });
  }
}

Deno.test("hybridSearch preserves geometry columns with table caching", async () => {
  const directory = await Deno.makeTempDir();
  const originalDirectory = Deno.cwd();
  try {
    Deno.chdir(directory);
    const geometry = { type: "Point", coordinates: [-73.5, 45.5] };
    for (const cached of [false, true]) {
      const sdb = new SimpleDB();
      try {
        const table = sdb.newTable("geometry_search");
        await table.loadArray([{ id: "a", text: "alpha", geometry }], {
          columnTypes: { geometry: "GEOMETRY('EPSG:4326')" },
        }).run();
        const client = new FakeOllamaEmbeddingClient(
          "http://geometry.local:11434",
          [1, 0],
        );
        const result = table.hybridSearch("query", "id", "text", 1, {
          embeddings: {
            provider: "ollama",
            model: "geometry-model",
            ollama: client,
          },
          outputTable: "results",
        });
        await result.run();
        assertEquals(
          (await result.getTypes()).geometry,
          "GEOMETRY('EPSG:4326')",
        );
        assertEquals(
          await sdb.customQuery(
            `SELECT ST_AsText(geometry) AS wkt FROM "${result.name}"`,
            { returnData: true },
          ),
          [{ wkt: "POINT (-73.5 45.5)" }],
        );
        assertEquals(client.requests, cached ? 0 : 2);
        assertEquals(existsSync("./.sda-cache"), true);
      } finally {
        await sdb.close();
      }
    }
  } finally {
    Deno.chdir(originalDirectory);
    await Deno.remove(directory, { recursive: true });
  }
});

Deno.test("hybridSearch trusts existing embeddings after text changes and reopening", async () => {
  const directory = await Deno.makeTempDir();
  let sdb = new SimpleDB({ file: `${directory}/embeddings.db` });
  try {
    let table = sdb.newTable("texts");
    const client = new FakeOllamaEmbeddingClient("http://trust.local:11434", [
      1,
      0,
    ]);
    const embeddings = {
      provider: "ollama" as const,
      model: "trust-model",
      ollama: client,
      cache: false,
    };
    await table.loadArray([{ id: "a", text: "alpha" }])
      .aiEmbeddings("text", "text_embeddings", { embeddings }).run();
    await table.replace("text", { alpha: "changed" }).run();
    for (const reopen of [false, true]) {
      if (reopen) {
        await sdb.close();
        sdb = new SimpleDB({ file: `${directory}/embeddings.db` });
        table = await sdb.getTable("texts");
      }
      const before = client.requests;
      await table.hybridSearch("query", "id", "text", 1, {
        embeddings,
        bm25: false,
        outputTable: reopen ? "reopened_results" : "results",
      }).run();
      // Only the query is embedded; the existing document vector is trusted.
      assertEquals(client.requests - before, 1);
      assertEquals(await table.getData(), [{
        id: "a",
        text: "changed",
        text_embeddings: [1, 0],
      }]);
    }
  } finally {
    await sdb.close();
    await Deno.remove(directory, { recursive: true });
  }
});

Deno.test(
  "hybridSearch regenerates embeddings when providers change at equal dimensions",
  async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("provider_change");
    table.loadArray([
      { id: "a", text: "alpha" },
      { id: "b", text: "beta" },
    ]);

    const ollamaClient = new FakeOllamaEmbeddingClient(
      "http://ollama.local:11434",
      [1, 0],
    );
    const ollamaResults = table.hybridSearch("alpha", "id", "text", 1, {
      embeddings: {
        provider: "ollama",
        model: "same-model-label",
        ollama: ollamaClient,
        cache: false,
      },
      bm25: false,
      outputTable: "ollama_results",
    }).selectColumns("id");
    await ollamaResults.run();
    assertEquals(ollamaClient.requests, 3);

    const originalFetch = globalThis.fetch;
    const geminiFetch = new FakeGeminiEmbeddingFetch([0, 1]);
    globalThis.fetch = geminiFetch.fetch;
    try {
      await table.hybridSearch("alpha", "id", "text", 1, {
        embeddings: {
          provider: "gemini",
          model: "same-model-label",
          apiKey: "fake-key",
          cache: false,
        },
        bm25: false,
        outputTable: "gemini_results",
      }).run();
    } finally {
      globalThis.fetch = originalFetch;
    }
    assertEquals(geminiFetch.requests, 3);

    await sdb.close();
  },
);

Deno.test("hybridSearch caches tables by default for each embedding identity", async () => {
  clearEmbeddingCaches();

  try {
    const sdb = new SimpleDB();
    const table = sdb.newTable("cache_identity");
    table.loadArray([
      { id: "a", text: "cache alpha" },
      { id: "b", text: "cache beta" },
    ]);

    const firstClient = new FakeOllamaEmbeddingClient(
      "http://cache.local:11434",
      [1, 0],
    );
    await table.hybridSearch("cache alpha", "id", "text", 1, {
      embeddings: {
        provider: "ollama",
        model: "cache-model-a",
        ollama: firstClient,
      },
      bm25: false,
      outputTable: "cache_results_a",
    }).run();

    const secondClient = new FakeOllamaEmbeddingClient(
      "http://cache.local:11434",
      [0, 1],
    );
    await table.hybridSearch("cache alpha", "id", "text", 1, {
      embeddings: {
        provider: "ollama",
        model: "cache-model-b",
        ollama: secondClient,
      },
      bm25: false,
      outputTable: "cache_results_b",
    }).run();

    const sources = JSON.parse(
      Deno.readTextFileSync("./.sda-cache/sources.json"),
    ) as Record<string, unknown>;
    assertEquals(
      Object.keys(sources).filter((key) => key.startsWith("cache_identity."))
        .length,
      2,
    );
    await sdb.close();
  } finally {
    clearEmbeddingCaches();
  }
});

Deno.test("hybridSearch does not cache tables when disabled", async () => {
  clearEmbeddingCaches();

  try {
    const sdb = new SimpleDB();
    const table = sdb.newTable("cache_disabled");
    table.loadArray([
      { id: "a", text: "alpha" },
      { id: "b", text: "beta" },
    ]);

    await table.hybridSearch("alpha", "id", "text", 1, {
      embeddings: {
        provider: "ollama",
        model: "no-cache-model",
        ollama: new FakeOllamaEmbeddingClient(
          "http://no-cache.local:11434",
          [1, 0],
        ),
        cache: false,
      },
      bm25: false,
      outputTable: "no_cache_results",
    }).run();

    assertEquals(existsSync("./.sda-cache"), false);
    assertEquals(existsSync("./.journalism-cache"), false);
    await sdb.close();
  } finally {
    clearEmbeddingCaches();
  }
});

Deno.test("hybridSearch isolates table caches by source mapping", async () => {
  clearEmbeddingCaches();

  try {
    const sdb = new SimpleDB();
    const table = sdb.newTable("cache_source_mapping");
    table.loadArray([
      { id: "a", title: "alpha title", body: "alpha body" },
      { id: "b", title: "beta title", body: "beta body" },
    ]);
    const embeddings = {
      provider: "ollama",
      model: "cache-model",
      ollama: new FakeOllamaEmbeddingClient(
        "http://cache.local:11434",
        [1, 0],
      ),
    } as const;

    await table.hybridSearch("alpha", "id", "title", 1, {
      embeddings,
      bm25: false,
      outputTable: "title_results",
    }).run();
    await table.hybridSearch("alpha", "id", "body", 1, {
      embeddings,
      bm25: false,
      outputTable: "body_results",
    }).run();

    assertEquals(await table.hasColumn("title_embeddings"), true);
    assertEquals(await table.hasColumn("body_embeddings"), true);
    const sources = JSON.parse(
      Deno.readTextFileSync("./.sda-cache/sources.json"),
    ) as Record<string, unknown>;
    assertEquals(
      Object.keys(sources).filter((key) =>
        key.startsWith("cache_source_mapping.")
      ).length,
      2,
    );
    await sdb.close();
  } finally {
    clearEmbeddingCaches();
  }
});

if (hasGoogleEmbeddingCredentials) {
  clearEmbeddingCaches();

  Deno.test(
    "should perform hybrid search and return a table",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const originalNbRows = await table.getRowCount();

      await table.hybridSearch(
        "buttery pastry for breakfast",
        "Dish",
        "Recipe",
        10,
        {
          embeddings: geminiEmbeddings,
          embeddingsConcurrency: 100,
          verbose: true,
        },
      ).run();
      const results = table;

      // Should return the same table instance when no outputTable is specified
      assertEquals(results, table);

      // Table should be modified to contain only the search results
      const nbRows = await table.getRowCount();
      assertEquals(nbRows <= 10, true);
      assertEquals(nbRows < originalNbRows, true);

      // Verify it has the expected columns
      const columns = await table.getColumns();
      assertEquals(columns.includes("Dish"), true);
      assertEquals(columns.includes("Recipe"), true);

      await sdb.close();
    },
  );

  Deno.test(
    "should perform hybrid search with cached embeddings",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const nbRows = await table.hybridSearch(
        "spicy vegan lunch",
        "Dish",
        "Recipe",
        5,
        {
          embeddings: { ...geminiEmbeddings, cache: true },
          embeddingsConcurrency: 100,
        },
      ).getRowCount();
      assertEquals(nbRows <= 5, true);

      await sdb.close();
    },
  );

  Deno.test(
    "should perform hybrid search with custom output table",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      await table.hybridSearch(
        "italian cuisine",
        "Dish",
        "Recipe",
        5,
        {
          embeddings: geminiEmbeddings,
          embeddingsConcurrency: 100,
          outputTable: "italian_search_results",
        },
      ).run();
      const results = await sdb.getTable("italian_search_results");

      // Verify the output table name
      assertEquals(results.name, "italian_search_results");

      // Verify original table is unchanged
      const originalNbRows = await table.getRowCount();
      assertEquals(originalNbRows > 5, true);

      await sdb.close();
    },
  );

  Deno.test(
    "should perform hybrid search with custom BM25 parameters",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const nbRows = await table.hybridSearch(
        "french cuisine",
        "Dish",
        "Recipe",
        5,
        {
          embeddings: geminiEmbeddings,
          embeddingsConcurrency: 100,
          stemmer: "french",
          k: 1.5,
          b: 0.8,
        },
      ).getRowCount();
      assertEquals(nbRows <= 5, true);

      await sdb.close();
    },
  );

  Deno.test(
    "should perform hybrid search with index creation",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const nbRows = await table.hybridSearch(
        "dessert",
        "Dish",
        "Recipe",
        3,
        {
          embeddings: geminiEmbeddings,
          createIndex: true,
          verbose: true,
        },
      ).getRowCount();
      assertEquals(nbRows <= 3, true);

      await sdb.close();
    },
  );

  Deno.test(
    "should perform hybrid search with conjunctive option",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      // Run without conjunctive option
      // This will only affect the BM25 part of the search
      await table.hybridSearch(
        "fennel garlic",
        "Dish",
        "Recipe",
        10,
        {
          embeddings: geminiEmbeddings,
          outputTable: "results_conjunctive_false",
        },
      ).log();

      // Run with conjunctive option
      // This will only affect the BM25 part of the search
      const nbRows = await table.hybridSearch(
        "fennel garlic",
        "Dish",
        "Recipe",
        10,
        {
          embeddings: geminiEmbeddings,
          conjunctive: true,
          outputTable: "results_conjunctive_true",
        },
      ).getRowCount();
      assertEquals(nbRows > 0, true);

      await sdb.close();
    },
  );

  Deno.test(
    "should perform hybrid search with FTS options",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const nbRows = await table.hybridSearch("pasta", "Dish", "Recipe", 5, {
        embeddings: geminiEmbeddings,
        stopwords: "english",
        stemmer: "english",
        lower: true,
        stripAccents: true,
        verbose: true,
      }).getRowCount();
      assertEquals(nbRows <= 5, true);

      await sdb.close();
    },
  );
}
if (Deno.env.get("AI_EMBEDDINGS_PROVIDER") === "ollama") {
  clearEmbeddingCaches();

  Deno.test(
    "should perform hybrid search and return a table",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const originalNbRows = await table.getRowCount();

      await table.hybridSearch(
        "buttery pastry for breakfast",
        "Dish",
        "Recipe",
        10,
        {
          embeddings: ollamaEmbeddings,
          verbose: true,
        },
      ).run();
      const results = table;

      // Should return the same table instance when no outputTable is specified
      assertEquals(results, table);

      // Table should be modified to contain only the search results
      const nbRows = await table.getRowCount();
      assertEquals(nbRows <= 10, true);
      assertEquals(nbRows < originalNbRows, true);

      // Verify it has the expected columns
      const columns = await table.getColumns();
      assertEquals(columns.includes("Dish"), true);
      assertEquals(columns.includes("Recipe"), true);

      await sdb.close();
    },
  );

  Deno.test(
    "should perform hybrid search with cached embeddings",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const nbRows = await table.hybridSearch(
        "spicy vegan lunch",
        "Dish",
        "Recipe",
        5,
        {
          embeddings: { ...ollamaEmbeddings, cache: true },
        },
      ).getRowCount();
      assertEquals(nbRows <= 5, true);

      await sdb.close();
    },
  );

  Deno.test(
    "should perform hybrid search with custom output table",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      await table.hybridSearch(
        "italian cuisine",
        "Dish",
        "Recipe",
        5,
        {
          embeddings: ollamaEmbeddings,
          outputTable: "italian_search_results",
        },
      ).run();
      const results = await sdb.getTable("italian_search_results");

      // Verify the output table name
      assertEquals(results.name, "italian_search_results");

      // Verify original table is unchanged
      const originalNbRows = await table.getRowCount();
      assertEquals(originalNbRows > 5, true);

      await sdb.close();
    },
  );

  Deno.test(
    "should perform hybrid search with custom BM25 parameters",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const nbRows = await table.hybridSearch(
        "french cuisine",
        "Dish",
        "Recipe",
        5,
        {
          embeddings: ollamaEmbeddings,
          stemmer: "french",
          k: 1.5,
          b: 0.8,
        },
      ).getRowCount();
      assertEquals(nbRows <= 5, true);

      await sdb.close();
    },
  );

  Deno.test(
    "should perform hybrid search with index creation",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const nbRows = await table.hybridSearch(
        "dessert",
        "Dish",
        "Recipe",
        3,
        {
          embeddings: ollamaEmbeddings,
          createIndex: true,
          verbose: true,
        },
      ).getRowCount();
      assertEquals(nbRows <= 3, true);

      await sdb.close();
    },
  );

  Deno.test(
    "should perform hybrid search with only BM25",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const nbRows = await table.hybridSearch(
        "dessert",
        "Dish",
        "Recipe",
        5,
        {
          embeddings: ollamaEmbeddings,
          vectorSearch: false, // Disable vector search
          bm25: true, // Enable only BM25
          verbose: true,
        },
      ).getRowCount();
      assertEquals(nbRows <= 5, true);

      await sdb.close();
    },
  );

  Deno.test(
    "should perform hybrid search with only vector search",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const nbRows = await table.hybridSearch(
        "healthy breakfast",
        "Dish",
        "Recipe",
        5,
        {
          embeddings: ollamaEmbeddings,
          vectorSearch: true, // Enable only vector search
          bm25: false, // Disable BM25
          verbose: true,
        },
      ).getRowCount();
      assertEquals(nbRows <= 5, true);

      await sdb.close();
    },
  );

  Deno.test(
    "should throw error when both search methods are disabled",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      let errorThrown = false;
      try {
        await table.hybridSearch(
          "test",
          "Dish",
          "Recipe",
          5,
          {
            embeddings: ollamaEmbeddings,
            vectorSearch: false,
            bm25: false,
          },
        ).run();
      } catch (error) {
        errorThrown = true;
        assertEquals(
          (error as Error).message.includes(
            "At least one search method must be enabled",
          ),
          true,
        );
      }

      assertEquals(errorThrown, true);

      await sdb.run();
      await sdb.close();
    },
  );
  Deno.test(
    "should have threshold and new columns for scores",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      await table.hybridSearch(
        "gluten-free dessert",
        "Dish",
        "Recipe",
        10,
        {
          embeddings: ollamaEmbeddings,
          vectorMinSimilarity: 0.6, // Only include vector results with at least 60% similarity
          bm25MinScore: 1.4, // Only include BM25 results with a score above 1.5
          bm25ScoreColumn: "bm25_score", // Add BM25 scores to the results
          vectorSimilarityColumn: "vector_similarity", // Add vector similarity scores to the results
        },
      ).log();

      assertEquals(true, true);

      await sdb.close();
    },
  );
  Deno.test(
    "should should not throw an error when nothing is returned with strict thresholds and score columns",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      await table.hybridSearch(
        "gluten-free dessert",
        "Dish",
        "Recipe",
        10,
        {
          embeddings: ollamaEmbeddings,
          vectorMinSimilarity: 0.9, // Only include vector results with at least 60% similarity
          bm25MinScore: 2, // Only include BM25 results with a score above 1.5
          bm25ScoreColumn: "bm25_score", // Add BM25 scores to the results
          vectorSimilarityColumn: "vector_similarity", // Add vector similarity scores to the results
        },
      ).log();

      assertEquals(true, true);

      await sdb.close();
    },
  );
  Deno.test(
    "should perform hybrid search with conjunctive option",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      // Run without conjunctive option
      // This will only affect the BM25 part of the search
      const resultsConjunctiveFalse = await table.hybridSearch(
        "fennel garlic",
        "Dish",
        "Recipe",
        10,
        {
          embeddings: ollamaEmbeddings,
          outputTable: "results_conjunctive_false",
        },
      ).getRowCount();

      // Run with conjunctive option
      // This will only affect the BM25 part of the search
      const resultsConjunctiveTrue = await table.hybridSearch(
        "fennel garlic",
        "Dish",
        "Recipe",
        10,
        {
          embeddings: ollamaEmbeddings,
          conjunctive: true,
          outputTable: "results_conjunctive_true",
        },
      ).getRowCount();

      assertEquals(
        resultsConjunctiveFalse > 0 && resultsConjunctiveTrue > 0,
        true,
      );

      await sdb.close();
    },
  );

  Deno.test(
    "should perform hybrid search with custom BM25 options",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const nbRows = await table.hybridSearch(
        "italian food",
        "Dish",
        "Recipe",
        5,
        {
          stemmer: "none",
          lower: false,
          stripAccents: false,
          embeddings: ollamaEmbeddings,
          verbose: true,
          outputTable: "custom_bm25_results",
        },
      ).getRowCount();
      assertEquals(nbRows > 0, true);
      assertEquals(nbRows <= 5, true);

      await sdb.close();
    },
  );

  Deno.test(
    "should perform hybrid search with stopwords",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const nbRows = await table.hybridSearch(
        "the a for with dish",
        "Dish",
        "Recipe",
        5,
        {
          stopwords: "english",
          embeddings: ollamaEmbeddings,
          verbose: true,
          outputTable: "stopwords_results",
        },
      ).getRowCount();
      assertEquals(nbRows <= 5, true);

      await sdb.close();
    },
  );
} else {
  console.log("No AI key or Ollama detected, skipping hybrid search tests");
}

for (const mode of ["bm25", "vector", "fused"] as const) {
  for (const withScores of [false, true]) {
    for (const inPlace of [false, true]) {
      Deno.test(`hybridSearch preserves ${mode} rank (scores=${withScores}, inPlace=${inPlace})`, async () => {
        const sdb = new SimpleDB();
        try {
          const table = sdb.newTable("ranking");
          await table.loadArray([
            { id: "low's", text: "zebra " + "unrelated ".repeat(100) },
            { id: "high", text: "zebra" },
            { id: "vector", text: "semantic match" },
            ...Array.from(
              { length: 8 },
              (_, i) => ({ id: `noise${i}`, text: "other topic" }),
            ),
          ]).run();
          const result = table.hybridSearch("zebra", "id", "text", 3, {
            vectorSearch: mode !== "bm25",
            bm25: mode !== "vector",
            vectorMinSimilarity: 0.5,
            embeddings: {
              provider: "ollama",
              model: "ranking-test",
              cache: false,
              ollama: {
                embeddingEndpoint: "http://ranking.local:11434",
                embed({ input }: { input: string }) {
                  const vector = input === "zebra"
                    ? [1, 0]
                    : input === "semantic match"
                    ? [0.9, 0.1]
                    : input.startsWith("zebra ")
                    ? [0.8, 0.2]
                    : [0, 1];
                  return Promise.resolve({ embeddings: [vector] });
                },
              },
            },
            ...(inPlace ? {} : { outputTable: "ranked" }),
            ...(withScores
              ? {
                bm25ScoreColumn: "bm25_score",
                vectorSimilarityColumn: "vector_score",
              }
              : {}),
          });
          const data = await result.getData();
          assertEquals(
            data.map((row) => row.id),
            mode === "bm25"
              ? ["high", "low's"]
              : mode === "vector"
              ? ["high", "vector", "low's"]
              : ["high", "low's", "vector"],
          );
          if (withScores) {
            assertEquals(data[0].vector_score, mode === "bm25" ? null : 1);
            assertEquals(data[0].bm25_score === null, mode === "vector");
            if (mode === "fused") assertEquals(data[2].bm25_score, null);
            if (mode !== "bm25") {
              assertEquals(
                data.find((row) => row.id === "low's")?.vector_score,
                0.9701,
              );
            }
          }
          assertEquals(await table.getRowCount(), inPlace ? data.length : 11);
        } finally {
          await sdb.close();
        }
      });
    }
  }
}

Deno.test("hybridSearch preserves numeric IDs and empty score schemas", async () => {
  const sdb = new SimpleDB();
  try {
    const table = sdb.newTable("numeric_ranking");
    await table.loadArray([
      { id: 1, text: "zebra " + "unrelated ".repeat(100) },
      { id: 2, text: "zebra" },
      ...Array.from(
        { length: 8 },
        (_, i) => ({ id: i + 3, text: "other topic" }),
      ),
    ]).run();
    const ranked = table.hybridSearch("zebra", "id", "text", 2, {
      vectorSearch: false,
      outputTable: "numeric_results",
    });
    assertEquals(await ranked.getValues("id"), [2, 1]);
    const empty = table.hybridSearch("nonexistent", "id", "text", 2, {
      vectorSearch: false,
      outputTable: "empty_results",
      bm25ScoreColumn: "bm25_score",
      vectorSimilarityColumn: "vector_score",
    });
    assertEquals(await empty.getData(), []);
    const types = await empty.getTypes();
    assertEquals(types.bm25_score, "DOUBLE");
    assertEquals(types.vector_score, "DOUBLE");
  } finally {
    await sdb.close();
  }
});

Deno.test("hybridSearch preserves fusion tie order independently of score columns", async () => {
  const sdb = new SimpleDB();
  try {
    const table = sdb.newTable("tied_ranking");
    await table.loadArray([
      { id: "high", text: "zebra" },
      { id: "low", text: "zebra " + "unrelated ".repeat(100) },
      ...Array.from(
        { length: 8 },
        (_, i) => ({ id: `noise${i}`, text: "other topic" }),
      ),
    ]).run();
    for (const withScores of [false, true]) {
      const results = table.hybridSearch("zebra query", "id", "text", 2, {
        outputTable: `ties_${withScores}`,
        embeddings: {
          provider: "ollama",
          model: "ties-test",
          cache: false,
          ollama: {
            embeddingEndpoint: "http://ranking.local:11434",
            embed({ input }: { input: string }) {
              return Promise.resolve({
                embeddings: [
                  input === "zebra"
                    ? [0.8, 0.2]
                    : input.startsWith("zebra ")
                    ? [1, 0]
                    : [0, 1],
                ],
              });
            },
          },
        },
        ...(withScores
          ? {
            bm25ScoreColumn: "bm25_score",
            vectorSimilarityColumn: "vector_score",
          }
          : {}),
      });
      // The reversed search lists tie under RRF; preserve the fusion's
      // stable vector-first tie order, rather than source or BM25 order.
      assertEquals(await results.getValues("id"), ["low", "high"]);
      assertEquals(await results.getColumns(), [
        "id",
        "text",
        "text_embeddings",
        ...(withScores ? ["vector_score", "bm25_score"] : []),
      ]);
    }
  } finally {
    await sdb.close();
  }
});

Deno.test("hybridSearch rejects score column collisions", async () => {
  for (
    const names of [
      { vectorSimilarityColumn: "text" },
      { bm25ScoreColumn: "score", vectorSimilarityColumn: "score" },
    ]
  ) {
    const sdb = new SimpleDB();
    try {
      const table = sdb.newTable("score_collision");
      await table.loadArray([{ id: 1, text: "zebra" }]).run();
      await assertRejects(
        async () => {
          await table.hybridSearch("nonexistent", "id", "text", 2, {
            vectorSearch: false,
            outputTable: "collision_result",
            ...names,
          }).run();
        },
        Error,
        "already exists",
      );
    } finally {
      await sdb.close();
    }
  }
});
