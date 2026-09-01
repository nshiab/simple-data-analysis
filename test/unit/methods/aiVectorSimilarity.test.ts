import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import { existsSync, rmSync } from "node:fs";
import { Ollama } from "ollama";
import createEnvironmentTest from "../helpers/createEnvironmentTest.ts";

// Testing just with Ollama for now
const Deno = {
  env: globalThis.Deno.env,
  test: createEnvironmentTest({ AI_EMBEDDINGS_PROVIDER: "ollama" }),
};
const ollamaEmbeddings = { provider: "ollama", cache: false } as const;
if (Deno.env.get("AI_EMBEDDINGS_PROVIDER") === "ollama") {
  if (existsSync("./.journalism-cache")) {
    rmSync("./.journalism-cache", { recursive: true });
  }
  if (existsSync("./.sda-cache")) {
    rmSync("./.sda-cache", { recursive: true });
  }
  Deno.test("should sucessfully run the example", async () => {
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
    await table.aiEmbeddings("food", "embeddings", {
      embeddings: ollamaEmbeddings,
      concurrency: 3,
    }).run();

    // Ask the AI to find the 3 most similar foods to "italian food" in the column "food".
    const values = await table.aiVectorSimilarity(
      "italian food",
      "embeddings",
      3,
      {
        // Create an index on the embeddings column
        createIndex: true,
        embeddings: ollamaEmbeddings,
      },
    ).getValues("food");

    // Just making sure it's doesnt crash for now
    assertEquals(values, ["pizza", "pasta", "salad"]);
  });
  Deno.test(
    "should sucessfully run the example with a different Ollama instance",
    async () => {
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
      await table.aiEmbeddings("food", "embeddings", {
        embeddings: ollamaEmbeddings,
        concurrency: 3,
      }).run();

      const ollama = new Ollama({ host: "http://127.0.0.1:11434" });

      // Ask the AI to find the 3 most similar foods to "italian food" in the column "food".
      const values = await table.aiVectorSimilarity(
        "italian foods",
        "embeddings",
        3,
        {
          // Create an index on the embeddings column
          createIndex: true,
          embeddings: { ...ollamaEmbeddings, ollama },
        },
      ).getValues("food");

      // Just making sure it's doesnt crash for now
      assertEquals(values, ["pasta", "pizza", "salad"]);
    },
  );
  Deno.test("should make a vector similarity search", async () => {
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
    await table.aiEmbeddings("food", "embeddings", {
      embeddings: ollamaEmbeddings,
      concurrency: 4,
    }).run();

    const values = await table.aiVectorSimilarity(
      "italian food",
      "embeddings",
      3,
      {
        embeddings: ollamaEmbeddings,
      },
    ).getValues("food");

    // Just making sure it's doesnt crash for now
    assertEquals(values, ["pizza", "pasta", "salad"]);
    await sdb.close();
  });
  Deno.test(
    "should make a vector similarity search by using the cache",
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
      await table.aiEmbeddings("food", "embeddings", {
        embeddings: { ...ollamaEmbeddings, cache: true },
        concurrency: 6,
      }).run();

      const values = await table.aiVectorSimilarity(
        "italian food",
        "embeddings",
        3,
        {
          embeddings: { ...ollamaEmbeddings, cache: true },
        },
      ).getValues("food");

      // Just making sure it's doesnt crash for now
      assertEquals(values, ["pizza", "pasta", "salad"]);
      await sdb.close();
    },
  );
  Deno.test(
    "should make a vector similarity search after creating an index",
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
      await table.aiEmbeddings("food", "embeddings", {
        embeddings: ollamaEmbeddings,
        concurrency: 10,
      }).run();

      const values = await table.aiVectorSimilarity(
        "italian food",
        "embeddings",
        3,
        {
          embeddings: ollamaEmbeddings,
          createIndex: true,
        },
      ).getValues("food");

      // Just making sure it's doesnt crash for now
      assertEquals(values, ["pizza", "pasta", "salad"]);
      await sdb.close();
    },
  );
  Deno.test(
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
      await table.aiEmbeddings("food", "embeddings", {
        embeddings: ollamaEmbeddings,
        concurrency: 100,
      }).run();

      const americanFood = await table.aiVectorSimilarity(
        "american food",
        "embeddings",
        3,
        {
          outputTable: "americanFood",
          embeddings: ollamaEmbeddings,
          createIndex: true,
        },
      ).getValues("food");

      const italianFood = await table.aiVectorSimilarity(
        "italian food",
        "embeddings",
        3,
        {
          outputTable: "italianFood",
          embeddings: ollamaEmbeddings,
          createIndex: true,
        },
      ).getValues("food");

      assertEquals({
        americanFood: americanFood,
        italianFood: italianFood,
        originalData: await table.getValues("food"),
      }, {
        americanFood: ["burger", "salad", "pizza"],
        italianFood: ["pizza", "pasta", "salad"],
        originalData: ["pizza", "sushi", "burger", "pasta", "salad", "tacos"],
      });
      await sdb.close();
    },
  );
  Deno.test(
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
        await table.aiEmbeddings("food", "embeddings", {
          embeddings: ollamaEmbeddings,
          concurrency: 10,
        }).run();
      });

      const americanFood = await table.aiVectorSimilarity(
        "american food",
        "embeddings",
        3,
        {
          outputTable: "americanFood",
          embeddings: ollamaEmbeddings,
          createIndex: true,
        },
      ).getValues("food");

      const italianFood = await table.aiVectorSimilarity(
        "italian food",
        "embeddings",
        3,
        {
          outputTable: "italianFood",
          embeddings: ollamaEmbeddings,
          createIndex: true,
        },
      ).getValues("food");

      assertEquals({
        americanFood: americanFood,
        italianFood: italianFood,
        originalData: await table.getValues("food"),
      }, {
        americanFood: ["burger", "salad", "pizza"],
        italianFood: ["pizza", "pasta", "salad"],
        originalData: ["pizza", "sushi", "burger", "pasta", "salad", "tacos"],
      });
      await sdb.close();
    },
  );
  Deno.test(
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
        await table.aiEmbeddings("food", "embeddings", {
          embeddings: ollamaEmbeddings,
          concurrency: 10,
        }).run();
      });

      const americanFood = await table.aiVectorSimilarity(
        "american food",
        "embeddings",
        3,
        {
          outputTable: "americanFood",
          embeddings: ollamaEmbeddings,
          createIndex: true,
        },
      ).getValues("food");

      const italianFood = await table.aiVectorSimilarity(
        "italian food",
        "embeddings",
        3,
        {
          outputTable: "italianFood",
          embeddings: ollamaEmbeddings,
          createIndex: true,
        },
      ).getValues("food");

      assertEquals({
        americanFood: americanFood,
        italianFood: italianFood,
        originalData: await table.getValues("food"),
      }, {
        americanFood: ["burger", "salad", "pizza"],
        italianFood: ["pizza", "pasta", "salad"],
        originalData: ["pizza", "sushi", "burger", "pasta", "salad", "tacos"],
      });
      await sdb.close();
    },
  );
  Deno.test(
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
      await table.aiEmbeddings("food", "embeddings", {
        embeddings: ollamaEmbeddings,
        concurrency: 4,
      }).run();

      const scores = await table.aiVectorSimilarity(
        "italian food",
        "embeddings",
        3,
        {
          embeddings: ollamaEmbeddings,
          similarityColumn: "score", // Add the new column
        },
      ).getValues("score");

      // We asked for 3 results
      assertEquals(scores.length, 3);

      // Check that the returned scores are numbers and fall within the 0.0 to 1.0 similarity range
      assertEquals(typeof scores[0] === "number", true);
      assertEquals((scores[0] as number) <= 1, true);
      assertEquals((scores[0] as number) >= 0, true);

      // Ensure the array is sorted descending by similarity (highest score first)
      assertEquals((scores[0] as number) >= (scores[1] as number), true);

      await sdb.close();
    },
  );

  Deno.test(
    "should filter results based on the minSimilarity threshold",
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

      await table.aiEmbeddings("food", "embeddings", {
        embeddings: ollamaEmbeddings,
        concurrency: 4,
      }).run();

      // 1. Run a baseline search to get the actual scores for the current model
      const baselineScores = await table.aiVectorSimilarity(
        "italian food",
        "embeddings",
        3,
        {
          outputTable: "baselineTable",
          embeddings: ollamaEmbeddings,
          similarityColumn: "score",
        },
      ).getValues("score") as number[];
      const highestScore = baselineScores[0];
      const lowestScoreInTop3 = baselineScores[2];

      // Calculate a threshold exactly halfway between the 1st and 3rd result
      const dynamicThreshold = lowestScoreInTop3 +
        ((highestScore - lowestScoreInTop3) / 2);

      // 2. Run the search again with our dynamic minSimilarity threshold applied
      const filteredScores = await table.aiVectorSimilarity(
        "italian food",
        "embeddings",
        3, // Still asking for 3
        {
          outputTable: "filteredTable",
          embeddings: ollamaEmbeddings,
          similarityColumn: "filtered_score",
          minSimilarity: dynamicThreshold,
        },
      ).getValues("filtered_score") as number[];

      // Ensure the filter worked: we should have fewer than 3 results now
      assertEquals(filteredScores.length < 3, true);
      assertEquals(filteredScores.length > 0, true);

      // Ensure all returned rows strictly respect the minSimilarity threshold
      const allRespectThreshold = filteredScores.every((score) =>
        score >= dynamicThreshold
      );
      assertEquals(allRespectThreshold, true);

      await sdb.close();
    },
  );
} else {
  console.log("AI_EMBEDDINGS_PROVIDER is not set to ollama");
}
