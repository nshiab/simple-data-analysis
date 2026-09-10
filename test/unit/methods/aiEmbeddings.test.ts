import createAIEnrichmentFixture from "../helpers/createAIEnrichmentFixture.ts";
import { assertEquals, assertRejects } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import type SimpleTable from "../../../src/class/SimpleTable.ts";
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

async function cacheIndexedEmbeddings(
  table: SimpleTable,
  client: FakeOllamaEmbeddingClient,
): Promise<void> {
  await table.cache(async () => {
    table.loadArray([
      { id: "a", text: "alpha" },
      { id: "b", text: "beta" },
    ]);
    await table.aiEmbeddings("text", "text_embeddings", {
      embeddings: {
        provider: "ollama",
        model: "cache-index-model",
        ollama: client,
        cache: false,
      },
      createIndex: true,
    }).createFtsIndex("id", "text").run();
  });
}

Deno.test("aiEmbeddings verbose progress does not add blank lines", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("embedding_progress");
  table.loadArray([{ text: "alpha" }, { text: "beta" }]);
  const client = new FakeOllamaEmbeddingClient(
    "http://progress.local:11434",
    [1, 0],
  );
  const logs: string[] = [];
  const originalLog = console.log;
  console.log = (...values: unknown[]) =>
    logs.push(values.map(String).join(" "));

  try {
    const returned = table.aiEmbeddings("text", "text_embeddings", {
      embeddings: {
        provider: "ollama",
        model: "model-a",
        ollama: client,
        cache: false,
      },
      verbose: true,
    }).selectColumns(["text", "text_embeddings"]);
    assertEquals(returned === table, true);
    assertEquals(client.requests, 0);
    await returned.run();
  } finally {
    console.log = originalLog;
    await sdb.close();
  }

  assertEquals(logs, [
    "\naiEmbeddings()",
    "Processing row 1 of 2... (50%)",
    "Processing row 2 of 2... (100%)",
  ]);
});

Deno.test("aiEmbeddings refreshes compatible columns and handles identity changes", async () => {
  const sdb = new SimpleDB();
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
      cache: false,
    },
  }).run();
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
      cache: false,
    },
  }).run();
  assertEquals(compatibleClient.requests, 2);
  assertEquals(await table.getValues("text_embeddings"), [[9, 9], [9, 9]]);
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
      cache: false,
    },
  }).run();
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
      cache: false,
    },
  }).run();
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
      cache: false,
    },
  }).run();
  assertEquals(changedModelClient.requests, 2);
  assertEquals((await table.getTypes()).text_embeddings, "FLOAT[3]");

  await sdb.close();
});

for (const cache of [false, true]) {
  Deno.test(`aiEmbeddings refreshes changed text with cache=${cache}`, async () => {
    const directory = await Deno.makeTempDir();
    const originalDirectory = Deno.cwd();
    const sdb = new SimpleDB();
    try {
      Deno.chdir(directory);
      const table = sdb.newTable("refresh_text");
      const inputs: string[] = [];
      const client = {
        embeddingEndpoint: "http://refresh.local:11434",
        embed: (request: { input: string | string[] }) => {
          const text = String(request.input);
          inputs.push(text);
          return Promise.resolve({
            embeddings: [text === "changed" ? [0, 1] : [1, 0]],
          });
        },
      };
      const options = {
        embeddings: {
          provider: "ollama" as const,
          model: "refresh-model",
          ollama: client,
          cache,
        },
      };
      await table.loadArray([{ text: "alpha" }, { text: "beta" }])
        .aiEmbeddings("text", "vec", { ...options, createIndex: true }).run();
      assertEquals(inputs, ["alpha", "beta"]);
      await table.replace("text", { alpha: "changed" }).run();
      inputs.length = 0;
      await table.aiEmbeddings("text", "vec", options).run();
      assertEquals(inputs, cache ? ["changed"] : ["changed", "beta"]);
      assertEquals(await table.getValues("vec"), [[0, 1], [1, 0]]);
      assertEquals(table.indexes.filter(({ kind }) => kind === "vss"), []);
      inputs.length = 0;
      await table.aiEmbeddings("text", "vec", { ...options, createIndex: true })
        .run();
      assertEquals(inputs, cache ? [] : ["changed", "beta"]);
      assertEquals(
        table.indexes.filter(({ kind }) => kind === "vss").length,
        1,
      );
    } finally {
      await sdb.close();
      Deno.chdir(originalDirectory);
      await Deno.remove(directory, { recursive: true });
    }
  });
}

Deno.test("aiEmbeddings preserves geometry columns when generating and refreshing", async () => {
  const sdb = new SimpleDB();
  try {
    const table = sdb.newTable("geometry_embeddings");
    const geometry = { type: "Point", coordinates: [-73.5, 45.5] };
    await table.loadArray([{ text: "alpha", geometry }], {
      columnTypes: { geometry: "GEOMETRY('EPSG:4326')" },
    }).run();
    const client = new FakeOllamaEmbeddingClient(
      "http://geometry.local:11434",
      [1, 0],
    );
    for (let i = 0; i < 2; i++) {
      await table.aiEmbeddings("text", "vec", {
        embeddings: {
          provider: "ollama",
          model: "geometry-model",
          ollama: client,
          cache: false,
        },
      }).run();
      assertEquals((await table.getTypes()).geometry, "GEOMETRY('EPSG:4326')");
      assertEquals(
        await sdb.customQuery(
          `SELECT ST_AsText(geometry) AS wkt FROM "${table.name}"`,
          { returnData: true },
        ),
        [{ wkt: "POINT (-73.5 45.5)" }],
      );
    }
    assertEquals(client.requests, 2);
  } finally {
    await sdb.close();
  }
});

Deno.test("aiEmbeddings regenerates a legacy column without provenance", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("legacy_embeddings");
  table.loadArray([
    { text: "alpha", text_embeddings: [9, 9] },
    { text: "beta", text_embeddings: [9, 9] },
  ], { columnTypes: { text_embeddings: "FLOAT[2]" } });

  const client = new FakeOllamaEmbeddingClient(
    "http://legacy.local:11434",
    [1, 0],
  );
  await table.aiEmbeddings("text", "text_embeddings", {
    embeddings: {
      provider: "ollama",
      model: "model-a",
      ollama: client,
      cache: false,
    },
  }).run();

  assertEquals(client.requests, 2);
  await sdb.close();
});

Deno.test("aiEmbeddings refreshes embeddings after reopening a DuckDB database", async () => {
  const directory = await Deno.makeTempDir();
  const databaseFile = `${directory}/embedding-provenance.db`;
  try {
    const firstDb = new SimpleDB({ file: databaseFile });
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
        cache: false,
      },
    }).run();
    assertEquals(firstClient.requests, 2);
    await firstDb.close();

    const reopenedDb = new SimpleDB({ file: databaseFile });
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
        cache: false,
      },
    }).run();
    assertEquals(compatibleClient.requests, 2);
    assertEquals(await reopenedTable.getValues("text_embeddings"), [[9, 9], [
      9,
      9,
    ]]);
    await reopenedDb.close();
  } finally {
    await Deno.remove(directory, { recursive: true });
  }
});

Deno.test("every incompatible identity transition invalidates a stale VSS index", async () => {
  const sdb = new SimpleDB();
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
      cache: false,
    },
    createIndex: true,
  }).run();
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
      cache: false,
    },
  }).run();
  assertEquals(semanticChangeClient.requests, 2);
  assertEquals(table.indexes, []);

  await table.aiEmbeddings("text", "text_embeddings", {
    embeddings: {
      provider: "ollama",
      model: "model-a",
      contextWindow: 8_192,
      ollama: semanticChangeClient,
      cache: false,
    },
    createIndex: true,
  }).run();
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
      cache: false,
    },
  }).run();
  assertEquals(modelChangeClient.requests, 2);
  assertEquals(table.indexes, []);

  await table.aiEmbeddings("text", "text_embeddings", {
    embeddings: {
      provider: "ollama",
      model: "model-b",
      ollama: modelChangeClient,
      cache: false,
    },
    createIndex: true,
  }).run();
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
      cache: false,
    },
  }).run();
  assertEquals(dimensionChangeClient.requests, 2);
  assertEquals((await table.getTypes()).text_embeddings, "FLOAT[3]");
  assertEquals(table.indexes, []);

  await table.aiEmbeddings("text", "text_embeddings", {
    embeddings: {
      provider: "ollama",
      model: "model-c",
      ollama: dimensionChangeClient,
      cache: false,
    },
    createIndex: true,
  }).run();
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
        cache: false,
      },
    }).run();
  } finally {
    globalThis.fetch = originalFetch;
  }
  assertEquals(geminiFetch.requests, 2);
  assertEquals(table.indexes, []);
  await sdb.close();
});

Deno.test("stale VSS cleanup preserves unrelated structured index definitions", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("mixed_indexes");
  table.loadArray([
    { id: "a", text: "alpha" },
    { id: "b", text: "beta" },
  ]);
  table.createFtsIndex("id", "text");
  await table.run();

  await table.aiEmbeddings("text", "text_embeddings", {
    embeddings: {
      provider: "ollama",
      model: "model-a",
      ollama: new FakeOllamaEmbeddingClient(
        "http://mixed.local:11434",
        [1, 0],
      ),
      cache: false,
    },
    createIndex: true,
  }).run();
  assertEquals(table.indexes.map(({ kind }) => kind).sort(), ["fts", "vss"]);

  await table.aiEmbeddings("text", "text_embeddings", {
    embeddings: {
      provider: "ollama",
      model: "model-b",
      ollama: new FakeOllamaEmbeddingClient(
        "http://mixed.local:11434",
        [0, 1],
      ),
      cache: false,
    },
  }).run();

  assertEquals(table.indexes.map(({ kind }) => kind), ["fts"]);
  await sdb.close();
});

Deno.test("DuckDB cache restores FTS and rebuilds HNSW from structured definitions", async () => {
  if (existsSync("./.sda-cache")) {
    rmSync("./.sda-cache", { recursive: true });
  }

  try {
    const firstDb = new SimpleDB();
    const firstTable = firstDb.newTable("indexed_cache");
    const firstClient = new FakeOllamaEmbeddingClient(
      "http://indexed-cache.local:11434",
      [1, 0],
    );
    await cacheIndexedEmbeddings(firstTable, firstClient);
    assertEquals(firstClient.requests, 2);
    await firstDb.close();

    const cachedDb = new SimpleDB();
    const cachedTable = cachedDb.newTable("indexed_cache");
    const cachedClient = new FakeOllamaEmbeddingClient(
      "http://indexed-cache.local:11434",
      [0, 1],
    );
    await cacheIndexedEmbeddings(cachedTable, cachedClient);

    assertEquals(cachedClient.requests, 0);
    assertEquals(cachedTable.indexes.map(({ kind }) => kind).sort(), [
      "fts",
      "vss",
    ]);
    const physicalVssIndexes = await cachedDb.customQuery(
      `SELECT index_name FROM duckdb_indexes()
      WHERE table_name = 'indexed_cache'
        AND index_name LIKE 'vss_cosine_index_%';`,
      { returnData: true },
    ) as { index_name: string }[];
    const physicalFtsSchemas = await cachedDb.customQuery(
      `SELECT schema_name FROM duckdb_schemas()
      WHERE schema_name LIKE 'fts_main_indexed_cache%';`,
      { returnData: true },
    ) as { schema_name: string }[];
    assertEquals(physicalVssIndexes.length, 1);
    assertEquals(physicalFtsSchemas.length, 1);
    await cachedDb.close();
  } finally {
    if (existsSync("./.sda-cache")) {
      rmSync("./.sda-cache", { recursive: true });
    }
  }
});

Deno.test("failed regeneration is retried and restores cache logging", async () => {
  const sdb = new SimpleDB();
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
      cache: false,
    },
  }).run();

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
      }).run(),
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
      cache: false,
    },
  }).run();
  assertEquals(retryClient.requests, 2);
  await sdb.close();
});

if (hasGoogleEmbeddingCredentials) {
  if (existsSync("./.journalism-cache")) {
    rmSync("./.journalism-cache", { recursive: true });
  }
  Deno.test("should create embeddings", async () => {
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

    // Ask the AI to generate embeddings in a new column "embeddings".
    await table.aiEmbeddings("food", "embeddings", {
      embeddings: {
        ...geminiEmbeddingOptions,
      },
      // Avoid exceeding a rate limit by waiting between requests
      rateLimitPerMinute: 15,
      // Log details
      verbose: true,
    }).run();

    // Just making sure it's doesnt crash for now
    assertEquals(true, true);
    await sdb.close();
  });
  Deno.test("should retrieve embedding from cache", async () => {
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

    // Ask the AI to generate embeddings in a new column "embeddings".
    await table.aiEmbeddings("food", "embeddings", {
      embeddings: {
        ...geminiEmbeddingOptions,
        cache: true,
      },
      // Avoid exceeding a rate limit by waiting between requests
      rateLimitPerMinute: 15,
      // Log details
      verbose: true,
    }).run();

    // Just making sure it's doesnt crash for now
    assertEquals(true, true);
    await sdb.close();
  });
  Deno.test("should create embeddings with an index", async () => {
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

    // Ask the AI to generate embeddings in a new column "embeddings".
    await table.aiEmbeddings("food", "embeddings", {
      embeddings: {
        ...geminiEmbeddingOptions,
      },
      // Avoid exceeding a rate limit by waiting between requests
      rateLimitPerMinute: 15,
      // Create an index on the new column "embeddings"
      createIndex: true,
      // Log details
      verbose: true,
    }).run();

    // Just making sure it's doesnt crash for now
    assertEquals(true, true);
    await sdb.close();
  });
} else {
  console.log("No AI_KEY in process.env");
}

if (Deno.env.get("AI_EMBEDDINGS_PROVIDER") === "ollama") {
  if (existsSync("./.journalism-cache")) {
    rmSync("./.journalism-cache", { recursive: true });
  }
  Deno.test("should create embeddings", async () => {
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

    // Ask the AI to generate embeddings in a new column "embeddings".
    await table.aiEmbeddings("food", "embeddings", {
      embeddings: {
        provider: "ollama",
        cache: false,
      },
      // Log details
      verbose: true,
    }).run();

    // Just making sure it's doesnt crash for now
    assertEquals(true, true);
    await sdb.close();
  });
  Deno.test("should create embeddings with a different Ollama instance", async () => {
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

    const ollama = new Ollama({ host: "http://127.0.0.1:11434" });

    // Ask the AI to generate embeddings in a new column "embeddings".
    await table.aiEmbeddings("food", "embeddings", {
      embeddings: {
        provider: "ollama",
        ollama,
        cache: false,
      },
      // Log details
      verbose: true,
    }).run();

    // Just making sure it's doesnt crash for now
    assertEquals(true, true);
    await sdb.close();
  });
  Deno.test("should retrieve embedding from cache", async () => {
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

    // Ask the AI to generate embeddings in a new column "embeddings".
    await table.aiEmbeddings("food", "embeddings", {
      embeddings: {
        provider: "ollama",
        cache: true,
      },
      // Avoid exceeding a rate limit by waiting between requests
      // rateLimitPerMinute: 15,
      // Log details
      verbose: true,
    }).run();

    // Just making sure it's doesnt crash for now
    assertEquals(true, true);
    await sdb.close();
  });
  Deno.test("should create embeddings with an index", async () => {
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

    // Ask the AI to generate embeddings in a new column "embeddings".
    await table.aiEmbeddings("food", "embeddings", {
      embeddings: {
        provider: "ollama",
        cache: false,
      },
      // Avoid exceeding a rate limit by waiting between requests
      // rateLimitPerMinute: 15,
      // Create an index on the new column "embeddings"
      createIndex: true,
      // Log details
      verbose: true,
    }).run();

    // Just making sure it's doesnt crash for now
    assertEquals(true, true);
    await sdb.close();
  });
  Deno.test("should create embeddings with concurrent requests", async () => {
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

    // Ask the AI to generate embeddings in a new column "embeddings".
    await table.aiEmbeddings("food", "embeddings", {
      embeddings: {
        provider: "ollama",
        cache: false,
      },
      // Avoid exceeding a rate limit by waiting between requests
      // rateLimitPerMinute: 15,
      // Create an index on the new column "embeddings"
      createIndex: true,
      // Use concurrent requests to speed up the process
      concurrency: 2,
      // Log details
      verbose: true,
    }).run();

    // Just making sure it's doesnt crash for now
    assertEquals(true, true);
    await sdb.close();
  });
} else {
  console.log("AI_EMBEDDINGS_PROVIDER is not set to ollama");
}

Deno.test("aiEmbeddings preserves SQL values and independent vectors across transfer batches", async () => {
  const { sdb, table, assertPreserved } = await createAIEnrichmentFixture();
  try {
    for (
      const [column, dimensions] of [
        ["first", 2],
        ["second", 3],
        ["first", 4],
        ["second", 2],
      ] as const
    ) {
      let requests = 0;
      const client = {
        embeddingEndpoint: "http://lossless.local:11434",
        embed: (request: { input: string | string[] }) => {
          requests++;
          const id = Number(String(request.input).slice(4));
          return Promise.resolve({
            embeddings: [[id, ...Array<number>(dimensions - 1).fill(1)]],
          });
        },
      };
      await table.aiEmbeddings("text", column, {
        embeddings: {
          provider: "ollama",
          model: "lossless-test",
          ollama: client,
          cache: false,
        },
        concurrency: 3,
      }).run();
      assertEquals(requests, 1003);
      const outputs = column === "first" && dimensions === 2
        ? ["first"]
        : ["first", "second"];
      await assertPreserved(outputs);
      assertEquals((await table.getTypes())[column], `FLOAT[${dimensions}]`);
      for (const output of outputs) {
        assertEquals(
          await sdb.customQuery(
            `SELECT count(*) AS valid FROM enriched
          WHERE ${output}[1] = i AND array_cosine_similarity(${output}, ${output}) > 0.999`,
            { returnData: true },
          ),
          [{ valid: 1003 }],
        );
      }
    }
  } finally {
    await sdb.close();
  }
});

for (const failure of ["generation", "staging"]) {
  Deno.test(`aiEmbeddings preserves original data after late ${failure} failure`, async () => {
    const { sdb, table, assertPreserved } = await createAIEnrichmentFixture();
    let requests = 0;
    try {
      const client = {
        embeddingEndpoint: "http://failure.local:11434",
        embed: () => {
          requests++;
          if (requests > 1000 && failure === "generation") {
            throw new Error("late provider failure");
          }
          return Promise.resolve({
            embeddings: [requests > 1000 ? [1, 2, 3] : [1, 2]],
          });
        },
      };
      await assertRejects(
        () =>
          table.aiEmbeddings("text", "existing_vector", {
            embeddings: {
              provider: "ollama",
              model: "lossless-test",
              ollama: client,
              cache: false,
            },
          }).run(),
        Error,
        failure === "generation" ? "late provider failure" : "changed type",
      );
      assertEquals(requests > 1000, true);
      await assertPreserved();
    } finally {
      await sdb.close();
    }
  });
}

for (const target of ["input", "output"] as const) {
  Deno.test(`aiEmbeddings rejects geometry ${target} before provider requests`, async () => {
    const { sdb, table, assertPreserved } = await createAIEnrichmentFixture(2);
    const client = new FakeOllamaEmbeddingClient(
      "http://geometry.local:11434",
      [1, 0],
    );
    try {
      await assertRejects(
        () =>
          table.aiEmbeddings(
            target === "input" ? "UNKNOWN_CRS" : "text",
            target === "output" ? "PROJECTED" : "vectors",
            {
              embeddings: {
                provider: "ollama",
                model: "geometry-test",
                ollama: client,
                cache: false,
              },
            },
          ).run(),
        Error,
        "cannot be an input or output",
      );
      assertEquals(client.requests, 0);
      await assertPreserved();
    } finally {
      await sdb.close();
    }
  });
}
