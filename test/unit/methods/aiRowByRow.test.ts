import { assert, assertEquals, assertRejects } from "@std/assert";
import { existsSync, rmSync } from "node:fs";
import { Ollama } from "ollama";
import type { GenerationOptions } from "../../../src/helpers/aiOptions.ts";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import { z } from "zod";

type Place = {
  country: string;
  continent: string;
  population: number;
};

const places: Record<string, Place> = {
  Marrakech: { country: "Morocco", continent: "Africa", population: 929_987 },
  Kyoto: { country: "Japan", continent: "Asia", population: 1_463_723 },
  Auckland: {
    country: "New Zealand",
    continent: "Oceania",
    population: 1_478_800,
  },
  Paris: { country: "France", continent: "Europe", population: 2_102_650 },
};

type ProviderFixture = {
  generation: GenerationOptions;
  requestCount: () => number;
  run: <T>(callback: () => Promise<T>) => Promise<T>;
};

type OllamaChatResponse = {
  message: { role: "assistant"; content: string };
  prompt_eval_count: number;
  eval_count: number;
};

function extractValues(prompt: string): string[] {
  const marker = "values as a JSON array:\n";
  const start = prompt.indexOf(marker);
  if (start < 0) {
    throw new Error("The row-processing prompt did not contain input values.");
  }
  const jsonStart = start + marker.length;
  const jsonEnd = prompt.indexOf("\n\n", jsonStart);
  return JSON.parse(
    prompt.slice(jsonStart, jsonEnd < 0 ? undefined : jsonEnd),
  ) as string[];
}

function responseForPrompt(prompt: string): Record<string, unknown>[] {
  const includeContinent = prompt.includes("continent");
  const includePopulation = prompt.includes("population");
  return extractValues(prompt).map((city) => {
    const place = places[city];
    return {
      country: place.country,
      ...(includeContinent ? { continent: place.continent } : {}),
      ...(includePopulation ? { population: place.population } : {}),
    };
  });
}

function createGeminiFixture(): ProviderFixture {
  let requests = 0;
  return {
    generation: {
      provider: "gemini",
      model: "fake-gemini-generation",
      apiKey: "fake-key",
    },
    requestCount: () => requests,
    run: async <T>(callback: () => Promise<T>): Promise<T> => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = (
        _input: string | URL | Request,
        init?: RequestInit,
      ): Promise<Response> => {
        requests++;
        const body = JSON.parse(String(init?.body)) as {
          contents: { parts: { text: string }[] }[];
        };
        const prompt = body.contents.at(-1)?.parts.at(0)?.text ?? "";
        return Promise.resolve(
          new Response(
            JSON.stringify({
              candidates: [{
                content: {
                  parts: [{ text: JSON.stringify(responseForPrompt(prompt)) }],
                },
              }],
              usageMetadata: {
                promptTokenCount: 1,
                candidatesTokenCount: 1,
                totalTokenCount: 2,
              },
            }),
            { status: 200, headers: { "content-type": "application/json" } },
          ),
        );
      };
      try {
        return await callback();
      } finally {
        globalThis.fetch = originalFetch;
      }
    },
  };
}

function createOllamaFixture(): ProviderFixture {
  let requests = 0;
  const client = new Ollama({ host: "http://unused.local:11434" });
  Object.defineProperty(client, "chat", {
    configurable: true,
    writable: true,
    value: (request: { messages: { content: string }[] }) => {
      requests++;
      const prompt = request.messages.at(-1)?.content ?? "";
      return Promise.resolve({
        message: {
          role: "assistant",
          content: JSON.stringify(responseForPrompt(prompt)),
        },
        prompt_eval_count: 1,
        eval_count: 1,
      });
    },
  });
  return {
    generation: {
      provider: "ollama",
      model: "fake-ollama-generation",
      ollama: client,
    },
    requestCount: () => requests,
    run: <T>(callback: () => Promise<T>) => callback(),
  };
}

function createOllamaClient(
  respond: (
    prompt: string,
  ) => OllamaChatResponse | Promise<OllamaChatResponse>,
): Ollama {
  const client = new Ollama({ host: "http://unused.local:11434" });
  Object.defineProperty(client, "chat", {
    configurable: true,
    writable: true,
    value: (request: { messages: { content: string }[] }) =>
      respond(request.messages.at(-1)?.content ?? ""),
  });
  return client;
}

function ollamaResponse(content: unknown): OllamaChatResponse {
  return {
    message: {
      role: "assistant",
      content: JSON.stringify(content),
    },
    prompt_eval_count: 1,
    eval_count: 1,
  };
}

function registerRowProcessingContract(
  provider: string,
  createFixture: () => ProviderFixture,
): void {
  Deno.test(`aiRowByRow shared batching contract (${provider})`, async () => {
    const fixture = createFixture();
    await fixture.run(async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable(`row_contract_${provider}`);
      table.loadArray([
        { city: "Marrakech" },
        { city: "Kyoto" },
        { city: "Auckland" },
        { city: "Paris" },
      ]);
      const metrics = {
        totalCost: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalRequests: 0,
      };

      const returned = table
        .aiRowByRow(
          "city",
          "country",
          "Give me the country of the city.",
          {
            generation: { ...fixture.generation, cache: false },
            batchSize: 2,
            concurrency: 2,
            metrics,
          },
        )
        .filter("country IS NOT NULL");

      assertEquals(returned, table);
      assertEquals(fixture.requestCount(), 0);
      assertEquals(await returned.getData(), [
        { city: "Marrakech", country: "Morocco" },
        { city: "Kyoto", country: "Japan" },
        { city: "Auckland", country: "New Zealand" },
        { city: "Paris", country: "France" },
      ]);
      assertEquals(fixture.requestCount(), 2);
      assertEquals(metrics.totalRequests, 2);
      await sdb.close();
    });
  });

  Deno.test(`aiRowByRow shared cache contract (${provider})`, async () => {
    if (existsSync("./.journalism-cache")) {
      rmSync("./.journalism-cache", { recursive: true });
    }
    try {
      const fixture = createFixture();
      await fixture.run(async () => {
        for (const tableName of ["first", "second"]) {
          const sdb = new SimpleDB();
          const table = sdb.newTable(`row_cache_${provider}_${tableName}`);
          table.loadArray([{ city: "Marrakech" }, { city: "Kyoto" }]);
          const start = performance.now();
          await table.aiRowByRow(
            "city",
            "country",
            "Give me the country of the city.",
            {
              generation: { ...fixture.generation },
              batchSize: 1,
              rateLimitPerMinute: tableName === "second" ? 120 : undefined,
            },
          ).run();
          if (tableName === "second") {
            const duration = performance.now() - start;
            assert(
              duration < 250,
              `Cached requests took ${duration}ms and appear to have been rate-limited.`,
            );
          }
          assertEquals(await table.getValues("country"), ["Morocco", "Japan"]);
          await sdb.close();
        }
        assertEquals(fixture.requestCount(), 2);
      });
    } finally {
      if (existsSync("./.journalism-cache")) {
        rmSync("./.journalism-cache", { recursive: true });
      }
    }
  });

  Deno.test(
    `aiRowByRow shared multiple-column contract (${provider})`,
    async () => {
      const fixture = createFixture();
      await fixture.run(async () => {
        const sdb = new SimpleDB();
        const table = sdb.newTable(`row_columns_${provider}`);
        table.loadArray([{ city: "Marrakech" }, { city: "Kyoto" }]);

        await table.aiRowByRow(
          "city",
          ["country", "continent"],
          "Give me the country and continent of the city.",
          { generation: fixture.generation, batchSize: 2 },
        ).run();

        assertEquals(await table.getData(), [
          { city: "Marrakech", country: "Morocco", continent: "Africa" },
          { city: "Kyoto", country: "Japan", continent: "Asia" },
        ]);
        await sdb.close();
      });
    },
  );

  Deno.test(
    `aiRowByRow shared custom-schema contract (${provider})`,
    async () => {
      const fixture = createFixture();
      await fixture.run(async () => {
        const sdb = new SimpleDB();
        const table = sdb.newTable(`row_schema_${provider}`);
        table.loadArray([{ city: "Marrakech" }, { city: "Kyoto" }]);
        const schemaJson = z.toJSONSchema(z.array(z.object({
          country: z.string(),
          population: z.number(),
        })));

        await table.aiRowByRow(
          "city",
          ["country", "population"],
          "Give me the country and population of the city.",
          {
            generation: { ...fixture.generation, schemaJson },
            batchSize: 2,
          },
        ).run();

        assertEquals(await table.getData(), [
          { city: "Marrakech", country: "Morocco", population: 929_987 },
          { city: "Kyoto", country: "Japan", population: 1_463_723 },
        ]);
        await sdb.close();
      });
    },
  );
}

registerRowProcessingContract("gemini", createGeminiFixture);
registerRowProcessingContract("ollama", createOllamaFixture);

Deno.test("aiRowByRow stores failed batches and continues", async () => {
  const client = createOllamaClient((prompt) => {
    const city = extractValues(prompt)[0];
    if (city === "Kyoto") {
      throw new Error("provider rejected Kyoto");
    }
    return ollamaResponse([{ country: places[city].country }]);
  });
  const sdb = new SimpleDB();
  const table = sdb.newTable("row_errors");
  table.loadArray([
    { city: "Marrakech" },
    { city: "Kyoto" },
    { city: "Auckland" },
  ]);

  await table.aiRowByRow(
    "city",
    "country",
    "Give me the country of the city.",
    {
      generation: {
        provider: "ollama",
        model: "fake-ollama-generation",
        ollama: client,
        cache: false,
      },
      concurrency: 2,
      errorColumn: "error",
    },
  ).run();

  assertEquals(await table.getData(), [
    { city: "Marrakech", country: "Morocco", error: null },
    { city: "Kyoto", country: null, error: "provider rejected Kyoto" },
    { city: "Auckland", country: "New Zealand", error: null },
  ]);
  await sdb.close();
});

Deno.test("aiRowByRow throws a failed batch without errorColumn", async () => {
  const client = createOllamaClient(() => {
    throw new Error("provider failed");
  });
  const sdb = new SimpleDB();
  const table = sdb.newTable("row_throw");
  table.loadArray([{ city: "Marrakech" }]);
  table.aiRowByRow(
    "city",
    "country",
    "Give me the country of the city.",
    {
      generation: {
        provider: "ollama",
        model: "fake-ollama-generation",
        ollama: client,
        cache: false,
      },
    },
  );

  await assertRejects(() => table.run(), Error, "provider failed");
  await sdb.close();
});

Deno.test("aiRowByRow retries when retryCheck accepts the error", async () => {
  let attempts = 0;
  let checkedError: unknown;
  const client = createOllamaClient(() => {
    attempts++;
    if (attempts === 1) {
      throw new Error("temporary failure");
    }
    return ollamaResponse([{ country: "Morocco" }]);
  });
  const sdb = new SimpleDB();
  const table = sdb.newTable("row_retry");
  table.loadArray([{ city: "Marrakech" }]);

  await table.aiRowByRow(
    "city",
    "country",
    "Give me the country of the city.",
    {
      generation: {
        provider: "ollama",
        model: "fake-ollama-generation",
        ollama: client,
        cache: false,
      },
      retry: 1,
      retryCheck: (error) => {
        checkedError = error;
        return true;
      },
    },
  ).run();

  assertEquals(attempts, 2);
  assert(checkedError instanceof Error);
  assertEquals(await table.getValues("country"), ["Morocco"]);
  await sdb.close();
});

Deno.test("aiRowByRow bounds concurrent requests", async () => {
  let active = 0;
  let maximumActive = 0;
  const client = createOllamaClient(async (prompt) => {
    active++;
    maximumActive = Math.max(maximumActive, active);
    await new Promise((resolve) => setTimeout(resolve, 10));
    active--;
    const city = extractValues(prompt)[0];
    return ollamaResponse([{ country: places[city].country }]);
  });
  const sdb = new SimpleDB();
  const table = sdb.newTable("row_concurrent");
  table.loadArray(Object.keys(places).map((city) => ({ city })));

  await table.aiRowByRow(
    "city",
    "country",
    "Give me the country of the city.",
    {
      generation: {
        provider: "ollama",
        model: "fake-ollama-generation",
        ollama: client,
        cache: false,
      },
      concurrency: 2,
    },
  ).run();

  assertEquals(maximumActive, 2);
  await sdb.close();
});

Deno.test("aiRowByRow globally spaces provider request starts", async () => {
  const starts: number[] = [];
  const client = createOllamaClient((prompt) => {
    starts.push(performance.now());
    const city = extractValues(prompt)[0];
    return ollamaResponse([{ country: places[city].country }]);
  });
  const sdb = new SimpleDB();
  const table = sdb.newTable("row_rate_limit");
  table.loadArray([
    { city: "Marrakech" },
    { city: "Kyoto" },
    { city: "Auckland" },
  ]);

  await table.aiRowByRow(
    "city",
    "country",
    "Give me the country of the city.",
    {
      generation: {
        provider: "ollama",
        model: "fake-ollama-generation",
        ollama: client,
        cache: false,
      },
      concurrency: 3,
      rateLimitPerMinute: 1_200,
    },
  ).run();

  assertEquals(starts.length, 3);
  assert(starts[1] - starts[0] >= 40);
  assert(starts[2] - starts[1] >= 40);
  await sdb.close();
});
