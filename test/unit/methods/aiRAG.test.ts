import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import createEnvironmentTest from "../helpers/createEnvironmentTest.ts";
import { Ollama } from "ollama";
import { FakeOllamaEmbeddingClient } from "../helpers/fakeEmbeddingClients.ts";
import {
  geminiEmbeddingOptions,
  hasGoogleEmbeddingCredentials,
} from "../helpers/realEmbeddingOptions.ts";

const hasAiKey = hasGoogleEmbeddingCredentials;
const hasOllama = Deno.env.get("AI_PROVIDER") === "ollama" ||
  Deno.env.get("AI_EMBEDDINGS_PROVIDER") === "ollama";
const geminiGeneration = {
  provider: "gemini",
  model: "gemini-3-flash-preview",
} as const;
const geminiEmbeddings = {
  ...geminiEmbeddingOptions,
} as const;
const ollamaGeneration = {
  provider: "ollama",
  contextWindow: 128_000,
} as const;
const ollamaEmbeddings = {
  provider: "ollama",
  contextWindow: 2_000,
} as const;
const mixedProviderTest = createEnvironmentTest({
  AI_PROVIDER: "gemini",
  AI_EMBEDDINGS_PROVIDER: "ollama",
  AI_MODEL: "gemini-3-flash-preview",
});

Deno.test("aiRAG regenerates incompatible managed embeddings", async () => {
  const sdb = new SimpleDB({ dataTransport: "file" });
  const table = sdb.newTable("rag_provenance");
  table.loadArray([
    { id: "a", text: "alpha" },
    { id: "b", text: "beta" },
  ]);
  const firstClient = new FakeOllamaEmbeddingClient(
    "http://rag.local:11434",
    [1, 0],
  );
  await table.aiEmbeddings("text", "text_embeddings", {
    embeddings: {
      provider: "ollama",
      model: "rag-model-a",
      ollama: firstClient,
    },
  });

  const changedClient = new FakeOllamaEmbeddingClient(
    "http://rag.local:11434",
    [0, 1],
  );
  const generationClient = new Ollama({ host: "http://unused.local:11434" });
  Object.defineProperty(generationClient, "chat", {
    value: () =>
      Promise.resolve({
        message: { role: "assistant", content: "grounded answer" },
        prompt_eval_count: 1,
        eval_count: 1,
      }),
  });

  const response = await table.aiRAG("alpha", "id", "text", 1, {
    embeddings: {
      provider: "ollama",
      model: "rag-model-b",
      ollama: changedClient,
    },
    generation: {
      provider: "ollama",
      model: "fake-generation",
      ollama: generationClient,
    },
    bm25: false,
  });

  assertEquals(changedClient.requests, 3);
  assertEquals(response, "grounded answer");
  await sdb.close();
});

if (hasAiKey) {
  if (existsSync("./.journalism-cache")) {
    rmSync("./.journalism-cache", { recursive: true });
  }
  if (existsSync("./.sda-cache")) {
    rmSync("./.sda-cache", { recursive: true });
  }

  if (hasOllama) {
    mixedProviderTest(
      "should select Gemini/Vertex generation and Ollama embeddings from environment variables",
      { sanitizeResources: false },
      async () => {
        const sdb = new SimpleDB({ dataTransport: "file" });
        const table = sdb.newTable("data");
        table.loadData("test/data/files/recipes.parquet");
        table.removeDuplicates({ on: "Dish" });
        table.removeMissing({ columns: "Recipe" });

        const answer = await table.aiRAG(
          "I want a buttery pastry for breakfast.",
          "Dish",
          "Recipe",
          10,
          {
            // embeddingsConcurrent: 10,
            verbose: true,
          },
        );

        console.log(answer);

        // Just to make sure it doesn't crash for now
        assertEquals(true, true);
        await sdb.close();
      },
    );
    Deno.test(
      "should use a cached table with Gemini/Vertex and Ollama embeddings",
      {
        sanitizeResources: false,
      },
      async () => {
        const sdb = new SimpleDB({ dataTransport: "file" });
        const table = sdb.newTable("data");
        table.loadData("test/data/files/recipes.parquet");
        table.removeDuplicates({ on: "Dish" });
        table.removeMissing({ columns: "Recipe" });

        const answer = await table.aiRAG(
          "I am vegan. What can I eat for lunch that is spicy?",
          "Dish",
          "Recipe",
          10,
          {
            generation: { ...geminiGeneration, cache: true },
            embeddings: { ...ollamaEmbeddings, cache: true },
            // verbose: true,
          },
        );

        console.log(answer);

        // Just to make sure it doesn't crash for now
        assertEquals(true, true);
        await sdb.close();
      },
    );
    Deno.test(
      "should use minimal thinking with Gemini/Vertex and Ollama embeddings",
      {
        sanitizeResources: false,
      },
      async () => {
        const sdb = new SimpleDB({ dataTransport: "file" });
        const table = sdb.newTable("data");
        table.loadData("test/data/files/recipes.parquet");
        table.removeDuplicates({ on: "Dish" });
        table.removeMissing({ columns: "Recipe" });

        const answer = await table.aiRAG(
          "I am looking for round dish, but I don't remember the name.",
          "Dish",
          "Recipe",
          10,
          {
            generation: {
              ...geminiGeneration,
              cache: true,
              thinkingLevel: "minimal",
            },
            embeddings: { ...ollamaEmbeddings, cache: true },
            // verbose: true,
          },
        );

        console.log(answer);

        // Just to make sure it doesn't crash for now
        assertEquals(true, true);
        await sdb.close();
      },
    );
    Deno.test(
      "should use a different system prompt with Gemini/Vertex and Ollama embeddings",
      {
        sanitizeResources: false,
      },
      async () => {
        const sdb = new SimpleDB({ dataTransport: "file" });
        const table = sdb.newTable("data");
        table.loadData("test/data/files/recipes.parquet");
        table.removeDuplicates({ on: "Dish" });
        table.removeMissing({ columns: "Recipe" });

        const answer = await table.aiRAG(
          "I am looking for round dish, but I don't remember the name.",
          "Dish",
          "Recipe",
          10,
          {
            generation: {
              ...geminiGeneration,
              systemPrompt:
                "Answer the question based on provided data. Make sure it rhymes.",
              cache: true,
            },
            embeddings: { ...ollamaEmbeddings, cache: true },
            // verbose: true,
          },
        );

        console.log(answer);

        // Just to make sure it doesn't crash for now
        assertEquals(true, true);
        await sdb.close();
      },
    );
    Deno.test(
      "should answer that it doesn't know with Gemini/Vertex and Ollama embeddings",
      {
        sanitizeResources: false,
      },
      async () => {
        const sdb = new SimpleDB({ dataTransport: "file" });
        const table = sdb.newTable("data");
        table.loadData("test/data/files/recipes.parquet");
        table.removeDuplicates({ on: "Dish" });
        table.removeMissing({ columns: "Recipe" });

        const answer = await table.aiRAG(
          "Why is the sky blue?",
          "Dish",
          "Recipe",
          10,
          {
            generation: {
              ...geminiGeneration,
              cache: true,
              thinkingLevel: "minimal",
            },
            embeddings: { ...ollamaEmbeddings, cache: true },
            //  verbose: true,
          },
        );

        console.log(answer);

        // Just to make sure it doesn't crash for now
        assertEquals(true, true);
        await sdb.close();
      },
    );
  }

  Deno.test(
    "should answer a question using RAG with only BM25",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB({ dataTransport: "file" });
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const answer = await table.aiRAG(
        "What's a quick pasta recipe?",
        "Dish",
        "Recipe",
        10,
        {
          generation: { ...geminiGeneration, cache: true },
          vectorSearch: false, // Disable vector search
          bm25: true, // Enable only BM25
          verbose: true,
        },
      );

      console.log(answer);

      // Just to make sure it doesn't crash for now
      assertEquals(true, true);
      await sdb.close();
    },
  );

  Deno.test(
    "should answer a question using RAG with only vector search",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB({ dataTransport: "file" });
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const answer = await table.aiRAG(
        "I want something healthy for breakfast",
        "Dish",
        "Recipe",
        10,
        {
          generation: { ...geminiGeneration, cache: true },
          embeddings: { ...geminiEmbeddings, cache: true },
          embeddingsConcurrent: 100,
          vectorSearch: true, // Enable only vector search
          bm25: false, // Disable BM25
          verbose: true,
        },
      );

      console.log(answer);

      // Just to make sure it doesn't crash for now
      assertEquals(true, true);
      await sdb.close();
    },
  );

  Deno.test(
    "should answer a question using RAG with conjunctive option",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB({ dataTransport: "file" });
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const answer = await table.aiRAG("fennel garlic", "Dish", "Recipe", 3, {
        generation: { ...geminiGeneration, cache: true },
        embeddings: { ...geminiEmbeddings, cache: true },
        conjunctive: true,
        verbose: true,
      });

      console.log(answer);

      // Just to make sure it doesn't crash for now
      assertEquals(true, true);
      await sdb.close();
    },
  );
} else if (!hasAiKey) {
  console.log("No AI_KEY or AI_PROJECT in process.env");
}

if (hasOllama) {
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
      const sdb = new SimpleDB({ dataTransport: "file" });
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const answer = await table.aiRAG(
        "I want a buttery pastry for breakfast.",
        "Dish",
        "Recipe",
        10,
        {
          generation: {
            ...ollamaGeneration,
            cache: true,
            thinkingLevel: true,
          },
          embeddings: { ...ollamaEmbeddings, cache: true },
          verbose: true,
        },
      );

      console.log(answer);

      // Just to make sure it doesn't crash for now
      assertEquals(true, true);
      await sdb.close();
    },
  );
  Deno.test("should answer a question using RAG with a cached table", {
    sanitizeResources: false,
  }, async () => {
    const sdb = new SimpleDB({ dataTransport: "file" });
    const table = sdb.newTable("data");
    table.loadData("test/data/files/recipes.parquet");
    table.removeMissing({ columns: "Recipe" });

    const answer = await table.aiRAG(
      "I am vegan. What can I eat for lunch that is spicy?",
      "Dish",
      "Recipe",
      10,
      {
        generation: { ...ollamaGeneration, cache: true },
        embeddings: { ...ollamaEmbeddings, cache: true },
        // verbose: true,
      },
    );

    console.log(answer);

    // Just to make sure it doesn't crash for now
    assertEquals(true, true);
    await sdb.close();
  });
  Deno.test(
    "should answer a question using RAG with a cached table and minimal thinking",
    {
      sanitizeResources: false,
    },
    async () => {
      const sdb = new SimpleDB({ dataTransport: "file" });
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeMissing({ columns: "Recipe" });

      const answer = await table.aiRAG(
        "I am looking for round dish, but I don't remember the name.",
        "Dish",
        "Recipe",
        10,
        {
          generation: {
            ...ollamaGeneration,
            cache: true,
            thinkingLevel: true,
          },
          embeddings: { ...ollamaEmbeddings, cache: true },
          // verbose: true,
        },
      );

      console.log(answer);

      // Just to make sure it doesn't crash for now
      assertEquals(true, true);
      await sdb.close();
    },
  );
  Deno.test(
    "should answer with a different system prompt",
    {
      sanitizeResources: false,
    },
    async () => {
      const sdb = new SimpleDB({ dataTransport: "file" });
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeMissing({ columns: "Recipe" });

      const answer = await table.aiRAG(
        "I am looking for round dish, but I don't remember the name.",
        "Dish",
        "Recipe",
        10,
        {
          generation: {
            ...ollamaGeneration,
            systemPrompt:
              "Answer the question based on provided data. Make sure it rhymes.",
            cache: true,
          },
          embeddings: { ...ollamaEmbeddings, cache: true },
          // verbose: true,
        },
      );

      console.log(answer);

      // Just to make sure it doesn't crash for now
      assertEquals(true, true);
      await sdb.close();
    },
  );
  Deno.test(
    "should answer that it doesn't know",
    {
      sanitizeResources: false,
    },
    async () => {
      const sdb = new SimpleDB({ dataTransport: "file" });
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeMissing({ columns: "Recipe" });

      const answer = await table.aiRAG(
        "Why is the sky blue?",
        "Dish",
        "Recipe",
        10,
        {
          generation: {
            ...ollamaGeneration,
            cache: true,
            thinkingLevel: true,
          },
          embeddings: { ...ollamaEmbeddings, cache: true },
          // verbose: true,
        },
      );

      console.log(answer);

      // Just to make sure it doesn't crash for now
      assertEquals(true, true);
      await sdb.close();
    },
  );
  Deno.test(
    "should answer a question using RAG with a DB that already exists and store in cache",
    { sanitizeResources: false },
    async () => {
      if (!existsSync("test/output")) {
        mkdirSync("test/output", { recursive: true });
      }
      // First iteration of the test, we remove
      if (existsSync("test/output/recipes.db")) {
        rmSync("test/output/recipes.db");
      }

      let sdb;
      let table;
      if (!existsSync("test/output/recipes.db")) {
        sdb = new SimpleDB({
          dataTransport: "file",
          file: "test/output/recipes.db",
          cacheVerbose: true,
        });
        table = sdb.newTable("data");
        table.loadData("test/data/files/recipes.parquet");
        table.removeDuplicates({ on: "Dish" });
        table.removeMissing({ columns: "Recipe" });
      } else {
        sdb = new SimpleDB({ dataTransport: "file", cacheVerbose: true });
        await sdb.customQuery("INSTALL vss; LOAD vss;");
        await sdb.loadDB("test/output/recipes.db");
        table = await sdb.getTable("data");
      }

      // await table.log();

      const answer = await table.aiRAG(
        "I want a buttery pastry for breakfast.",
        "Dish",
        "Recipe",
        10,
        {
          generation: { ...ollamaGeneration, cache: true },
          embeddings: { ...ollamaEmbeddings, cache: true },
          createIndex: true,
          verbose: true,
        },
      );

      console.log(answer);

      // Just to make sure it doesn't crash for now
      assertEquals(true, true);
      await sdb.close();
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
          dataTransport: "file",
          file: "test/output/recipes.db",
          cacheVerbose: true,
        });
        table = sdb.newTable("data");
        table.loadData("test/data/files/recipes.parquet");
        table.removeDuplicates({ on: "Dish" });
        table.removeMissing({ columns: "Recipe" });
      } else {
        sdb = new SimpleDB({ dataTransport: "file", cacheVerbose: true });
        await sdb.customQuery("INSTALL vss; LOAD vss;");
        await sdb.loadDB("test/output/recipes.db");
        table = await sdb.getTable("data");
      }

      // await table.log();

      const answer = await table.aiRAG(
        "I want a buttery pastry for breakfast.",
        "Dish",
        "Recipe",
        10,
        {
          generation: { ...ollamaGeneration, cache: true },
          embeddings: { ...ollamaEmbeddings, cache: true },
          createIndex: true,
          verbose: true,
        },
      );

      console.log(answer);

      // Just to make sure it doesn't crash for now
      assertEquals(true, true);
      await sdb.close();
    },
  );

  Deno.test(
    "should answer a question using RAG with only BM25",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB({ dataTransport: "file" });
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const answer = await table.aiRAG(
        "What's a quick pasta recipe?",
        "Dish",
        "Recipe",
        10,
        {
          generation: { ...ollamaGeneration, cache: true },
          embeddings: { ...ollamaEmbeddings, cache: true },
          vectorSearch: false, // Disable vector search
          bm25: true, // Enable only BM25
          verbose: true,
        },
      );

      console.log(answer);

      // Just to make sure it doesn't crash for now
      assertEquals(true, true);
      await sdb.close();
    },
  );

  Deno.test(
    "should answer a question using RAG with only vector search",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB({ dataTransport: "file" });
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const answer = await table.aiRAG(
        "I want something healthy for breakfast",
        "Dish",
        "Recipe",
        10,
        {
          generation: { ...ollamaGeneration, cache: true },
          embeddings: { ...ollamaEmbeddings, cache: true },
          vectorSearch: true, // Enable only vector search
          bm25: false, // Disable BM25
          verbose: true,
        },
      );

      console.log(answer);

      // Just to make sure it doesn't crash for now
      assertEquals(true, true);
      await sdb.close();
    },
  );
  Deno.test(
    "should answer a question using RAG and log scores",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB({ dataTransport: "file" });
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const answer = await table.aiRAG(
        "I want something healthy for breakfast",
        "Dish",
        "Recipe",
        10,
        {
          generation: { ...ollamaGeneration, cache: true },
          embeddings: { ...ollamaEmbeddings, cache: true },
          verbose: true,
          bm25MinScore: 0.1, // Set a low BM25 min score to see more results
          bm25ScoreColumn: "bm25_score", // Log BM25 scores in this column
          vectorMinSimilarity: 0.1, // Set a low vector similarity to see more results
          vectorSimilarityColumn: "vector_similarity", // Log vector similarities in this column
        },
      );

      console.log(answer);

      // Just to make sure it doesn't crash for now
      assertEquals(true, true);
      await sdb.close();
    },
  );
  Deno.test(
    "should answer a question using RAG with conjunctive option",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB({ dataTransport: "file" });
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const answer = await table.aiRAG("fennel garlic", "Dish", "Recipe", 3, {
        generation: { ...ollamaGeneration, cache: true },
        embeddings: { ...ollamaEmbeddings, cache: true },
        conjunctive: true,
        verbose: true,
      });

      console.log(answer);

      // Just to make sure it doesn't crash for now
      assertEquals(true, true);
      await sdb.close();
    },
  );
  Deno.test(
    "should perform aiRAG with custom BM25 options",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB({ dataTransport: "file" });
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      // Using custom BM25 options in RAG context
      const answer = await table.aiRAG("italian food", "Dish", "Recipe", 5, {
        generation: { ...ollamaGeneration, cache: true },
        embeddings: { ...ollamaEmbeddings, cache: true },
        stemmer: "none",
        lower: false,
        stripAccents: false,
        verbose: true,
      });

      console.log(answer);
      assertEquals(typeof answer, "string");

      await sdb.close();
    },
  );

  Deno.test(
    "should perform aiRAG with stopwords",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB({ dataTransport: "file" });
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const answer = await table.aiRAG(
        "the a for with pasta dish",
        "Dish",
        "Recipe",
        5,
        {
          generation: {
            ...ollamaGeneration,
            cache: true,
            contextWindow: 8_000,
            thinkingLevel: false,
          },
          embeddings: { ...ollamaEmbeddings, cache: true },
          stopwords: "english",
          verbose: true,
        },
      );

      console.log(answer);
      assertEquals(typeof answer, "string");

      await sdb.close();
    },
  );
} else {
  console.log(
    "Neither AI_PROVIDER nor AI_EMBEDDINGS_PROVIDER is set to ollama",
  );
}
