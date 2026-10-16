import { test, expect } from "vite-plus/test";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import createGenerationClient from "../helpers/createGenerationClient.ts";

const source = [
  { city: "Paris", temperature: 10 },
  { city: "Paris", temperature: 20 },
  { city: "Tokyo", temperature: 24 },
];
const expected = [
  { city: "Paris", average: 15 },
  { city: "Tokyo", average: 24 },
];
const prompt =
  "Calculate the average temperature per city. Name the columns city and average, and sort by city.";

for (const outputTable of [undefined, "averages"]) {
  test(`aiQuery executes queued changes with outputTable=${outputTable}`, async () => {
    const sdb = new SimpleDB();
    const client = createGenerationClient(() =>
      JSON.stringify({
        query: `CREATE OR REPLACE TABLE "${outputTable ?? "weather"}" AS SELECT city, AVG(temperature) AS average FROM weather GROUP BY city ORDER BY city`,
      }),
    );
    try {
      const table = sdb
        .newTable("weather")
        .loadArray(source.map(({ city, temperature }) => ({ city, t: temperature })))
        .renameColumns({ t: "temperature" });
      const result = table.aiQuery(prompt, {
        generation: {
          provider: "ollama",
          model: "query-test",
          ollama: client.ollama,
          cache: false,
        },
        outputTable,
        extraInstructions: "Only use the supplied table.",
      });
      expect(client.requests).toHaveLength(0);
      expect(await result.getData()).toEqual(expected);
      expect(client.requests).toHaveLength(1);
      const sent = client.requests[0].messages?.map((message) => message.content).join("\n");
      expect(sent).toContain('"temperature"');
      expect(sent).toContain("Only use the supplied table.");
      expect(await table.getData()).toEqual(outputTable ? source : expected);
    } finally {
      await sdb.close();
    }
  });
}

for (const invalid of [
  "not JSON",
  JSON.stringify({ query: 42 }),
  JSON.stringify({ wrong: "field" }),
]) {
  test(`aiQuery rejects malformed response ${invalid}`, async () => {
    const sdb = new SimpleDB();
    const client = createGenerationClient(() => invalid);
    try {
      const table = sdb.newTable("weather").loadArray(source);
      await table.run();
      await expect(
        table
          .aiQuery(prompt, {
            generation: {
              provider: "ollama",
              model: "invalid-query",
              ollama: client.ollama,
              cache: false,
            },
          })
          .run(),
      ).rejects.toThrow();
      expect(await sdb.customQuery("SELECT * FROM weather", { returnData: true })).toEqual(source);
      expect(client.requests).toHaveLength(1);
    } finally {
      await sdb.close();
    }
  });
}

test("aiQuery propagates provider failures without replacing the source", async () => {
  const sdb = new SimpleDB();
  const client = createGenerationClient(() => {
    throw new Error("Provider unavailable");
  });
  try {
    const table = sdb.newTable("weather").loadArray(source);
    await table.run();
    await expect(
      table
        .aiQuery(prompt, {
          generation: {
            provider: "ollama",
            model: "failed-query",
            ollama: client.ollama,
            cache: false,
          },
        })
        .run(),
    ).rejects.toThrow("Provider unavailable");
    expect(await sdb.customQuery("SELECT * FROM weather", { returnData: true })).toEqual(source);
  } finally {
    await sdb.close();
  }
});

test("aiQuery reuses cached SQL but executes it against the current data", async () => {
  const client = createGenerationClient(() =>
    JSON.stringify({
      query:
        "CREATE OR REPLACE TABLE weather AS SELECT city, AVG(temperature) AS average FROM weather GROUP BY city ORDER BY city",
    }),
  );
  for (const increase of [0, 10]) {
    const sdb = new SimpleDB();
    try {
      const rows = await sdb
        .newTable("weather")
        .loadArray(source.map((row) => ({ ...row, temperature: row.temperature + increase })))
        .aiQuery(prompt, {
          generation: {
            provider: "ollama",
            model: "cached-sql",
            ollama: client.ollama,
            cache: true,
          },
        })
        .getData();
      expect(rows).toEqual(expected.map((row) => ({ ...row, average: row.average + increase })));
      expect(client.requests).toHaveLength(1);
    } finally {
      await sdb.close();
    }
  }
});

for (const provider of ["gemini", "ollama"] as const) {
  const configured =
    provider === "gemini"
      ? Boolean(process.env.AI_KEY || (process.env.AI_PROJECT && process.env.AI_LOCATION))
      : process.env.AI_PROVIDER === "ollama";
  test.skipIf(process.env.CI === "true" || !configured)(
    `live ${provider} SQL computes averages and preserves its source`,
    async () => {
      const sdb = new SimpleDB();
      try {
        const table = sdb.newTable("weather").loadArray(source);
        const result = table.aiQuery(prompt, {
          outputTable: "averages",
          generation:
            provider === "gemini"
              ? { provider, model: "gemini-3-flash-preview", cache: false }
              : { provider, thinkingLevel: false, cache: false },
        });
        expect(await result.getData()).toEqual(expected);
        expect(await table.getData()).toEqual(source);
      } finally {
        await sdb.close();
      }
    },
  );
}
