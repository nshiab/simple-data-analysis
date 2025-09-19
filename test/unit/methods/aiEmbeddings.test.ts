import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import { existsSync, rmSync } from "node:fs";
import { Ollama } from "ollama";

const aiKey = Deno.env.get("AI_KEY") ?? Deno.env.get("AI_PROJECT");
if (typeof aiKey === "string" && aiKey !== "") {
  if (existsSync("./.journalism-cache")) {
    rmSync("./.journalism-cache", { recursive: true });
  }
  Deno.test("should create embeddings", async () => {
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

    // Ask the AI to generate embeddings in a new column "embeddings".
    await table.aiEmbeddings("food", "embeddings", {
      // Cache the results locally
      cache: true,
      // Avoid exceeding a rate limit by waiting between requests
      rateLimitPerMinute: 15,
      // Log details
      verbose: true,
    });

    // Just making sure it's doesnt crash for now
    assertEquals(true, true);
    await sdb.done();
  });
  Deno.test("should retrieve embedding from cache", async () => {
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

    // Ask the AI to generate embeddings in a new column "embeddings".
    await table.aiEmbeddings("food", "embeddings", {
      // Cache the results locally
      cache: true,
      // Avoid exceeding a rate limit by waiting between requests
      rateLimitPerMinute: 15,
      // Log details
      verbose: true,
    });

    // Just making sure it's doesnt crash for now
    assertEquals(true, true);
    await sdb.done();
  });
  Deno.test("should create embeddings with an index", async () => {
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

    // Ask the AI to generate embeddings in a new column "embeddings".
    await table.aiEmbeddings("food", "embeddings", {
      // Cache the results locally
      cache: true,
      // Avoid exceeding a rate limit by waiting between requests
      rateLimitPerMinute: 15,
      // Create an index on the new column "embeddings"
      createIndex: true,
      // Log details
      verbose: true,
    });

    // Just making sure it's doesnt crash for now
    assertEquals(true, true);
    await sdb.done();
  });
} else {
  console.log("No AI_KEY in process.env");
}

const ollama = Deno.env.get("OLLAMA");
if (typeof ollama === "string" && ollama !== "") {
  if (existsSync("./.journalism-cache")) {
    rmSync("./.journalism-cache", { recursive: true });
  }
  Deno.test("should create embeddings", async () => {
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

    // Ask the AI to generate embeddings in a new column "embeddings".
    await table.aiEmbeddings("food", "embeddings", {
      // Cache the results locally
      cache: true,
      // Log details
      verbose: true,
    });

    // Just making sure it's doesnt crash for now
    assertEquals(true, true);
    await sdb.done();
  });
  Deno.test("should create embeddings with a different Ollama instance", async () => {
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

    const ollama = new Ollama({ host: "http://127.0.0.1:11434" });

    // Ask the AI to generate embeddings in a new column "embeddings".
    await table.aiEmbeddings("food", "embeddings", {
      // Cache the results locally
      cache: true,
      // Log details
      verbose: true,
      ollama,
    });

    // Just making sure it's doesnt crash for now
    assertEquals(true, true);
    await sdb.done();
  });
  Deno.test("should retrieve embedding from cache", async () => {
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

    // Ask the AI to generate embeddings in a new column "embeddings".
    await table.aiEmbeddings("food", "embeddings", {
      // Cache the results locally
      cache: true,
      // Avoid exceeding a rate limit by waiting between requests
      // rateLimitPerMinute: 15,
      // Log details
      verbose: true,
    });

    // Just making sure it's doesnt crash for now
    assertEquals(true, true);
    await sdb.done();
  });
  Deno.test("should create embeddings with an index", async () => {
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

    // Ask the AI to generate embeddings in a new column "embeddings".
    await table.aiEmbeddings("food", "embeddings", {
      // Cache the results locally
      cache: true,
      // Avoid exceeding a rate limit by waiting between requests
      // rateLimitPerMinute: 15,
      // Create an index on the new column "embeddings"
      createIndex: true,
      // Log details
      verbose: true,
    });

    // Just making sure it's doesnt crash for now
    assertEquals(true, true);
    await sdb.done();
  });
  Deno.test("should create embeddings with concurrent requests", async () => {
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

    // Ask the AI to generate embeddings in a new column "embeddings".
    await table.aiEmbeddings("food", "embeddings", {
      // Cache the results locally
      cache: true,
      // Avoid exceeding a rate limit by waiting between requests
      // rateLimitPerMinute: 15,
      // Create an index on the new column "embeddings"
      createIndex: true,
      // Use concurrent requests to speed up the process
      concurrent: 2,
      // Log details
      verbose: true,
    });

    // Just making sure it's doesnt crash for now
    assertEquals(true, true);
    await sdb.done();
  });
} else {
  console.log("No OLLAMA in process.env");
}
