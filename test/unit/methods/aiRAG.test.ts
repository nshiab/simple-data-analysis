import createAIEnrichmentFixture from "../helpers/createAIEnrichmentFixture.ts";
import { assertEquals, assertRejects } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import createEnvironmentTest from "../helpers/createEnvironmentTest.ts";
import { type ChatRequest, Ollama } from "ollama";
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
  cache: false,
} as const;
const geminiEmbeddings = {
  ...geminiEmbeddingOptions,
} as const;
const ollamaGeneration = {
  provider: "ollama",
  contextWindow: 128_000,
  cache: false,
} as const;
const ollamaEmbeddings = {
  provider: "ollama",
  contextWindow: 2_000,
  cache: false,
} as const;
const mixedProviderTest = createEnvironmentTest({
  AI_PROVIDER: "gemini",
  AI_EMBEDDINGS_PROVIDER: "ollama",
  AI_MODEL: "gemini-3-flash-preview",
});

for (const mode of ["bm25", "vector", "fused"] as const) {
  for (const withScores of [false, true]) {
    Deno.test(`aiRAG sends documents in ${mode} relevance order (scores=${withScores})`, async () => {
      const sdb = new SimpleDB();
      try {
        const table = sdb.newTable("rag_ranking");
        const lowText = "zebra " + "unrelated ".repeat(100);
        await table.loadArray([
          { id: "low", text: lowText },
          { id: "high", text: "zebra" },
          { id: "vector", text: "semantic match" },
          ...Array.from({ length: 8 }, (_, i) => ({
            id: `noise${i}`,
            text: "other topic",
          })),
        ]).run();

        const prompts: string[] = [];
        const generationClient = new Ollama({
          host: "http://unused.local:11434",
        });
        Object.defineProperty(generationClient, "chat", {
          value: (request: ChatRequest) => {
            prompts.push(
              ...(request.messages ?? [])
                .filter((message) => message.role === "user")
                .map((message) => message.content),
            );
            return Promise.resolve({
              message: { role: "assistant", content: "grounded answer" },
              prompt_eval_count: 1,
              eval_count: 1,
            });
          },
        });

        const response = await table.aiRAG("zebra", "id", "text", 3, {
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
                  : input === lowText
                  ? [0.8, 0.2]
                  : [0, 1];
                return Promise.resolve({ embeddings: [vector] });
              },
            },
          },
          generation: {
            provider: "ollama",
            model: "fake-generation",
            ollama: generationClient,
            cache: false,
          },
          ...(withScores
            ? {
              bm25ScoreColumn: "bm25_score",
              vectorSimilarityColumn: "vector_score",
            }
            : {}),
        });

        assertEquals(response, "grounded answer");
        assertEquals(prompts.length, 1);
        // Inspect the actual generation request after retrieval, projection,
        // and prompt assembly; source order differs from all three rankings.
        const documents = [...prompts[0].matchAll(
          /^id: (.+)\n\ntext:\n\n([^\n]*)/gm,
        )].map((match) => ({ id: match[1], text: match[2] }));
        const high = { id: "high", text: "zebra" };
        const low = { id: "low", text: lowText };
        const vector = { id: "vector", text: "semantic match" };
        assertEquals(
          documents,
          mode === "bm25"
            ? [high, low]
            : mode === "vector"
            ? [high, vector, low]
            : [high, low, vector],
        );
      } finally {
        await sdb.close();
      }
    });
  }
}

Deno.test("aiRAG regenerates incompatible managed embeddings while preserving geometries", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("rag_provenance");
  table.loadArray([
    {
      id: "a",
      text: "alpha",
      geometry: { type: "Point", coordinates: [-73.5, 45.5] },
    },
    {
      id: "b",
      text: "beta",
      geometry: { type: "Point", coordinates: [-73.5, 45.5] },
    },
  ], { columnTypes: { geometry: "GEOMETRY('EPSG:4326')" } });
  const firstClient = new FakeOllamaEmbeddingClient(
    "http://rag.local:11434",
    [1, 0],
  );
  await table.aiEmbeddings("text", "text_embeddings", {
    embeddings: {
      provider: "ollama",
      model: "rag-model-a",
      ollama: firstClient,
      cache: false,
    },
  }).run();

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
      cache: false,
    },
    generation: {
      provider: "ollama",
      model: "fake-generation",
      ollama: generationClient,
      cache: false,
    },
    bm25: false,
  });

  assertEquals(changedClient.requests, 3);
  assertEquals(response, "grounded answer");
  assertEquals((await table.getTypes()).geometry, "GEOMETRY('EPSG:4326')");
  assertEquals(
    await sdb.customQuery(
      `SELECT ST_AsText(geometry) AS wkt FROM "${table.name}"`,
      { returnData: true },
    ),
    [{ wkt: "POINT (-73.5 45.5)" }, { wkt: "POINT (-73.5 45.5)" }],
  );
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
        const sdb = new SimpleDB();
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
            // embeddingsConcurrency: 10,
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
        const sdb = new SimpleDB();
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
            generation: { ...geminiGeneration },
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
        const sdb = new SimpleDB();
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
              thinkingLevel: "minimal",
            },
            embeddings: { ...ollamaEmbeddings },
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
        const sdb = new SimpleDB();
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
            },
            embeddings: { ...ollamaEmbeddings },
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
        const sdb = new SimpleDB();
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
              thinkingLevel: "minimal",
            },
            embeddings: { ...ollamaEmbeddings },
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
      const sdb = new SimpleDB();
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
          generation: { ...geminiGeneration },
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
      const sdb = new SimpleDB();
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
          generation: { ...geminiGeneration },
          embeddings: { ...geminiEmbeddings },
          embeddingsConcurrency: 100,
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
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const answer = await table.aiRAG("fennel garlic", "Dish", "Recipe", 3, {
        generation: { ...geminiGeneration },
        embeddings: { ...geminiEmbeddings },
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
      const sdb = new SimpleDB();
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
            thinkingLevel: true,
          },
          embeddings: { ...ollamaEmbeddings },
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
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    table.loadData("test/data/files/recipes.parquet");
    table.removeMissing({ columns: "Recipe" });

    const answer = await table.aiRAG(
      "I am vegan. What can I eat for lunch that is spicy?",
      "Dish",
      "Recipe",
      10,
      {
        generation: { ...ollamaGeneration },
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
      const sdb = new SimpleDB();
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
      const sdb = new SimpleDB();
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
          },
          embeddings: { ...ollamaEmbeddings },
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
      const sdb = new SimpleDB();
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
            thinkingLevel: true,
          },
          embeddings: { ...ollamaEmbeddings },
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
          file: "test/output/recipes.db",
          cacheVerbose: true,
        });
        table = sdb.newTable("data");
        table.loadData("test/data/files/recipes.parquet");
        table.removeDuplicates({ on: "Dish" });
        table.removeMissing({ columns: "Recipe" });
      } else {
        sdb = new SimpleDB({ cacheVerbose: true });
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
          generation: { ...ollamaGeneration },
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
          file: "test/output/recipes.db",
          cacheVerbose: true,
        });
        table = sdb.newTable("data");
        table.loadData("test/data/files/recipes.parquet");
        table.removeDuplicates({ on: "Dish" });
        table.removeMissing({ columns: "Recipe" });
      } else {
        sdb = new SimpleDB({ cacheVerbose: true });
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
          generation: { ...ollamaGeneration },
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
      const sdb = new SimpleDB();
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
          generation: { ...ollamaGeneration },
          embeddings: { ...ollamaEmbeddings },
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
      const sdb = new SimpleDB();
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
          generation: { ...ollamaGeneration },
          embeddings: { ...ollamaEmbeddings },
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
      const sdb = new SimpleDB();
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
          generation: { ...ollamaGeneration },
          embeddings: { ...ollamaEmbeddings },
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
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      const answer = await table.aiRAG("fennel garlic", "Dish", "Recipe", 3, {
        generation: { ...ollamaGeneration },
        embeddings: { ...ollamaEmbeddings },
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
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/recipes.parquet");
      table.removeDuplicates({ on: "Dish" });
      table.removeMissing({ columns: "Recipe" });

      // Using custom BM25 options in RAG context
      const answer = await table.aiRAG("italian food", "Dish", "Recipe", 5, {
        generation: { ...ollamaGeneration },
        embeddings: { ...ollamaEmbeddings },
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
      const sdb = new SimpleDB();
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
            contextWindow: 8_000,
            thinkingLevel: false,
          },
          embeddings: { ...ollamaEmbeddings },
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

for (
  const mode of ["disabled", "reused", "generated", "regenerated"] as const
) {
  Deno.test(
    "aiRAG preserves exact geometry across CRS with vector search " + mode,
    async () => {
      const { sdb, table, assertGeometry, assertPreserved } =
        await createAIEnrichmentFixture(12);
      const client = new FakeOllamaEmbeddingClient(
        "http://geometry.local:11434",
        [1, 0],
      );
      const embeddings = {
        provider: "ollama",
        model: "geometry-search",
        ollama: client,
        cache: false,
      } as const;
      try {
        if (mode === "reused" || mode === "regenerated") {
          await table.aiEmbeddings("text", "text_embeddings", {
            embeddings: {
              ...embeddings,
              model: mode === "reused" ? embeddings.model : "old-model",
            },
          }).run();
        }
        const before = client.requests;

        const generationClient = new Ollama({
          host: "http://unused.local:11434",
        });
        let generations = 0;
        Object.defineProperty(generationClient, "chat", {
          value: () => {
            generations++;
            return Promise.resolve({
              message: { role: "assistant", content: "answer" },
              prompt_eval_count: 1,
              eval_count: 1,
            });
          },
        });
        const generation = {
          provider: "ollama",
          model: "fake-generation",
          ollama: generationClient,
          cache: false,
        } as const;

        assertEquals(
          await table.aiRAG("row", "i", "text", 3, {
            embeddings,
            generation,
            vectorSearch: mode !== "disabled",
          }),
          "answer",
        );
        assertEquals(generations, 1);

        assertEquals(
          client.requests - before,
          mode === "disabled" ? 0 : mode === "reused" ? 1 : 13,
        );
        await assertGeometry();
        await assertPreserved(mode === "disabled" ? [] : ["text_embeddings"]);
      } finally {
        await sdb.close();
      }
    },
  );
}

Deno.test("aiRAG rejects a geometry embedding-column collision before provider requests", async () => {
  const { sdb, table, assertPreserved } = await createAIEnrichmentFixture(2);
  const client = new FakeOllamaEmbeddingClient("http://geometry.local:11434", [
    1,
    0,
  ]);
  const embeddings = {
    provider: "ollama",
    model: "geometry-search",
    ollama: client,
    cache: false,
  } as const;
  try {
    await sdb.customQuery(
      "ALTER TABLE enriched ADD COLUMN text_embeddings GEOMETRY('EPSG:3857')",
    );

    const generationClient = new Ollama({ host: "http://unused.local:11434" });
    let generations = 0;
    Object.defineProperty(generationClient, "chat", {
      value: () => {
        generations++;
        return Promise.resolve({
          message: { role: "assistant", content: "answer" },
          prompt_eval_count: 1,
          eval_count: 1,
        });
      },
    });
    const generation = {
      provider: "ollama",
      model: "fake-generation",
      ollama: generationClient,
      cache: false,
    } as const;

    await assertRejects(
      () => table.aiRAG("row", "i", "text", 3, { embeddings, generation }),
      Error,
      "cannot be an input or output",
    );
    assertEquals(client.requests, 0);
    assertEquals(generations, 0);
    assertEquals(
      (await table.getTypes()).text_embeddings,
      "GEOMETRY('EPSG:3857')",
    );
    await assertPreserved(["text_embeddings"]);
  } finally {
    await sdb.close();
  }
});
