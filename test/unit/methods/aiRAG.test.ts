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
      await table.removeDuplicates({ on: "Dish" });
      await table.removeMissing({ columns: "Recipe" });

      const answer = await table.aiRAG(
        "I want a buttery pastry for breakfast.",
        "Dish",
        "Recipe",
        10,
        {
          cache: true,
          ollamaEmbeddings: true,
          model: "gemini-3-flash-preview",
          // embeddingsConcurrent: 10,
          verbose: true,
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
    await table.removeDuplicates({ on: "Dish" });
    await table.removeMissing({ columns: "Recipe" });

    const answer = await table.aiRAG(
      "I am vegan. What can I eat for lunch that is spicy?",
      "Dish",
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
      await table.removeDuplicates({ on: "Dish" });
      await table.removeMissing({ columns: "Recipe" });

      const answer = await table.aiRAG(
        "I am looking for round dish, but I don't remember the name.",
        "Dish",
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
      await table.removeDuplicates({ on: "Dish" });
      await table.removeMissing({ columns: "Recipe" });

      const answer = await table.aiRAG(
        "I am looking for round dish, but I don't remember the name.",
        "Dish",
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
      await table.removeDuplicates({ on: "Dish" });
      await table.removeMissing({ columns: "Recipe" });

      const answer = await table.aiRAG(
        "Why is the sky blue?",
        "Dish",
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

  Deno.test(
    "should answer a question using RAG with only BM25",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      await table.loadData("test/data/files/recipes.parquet");
      await table.removeDuplicates({ on: "Dish" });
      await table.removeMissing({ columns: "Recipe" });

      const answer = await table.aiRAG(
        "What's a quick pasta recipe?",
        "Dish",
        "Recipe",
        10,
        {
          cache: true,
          vectorSearch: false, // Disable vector search
          bm25: true, // Enable only BM25
          model: "gemini-3-flash-preview",
          verbose: true,
        },
      );

      console.log(answer);

      // Just to make sure it doesn't crash for now
      assertEquals(true, true);
      await sdb.done();
    },
  );

  Deno.test(
    "should answer a question using RAG with only vector search",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      await table.loadData("test/data/files/recipes.parquet");
      await table.removeDuplicates({ on: "Dish" });
      await table.removeMissing({ columns: "Recipe" });

      const answer = await table.aiRAG(
        "I want something healthy for breakfast",
        "Dish",
        "Recipe",
        10,
        {
          embeddingsConcurrent: 100,
          cache: true,
          vectorSearch: true, // Enable only vector search
          bm25: false, // Disable BM25
          model: "gemini-3-flash-preview",
          verbose: true,
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
      await table.removeDuplicates({ on: "Dish" });
      await table.removeMissing({ columns: "Recipe" });

      const answer = await table.aiRAG(
        "I want a buttery pastry for breakfast.",
        "Dish",
        "Recipe",
        10,
        {
          cache: true,
          modelContextWindow: 128_000,
          embeddingsModelContextWindow: 2_000,
          thinkingLevel: "minimal",
          verbose: true,
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
      "Dish",
      "Recipe",
      10,
      {
        cache: true,
        modelContextWindow: 128_000,
        embeddingsModelContextWindow: 2_000,
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
        "Dish",
        "Recipe",
        10,
        {
          cache: true,
          thinkingLevel: "minimal",
          modelContextWindow: 128_000,
          embeddingsModelContextWindow: 2_000,
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
        "Dish",
        "Recipe",
        10,
        {
          systemPrompt:
            "Answer the question based on provided data. Make sure it rhymes.",
          cache: true,
          modelContextWindow: 128_000,
          embeddingsModelContextWindow: 2_000,
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
        "Dish",
        "Recipe",
        10,
        {
          cache: true,
          thinkingLevel: "minimal",
          modelContextWindow: 128_000,
          embeddingsModelContextWindow: 2_000,
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
    "should answer a question using RAG with a DB that already exists and store in cache",
    { sanitizeResources: false },
    async () => {
      // First iteration of the test, we remove
      if (existsSync("test/output/recipes.db")) {
        rmSync("test/output/recipes.db");
      }

      let sdb;
      let table;
      if (!existsSync("test/output/recipes.db")) {
        sdb = new SimpleDB({
          file: "test/output/recipes.db",
          cacheVerbose: true,
        });
        table = sdb.newTable("data");
        await table.loadData("test/data/files/recipes.parquet");
        await table.removeMissing({ columns: "Recipe" });
      } else {
        sdb = new SimpleDB({ cacheVerbose: true });
        await sdb.loadDB("test/output/recipes.db");
        table = await sdb.getTable("data");
      }

      // await table.logTable();

      const answer = await table.aiRAG(
        "I want a buttery pastry for breakfast.",
        "Dish",
        "Recipe",
        10,
        {
          cache: true,
          createIndex: true,
          modelContextWindow: 128_000,
          embeddingsModelContextWindow: 2_000,
          verbose: true,
        },
      );

      console.log(answer);

      // Just to make sure it doesn't crash for now
      assertEquals(true, true);
      await sdb.done();
    },
  );
  Deno.test(
    "should answer a question using RAG with a DB that already exists and reuse the cache",
    { sanitizeResources: false },
    async () => {
      // Second iteration of the test, we reuse the existing DB
      let sdb;
      let table;
      if (!existsSync("test/output/recipes.db")) {
        sdb = new SimpleDB({
          file: "test/output/recipes.db",
          cacheVerbose: true,
        });
        table = sdb.newTable("data");
        await table.loadData("test/data/files/recipes.parquet");
        await table.removeMissing({ columns: "Recipe" });
      } else {
        sdb = new SimpleDB({ cacheVerbose: true });
        await sdb.loadDB("test/output/recipes.db");
        table = await sdb.getTable("data");
      }

      // await table.logTable();

      const answer = await table.aiRAG(
        "I want a buttery pastry for breakfast.",
        "Dish",
        "Recipe",
        10,
        {
          cache: true,
          createIndex: true,
          modelContextWindow: 128_000,
          embeddingsModelContextWindow: 2_000,
          verbose: true,
        },
      );

      console.log(answer);

      // Just to make sure it doesn't crash for now
      assertEquals(true, true);
      await sdb.done();
    },
  );

  Deno.test(
    "should answer a question using RAG with only BM25",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      await table.loadData("test/data/files/recipes.parquet");
      await table.removeDuplicates({ on: "Dish" });
      await table.removeMissing({ columns: "Recipe" });

      const answer = await table.aiRAG(
        "What's a quick pasta recipe?",
        "Dish",
        "Recipe",
        10,
        {
          cache: true,
          ollamaEmbeddings: true,
          vectorSearch: false, // Disable vector search
          bm25: true, // Enable only BM25
          verbose: true,
        },
      );

      console.log(answer);

      // Just to make sure it doesn't crash for now
      assertEquals(true, true);
      await sdb.done();
    },
  );

  Deno.test(
    "should answer a question using RAG with only vector search",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      await table.loadData("test/data/files/recipes.parquet");
      await table.removeDuplicates({ on: "Dish" });
      await table.removeMissing({ columns: "Recipe" });

      const answer = await table.aiRAG(
        "I want something healthy for breakfast",
        "Dish",
        "Recipe",
        10,
        {
          cache: true,
          ollamaEmbeddings: true,
          vectorSearch: true, // Enable only vector search
          bm25: false, // Disable BM25
          verbose: true,
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
