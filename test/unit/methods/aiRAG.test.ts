import { test, expect, vi } from "vite-plus/test";
import createAIEnrichmentFixture from "../helpers/createAIEnrichmentFixture.ts";
import { assertRejects } from "../../helpers/assertions.ts";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import createGenerationClient from "../helpers/createGenerationClient.ts";
import { type ChatRequest, Ollama } from "ollama";
import { FakeOllamaEmbeddingClient } from "../helpers/fakeEmbeddingClients.ts";
import {
  geminiEmbeddingOptions,
  hasGoogleEmbeddingCredentials,
} from "../helpers/realEmbeddingOptions.ts";

for (const mode of ["bm25", "vector", "fused"] as const) {
  for (const withScores of [false, true]) {
    test(`aiRAG sends documents in ${mode} relevance order (scores=${withScores})`, async () => {
      const sdb = new SimpleDB();
      try {
        const table = sdb.newTable("rag_ranking");
        const lowText = "zebra " + "unrelated ".repeat(100);
        await table
          .loadArray([
            { id: "low", text: lowText },
            { id: "high", text: "zebra" },
            { id: "vector", text: "semantic match" },
            ...Array.from({ length: 8 }, (_, i) => ({
              id: `noise${i}`,
              text: "other topic",
            })),
          ])
          .run();

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
                const vector =
                  input === "zebra"
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

        expect(response).toEqual("grounded answer");
        expect(prompts.length).toEqual(1);
        // Inspect the actual generation request after retrieval, projection,
        // and prompt assembly; source order differs from all three rankings.
        const documents = [...prompts[0].matchAll(/^id: (.+)\n\ntext:\n\n([^\n]*)/gm)].map(
          (match) => ({ id: match[1], text: match[2] }),
        );
        const high = { id: "high", text: "zebra" };
        const low = { id: "low", text: lowText };
        const vector = { id: "vector", text: "semantic match" };
        expect(documents).toEqual(
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

test("aiRAG regenerates incompatible managed embeddings while preserving geometries", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("rag_provenance");
  table.loadArray(
    [
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
    ],
    { columnTypes: { geometry: "GEOMETRY('EPSG:4326')" } },
  );
  const firstClient = new FakeOllamaEmbeddingClient("http://rag.local:11434", [1, 0]);
  await table
    .aiEmbeddings("text", "text_embeddings", {
      embeddings: {
        provider: "ollama",
        model: "rag-model-a",
        ollama: firstClient,
        cache: false,
      },
    })
    .run();

  const changedClient = new FakeOllamaEmbeddingClient("http://rag.local:11434", [0, 1]);
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

  expect(changedClient.requests).toEqual(3);
  expect(response).toEqual("grounded answer");
  expect((await table.getTypes()).geometry).toEqual("GEOMETRY('EPSG:4326')");
  expect(
    await sdb.customQuery(`SELECT ST_AsText(geometry) AS wkt FROM "${table.name}"`, {
      returnData: true,
    }),
  ).toEqual([{ wkt: "POINT (-73.5 45.5)" }, { wkt: "POINT (-73.5 45.5)" }]);
  await sdb.close();
});

const documents = [
  { id: "croissant", text: "The croissant is a buttery flaky pastry served for breakfast." },
  { id: "salad", text: "The salad is made of fresh cucumber and tomato." },
  { id: "pasta", text: "The pasta is spaghetti with tomato sauce." },
];

for (const provider of ["gemini", "ollama"] as const) {
  const configured =
    provider === "gemini"
      ? hasGoogleEmbeddingCredentials
      : process.env.AI_PROVIDER === "ollama" && process.env.AI_EMBEDDINGS_PROVIDER === "ollama";
  test.skipIf(process.env.CI === "true" || !configured)(
    `live ${provider} RAG answers from the retrieved documents`,
    async () => {
      const sdb = new SimpleDB();
      try {
        const answer = await sdb
          .newTable("recipes")
          .loadArray(documents)
          .aiRAG(
            "Which dish is a buttery pastry for breakfast? Respond with only its name.",
            "id",
            "text",
            2,
            {
              generation:
                provider === "gemini"
                  ? { provider, model: "gemini-3-flash-preview", cache: false }
                  : { provider, thinkingLevel: false, cache: false },
              embeddings:
                provider === "gemini" ? geminiEmbeddingOptions : { provider, cache: false },
              embeddingsConcurrency: 2,
            },
          );
        expect(answer).toMatch(/croissant/i);
      } finally {
        await sdb.close();
      }
    },
  );
}

test("aiRAG forwards generation options and processes cached model answers on every call", async () => {
  const sdb = new SimpleDB();
  const client = createGenerationClient(() => "croissant");
  const processResponse = vi.fn((response: unknown) => String(response).toUpperCase());
  try {
    const table = sdb.newTable("recipes").loadArray(documents);
    const options = {
      vectorSearch: false,
      generation: {
        provider: "ollama",
        model: "rag-options",
        ollama: client.ollama,
        cache: true,
        thinkingLevel: true,
        systemPrompt: "Use only the supplied recipes.",
        processResponse,
      },
    } as const;
    expect(await table.aiRAG("buttery pastry", "id", "text", 1, options)).toEqual("CROISSANT");
    expect(await table.aiRAG("buttery pastry", "id", "text", 1, options)).toEqual("CROISSANT");
    expect(client.requests).toHaveLength(1);
    expect(client.requests[0].think).toEqual(true);
    expect(client.requests[0].messages).toContainEqual({
      role: "system",
      content: "Use only the supplied recipes.",
    });
    expect(processResponse).toHaveBeenCalledTimes(2);
  } finally {
    await sdb.close();
  }
});

for (const mode of ["disabled", "reused", "generated", "regenerated"] as const) {
  test("aiRAG preserves exact geometry across CRS with vector search " + mode, async () => {
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

      expect(
        await table.aiRAG("row", "i", "text", 3, {
          embeddings,
          generation,
          vectorSearch: mode !== "disabled",
        }),
      ).toEqual("answer");
      expect(generations).toEqual(1);

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

test("aiRAG rejects a geometry embedding-column collision before provider requests", async () => {
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
    expect(client.requests).toEqual(0);
    expect(generations).toEqual(0);
    expect((await table.getTypes()).text_embeddings).toEqual("GEOMETRY('EPSG:3857')");
    await assertPreserved(["text_embeddings"]);
  } finally {
    await sdb.close();
  }
});
