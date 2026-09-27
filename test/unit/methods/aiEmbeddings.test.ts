import { FakeTime } from "@std/testing/time";
import { stub } from "@std/testing/mock";
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

Deno.test("aiEmbeddings refills slots, bounds concurrency, and matches out-of-order results", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("refill");
  await table.loadArray([0, 1, 2, 3].map((i) => ({ text: String(i) }))).run();
  const release = Promise.withResolvers<void>();
  const third = Promise.withResolvers<void>();
  let active = 0;
  let peak = 0;
  const starts: number[] = [];
  const pending = table.aiEmbeddings("text", "vector", {
    concurrency: 2,
    embeddings: {
      provider: "ollama",
      model: "refill",
      cache: false,
      ollama: {
        embeddingEndpoint: "http://refill.local:11434",
        embed: async ({ input }: { input: string }) => {
          const id = Number(input);
          starts.push(id);
          peak = Math.max(peak, ++active);
          if (id === 0) await release.promise;
          if (id === 2) third.resolve();
          active--;
          return { embeddings: [[id, 1]] };
        },
      },
    },
  }).run();
  try {
    await third.promise;
    assertEquals(starts.slice(0, 3), [0, 1, 2]);
    assertEquals(peak, 2);
    release.resolve();
    await pending;
    assertEquals(await table.getValues("vector"), [[0, 1], [1, 1], [2, 1], [
      3,
      1,
    ]]);
  } finally {
    release.resolve();
    await pending;
    await sdb.close();
  }
});

Deno.test("aiEmbeddings drains failures without retries or new tasks and cleans staging", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("failure_drain");
  await table.loadArray([0, 1, 2, 3].map((i) => ({ text: String(i) }))).run();
  const fail = Promise.withResolvers<void>();
  const release = Promise.withResolvers<void>();
  const second = Promise.withResolvers<void>();
  const starts: string[] = [];
  let settled = false;
  const pending = table.aiEmbeddings("text", "vector", {
    concurrency: 2,
    embeddings: {
      provider: "ollama",
      model: "drain",
      cache: false,
      ollama: {
        embeddingEndpoint: "http://drain.local:11434",
        embed: async ({ input }: { input: string }) => {
          starts.push(input);
          if (input === "0") {
            await fail.promise;
            throw new Error("first failure");
          }
          second.resolve();
          await release.promise;
          throw new Error("late failure");
        },
      },
    },
  }).run();
  const observed = pending.then(() => {
    settled = true;
  }, (error: unknown) => {
    settled = true;
    return error;
  });
  try {
    await second.promise;
    fail.resolve();
    // Yield the event loop; the sibling's explicit gate remains closed.
    await new Promise((resolve) => setTimeout(resolve, 0));
    assertEquals(settled, false);
    assertEquals(starts, ["0", "1"]);
    release.resolve();
    const error = await observed;
    assertEquals(error instanceof Error && error.message, "first failure");
    assertEquals(await table.getValues("text"), ["0", "1", "2", "3"]);
    assertEquals(await table.hasColumn("vector"), false);
    assertEquals(
      await sdb.customQuery(
        "SELECT count(*) AS n FROM duckdb_tables() WHERE starts_with(table_name, '__sda_source_') OR starts_with(table_name, '__sda_generated_') OR starts_with(table_name, '__sda_batch_')",
        { returnData: true },
      ),
      [{ n: 0 }],
    );
  } finally {
    fail.resolve();
    release.resolve();
    await observed;
    await sdb.close();
  }
});

Deno.test("aiEmbeddings validates scheduling before reading rows or invalidating provenance and indexes", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("validation");
  const client = new FakeOllamaEmbeddingClient(
    "http://validation.local:11434",
    [1, 0],
  );
  const embeddings = {
    provider: "ollama" as const,
    model: "validation",
    cache: false,
    ollama: client,
  };
  try {
    await table.loadArray([{ text: "hello" }]).aiEmbeddings("text", "vector", {
      embeddings,
      createIndex: true,
    }).run();
    const metadata = () =>
      sdb.customQuery(
        "SELECT * FROM __sda_embedding_column_metadata WHERE table_name = 'validation'",
        { returnData: true },
      );
    const indexes = () =>
      sdb.customQuery(
        "SELECT index_name FROM duckdb_indexes() WHERE table_name = 'validation'",
        { returnData: true },
      );
    const originalMetadata = await metadata();
    const originalIndexes = await indexes();
    using noReads = stub(table, "getRowCount", () => {
      throw new Error("must not read rows");
    });
    for (
      const options of [
        ...[0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1].map((
          concurrency,
        ) => ({ concurrency })),
        ...[0, -1, NaN, Infinity].map((rateLimitPerMinute) => ({
          rateLimitPerMinute,
        })),
        { errorColumn: "VECTOR" },
        ...[-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1].map((
          retry,
        ) => ({ retry })),
      ]
    ) {
      await assertRejects(
        () =>
          table.aiEmbeddings("text", "vector", { embeddings, ...options })
            .run(),
        Error,
        "concurrency" in options
          ? "concurrency"
          : "errorColumn" in options
          ? "errorColumn"
          : "retry" in options
          ? "retry"
          : "rateLimitPerMinute",
      );
    }
    assertEquals(noReads.calls.length, 0);
    assertEquals(client.requests, 1);
    assertEquals(await metadata(), originalMetadata);
    assertEquals(await indexes(), originalIndexes);
  } finally {
    await sdb.close();
  }
});

Deno.test("aiEmbeddings bypasses cached requests and paces misses across transfer batches", async () => {
  const directory = Deno.makeTempDirSync();
  const originalDirectory = Deno.cwd();
  Deno.chdir(directory);
  const sdb = new SimpleDB();
  const table = sdb.newTable("pacing");
  const starts: number[] = [];
  const inputs: string[] = [];
  const embeddings = {
    provider: "ollama" as const,
    model: "pacing",
    cache: true,
    ollama: {
      embeddingEndpoint: "http://pacing.local:11434",
      embed: ({ input }: { input: string }) => {
        starts.push(Date.now());
        inputs.push(input);
        return Promise.resolve({ embeddings: [[1, 0]] });
      },
    },
  };
  try {
    await table.loadArray(
      Array.from({ length: 1003 }, (_, i) => ({ i, text: String(i) })),
    )
      .aiEmbeddings("text", "vector", { embeddings, concurrency: 3 }).run();
    await sdb.customQuery(
      "UPDATE pacing SET text = concat('changed-', text) WHERE i IN (0, 999, 1000, 1002)",
    );
    starts.length = 0;
    inputs.length = 0;
    using time = new FakeTime(0);
    const logs: string[] = [];
    using capture = stub(
      console,
      "log",
      (message: unknown) => logs.push(String(message)),
    );
    let done = false;
    const pending = table.aiEmbeddings("text", "vector", {
      embeddings,
      concurrency: 3,
      rateLimitPerMinute: 1200,
      logProgress: true,
    }).run();
    const observed = pending.finally(() => {
      done = true;
    });
    while (!done) await time.nextAsync();
    await observed;
    assertEquals(inputs, [
      "changed-0",
      "changed-999",
      "changed-1000",
      "changed-1002",
    ]);
    assertEquals(starts, [0, 50, 100, 150]);
    assertEquals(time.now, 150);
    assertEquals(capture.calls.length, 1003);
    assertEquals(
      logs,
      Array.from(
        { length: 1003 },
        (_, i) => `Processed ${i + 1} of 1003 requests.`,
      ),
    );
  } finally {
    await sdb.close();
    Deno.chdir(originalDirectory);
    Deno.removeSync(directory, { recursive: true });
  }
});

Deno.test("aiEmbeddings preserves empty-input behavior and validates options without dispatch", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("empty_input");
  const client = new FakeOllamaEmbeddingClient("http://empty.local:11434", [
    1,
    0,
  ]);
  const embeddings = {
    provider: "ollama" as const,
    model: "empty",
    cache: false,
    ollama: client,
  };
  try {
    await table.loadArray([{ text: "hello" }]).run();
    await sdb.customQuery("DELETE FROM empty_input");
    await assertRejects(
      () =>
        table.aiEmbeddings("text", "vector", { embeddings, concurrency: 0 })
          .run(),
      Error,
      "concurrency",
    );
    await assertRejects(
      () =>
        table.aiEmbeddings("text", "vector", {
          embeddings,
          rateLimitPerMinute: 0,
        }).run(),
      Error,
      "rateLimitPerMinute",
    );
    await assertRejects(
      () => table.aiEmbeddings("text", "vector", { embeddings }).run(),
      Error,
      "Embedding generation did not create",
    );
    assertEquals(client.requests, 0);
  } finally {
    await sdb.close();
  }
});

Deno.test("aiEmbeddings stores per-row errors and nulls without losing successful vectors", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("embedding_errors");
  let requests = 0;
  try {
    await table.loadArray([
      { text: "good", error: "old error" },
      { text: "bad", error: "old error" },
      { text: "undefined", error: "old error" },
      { text: null, error: "old error" },
      { text: "last", error: "old error" },
    ]).aiEmbeddings("text", "vector", {
      errorColumn: "error",
      concurrency: 3,
      embeddings: {
        provider: "ollama",
        model: "errors",
        cache: false,
        ollama: {
          embeddingEndpoint: "http://errors.local:11434",
          embed: ({ input }: { input: string }) => {
            requests++;
            if (input === "bad") {
              return Promise.reject("provider rejected input");
            }
            if (input === "undefined") return Promise.reject(undefined);
            return Promise.resolve({
              embeddings: [input === "good" ? [1, 0] : [0, 1]],
            });
          },
        },
      },
    }).run();
    assertEquals(requests, 4);
    assertEquals(await table.getValues("vector"), [[1, 0], null, null, null, [
      0,
      1,
    ]]);
    assertEquals(await table.getValues("error"), [
      null,
      "provider rejected input",
      "undefined",
      'The column "text" must be a string. Found null instead.',
      null,
    ]);
    assertEquals((await table.getTypes()).vector, "FLOAT[2]");
  } finally {
    await sdb.close();
  }
});

for (const failures of ["first-batch", "last-batch", "all"] as const) {
  Deno.test(`aiEmbeddings retains null vectors and errors across ${failures} failures`, async () => {
    const { sdb, table, assertPreserved } = await createAIEnrichmentFixture();
    let requests = 0;
    let fail = true;
    const logs: string[] = [];
    using capture = stub(
      console,
      "log",
      (message: unknown) => logs.push(String(message)),
    );
    using noFullReads = stub(table, "getValues", () => {
      throw new Error("must not buffer the output column");
    });
    const embeddings = {
      provider: "ollama" as const,
      model: "transfer-errors",
      cache: false,
      ollama: {
        embeddingEndpoint: "http://transfer-errors.local:11434",
        embed: ({ input }: { input: string }) => {
          requests++;
          const id = Number(input.slice(4));
          if (
            fail &&
            (failures === "all" ||
              (failures === "first-batch" ? id < 1000 : id >= 1000))
          ) {
            return Promise.reject(new Error("unavailable"));
          }
          return Promise.resolve({ embeddings: [[id, 1]] });
        },
      },
    };
    try {
      await table.aiEmbeddings("text", "vector", {
        embeddings,
        concurrency: 3,
        errorColumn: "error",
        logProgress: true,
      }).run();
      const failed = failures === "all"
        ? 1003
        : failures === "first-batch"
        ? 1000
        : 3;
      assertEquals(requests, 1003);
      assertEquals(
        await sdb.customQuery(
          "SELECT count(*) FILTER (WHERE vector IS NULL AND error = 'unavailable') AS failed, count(*) FILTER (WHERE vector IS NOT NULL AND error IS NULL) AS succeeded FROM enriched",
          { returnData: true },
        ),
        [{ failed, succeeded: 1003 - failed }],
      );
      assertEquals(
        logs,
        Array.from(
          { length: 1003 },
          (_, i) => `Processed ${i + 1} of 1003 requests.`,
        ),
      );
      assertEquals(capture.calls.length, 1003);
      assertEquals(noFullReads.calls.length, 0);
      await assertPreserved(["vector", "error"]);
      if (failures === "all") {
        assertEquals(
          await sdb.customQuery(
            "SELECT dimensions FROM __sda_embedding_column_metadata WHERE embedding_column = 'vector'",
            { returnData: true },
          ),
          [{ dimensions: 0 }],
        );
        fail = false;
        await table.aiEmbeddings("text", "vector", {
          embeddings,
          errorColumn: "error",
          concurrency: 3,
        }).run();
        assertEquals((await table.getTypes()).vector, "FLOAT[2]");
        assertEquals(
          await sdb.customQuery(
            "SELECT count(*) AS n FROM enriched WHERE vector IS NOT NULL AND error IS NULL",
            { returnData: true },
          ),
          [{ n: 1003 }],
        );
        await assertPreserved(["vector", "error"]);
      }
    } finally {
      await sdb.close();
    }
  });
}

Deno.test("aiEmbeddings paces retries and reports completion once per row", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("embedding_retries");
  await table.loadArray([{ text: "transient" }, { text: "permanent" }]).run();
  const starts: number[] = [];
  const checks: unknown[] = [];
  const logs: string[] = [];
  const transient = new Error("transient");
  const permanent = new Error("permanent");
  let attempts = 0;
  try {
    using time = new FakeTime(0);
    using capture = stub(
      console,
      "log",
      (message: unknown) => logs.push(String(message)),
    );
    let done = false;
    const pending = table.aiEmbeddings("text", "vector", {
      retry: 2,
      errorColumn: "error",
      logProgress: true,
      rateLimitPerMinute: 600,
      retryCheck: (error) => {
        checks.push(error);
        return Promise.resolve(error === transient);
      },
      embeddings: {
        provider: "ollama",
        model: "retry",
        cache: false,
        ollama: {
          embeddingEndpoint: "http://retry.local:11434",
          embed: ({ input }: { input: string }) => {
            starts.push(Date.now());
            if (input === "permanent") return Promise.reject(permanent);
            if (++attempts === 1) return Promise.reject(transient);
            return Promise.resolve({ embeddings: [[1, 0]] });
          },
        },
      },
    }).run().then(() => ({ error: undefined }), (error: unknown) => ({ error }))
      .finally(() => {
        done = true;
      });
    while (!done) await time.nextAsync();
    assertEquals((await pending).error, undefined);
    assertEquals(starts, [0, 100, 200]);
    assertEquals(checks, [transient, permanent]);
    assertEquals(capture.calls.length, 2);
    assertEquals(logs, [
      "Processed 1 of 2 requests.",
      "Processed 2 of 2 requests.",
    ]);
    assertEquals(await table.getValues("vector"), [[1, 0], null]);
    assertEquals(await table.getValues("error"), [null, "permanent"]);
  } finally {
    await sdb.close();
  }
});

for (const errorColumn of [undefined, "error"]) {
  Deno.test(`aiEmbeddings exhausts retries with errorColumn=${errorColumn}`, async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("retry_exhaustion");
    await table.loadArray([{ text: "a" }, { text: "b" }]).run();
    let requests = 0;
    try {
      const pending = () =>
        table.aiEmbeddings("text", "vector", {
          retry: 2,
          errorColumn,
          embeddings: {
            provider: "ollama",
            model: "exhaustion",
            cache: false,
            ollama: {
              embeddingEndpoint: "http://exhaustion.local:11434",
              embed: () => {
                requests++;
                return Promise.reject(new Error("unavailable"));
              },
            },
          },
        }).run();
      if (errorColumn === undefined) {
        await assertRejects(pending, Error, "unavailable");
        assertEquals(requests, 3);
        assertEquals(await table.hasColumn("vector"), false);
        assertEquals(await table.getValues("text"), ["a", "b"]);
      } else {
        await pending();
        assertEquals(requests, 6);
        assertEquals(await table.getValues("vector"), [null, null]);
        assertEquals(await table.getValues("error"), [
          "unavailable",
          "unavailable",
        ]);
      }
    } finally {
      await sdb.close();
    }
  });
}

Deno.test("aiEmbeddings errorColumn does not swallow retry-policy or staging failures", async () => {
  for (const failure of ["policy", "staging"] as const) {
    const { sdb, table, assertPreserved } = await createAIEnrichmentFixture();
    let requests = 0;
    try {
      await assertRejects(
        () =>
          table.aiEmbeddings("text", "vector", {
            errorColumn: "error",
            retry: 1,
            retryCheck: () => {
              throw new Error("policy failed");
            },
            embeddings: {
              provider: "ollama",
              model: "fatal",
              cache: false,
              ollama: {
                embeddingEndpoint: "http://fatal.local:11434",
                embed: () => {
                  requests++;
                  if (failure === "policy") {
                    return Promise.reject(new Error("provider failed"));
                  }
                  return Promise.resolve({
                    embeddings: [requests > 1000 ? [1, 0, 0] : [1, 0]],
                  });
                },
              },
            },
          }).run(),
        Error,
        failure === "policy" ? "policy failed" : "changed type",
      );
      await assertPreserved();
    } finally {
      await sdb.close();
    }
  }
});
