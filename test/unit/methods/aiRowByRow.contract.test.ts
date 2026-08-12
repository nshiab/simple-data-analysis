import { assertEquals } from "@std/assert";
import { existsSync, rmSync } from "node:fs";
import { Ollama } from "ollama";
import type { GenerationOptions } from "../../../src/index.ts";
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

function registerRowProcessingContract(
  provider: string,
  createFixture: () => ProviderFixture,
): void {
  Deno.test(`aiRowByRow shared batching contract (${provider})`, async () => {
    const fixture = createFixture();
    await fixture.run(async () => {
      const sdb = new SimpleDB({ dataTransport: "file" });
      const table = sdb.newTable(`row_contract_${provider}`);
      table.loadArray([
        { city: "Marrakech" },
        { city: "Kyoto" },
        { city: "Auckland" },
        { city: "Paris" },
      ]);

      await table.aiRowByRow(
        "city",
        "country",
        "Give me the country of the city.",
        {
          generation: fixture.generation,
          batchSize: 2,
          concurrent: 2,
        },
      );

      assertEquals(await table.getData(), [
        { city: "Marrakech", country: "Morocco" },
        { city: "Kyoto", country: "Japan" },
        { city: "Auckland", country: "New Zealand" },
        { city: "Paris", country: "France" },
      ]);
      assertEquals(fixture.requestCount(), 2);
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
          const sdb = new SimpleDB({ dataTransport: "file" });
          const table = sdb.newTable(`row_cache_${provider}_${tableName}`);
          table.loadArray([{ city: "Marrakech" }, { city: "Kyoto" }]);
          await table.aiRowByRow(
            "city",
            "country",
            "Give me the country of the city.",
            {
              generation: { ...fixture.generation, cache: true },
              batchSize: 2,
            },
          );
          assertEquals(await table.getValues("country"), ["Morocco", "Japan"]);
          await sdb.close();
        }
        assertEquals(fixture.requestCount(), 1);
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
        const sdb = new SimpleDB({ dataTransport: "file" });
        const table = sdb.newTable(`row_columns_${provider}`);
        table.loadArray([{ city: "Marrakech" }, { city: "Kyoto" }]);

        await table.aiRowByRow(
          "city",
          ["country", "continent"],
          "Give me the country and continent of the city.",
          { generation: fixture.generation, batchSize: 2 },
        );

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
        const sdb = new SimpleDB({ dataTransport: "file" });
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
        );

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
