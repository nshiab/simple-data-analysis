import "jsr:@std/dotenv/load";
import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import { existsSync, rmSync } from "node:fs";

// Testing just with Ollama for now
const ollama = Deno.env.get("OLLAMA");
if (typeof ollama === "string" && ollama !== "") {
  if (existsSync("./.journalism-cache")) {
    rmSync("./.journalism-cache", { recursive: true });
  }
  Deno.test("should sucessfully run the example", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable();
    await table.loadArray([
      { food: "pizza" },
      { food: "sushi" },
      { food: "burger" },
      { food: "pasta" },
      { food: "salad" },
      { food: "tacos" },
    ]);

    // Ask the AI to generate embeddings in a new column "embeddings".
    await table.aiEmbeddings("food", "embeddings", {
      // Cache the results locally
      cache: true,
    });

    // Ask the AI to find the 3 most similar foods to "italian food" in the column "food".
    await table.aiVectorSimilarity(
      "italian food",
      "embeddings",
      3,
      {
        // Create an index on the embeddings column
        createIndex: true,
        // Cache the results locally
        cache: true,
      },
    );

    const values = await table.getValues("food");

    // Just making sure it's doesnt crash for now
    assertEquals(values, ["pizza", "pasta", "salad"]);
  });
  Deno.test("should make a vector similarity search", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    await table.loadArray([
      { food: "pizza" },
      { food: "sushi" },
      { food: "burger" },
      { food: "pasta" },
      { food: "salad" },
      { food: "tacos" },
    ]);
    await table.aiEmbeddings("food", "embeddings", {
      cache: true,
    });

    await table.aiVectorSimilarity(
      "italian food",
      "embeddings",
      3,
      {
        cache: true,
      },
    );

    const values = await table.getValues("food");

    // Just making sure it's doesnt crash for now
    assertEquals(values, ["pizza", "pasta", "salad"]);
    await sdb.done();
  });
  Deno.test("should make a vector similarity search by using the cache", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    await table.loadArray([
      { food: "pizza" },
      { food: "sushi" },
      { food: "burger" },
      { food: "pasta" },
      { food: "salad" },
      { food: "tacos" },
    ]);
    await table.aiEmbeddings("food", "embeddings", {
      cache: true,
    });

    await table.aiVectorSimilarity(
      "italian food",
      "embeddings",
      3,
      {
        cache: true,
      },
    );

    const values = await table.getValues("food");

    // Just making sure it's doesnt crash for now
    assertEquals(values, ["pizza", "pasta", "salad"]);
    await sdb.done();
  });
  Deno.test("should make a vector similarity search after creating an index", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    await table.loadArray([
      { food: "pizza" },
      { food: "sushi" },
      { food: "burger" },
      { food: "pasta" },
      { food: "salad" },
      { food: "tacos" },
    ]);
    await table.aiEmbeddings("food", "embeddings", {
      cache: true,
    });

    await table.aiVectorSimilarity(
      "italian food",
      "embeddings",
      3,
      {
        cache: true,
        createIndex: true,
      },
    );

    const values = await table.getValues("food");

    // Just making sure it's doesnt crash for now
    assertEquals(values, ["pizza", "pasta", "salad"]);
    await sdb.done();
  });
  Deno.test("should make a vector similarity search with an outputable and without creating the index multiple times", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    await table.loadArray([
      { food: "pizza" },
      { food: "sushi" },
      { food: "burger" },
      { food: "pasta" },
      { food: "salad" },
      { food: "tacos" },
    ]);
    await table.aiEmbeddings("food", "embeddings", {
      cache: true,
    });

    const americanFood = await table.aiVectorSimilarity(
      "american food",
      "embeddings",
      3,
      {
        outputTable: "americanFood",
        cache: true,
        createIndex: true,
      },
    );

    const italianFood = await table.aiVectorSimilarity(
      "italian food",
      "embeddings",
      3,
      {
        outputTable: "italianFood",
        cache: true,
        createIndex: true,
      },
    );

    assertEquals({
      americanFood: await americanFood.getValues("food"),
      italianFood: await italianFood.getValues("food"),
      originalData: await table.getValues("food"),
    }, {
      americanFood: ["burger", "salad", "pizza"],
      italianFood: ["pizza", "pasta", "salad"],
      originalData: ["pizza", "sushi", "burger", "pasta", "salad", "tacos"],
    });
    await sdb.done();
  });
} else {
  console.log("No OLLAMA in process.env");
}
