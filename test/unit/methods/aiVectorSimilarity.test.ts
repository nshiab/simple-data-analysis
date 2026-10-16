import { describe } from "vite-plus/test";
import { test, expect } from "vite-plus/test";
import { assertAlmostEquals, assertRejects } from "../../helpers/assertions.ts";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import { existsSync, rmSync } from "node:fs";
import { Ollama } from "ollama";
import createEnvironmentTest from "../helpers/createEnvironmentTest.ts";
import { FakeOllamaEmbeddingClient } from "../helpers/fakeEmbeddingClients.ts";

// Testing just with Ollama for now
const ollamaTest = createEnvironmentTest({ AI_EMBEDDINGS_PROVIDER: "ollama" });
const ollamaEmbeddings = { provider: "ollama", cache: false } as const;
describe.skipIf(process.env.CI === "true" || !(process.env["AI_EMBEDDINGS_PROVIDER"] === "ollama"))(
  "live integration: process.env['AI_EMBEDDINGS_PROVIDER'] === 'ollama'",
  () => {
    if (existsSync("./.journalism-cache")) {
      rmSync("./.journalism-cache", { recursive: true });
    }
    if (existsSync("./.sda-cache")) {
      rmSync("./.sda-cache", { recursive: true });
    }
    ollamaTest("should sucessfully run the example", async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable();
      table.loadArray([
        { food: "pizza" },
        { food: "sushi" },
        { food: "burger" },
        { food: "pasta" },
        { food: "salad" },
        { food: "tacos" },
      ]);

      // Ask the AI to generate embeddings in a new column "embeddings".
      await table
        .aiEmbeddings("food", "embeddings", {
          embeddings: ollamaEmbeddings,
          concurrency: 3,
        })
        .run();

      // Ask the AI to find the 3 most similar foods to "italian food" in the column "food".
      const values = await table
        .aiVectorSimilarity("italian food", "embeddings", 3, {
          // Create an index on the embeddings column
          createIndex: true,
          embeddings: ollamaEmbeddings,
        })
        .getValues("food");

      // Just making sure it's doesnt crash for now
      expect(values).toEqual(["pizza", "pasta", "salad"]);
    });
    ollamaTest("should sucessfully run the example with a different Ollama instance", async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable();
      table.loadArray([
        { food: "pizza" },
        { food: "sushi" },
        { food: "burger" },
        { food: "pasta" },
        { food: "salad" },
        { food: "tacos" },
      ]);

      // Ask the AI to generate embeddings in a new column "embeddings".
      await table
        .aiEmbeddings("food", "embeddings", {
          embeddings: ollamaEmbeddings,
          concurrency: 3,
        })
        .run();

      const ollama = new Ollama({ host: "http://127.0.0.1:11434" });

      // Ask the AI to find the 3 most similar foods to "italian food" in the column "food".
      const values = await table
        .aiVectorSimilarity("italian foods", "embeddings", 3, {
          // Create an index on the embeddings column
          createIndex: true,
          embeddings: { ...ollamaEmbeddings, ollama },
        })
        .getValues("food");

      // Just making sure it's doesnt crash for now
      expect(values).toEqual(["pasta", "pizza", "salad"]);
    });
    ollamaTest("should make a vector similarity search", async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadArray([
        { food: "pizza" },
        { food: "sushi" },
        { food: "burger" },
        { food: "pasta" },
        { food: "salad" },
        { food: "tacos" },
      ]);
      await table
        .aiEmbeddings("food", "embeddings", {
          embeddings: ollamaEmbeddings,
          concurrency: 4,
        })
        .run();

      const values = await table
        .aiVectorSimilarity("italian food", "embeddings", 3, {
          embeddings: ollamaEmbeddings,
        })
        .getValues("food");

      // Just making sure it's doesnt crash for now
      expect(values).toEqual(["pizza", "pasta", "salad"]);
      await sdb.close();
    });
    ollamaTest("should make a vector similarity search by using the cache", async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadArray([
        { food: "pizza" },
        { food: "sushi" },
        { food: "burger" },
        { food: "pasta" },
        { food: "salad" },
        { food: "tacos" },
      ]);
      await table
        .aiEmbeddings("food", "embeddings", {
          embeddings: { ...ollamaEmbeddings, cache: true },
          concurrency: 6,
        })
        .run();

      const values = await table
        .aiVectorSimilarity("italian food", "embeddings", 3, {
          embeddings: { ...ollamaEmbeddings, cache: true },
        })
        .getValues("food");

      // Just making sure it's doesnt crash for now
      expect(values).toEqual(["pizza", "pasta", "salad"]);
      await sdb.close();
    });
    ollamaTest("should make a vector similarity search after creating an index", async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadArray([
        { food: "pizza" },
        { food: "sushi" },
        { food: "burger" },
        { food: "pasta" },
        { food: "salad" },
        { food: "tacos" },
      ]);
      await table
        .aiEmbeddings("food", "embeddings", {
          embeddings: ollamaEmbeddings,
          concurrency: 10,
        })
        .run();

      const values = await table
        .aiVectorSimilarity("italian food", "embeddings", 3, {
          embeddings: ollamaEmbeddings,
          createIndex: true,
        })
        .getValues("food");

      // Just making sure it's doesnt crash for now
      expect(values).toEqual(["pizza", "pasta", "salad"]);
      await sdb.close();
    });
    ollamaTest(
      "should make a vector similarity search with an outputable and without creating the index multiple times",
      async () => {
        const sdb = new SimpleDB();
        const table = sdb.newTable("data");
        table.loadArray([
          { food: "pizza" },
          { food: "sushi" },
          { food: "burger" },
          { food: "pasta" },
          { food: "salad" },
          { food: "tacos" },
        ]);
        await table
          .aiEmbeddings("food", "embeddings", {
            embeddings: ollamaEmbeddings,
            concurrency: 100,
          })
          .run();

        const americanFood = await table
          .aiVectorSimilarity("american food", "embeddings", 3, {
            outputTable: "americanFood",
            embeddings: ollamaEmbeddings,
            createIndex: true,
          })
          .getValues("food");

        const italianFood = await table
          .aiVectorSimilarity("italian food", "embeddings", 3, {
            outputTable: "italianFood",
            embeddings: ollamaEmbeddings,
            createIndex: true,
          })
          .getValues("food");

        expect({
          americanFood: americanFood,
          italianFood: italianFood,
          originalData: await table.getValues("food"),
        }).toEqual({
          americanFood: ["burger", "salad", "pizza"],
          italianFood: ["pizza", "pasta", "salad"],
          originalData: ["pizza", "sushi", "burger", "pasta", "salad", "tacos"],
        });
        await sdb.close();
      },
    );
    ollamaTest(
      "should make a vector similarity search from embeddings stored by the cache method (caching)",
      async () => {
        const sdb = new SimpleDB();
        const table = sdb.newTable("data");

        await table.cache(async () => {
          table.loadArray([
            { food: "pizza" },
            { food: "sushi" },
            { food: "burger" },
            { food: "pasta" },
            { food: "salad" },
            { food: "tacos" },
          ]);
          await table
            .aiEmbeddings("food", "embeddings", {
              embeddings: ollamaEmbeddings,
              concurrency: 10,
            })
            .run();
        });

        const americanFood = await table
          .aiVectorSimilarity("american food", "embeddings", 3, {
            outputTable: "americanFood",
            embeddings: ollamaEmbeddings,
            createIndex: true,
          })
          .getValues("food");

        const italianFood = await table
          .aiVectorSimilarity("italian food", "embeddings", 3, {
            outputTable: "italianFood",
            embeddings: ollamaEmbeddings,
            createIndex: true,
          })
          .getValues("food");

        expect({
          americanFood: americanFood,
          italianFood: italianFood,
          originalData: await table.getValues("food"),
        }).toEqual({
          americanFood: ["burger", "salad", "pizza"],
          italianFood: ["pizza", "pasta", "salad"],
          originalData: ["pizza", "sushi", "burger", "pasta", "salad", "tacos"],
        });
        await sdb.close();
      },
    );
    ollamaTest(
      "should make a vector similarity search from embeddings stored by the cache method (loading)",
      async () => {
        const sdb = new SimpleDB();
        const table = sdb.newTable("data");

        await table.cache(async () => {
          table.loadArray([
            { food: "pizza" },
            { food: "sushi" },
            { food: "burger" },
            { food: "pasta" },
            { food: "salad" },
            { food: "tacos" },
          ]);
          await table
            .aiEmbeddings("food", "embeddings", {
              embeddings: ollamaEmbeddings,
              concurrency: 10,
            })
            .run();
        });

        const americanFood = await table
          .aiVectorSimilarity("american food", "embeddings", 3, {
            outputTable: "americanFood",
            embeddings: ollamaEmbeddings,
            createIndex: true,
          })
          .getValues("food");

        const italianFood = await table
          .aiVectorSimilarity("italian food", "embeddings", 3, {
            outputTable: "italianFood",
            embeddings: ollamaEmbeddings,
            createIndex: true,
          })
          .getValues("food");

        expect({
          americanFood: americanFood,
          italianFood: italianFood,
          originalData: await table.getValues("food"),
        }).toEqual({
          americanFood: ["burger", "salad", "pizza"],
          italianFood: ["pizza", "pasta", "salad"],
          originalData: ["pizza", "sushi", "burger", "pasta", "salad", "tacos"],
        });
        await sdb.close();
      },
    );
    ollamaTest(
      "should add a similarity score column when similarityColumn is provided",
      async () => {
        const sdb = new SimpleDB();
        const table = sdb.newTable("data");
        table.loadArray([
          { food: "pizza" },
          { food: "sushi" },
          { food: "burger" },
          { food: "pasta" },
          { food: "salad" },
          { food: "tacos" },
        ]);
        await table
          .aiEmbeddings("food", "embeddings", {
            embeddings: ollamaEmbeddings,
            concurrency: 4,
          })
          .run();

        const scores = await table
          .aiVectorSimilarity("italian food", "embeddings", 3, {
            embeddings: ollamaEmbeddings,
            similarityColumn: "score", // Add the new column
          })
          .getValues("score");

        // We asked for 3 results
        expect(scores.length).toEqual(3);

        // Check that the returned scores are numbers and fall within the 0.0 to 1.0 similarity range
        expect(typeof scores[0] === "number").toEqual(true);
        expect((scores[0] as number) <= 1).toEqual(true);
        expect((scores[0] as number) >= 0).toEqual(true);

        // Ensure the array is sorted descending by similarity (highest score first)
        expect((scores[0] as number) >= (scores[1] as number)).toEqual(true);

        await sdb.close();
      },
    );

    ollamaTest("should filter results based on the minSimilarity threshold", async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadArray([
        { food: "pizza" },
        { food: "sushi" },
        { food: "burger" },
        { food: "pasta" },
        { food: "salad" },
        { food: "tacos" },
      ]);

      await table
        .aiEmbeddings("food", "embeddings", {
          embeddings: ollamaEmbeddings,
          concurrency: 4,
        })
        .run();

      // 1. Run a baseline search to get the actual scores for the current model
      const baselineScores = (await table
        .aiVectorSimilarity("italian food", "embeddings", 3, {
          outputTable: "baselineTable",
          embeddings: ollamaEmbeddings,
          similarityColumn: "score",
        })
        .getValues("score")) as number[];
      const highestScore = baselineScores[0];
      const lowestScoreInTop3 = baselineScores[2];

      // Calculate a threshold exactly halfway between the 1st and 3rd result
      const dynamicThreshold = lowestScoreInTop3 + (highestScore - lowestScoreInTop3) / 2;

      // 2. Run the search again with our dynamic minSimilarity threshold applied
      const filteredScores = (await table
        .aiVectorSimilarity(
          "italian food",
          "embeddings",
          3, // Still asking for 3
          {
            outputTable: "filteredTable",
            embeddings: ollamaEmbeddings,
            similarityColumn: "filtered_score",
            minSimilarity: dynamicThreshold,
          },
        )
        .getValues("filtered_score")) as number[];

      // Ensure the filter worked: we should have fewer than 3 results now
      expect(filteredScores.length < 3).toEqual(true);
      expect(filteredScores.length > 0).toEqual(true);

      // Ensure all returned rows strictly respect the minSimilarity threshold
      const allRespectThreshold = filteredScores.every((score) => score >= dynamicThreshold);
      expect(allRespectThreshold).toEqual(true);

      await sdb.close();
    });
  },
);

for (const outputTable of [undefined, "matches"]) {
  for (const similarityColumn of [undefined, false, true, 'match"score']) {
    test(`aiVectorSimilarity score option ${String(
      similarityColumn,
    )} with output ${outputTable ?? "source"}`, async () => {
      const sdb = new SimpleDB();
      const client = new FakeOllamaEmbeddingClient("http://similarity.local:11434", [1, 0]);
      try {
        await sdb.customQuery(`CREATE TABLE source AS SELECT * FROM (VALUES
            (1, [1, 0]::FLOAT[2]),
            (2, [0.6, 0.8]::FLOAT[2]),
            (3, [-1, 0]::FLOAT[2])
          ) rows(id, embeddings)`);
        const table = sdb.newTable("source");
        const before = await table.getData();
        const result = table.aiVectorSimilarity("query", "embeddings", 3, {
          embeddings: {
            provider: "ollama",
            model: "test-model",
            cache: false,
            ollama: client,
          },
          similarityColumn,
          minSimilarity: 0,
          outputTable,
        });
        const rows = await result.getData();
        const score = similarityColumn === true ? "similarity" : similarityColumn;
        expect(await result.getColumns()).toEqual(
          score ? ["id", "embeddings", score] : ["id", "embeddings"],
        );
        expect(rows.map((row) => row.id)).toEqual([1, 2]);
        if (score) {
          assertAlmostEquals(Number(rows[0][score]), 1, 1e-6);
          assertAlmostEquals(Number(rows[1][score]), 0.6, 1e-6);
        }
        expect(client.requests).toEqual(1);
        if (outputTable) expect(await table.getData()).toEqual(before);
      } finally {
        await sdb.close();
      }
    });
  }
}

for (const similarityColumn of [true, "SCORE", "EMBEDDINGS", "", "bad\0name"]) {
  test(`aiVectorSimilarity rejects score name ${JSON.stringify(
    similarityColumn,
  )} before embedding or mutation`, async () => {
    const sdb = new SimpleDB();
    const client = new FakeOllamaEmbeddingClient("http://similarity.local:11434", [1, 0]);
    try {
      await sdb.customQuery(`CREATE TABLE source AS SELECT
          1 AS id, [1, 0]::DOUBLE[2] AS embeddings, 42 AS Similarity, 7 AS Score;
          CREATE TABLE matches AS SELECT 'untouched' AS marker;`);
      const table = sdb.newTable("source");
      const before = await table.getData();
      const typesBefore = await table.getTypes();
      const outputBefore = await sdb.customQuery("SELECT * FROM matches", {
        returnData: true,
      });
      await assertRejects(
        () =>
          table
            .aiVectorSimilarity("query", "embeddings", 1, {
              embeddings: {
                provider: "ollama",
                model: "test-model",
                cache: false,
                ollama: client,
              },
              similarityColumn,
              outputTable: "matches",
              createIndex: true,
            })
            .run(),
        Error,
        similarityColumn === "" ||
          (typeof similarityColumn === "string" && similarityColumn.includes("\0"))
          ? "nonempty strings without null characters"
          : "column already exists",
      );
      expect(client.requests).toEqual(0);
      expect(await table.getData()).toEqual(before);
      expect(await table.getTypes()).toEqual(typesBefore);
      expect(await sdb.customQuery("SELECT * FROM matches", { returnData: true })).toEqual(
        outputBefore,
      );
    } finally {
      await sdb.close();
    }
  });
}

test("aiVectorSimilarity checks score collisions after queued schema changes", async () => {
  const sdb = new SimpleDB();
  const client = new FakeOllamaEmbeddingClient("http://similarity.local:11434", [1, 0]);
  try {
    await sdb.customQuery(
      "CREATE TABLE source AS SELECT [1, 0]::FLOAT[2] AS embeddings, 42 AS existing",
    );
    const table = sdb.newTable("source");
    await assertRejects(
      () =>
        table
          .renameColumns({ existing: "Similarity" })
          .aiVectorSimilarity("query", "embeddings", 1, {
            embeddings: {
              provider: "ollama",
              model: "test-model",
              cache: false,
              ollama: client,
            },
            similarityColumn: true,
          })
          .run(),
      Error,
      "column already exists",
    );
    expect(client.requests).toEqual(0);
    expect(await table.getColumns()).toEqual(["embeddings", "Similarity"]);
  } finally {
    await sdb.close();
  }
});

test("aiVectorSimilarity snapshots boolean score options and uses ASCII identifier folding", async () => {
  const sdb = new SimpleDB();
  const client = new FakeOllamaEmbeddingClient("http://similarity.local:11434", [1, 0]);
  try {
    await sdb.customQuery("CREATE TABLE source AS SELECT [1, 0]::FLOAT[2] AS embeddings, 42 AS É");
    const table = sdb.newTable("source");
    const options = {
      embeddings: {
        provider: "ollama" as const,
        model: "test-model",
        cache: false,
        ollama: client,
      },
      similarityColumn: true,
      outputTable: "default_score",
    };
    const result = table.aiVectorSimilarity("query", "embeddings", 1, options);
    options.similarityColumn = false;
    expect(await result.getColumns()).toEqual(["embeddings", "É", "similarity"]);
    const custom = table.aiVectorSimilarity("query", "embeddings", 1, {
      ...options,
      similarityColumn: "é",
      outputTable: "custom_score",
    });
    expect(await custom.getColumns()).toEqual(["embeddings", "É", "é"]);
    expect((await custom.getData())[0].é).toEqual(1);
  } finally {
    await sdb.close();
  }
});
