import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import { existsSync, rmSync } from "node:fs";

const aiKey = Deno.env.get("AI_KEY") ?? Deno.env.get("AI_PROJECT");
if (typeof aiKey === "string" && aiKey !== "") {
  if (existsSync("./.journalism-cache")) {
    rmSync("./.journalism-cache", { recursive: true });
  }
  if (existsSync("./.sda-cache")) {
    rmSync("./.sda-cache", { recursive: true });
  }

  Deno.test(
    "should answer a question using RAG",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      await table.loadData("test/data/files/recipes.parquet");
      await table.removeMissing({ columns: "Recipe" });

      const answer = await table.aiRAG(
        "I want a buttery pastry for breakfast.",
        "Recipe",
        10,
        {
          cache: true,
          ollamaEmbeddings: true,
          model: "gemini-3-flash-preview",
          // verbose: true,
        },
      );

      console.log(answer);

      // Just to make sure it doesn't crash for now
      assertEquals(true, true);
      await sdb.done();
    },
  );
  Deno.test("should answer a question using RAG with a cached table", {
    sanitizeResources: false,
  }, async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    await table.loadData("test/data/files/recipes.parquet");
    await table.removeMissing({ columns: "Recipe" });

    const answer = await table.aiRAG(
      "I am vegan. What can I eat for lunch that is spicy?",
      "Recipe",
      10,
      {
        cache: true,
        ollamaEmbeddings: true,
        model: "gemini-3-flash-preview",
        // verbose: true,
      },
    );

    console.log(answer);

    // Just to make sure it doesn't crash for now
    assertEquals(true, true);
    await sdb.done();
  });
  Deno.test(
    "should answer a question using RAG with a cached table and minimal thinking",
    {
      sanitizeResources: false,
    },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      await table.loadData("test/data/files/recipes.parquet");
      await table.removeMissing({ columns: "Recipe" });

      const answer = await table.aiRAG(
        "I am looking for round dish, but I don't remember the name.",
        "Recipe",
        10,
        {
          cache: true,
          thinkingLevel: "minimal",
          ollamaEmbeddings: true,
          model: "gemini-3-flash-preview",
          // verbose: true,
        },
      );

      console.log(answer);

      // Just to make sure it doesn't crash for now
      assertEquals(true, true);
      await sdb.done();
    },
  );
  Deno.test(
    "should answer with a different system prompt",
    {
      sanitizeResources: false,
    },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      await table.loadData("test/data/files/recipes.parquet");
      await table.removeMissing({ columns: "Recipe" });

      const answer = await table.aiRAG(
        "I am looking for round dish, but I don't remember the name.",
        "Recipe",
        10,
        {
          systemPrompt:
            "Answer the question based on provided data. Make sure it rhymes.",
          cache: true,
          ollamaEmbeddings: true,
          // verbose: true,
        },
      );

      console.log(answer);

      // Just to make sure it doesn't crash for now
      assertEquals(true, true);
      await sdb.done();
    },
  );
  Deno.test(
    "should answer that it doesn't know",
    {
      sanitizeResources: false,
    },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      await table.loadData("test/data/files/recipes.parquet");
      await table.removeMissing({ columns: "Recipe" });

      const answer = await table.aiRAG(
        "Why is the sky blue?",
        "Recipe",
        10,
        {
          cache: true,
          thinkingLevel: "minimal",
          ollamaEmbeddings: true,
          model: "gemini-3-flash-preview",
          //  verbose: true,
        },
      );

      console.log(answer);

      // Just to make sure it doesn't crash for now
      assertEquals(true, true);
      await sdb.done();
    },
  );
} else {
  console.log("No AI_KEY or AI_PROJECT in process.env");
}

const ollama = Deno.env.get("OLLAMA");
if (typeof ollama === "string" && ollama !== "") {
  if (existsSync("./.journalism-cache")) {
    rmSync("./.journalism-cache", { recursive: true });
  }
  if (existsSync("./.sda-cache")) {
    rmSync("./.sda-cache", { recursive: true });
  }

  Deno.test(
    "should answer a question using RAG",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      await table.loadData("test/data/files/recipes.parquet");
      await table.removeMissing({ columns: "Recipe" });

      const answer = await table.aiRAG(
        "I want a buttery pastry for breakfast.",
        "Recipe",
        10,
        {
          cache: true,
          contextWindow: 128_000,
          // verbose: true,
        },
      );

      console.log(answer);

      // Just to make sure it doesn't crash for now
      assertEquals(true, true);
      await sdb.done();
    },
  );
  Deno.test("should answer a question using RAG with a cached table", {
    sanitizeResources: false,
  }, async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    await table.loadData("test/data/files/recipes.parquet");
    await table.removeMissing({ columns: "Recipe" });

    const answer = await table.aiRAG(
      "I am vegan. What can I eat for lunch that is spicy?",
      "Recipe",
      10,
      {
        cache: true,
        contextWindow: 128_000,
        // verbose: true,
      },
    );

    console.log(answer);

    // Just to make sure it doesn't crash for now
    assertEquals(true, true);
    await sdb.done();
  });
  Deno.test(
    "should answer a question using RAG with a cached table and minimal thinking",
    {
      sanitizeResources: false,
    },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      await table.loadData("test/data/files/recipes.parquet");
      await table.removeMissing({ columns: "Recipe" });

      const answer = await table.aiRAG(
        "I am looking for round dish, but I don't remember the name.",
        "Recipe",
        10,
        {
          cache: true,
          thinkingLevel: "minimal",
          contextWindow: 128_000,
          // verbose: true,
        },
      );

      console.log(answer);

      // Just to make sure it doesn't crash for now
      assertEquals(true, true);
      await sdb.done();
    },
  );
  Deno.test(
    "should answer with a different system prompt",
    {
      sanitizeResources: false,
    },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      await table.loadData("test/data/files/recipes.parquet");
      await table.removeMissing({ columns: "Recipe" });

      const answer = await table.aiRAG(
        "I am looking for round dish, but I don't remember the name.",
        "Recipe",
        10,
        {
          systemPrompt:
            "Answer the question based on provided data. Make sure it rhymes.",
          cache: true,
          contextWindow: 128_000,
          // verbose: true,
        },
      );

      console.log(answer);

      // Just to make sure it doesn't crash for now
      assertEquals(true, true);
      await sdb.done();
    },
  );
  Deno.test(
    "should answer that it doesn't know",
    {
      sanitizeResources: false,
    },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      await table.loadData("test/data/files/recipes.parquet");
      await table.removeMissing({ columns: "Recipe" });

      const answer = await table.aiRAG(
        "Why is the sky blue?",
        "Recipe",
        10,
        {
          cache: true,
          thinkingLevel: "minimal",
          contextWindow: 128_000,
          // verbose: true,
        },
      );

      console.log(answer);

      // Just to make sure it doesn't crash for now
      assertEquals(true, true);
      await sdb.done();
    },
  );
} else {
  console.log("No OLLAMA in process.env");
}
