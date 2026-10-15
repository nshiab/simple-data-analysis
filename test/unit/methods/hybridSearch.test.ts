import { describe } from "vite-plus/test";
import { test, expect } from "vite-plus/test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { readFileSync } from "node:fs";
import { rm } from "node:fs/promises";
import createAIEnrichmentFixture from "../helpers/createAIEnrichmentFixture.ts";
import { assertRejects } from "../../helpers/assertions.ts";
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
    test(`hybridSearch preserves FTS table name ${name} (vectorSearch=${vectorSearch})`, async () => {
      const sdb = new SimpleDB();
      try {
        const table = sdb.newTable(name);
        await table
          .loadArray([
            { id: "a", text: "zebra" },
            { id: "b", text: "other" },
          ])
          .run();

        const result = table.hybridSearch("zebra", "id", "text", 1, {
          bm25: true,
          vectorSearch,
          outputTable: "result",
          embeddings: {
            provider: "ollama",
            model: "fts-table-name-test",
            cache: false,
            ollama: new FakeOllamaEmbeddingClient("http://fts.local:11434", [1, 0]),
          },
        });

        const rows = await result.getData();
        expect(rows.map((row) => row.id)).toEqual(["a"]);
      } finally {
        await sdb.close();
      }
    });
  }
}

test("hybridSearch preserves geometry columns with table caching", async () => {
  const directory = mkdtempSync(tmpdir() + "/" + "sda-test-");
  const originalDirectory = process.cwd();
  try {
    process.chdir(directory);
    const geometry = { type: "Point", coordinates: [-73.5, 45.5] };
    for (const cached of [false, true]) {
      const sdb = new SimpleDB();
      try {
        const table = sdb.newTable("geometry_search");
        await table
          .loadArray([{ id: "a", text: "alpha", geometry }], {
            columnTypes: { geometry: "GEOMETRY('EPSG:4326')" },
          })
          .run();
        const client = new FakeOllamaEmbeddingClient("http://geometry.local:11434", [1, 0]);
        const result = table.hybridSearch("query", "id", "text", 1, {
          embeddings: {
            provider: "ollama",
            model: "geometry-model",
            ollama: client,
          },
          outputTable: "results",
        });
        await result.run();
        expect((await result.getTypes()).geometry).toEqual("GEOMETRY('EPSG:4326')");
        expect(
          await sdb.customQuery(`SELECT ST_AsText(geometry) AS wkt FROM "${result.name}"`, {
            returnData: true,
          }),
        ).toEqual([{ wkt: "POINT (-73.5 45.5)" }]);
        expect(client.requests).toEqual(cached ? 0 : 2);
        expect(existsSync("./.sda-cache")).toEqual(true);
      } finally {
        await sdb.close();
      }
    }
  } finally {
    process.chdir(originalDirectory);
    await rm(directory, { recursive: true });
  }
});

test("hybridSearch trusts existing embeddings after text changes and reopening", async () => {
  const directory = mkdtempSync(tmpdir() + "/" + "sda-test-");
  let sdb = new SimpleDB({ file: `${directory}/embeddings.db` });
  try {
    let table = sdb.newTable("texts");
    const client = new FakeOllamaEmbeddingClient("http://trust.local:11434", [1, 0]);
    const embeddings = {
      provider: "ollama" as const,
      model: "trust-model",
      ollama: client,
      cache: false,
    };
    await table
      .loadArray([{ id: "a", text: "alpha" }])
      .aiEmbeddings("text", "text_embeddings", { embeddings })
      .run();
    await table.replace("text", { alpha: "changed" }).run();
    for (const reopen of [false, true]) {
      if (reopen) {
        await sdb.close();
        sdb = new SimpleDB({ file: `${directory}/embeddings.db` });
        table = await sdb.getTable("texts");
      }
      const before = client.requests;
      await table
        .hybridSearch("query", "id", "text", 1, {
          embeddings,
          bm25: false,
          outputTable: reopen ? "reopened_results" : "results",
        })
        .run();
      // Only the query is embedded; the existing document vector is trusted.
      expect(client.requests - before).toEqual(1);
      expect(await table.getData()).toEqual([
        {
          id: "a",
          text: "changed",
          text_embeddings: [1, 0],
        },
      ]);
    }
  } finally {
    await sdb.close();
    await rm(directory, { recursive: true });
  }
});

test("hybridSearch regenerates embeddings when providers change at equal dimensions", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("provider_change");
  table.loadArray([
    { id: "a", text: "alpha" },
    { id: "b", text: "beta" },
  ]);

  const ollamaClient = new FakeOllamaEmbeddingClient("http://ollama.local:11434", [1, 0]);
  const ollamaResults = table
    .hybridSearch("alpha", "id", "text", 1, {
      embeddings: {
        provider: "ollama",
        model: "same-model-label",
        ollama: ollamaClient,
        cache: false,
      },
      bm25: false,
      outputTable: "ollama_results",
    })
    .selectColumns("id");
  await ollamaResults.run();
  expect(ollamaClient.requests).toEqual(3);

  const originalFetch = globalThis.fetch;
  const geminiFetch = new FakeGeminiEmbeddingFetch([0, 1]);
  globalThis.fetch = geminiFetch.fetch;
  try {
    await table
      .hybridSearch("alpha", "id", "text", 1, {
        embeddings: {
          provider: "gemini",
          model: "same-model-label",
          apiKey: "fake-key",
          cache: false,
        },
        bm25: false,
        outputTable: "gemini_results",
      })
      .run();
  } finally {
    globalThis.fetch = originalFetch;
  }
  expect(geminiFetch.requests).toEqual(3);

  await sdb.close();
});

test("hybridSearch caches tables by default for each embedding identity", async () => {
  clearEmbeddingCaches();

  try {
    const sdb = new SimpleDB();
    const table = sdb.newTable("cache_identity");
    table.loadArray([
      { id: "a", text: "cache alpha" },
      { id: "b", text: "cache beta" },
    ]);

    const firstClient = new FakeOllamaEmbeddingClient("http://cache.local:11434", [1, 0]);
    await table
      .hybridSearch("cache alpha", "id", "text", 1, {
        embeddings: {
          provider: "ollama",
          model: "cache-model-a",
          ollama: firstClient,
        },
        bm25: false,
        outputTable: "cache_results_a",
      })
      .run();

    const secondClient = new FakeOllamaEmbeddingClient("http://cache.local:11434", [0, 1]);
    await table
      .hybridSearch("cache alpha", "id", "text", 1, {
        embeddings: {
          provider: "ollama",
          model: "cache-model-b",
          ollama: secondClient,
        },
        bm25: false,
        outputTable: "cache_results_b",
      })
      .run();

    const sources = JSON.parse(readFileSync("./.sda-cache/sources.json", "utf8")) as Record<
      string,
      unknown
    >;
    expect(Object.keys(sources).filter((key) => key.startsWith("cache_identity.")).length).toEqual(
      2,
    );
    await sdb.close();
  } finally {
    clearEmbeddingCaches();
  }
});

test("hybridSearch does not cache tables when disabled", async () => {
  clearEmbeddingCaches();

  try {
    const sdb = new SimpleDB();
    const table = sdb.newTable("cache_disabled");
    table.loadArray([
      { id: "a", text: "alpha" },
      { id: "b", text: "beta" },
    ]);

    await table
      .hybridSearch("alpha", "id", "text", 1, {
        embeddings: {
          provider: "ollama",
          model: "no-cache-model",
          ollama: new FakeOllamaEmbeddingClient("http://no-cache.local:11434", [1, 0]),
          cache: false,
        },
        bm25: false,
        outputTable: "no_cache_results",
      })
      .run();

    expect(existsSync("./.sda-cache")).toEqual(false);
    expect(existsSync("./.journalism-cache")).toEqual(false);
    await sdb.close();
  } finally {
    clearEmbeddingCaches();
  }
});

test("hybridSearch isolates table caches by source mapping", async () => {
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
      ollama: new FakeOllamaEmbeddingClient("http://cache.local:11434", [1, 0]),
    } as const;

    await table
      .hybridSearch("alpha", "id", "title", 1, {
        embeddings,
        bm25: false,
        outputTable: "title_results",
      })
      .run();
    await table
      .hybridSearch("alpha", "id", "body", 1, {
        embeddings,
        bm25: false,
        outputTable: "body_results",
      })
      .run();

    expect(await table.hasColumn("title_embeddings")).toEqual(true);
    expect(await table.hasColumn("body_embeddings")).toEqual(true);
    const sources = JSON.parse(readFileSync("./.sda-cache/sources.json", "utf8")) as Record<
      string,
      unknown
    >;
    expect(
      Object.keys(sources).filter((key) => key.startsWith("cache_source_mapping.")).length,
    ).toEqual(2);
    await sdb.close();
  } finally {
    clearEmbeddingCaches();
  }
});

describe.skipIf(process.env.CI === "true" || !hasGoogleEmbeddingCredentials)(
  "live integration: hasGoogleEmbeddingCredentials",
  () => {
    clearEmbeddingCaches();

    test("should perform hybrid search and return a table", async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const originalNbRows = await table.getRowCount();

      await table
        .hybridSearch("buttery pastry for breakfast", "Dish", "Recipe", 10, {
          embeddings: geminiEmbeddings,
          embeddingsConcurrency: 100,
          verbose: true,
        })
        .run();
      const results = table;

      // Should return the same table instance when no outputTable is specified
      expect(results).toEqual(table);

      // Table should be modified to contain only the search results
      const nbRows = await table.getRowCount();
      expect(nbRows <= 10).toEqual(true);
      expect(nbRows < originalNbRows).toEqual(true);

      // Verify it has the expected columns
      const columns = await table.getColumns();
      expect(columns.includes("Dish")).toEqual(true);
      expect(columns.includes("Recipe")).toEqual(true);

      await sdb.close();
    });

    test("should perform hybrid search with cached embeddings", async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const nbRows = await table
        .hybridSearch("spicy vegan lunch", "Dish", "Recipe", 5, {
          embeddings: { ...geminiEmbeddings, cache: true },
          embeddingsConcurrency: 100,
        })
        .getRowCount();
      expect(nbRows <= 5).toEqual(true);

      await sdb.close();
    });

    test("should perform hybrid search with custom output table", async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      await table
        .hybridSearch("italian cuisine", "Dish", "Recipe", 5, {
          embeddings: geminiEmbeddings,
          embeddingsConcurrency: 100,
          outputTable: "italian_search_results",
        })
        .run();
      const results = await sdb.getTable("italian_search_results");

      // Verify the output table name
      expect(results.name).toEqual("italian_search_results");

      // Verify original table is unchanged
      const originalNbRows = await table.getRowCount();
      expect(originalNbRows > 5).toEqual(true);

      await sdb.close();
    });

    test("should perform hybrid search with custom BM25 parameters", async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const nbRows = await table
        .hybridSearch("french cuisine", "Dish", "Recipe", 5, {
          embeddings: geminiEmbeddings,
          embeddingsConcurrency: 100,
          stemmer: "french",
          k: 1.5,
          b: 0.8,
        })
        .getRowCount();
      expect(nbRows <= 5).toEqual(true);

      await sdb.close();
    });

    test("should perform hybrid search with index creation", async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const nbRows = await table
        .hybridSearch("dessert", "Dish", "Recipe", 3, {
          embeddings: geminiEmbeddings,
          createIndex: true,
          verbose: true,
        })
        .getRowCount();
      expect(nbRows <= 3).toEqual(true);

      await sdb.close();
    });

    test("should perform hybrid search with conjunctive option", async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      // Run without conjunctive option
      // This will only affect the BM25 part of the search
      await table
        .hybridSearch("fennel garlic", "Dish", "Recipe", 10, {
          embeddings: geminiEmbeddings,
          outputTable: "results_conjunctive_false",
        })
        .log();

      // Run with conjunctive option
      // This will only affect the BM25 part of the search
      const nbRows = await table
        .hybridSearch("fennel garlic", "Dish", "Recipe", 10, {
          embeddings: geminiEmbeddings,
          conjunctive: true,
          outputTable: "results_conjunctive_true",
        })
        .getRowCount();
      expect(nbRows > 0).toEqual(true);

      await sdb.close();
    });

    test("should perform hybrid search with FTS options", async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const nbRows = await table
        .hybridSearch("pasta", "Dish", "Recipe", 5, {
          embeddings: geminiEmbeddings,
          stopwords: "english",
          stemmer: "english",
          lower: true,
          stripAccents: true,
          verbose: true,
        })
        .getRowCount();
      expect(nbRows <= 5).toEqual(true);

      await sdb.close();
    });
  },
);
describe.skipIf(process.env.CI === "true" || !(process.env["AI_EMBEDDINGS_PROVIDER"] === "ollama"))(
  "live integration: process.env['AI_EMBEDDINGS_PROVIDER'] === 'ollama'",
  () => {
    clearEmbeddingCaches();

    test("should perform hybrid search and return a table", async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const originalNbRows = await table.getRowCount();

      await table
        .hybridSearch("buttery pastry for breakfast", "Dish", "Recipe", 10, {
          embeddings: ollamaEmbeddings,
          verbose: true,
        })
        .run();
      const results = table;

      // Should return the same table instance when no outputTable is specified
      expect(results).toEqual(table);

      // Table should be modified to contain only the search results
      const nbRows = await table.getRowCount();
      expect(nbRows <= 10).toEqual(true);
      expect(nbRows < originalNbRows).toEqual(true);

      // Verify it has the expected columns
      const columns = await table.getColumns();
      expect(columns.includes("Dish")).toEqual(true);
      expect(columns.includes("Recipe")).toEqual(true);

      await sdb.close();
    });

    test("should perform hybrid search with cached embeddings", async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const nbRows = await table
        .hybridSearch("spicy vegan lunch", "Dish", "Recipe", 5, {
          embeddings: { ...ollamaEmbeddings, cache: true },
        })
        .getRowCount();
      expect(nbRows <= 5).toEqual(true);

      await sdb.close();
    });

    test("should perform hybrid search with custom output table", async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      await table
        .hybridSearch("italian cuisine", "Dish", "Recipe", 5, {
          embeddings: ollamaEmbeddings,
          outputTable: "italian_search_results",
        })
        .run();
      const results = await sdb.getTable("italian_search_results");

      // Verify the output table name
      expect(results.name).toEqual("italian_search_results");

      // Verify original table is unchanged
      const originalNbRows = await table.getRowCount();
      expect(originalNbRows > 5).toEqual(true);

      await sdb.close();
    });

    test("should perform hybrid search with custom BM25 parameters", async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const nbRows = await table
        .hybridSearch("french cuisine", "Dish", "Recipe", 5, {
          embeddings: ollamaEmbeddings,
          stemmer: "french",
          k: 1.5,
          b: 0.8,
        })
        .getRowCount();
      expect(nbRows <= 5).toEqual(true);

      await sdb.close();
    });

    test("should perform hybrid search with index creation", async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const nbRows = await table
        .hybridSearch("dessert", "Dish", "Recipe", 3, {
          embeddings: ollamaEmbeddings,
          createIndex: true,
          verbose: true,
        })
        .getRowCount();
      expect(nbRows <= 3).toEqual(true);

      await sdb.close();
    });

    test("should perform hybrid search with only BM25", async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const nbRows = await table
        .hybridSearch("dessert", "Dish", "Recipe", 5, {
          embeddings: ollamaEmbeddings,
          vectorSearch: false, // Disable vector search
          bm25: true, // Enable only BM25
          verbose: true,
        })
        .getRowCount();
      expect(nbRows <= 5).toEqual(true);

      await sdb.close();
    });

    test("should perform hybrid search with only vector search", async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const nbRows = await table
        .hybridSearch("healthy breakfast", "Dish", "Recipe", 5, {
          embeddings: ollamaEmbeddings,
          vectorSearch: true, // Enable only vector search
          bm25: false, // Disable BM25
          verbose: true,
        })
        .getRowCount();
      expect(nbRows <= 5).toEqual(true);

      await sdb.close();
    });

    test("should throw error when both search methods are disabled", async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      let errorThrown = false;
      try {
        await table
          .hybridSearch("test", "Dish", "Recipe", 5, {
            embeddings: ollamaEmbeddings,
            vectorSearch: false,
            bm25: false,
          })
          .run();
      } catch (error) {
        errorThrown = true;
        expect(
          (error as Error).message.includes("At least one search method must be enabled"),
        ).toEqual(true);
      }

      expect(errorThrown).toEqual(true);

      await sdb.run();
      await sdb.close();
    });
    test("should have threshold and new columns for scores", async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      await table
        .hybridSearch("gluten-free dessert", "Dish", "Recipe", 10, {
          embeddings: ollamaEmbeddings,
          vectorMinSimilarity: 0.6, // Only include vector results with at least 60% similarity
          bm25MinScore: 1.4, // Only include BM25 results with a score above 1.5
          bm25ScoreColumn: "bm25_score", // Add BM25 scores to the results
          vectorSimilarityColumn: "vector_similarity", // Add vector similarity scores to the results
        })
        .log();

      expect(true).toEqual(true);

      await sdb.close();
    });
    test("should should not throw an error when nothing is returned with strict thresholds and score columns", async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      await table
        .hybridSearch("gluten-free dessert", "Dish", "Recipe", 10, {
          embeddings: ollamaEmbeddings,
          vectorMinSimilarity: 0.9, // Only include vector results with at least 60% similarity
          bm25MinScore: 2, // Only include BM25 results with a score above 1.5
          bm25ScoreColumn: "bm25_score", // Add BM25 scores to the results
          vectorSimilarityColumn: "vector_similarity", // Add vector similarity scores to the results
        })
        .log();

      expect(true).toEqual(true);

      await sdb.close();
    });
    test("should perform hybrid search with conjunctive option", async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      // Run without conjunctive option
      // This will only affect the BM25 part of the search
      const resultsConjunctiveFalse = await table
        .hybridSearch("fennel garlic", "Dish", "Recipe", 10, {
          embeddings: ollamaEmbeddings,
          outputTable: "results_conjunctive_false",
        })
        .getRowCount();

      // Run with conjunctive option
      // This will only affect the BM25 part of the search
      const resultsConjunctiveTrue = await table
        .hybridSearch("fennel garlic", "Dish", "Recipe", 10, {
          embeddings: ollamaEmbeddings,
          conjunctive: true,
          outputTable: "results_conjunctive_true",
        })
        .getRowCount();

      expect(resultsConjunctiveFalse > 0 && resultsConjunctiveTrue > 0).toEqual(true);

      await sdb.close();
    });

    test("should perform hybrid search with custom BM25 options", async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const nbRows = await table
        .hybridSearch("italian food", "Dish", "Recipe", 5, {
          stemmer: "none",
          lower: false,
          stripAccents: false,
          embeddings: ollamaEmbeddings,
          verbose: true,
          outputTable: "custom_bm25_results",
        })
        .getRowCount();
      expect(nbRows > 0).toEqual(true);
      expect(nbRows <= 5).toEqual(true);

      await sdb.close();
    });

    test("should perform hybrid search with stopwords", async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const nbRows = await table
        .hybridSearch("the a for with dish", "Dish", "Recipe", 5, {
          stopwords: "english",
          embeddings: ollamaEmbeddings,
          verbose: true,
          outputTable: "stopwords_results",
        })
        .getRowCount();
      expect(nbRows <= 5).toEqual(true);

      await sdb.close();
    });
  },
);

for (const mode of ["bm25", "vector", "fused"] as const) {
  for (const withScores of [false, true]) {
    for (const inPlace of [false, true]) {
      test(`hybridSearch preserves ${mode} rank (scores=${withScores}, inPlace=${inPlace})`, async () => {
        const sdb = new SimpleDB();
        try {
          const table = sdb.newTable("ranking");
          await table
            .loadArray([
              { id: "low's", text: "zebra " + "unrelated ".repeat(100) },
              { id: "high", text: "zebra" },
              { id: "vector", text: "semantic match" },
              ...Array.from({ length: 8 }, (_, i) => ({ id: `noise${i}`, text: "other topic" })),
            ])
            .run();
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
                  const vector =
                    input === "zebra"
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
          expect(data.map((row) => row.id)).toEqual(
            mode === "bm25"
              ? ["high", "low's"]
              : mode === "vector"
                ? ["high", "vector", "low's"]
                : ["high", "low's", "vector"],
          );
          if (withScores) {
            expect(data[0].vector_score).toEqual(mode === "bm25" ? null : 1);
            expect(data[0].bm25_score === null).toEqual(mode === "vector");
            if (mode === "fused") expect(data[2].bm25_score).toEqual(null);
            if (mode !== "bm25") {
              expect(data.find((row) => row.id === "low's")?.vector_score).toEqual(0.9701);
            }
          }
          expect(await table.getRowCount()).toEqual(inPlace ? data.length : 11);
        } finally {
          await sdb.close();
        }
      });
    }
  }
}

test("hybridSearch preserves numeric IDs and empty score schemas", async () => {
  const sdb = new SimpleDB();
  try {
    const table = sdb.newTable("numeric_ranking");
    await table
      .loadArray([
        { id: 1, text: "zebra " + "unrelated ".repeat(100) },
        { id: 2, text: "zebra" },
        ...Array.from({ length: 8 }, (_, i) => ({ id: i + 3, text: "other topic" })),
      ])
      .run();
    const ranked = table.hybridSearch("zebra", "id", "text", 2, {
      vectorSearch: false,
      outputTable: "numeric_results",
    });
    expect(await ranked.getValues("id")).toEqual([2, 1]);
    const empty = table.hybridSearch("nonexistent", "id", "text", 2, {
      vectorSearch: false,
      outputTable: "empty_results",
      bm25ScoreColumn: "bm25_score",
      vectorSimilarityColumn: "vector_score",
    });
    expect(await empty.getData()).toEqual([]);
    const types = await empty.getTypes();
    expect(types.bm25_score).toEqual("DOUBLE");
    expect(types.vector_score).toEqual("DOUBLE");
  } finally {
    await sdb.close();
  }
});

test("hybridSearch preserves fusion tie order independently of score columns", async () => {
  const sdb = new SimpleDB();
  try {
    const table = sdb.newTable("tied_ranking");
    await table
      .loadArray([
        { id: "high", text: "zebra" },
        { id: "low", text: "zebra " + "unrelated ".repeat(100) },
        ...Array.from({ length: 8 }, (_, i) => ({ id: `noise${i}`, text: "other topic" })),
      ])
      .run();
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
                  input === "zebra" ? [0.8, 0.2] : input.startsWith("zebra ") ? [1, 0] : [0, 1],
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
      expect(await results.getValues("id")).toEqual(["low", "high"]);
      expect(await results.getColumns()).toEqual([
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

test("hybridSearch rejects score column collisions", async () => {
  for (const names of [
    { vectorSimilarityColumn: "text" },
    { bm25ScoreColumn: "score", vectorSimilarityColumn: "score" },
  ]) {
    const sdb = new SimpleDB();
    try {
      const table = sdb.newTable("score_collision");
      await table.loadArray([{ id: 1, text: "zebra" }]).run();
      await assertRejects(
        async () => {
          await table
            .hybridSearch("nonexistent", "id", "text", 2, {
              vectorSearch: false,
              outputTable: "collision_result",
              ...names,
            })
            .run();
        },
        Error,
        "already exists",
      );
    } finally {
      await sdb.close();
    }
  }
});

for (const mode of ["disabled", "reused", "generated", "regenerated"] as const) {
  test("hybridSearch preserves exact geometry across CRS with vector search " + mode, async () => {
    const { sdb, table, assertGeometry, assertPreserved } = await createAIEnrichmentFixture(12);
    const client = new FakeOllamaEmbeddingClient("http://geometry.local:11434", [1, 0]);
    const embeddings = {
      provider: "ollama",
      model: "geometry-search",
      ollama: client,
      cache: false,
    } as const;
    try {
      if (mode === "reused" || mode === "regenerated") {
        await table
          .aiEmbeddings("text", "text_embeddings", {
            embeddings: {
              ...embeddings,
              model: mode === "reused" ? embeddings.model : "old-model",
            },
          })
          .run();
      }
      const before = client.requests;

      const result = table.hybridSearch("row", "i", "text", 3, {
        embeddings,
        vectorSearch: mode !== "disabled",
        outputTable: "geometry_results",
      });
      await result.run();
      expect((await result.getRowCount()) > 0).toEqual(true);
      await assertGeometry(result);

      expect(client.requests - before).toEqual(
        mode === "disabled" ? 0 : mode === "reused" ? 1 : 13,
      );
      await assertGeometry();
      await assertPreserved(mode === "disabled" ? [] : ["text_embeddings"]);
    } finally {
      await sdb.close();
    }
  });
}

test("hybridSearch rejects a geometry embedding-column collision before provider requests", async () => {
  const { sdb, table, assertPreserved } = await createAIEnrichmentFixture(2);
  const client = new FakeOllamaEmbeddingClient("http://geometry.local:11434", [1, 0]);
  const embeddings = {
    provider: "ollama",
    model: "geometry-search",
    ollama: client,
    cache: false,
  } as const;
  try {
    await sdb.customQuery("ALTER TABLE enriched ADD COLUMN text_embeddings GEOMETRY('EPSG:3857')");

    await assertRejects(
      () => table.hybridSearch("row", "i", "text", 3, { embeddings }).run(),
      Error,
      "cannot be an input or output",
    );
    expect(client.requests).toEqual(0);

    expect((await table.getTypes()).text_embeddings).toEqual("GEOMETRY('EPSG:3857')");
    await assertPreserved(["text_embeddings"]);
  } finally {
    await sdb.close();
  }
});
