import { assertEquals, assertRejects } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import { existsSync, rmSync } from "node:fs";
import { Ollama } from "ollama";
import {
  FakeGeminiEmbeddingFetch,
  FakeOllamaEmbeddingClient,
} from "../helpers/fakeEmbeddingClients.ts";
import {
  geminiEmbeddingOptions,
  hasGoogleEmbeddingCredentials,
} from "../helpers/realEmbeddingOptions.ts";

Deno.test("aiEmbeddings reuses only a compatible managed column", async () => {
  const sdb = new SimpleDB({ dataTransport: "file" });
  const table = sdb.newTable("embedding_provenance");
  table.loadArray([
    { text: "alpha", alternate_text: "first" },
    { text: "beta", alternate_text: "second" },
  ]);

  const firstClient = new FakeOllamaEmbeddingClient(
    "http://first.local:11434",
    [1, 0],
  );
  await table.aiEmbeddings("text", "text_embeddings", {
    embeddings: {
      provider: "ollama",
      model: "model-a",
      ollama: firstClient,
    },
  });
  assertEquals(firstClient.requests, 2);

  const compatibleClient = new FakeOllamaEmbeddingClient(
    "http://first.local:11434",
    [9, 9],
  );
  await table.aiEmbeddings("text", "text_embeddings", {
    embeddings: {
      provider: "ollama",
      model: "model-a",
      ollama: compatibleClient,
    },
  });
  assertEquals(compatibleClient.requests, 0);
  assertEquals((await table.getTypes()).text_embeddings, "FLOAT[2]");

  const changedSemanticOptionsClient = new FakeOllamaEmbeddingClient(
    "http://first.local:11434",
    [0, 1],
  );
  await table.aiEmbeddings("text", "text_embeddings", {
    embeddings: {
      provider: "ollama",
      model: "model-a",
      contextWindow: 8_192,
      ollama: changedSemanticOptionsClient,
    },
  });
  assertEquals(changedSemanticOptionsClient.requests, 2);

  const changedSourceClient = new FakeOllamaEmbeddingClient(
    "http://first.local:11434",
    [1, 1],
  );
  await table.aiEmbeddings("alternate_text", "text_embeddings", {
    embeddings: {
      provider: "ollama",
      model: "model-a",
      contextWindow: 8_192,
      ollama: changedSourceClient,
    },
  });
  assertEquals(changedSourceClient.requests, 2);

  const changedModelClient = new FakeOllamaEmbeddingClient(
    "http://first.local:11434",
    [0, 1, 0],
  );
  await table.aiEmbeddings("text", "text_embeddings", {
    embeddings: {
      provider: "ollama",
      model: "model-b",
      ollama: changedModelClient,
    },
  });
  assertEquals(changedModelClient.requests, 2);
  assertEquals((await table.getTypes()).text_embeddings, "FLOAT[3]");

  await sdb.done();
});

Deno.test("aiEmbeddings regenerates a legacy column without provenance", async () => {
  const sdb = new SimpleDB({ dataTransport: "file" });
  const table = sdb.newTable("legacy_embeddings");
  table.loadArray([
    { text: "alpha", text_embeddings: [9, 9] },
    { text: "beta", text_embeddings: [9, 9] },
  ]);

  const client = new FakeOllamaEmbeddingClient(
    "http://legacy.local:11434",
    [1, 0],
  );
  await table.aiEmbeddings("text", "text_embeddings", {
    embeddings: {
      provider: "ollama",
      model: "model-a",
      ollama: client,
    },
  });

  assertEquals(client.requests, 2);
  await sdb.done();
});

Deno.test("embedding provenance survives reopening a DuckDB database", async () => {
  const directory = await Deno.makeTempDir();
  const databaseFile = `${directory}/embedding-provenance.db`;
  try {
    const firstDb = new SimpleDB({ dataTransport: "file", file: databaseFile });
    const firstTable = firstDb.newTable("persistent_embeddings");
    firstTable.loadArray([{ text: "alpha" }, { text: "beta" }]);
    const firstClient = new FakeOllamaEmbeddingClient(
      "http://persistent.local:11434",
      [1, 0],
    );
    await firstTable.aiEmbeddings("text", "text_embeddings", {
      embeddings: {
        provider: "ollama",
        model: "model-a",
        ollama: firstClient,
      },
    });
    assertEquals(firstClient.requests, 2);
    await firstDb.done();

    const reopenedDb = new SimpleDB({ dataTransport: "file" });
    await reopenedDb.loadDB(databaseFile);
    const reopenedTable = await reopenedDb.getTable("persistent_embeddings");
    const compatibleClient = new FakeOllamaEmbeddingClient(
      "http://persistent.local:11434",
      [9, 9],
    );
    await reopenedTable.aiEmbeddings("text", "text_embeddings", {
      embeddings: {
        provider: "ollama",
        model: "model-a",
        ollama: compatibleClient,
      },
    });
    assertEquals(compatibleClient.requests, 0);
    await reopenedDb.done();
  } finally {
    await Deno.remove(directory, { recursive: true });
  }
});

Deno.test("every incompatible identity transition invalidates a stale VSS index", async () => {
  const sdb = new SimpleDB({ dataTransport: "file" });
  const table = sdb.newTable("indexed_embeddings");
  table.loadArray([{ text: "alpha" }, { text: "beta" }]);
  const firstClient = new FakeOllamaEmbeddingClient(
    "http://indexed.local:11434",
    [1, 0],
  );
  await table.aiEmbeddings("text", "text_embeddings", {
    embeddings: {
      provider: "ollama",
      model: "model-a",
      ollama: firstClient,
    },
    createIndex: true,
  });
  assertEquals(table.indexes.length, 1);

  const semanticChangeClient = new FakeOllamaEmbeddingClient(
    "http://indexed.local:11434",
    [0, 1],
  );
  await table.aiEmbeddings("text", "text_embeddings", {
    embeddings: {
      provider: "ollama",
      model: "model-a",
      contextWindow: 8_192,
      ollama: semanticChangeClient,
    },
  });
  assertEquals(semanticChangeClient.requests, 2);
  assertEquals(table.indexes, []);

  await table.aiEmbeddings("text", "text_embeddings", {
    embeddings: {
      provider: "ollama",
      model: "model-a",
      contextWindow: 8_192,
      ollama: semanticChangeClient,
    },
    createIndex: true,
  });
  assertEquals(table.indexes.length, 1);

  const modelChangeClient = new FakeOllamaEmbeddingClient(
    "http://indexed.local:11434",
    [1, 1],
  );
  await table.aiEmbeddings("text", "text_embeddings", {
    embeddings: {
      provider: "ollama",
      model: "model-b",
      ollama: modelChangeClient,
    },
  });
  assertEquals(modelChangeClient.requests, 2);
  assertEquals(table.indexes, []);

  await table.aiEmbeddings("text", "text_embeddings", {
    embeddings: {
      provider: "ollama",
      model: "model-b",
      ollama: modelChangeClient,
    },
    createIndex: true,
  });
  assertEquals(table.indexes.length, 1);

  const dimensionChangeClient = new FakeOllamaEmbeddingClient(
    "http://indexed.local:11434",
    [1, 0, 0],
  );
  await table.aiEmbeddings("text", "text_embeddings", {
    embeddings: {
      provider: "ollama",
      model: "model-c",
      ollama: dimensionChangeClient,
    },
  });
  assertEquals(dimensionChangeClient.requests, 2);
  assertEquals((await table.getTypes()).text_embeddings, "FLOAT[3]");
  assertEquals(table.indexes, []);

  await table.aiEmbeddings("text", "text_embeddings", {
    embeddings: {
      provider: "ollama",
      model: "model-c",
      ollama: dimensionChangeClient,
    },
    createIndex: true,
  });
  assertEquals(table.indexes.length, 1);

  const originalFetch = globalThis.fetch;
  const geminiFetch = new FakeGeminiEmbeddingFetch([0, 1, 0]);
  globalThis.fetch = geminiFetch.fetch;
  try {
    await table.aiEmbeddings("text", "text_embeddings", {
      embeddings: {
        provider: "gemini",
        model: "model-c",
        apiKey: "fake-key",
      },
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
  assertEquals(geminiFetch.requests, 2);
  assertEquals(table.indexes, []);
  await sdb.done();
});

Deno.test("failed regeneration is retried and restores cache logging", async () => {
  const sdb = new SimpleDB({ dataTransport: "file" });
  const table = sdb.newTable("failed_embeddings");
  table.loadArray([
    { id: "a", text: "alpha" },
    { id: "b", text: "beta" },
  ]);
  const firstClient = new FakeOllamaEmbeddingClient(
    "http://failure.local:11434",
    [1, 0],
  );
  await table.aiEmbeddings("text", "text_embeddings", {
    embeddings: {
      provider: "ollama",
      model: "model-a",
      ollama: firstClient,
    },
  });

  const failingClient = {
    embeddingEndpoint: "http://failure.local:11434",
    embed: () => Promise.reject(new Error("embedding failed")),
  };
  await assertRejects(
    () =>
      table.hybridSearch("alpha", "id", "text", 1, {
        embeddings: {
          provider: "ollama",
          model: "model-b",
          ollama: failingClient,
        },
        bm25: false,
        verbose: true,
      }),
    Error,
    "embedding failed",
  );
  assertEquals(sdb.cacheVerbose, false);

  const retryClient = new FakeOllamaEmbeddingClient(
    "http://failure.local:11434",
    [1, 0],
  );
  await table.aiEmbeddings("text", "text_embeddings", {
    embeddings: {
      provider: "ollama",
      model: "model-a",
      ollama: retryClient,
    },
  });
  assertEquals(retryClient.requests, 2);
  await sdb.done();
});

if (hasGoogleEmbeddingCredentials) {
  if (existsSync("./.journalism-cache")) {
    rmSync("./.journalism-cache", { recursive: true });
  }
  Deno.test("should create embeddings", async () => {
    const sdb = new SimpleDB({ dataTransport: "file" });
    const table = sdb.newTable("data");
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
      embeddings: {
        ...geminiEmbeddingOptions,
        // Cache the results locally
        cache: true,
      },
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
    const sdb = new SimpleDB({ dataTransport: "file" });
    const table = sdb.newTable("data");
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
      embeddings: {
        ...geminiEmbeddingOptions,
        // Cache the results locally
        cache: true,
      },
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
    const sdb = new SimpleDB({ dataTransport: "file" });
    const table = sdb.newTable("data");
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
      embeddings: {
        ...geminiEmbeddingOptions,
        // Cache the results locally
        cache: true,
      },
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
    const sdb = new SimpleDB({ dataTransport: "file" });
    const table = sdb.newTable("data");
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
      embeddings: {
        provider: "ollama",
        // Cache the results locally
        cache: true,
      },
      // Log details
      verbose: true,
    });

    // Just making sure it's doesnt crash for now
    assertEquals(true, true);
    await sdb.done();
  });
  Deno.test("should create embeddings with a different Ollama instance", async () => {
    const sdb = new SimpleDB({ dataTransport: "file" });
    const table = sdb.newTable("data");
    table.loadArray([
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
      embeddings: {
        provider: "ollama",
        // Cache the results locally
        cache: true,
        ollama,
      },
      // Log details
      verbose: true,
    });

    // Just making sure it's doesnt crash for now
    assertEquals(true, true);
    await sdb.done();
  });
  Deno.test("should retrieve embedding from cache", async () => {
    const sdb = new SimpleDB({ dataTransport: "file" });
    const table = sdb.newTable("data");
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
      embeddings: {
        provider: "ollama",
        // Cache the results locally
        cache: true,
      },
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
    const sdb = new SimpleDB({ dataTransport: "file" });
    const table = sdb.newTable("data");
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
      embeddings: {
        provider: "ollama",
        // Cache the results locally
        cache: true,
      },
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
    const sdb = new SimpleDB({ dataTransport: "file" });
    const table = sdb.newTable("data");
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
      embeddings: {
        provider: "ollama",
        // Cache the results locally
        cache: true,
      },
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
