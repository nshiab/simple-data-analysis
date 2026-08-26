import { assertEquals } from "@std/assert";
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

Deno.test(
  "hybridSearch regenerates embeddings when providers change at equal dimensions",
  async () => {
    const sdb = new SimpleDB({ dataTransport: "file" });
    const table = sdb.newTable("provider_change");
    table.loadArray([
      { id: "a", text: "alpha" },
      { id: "b", text: "beta" },
    ]);

    const ollamaClient = new FakeOllamaEmbeddingClient(
      "http://ollama.local:11434",
      [1, 0],
    );
    await table.hybridSearch("alpha", "id", "text", 1, {
      embeddings: {
        provider: "ollama",
        model: "same-model-label",
        ollama: ollamaClient,
        cache: false,
      },
      bm25: false,
      outputTable: "ollama_results",
    });
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
      });
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
    const sdb = new SimpleDB({ dataTransport: "file" });
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
    });

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
    });

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
    const sdb = new SimpleDB({ dataTransport: "file" });
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
    });

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
    const sdb = new SimpleDB({ dataTransport: "file" });
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
    });
    await table.hybridSearch("alpha", "id", "body", 1, {
      embeddings,
      bm25: false,
      outputTable: "body_results",
    });

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
      const sdb = new SimpleDB({ dataTransport: "file" });
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const originalNbRows = await table.getRowCount();

      const results = await table.hybridSearch(
        "buttery pastry for breakfast",
        "Dish",
        "Recipe",
        10,
        {
          embeddings: geminiEmbeddings,
          embeddingsConcurrent: 100,
          verbose: true,
        },
      );

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
      const sdb = new SimpleDB({ dataTransport: "file" });
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const results = await table.hybridSearch(
        "spicy vegan lunch",
        "Dish",
        "Recipe",
        5,
        {
          embeddings: { ...geminiEmbeddings, cache: true },
          embeddingsConcurrent: 100,
        },
      );

      const nbRows = await results.getRowCount();
      assertEquals(nbRows <= 5, true);

      await sdb.close();
    },
  );

  Deno.test(
    "should perform hybrid search with custom output table",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB({ dataTransport: "file" });
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const results = await table.hybridSearch(
        "italian cuisine",
        "Dish",
        "Recipe",
        5,
        {
          embeddings: geminiEmbeddings,
          embeddingsConcurrent: 100,
          outputTable: "italian_search_results",
        },
      );

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
      const sdb = new SimpleDB({ dataTransport: "file" });
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const results = await table.hybridSearch(
        "french cuisine",
        "Dish",
        "Recipe",
        5,
        {
          embeddings: geminiEmbeddings,
          embeddingsConcurrent: 100,
          stemmer: "french",
          k: 1.5,
          b: 0.8,
        },
      );

      const nbRows = await results.getRowCount();
      assertEquals(nbRows <= 5, true);

      await sdb.close();
    },
  );

  Deno.test(
    "should perform hybrid search with index creation",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB({ dataTransport: "file" });
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const results = await table.hybridSearch(
        "dessert",
        "Dish",
        "Recipe",
        3,
        {
          embeddings: geminiEmbeddings,
          createIndex: true,
          verbose: true,
        },
      );

      const nbRows = await results.getRowCount();
      assertEquals(nbRows <= 3, true);

      await sdb.close();
    },
  );

  Deno.test(
    "should perform hybrid search with conjunctive option",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB({ dataTransport: "file" });
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
          embeddings: geminiEmbeddings,
          outputTable: "results_conjunctive_false",
        },
      );
      await resultsConjunctiveFalse.log();

      // Run with conjunctive option
      // This will only affect the BM25 part of the search
      const results = await table.hybridSearch(
        "fennel garlic",
        "Dish",
        "Recipe",
        10,
        {
          embeddings: geminiEmbeddings,
          conjunctive: true,
          outputTable: "results_conjunctive_true",
        },
      );
      await results.log();

      const nbRows = await results.getRowCount();
      assertEquals(nbRows > 0, true);

      await sdb.close();
    },
  );

  Deno.test(
    "should perform hybrid search with FTS options",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB({ dataTransport: "file" });
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const results = await table.hybridSearch("pasta", "Dish", "Recipe", 5, {
        embeddings: geminiEmbeddings,
        stopwords: "english",
        stemmer: "english",
        lower: true,
        stripAccents: true,
        verbose: true,
      });

      const nbRows = await results.getRowCount();
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
      const sdb = new SimpleDB({ dataTransport: "file" });
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const originalNbRows = await table.getRowCount();

      const results = await table.hybridSearch(
        "buttery pastry for breakfast",
        "Dish",
        "Recipe",
        10,
        {
          embeddings: ollamaEmbeddings,
          verbose: true,
        },
      );

      await results.log();

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
      const sdb = new SimpleDB({ dataTransport: "file" });
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const results = await table.hybridSearch(
        "spicy vegan lunch",
        "Dish",
        "Recipe",
        5,
        {
          embeddings: { ...ollamaEmbeddings, cache: true },
        },
      );

      await results.log();

      const nbRows = await results.getRowCount();
      assertEquals(nbRows <= 5, true);

      await sdb.close();
    },
  );

  Deno.test(
    "should perform hybrid search with custom output table",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB({ dataTransport: "file" });
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const results = await table.hybridSearch(
        "italian cuisine",
        "Dish",
        "Recipe",
        5,
        {
          embeddings: ollamaEmbeddings,
          outputTable: "italian_search_results",
        },
      );

      await results.log();

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
      const sdb = new SimpleDB({ dataTransport: "file" });
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const results = await table.hybridSearch(
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
      );

      await results.log();

      const nbRows = await results.getRowCount();
      assertEquals(nbRows <= 5, true);

      await sdb.close();
    },
  );

  Deno.test(
    "should perform hybrid search with index creation",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB({ dataTransport: "file" });
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const results = await table.hybridSearch(
        "dessert",
        "Dish",
        "Recipe",
        3,
        {
          embeddings: ollamaEmbeddings,
          createIndex: true,
          verbose: true,
        },
      );

      await results.log();

      const nbRows = await results.getRowCount();
      assertEquals(nbRows <= 3, true);

      await sdb.close();
    },
  );

  Deno.test(
    "should perform hybrid search with only BM25",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB({ dataTransport: "file" });
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const results = await table.hybridSearch(
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
      );

      await results.log();

      const nbRows = await results.getRowCount();
      assertEquals(nbRows <= 5, true);

      await sdb.close();
    },
  );

  Deno.test(
    "should perform hybrid search with only vector search",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB({ dataTransport: "file" });
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const results = await table.hybridSearch(
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
      );

      await results.log();

      const nbRows = await results.getRowCount();
      assertEquals(nbRows <= 5, true);

      await sdb.close();
    },
  );

  Deno.test(
    "should throw error when both search methods are disabled",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB({ dataTransport: "file" });
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
        );
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
      const sdb = new SimpleDB({ dataTransport: "file" });
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
      );

      await table.log();

      assertEquals(true, true);

      await sdb.close();
    },
  );
  Deno.test(
    "should should not throw an error when nothing is returned with strict thresholds and score columns",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB({ dataTransport: "file" });
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
      );

      await table.log();

      assertEquals(true, true);

      await sdb.close();
    },
  );
  Deno.test(
    "should perform hybrid search with conjunctive option",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB({ dataTransport: "file" });
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
      );

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
      );

      assertEquals(
        await resultsConjunctiveFalse.getRowCount() > 0 &&
          await resultsConjunctiveTrue.getRowCount() > 0,
        true,
      );

      await sdb.close();
    },
  );

  Deno.test(
    "should perform hybrid search with custom BM25 options",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB({ dataTransport: "file" });
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const results = await table.hybridSearch(
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
      );

      const nbRows = await results.getRowCount();
      assertEquals(nbRows > 0, true);
      assertEquals(nbRows <= 5, true);

      await sdb.close();
    },
  );

  Deno.test(
    "should perform hybrid search with stopwords",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB({ dataTransport: "file" });
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const results = await table.hybridSearch(
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
      );

      const nbRows = await results.getRowCount();
      assertEquals(nbRows <= 5, true);

      await sdb.close();
    },
  );
} else {
  console.log("No AI key or Ollama detected, skipping hybrid search tests");
}
