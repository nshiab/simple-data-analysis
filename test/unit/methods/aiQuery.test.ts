import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import { existsSync, rmSync } from "node:fs";
import { Ollama } from "ollama";

const geminiGeneration = {
  provider: "gemini",
  model: "gemini-3-flash-preview",
  cache: false,
} as const;
const ollamaGeneration = { provider: "ollama", cache: false } as const;

const aiKey = Deno.env.get("AI_KEY") ?? Deno.env.get("AI_PROJECT");
if (typeof aiKey === "string" && aiKey !== "") {
  if (existsSync("./.journalism-cache")) {
    rmSync("./.journalism-cache", { recursive: true });
  }

  Deno.test("should update a table with natural language", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    table.loadData("test/data/files/dailyTemperatures.csv");
    table.renameColumns({ t: "temperature", "id": "city" });

    await table.aiQuery(
      `I want the average temperature for each city with two decimals.`,
      { generation: geminiGeneration },
    ).log();

    // Just to make sure it doesn't crash for now
    assertEquals(true, true);
    await sdb.close();
  });
  Deno.test("should update a table with natural language and thinking", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    table.loadData("test/data/files/dailyTemperatures.csv");
    table.renameColumns({ t: "temperature", "id": "city" });

    await table.aiQuery(
      `I want the average temperature for each city with two decimals.`,
      {
        generation: {
          ...geminiGeneration,
          thinkingLevel: "low",
        },
        verbose: true,
      },
    ).log();

    // Just to make sure it doesn't crash for now
    assertEquals(true, true);
    await sdb.close();
  });
  Deno.test("should update a table with natural language with cache", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    table.loadData("test/data/files/dailyTemperatures.csv");
    table.renameColumns({ t: "temperature", "id": "city" });

    await table.aiQuery(
      `I want the average temperature for each city with two decimals.`,
      {
        generation: { ...geminiGeneration, cache: true },
        verbose: true,
      },
    ).log();

    // Just to make sure it doesn't crash for now
    assertEquals(true, true);
    await sdb.close();
  });
  Deno.test("should update a table with natural language with query returned from cache", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    table.loadData("test/data/files/dailyTemperatures.csv");
    table.renameColumns({ t: "temperature", "id": "city" });

    await table.aiQuery(
      `I want the average temperature for each city with two decimals.`,
      {
        generation: { ...geminiGeneration, cache: true },
        verbose: true,
      },
    ).log();

    // Just to make sure it doesn't crash for now
    assertEquals(true, true);
    await sdb.close();
  });
  Deno.test("should update a table with natural language and safetyEnabled", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    table.loadData("test/data/files/dailyTemperatures.csv");
    table.renameColumns({ t: "temperature", "id": "city" });

    await table.aiQuery(
      `I want the average temperature for each city with two decimals.`,
      {
        generation: { ...geminiGeneration, safetyEnabled: false },
        verbose: true,
      },
    ).log();

    // Just to make sure it doesn't crash for now
    assertEquals(true, true);
    await sdb.close();
  });
  Deno.test("should update a table with natural language and option verbose", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    table.loadData("test/data/files/dailyTemperatures.csv");
    table.renameColumns({ t: "temperature", "id": "city" });

    await table.aiQuery(
      `I want the average temperature for each city with two decimals.`,
      { generation: geminiGeneration, verbose: true },
    ).log();

    // Just to make sure it doesn't crash for now
    assertEquals(true, true);
    await sdb.close();
  });
  Deno.test("should create a new table with aiQuery results using outputTable option", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    table.loadData("test/data/files/dailyTemperatures.csv");
    table.renameColumns({ t: "temperature", "id": "city" });

    const originalRowCount = await table.getRowCount();

    const resultRowCount = await table.aiQuery(
      `I want the average temperature for each city with two decimals.`,
      {
        generation: { ...geminiGeneration },
        outputTable: "avg_temp",
        verbose: true,
      },
    ).getRowCount();

    // Original table should remain unchanged
    const currentRowCount = await table.getRowCount();
    assertEquals(currentRowCount, originalRowCount);

    // Result table should have the aggregated data
    const resultTable = await sdb.getTable("avg_temp");
    assertEquals(resultTable.name, "avg_temp");
    // We expect fewer rows since we're aggregating by city
    assertEquals(resultRowCount < originalRowCount, true);

    await sdb.close();
  });
} else {
  console.log("No AI_PROJECT in process.env");
}

if (Deno.env.get("AI_PROVIDER") === "ollama") {
  if (existsSync("./.journalism-cache")) {
    rmSync("./.journalism-cache", { recursive: true });
  }
  Deno.test("should update a table with natural language (Ollama)", {
    sanitizeResources: false,
  }, async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    table.loadData("test/data/files/dailyTemperatures.csv");
    table.renameColumns({ t: "temperature", "id": "city" });

    await table.aiQuery(
      `I want the average temperature for each city with two decimals.`,
      { generation: ollamaGeneration, verbose: true },
    ).log();

    // Just to make sure it doesn't crash for now
    assertEquals(true, true);
    await sdb.close();
  });
  Deno.test(
    "should update a table with natural language and thinking (Ollama)",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/dailyTemperatures.csv");
      table.renameColumns({ t: "temperature", "id": "city" });

      await table.aiQuery(
        `I want the average temperature for each city with two decimals.`,
        {
          generation: { ...ollamaGeneration, thinkingLevel: true },
          verbose: true,
        },
      ).log();

      // Just to make sure it doesn't crash for now
      assertEquals(true, true);
      await sdb.close();
    },
  );
  Deno.test(
    "should update a table with natural language with a different Ollama instance",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/dailyTemperatures.csv");
      table.renameColumns({ t: "temperature", "id": "city" });

      const ollama = new Ollama({ host: "http://127.0.0.1:11434" });

      await table.aiQuery(
        `I want the average temperature for each city with two decimals.`,
        {
          generation: { ...ollamaGeneration, ollama },
          verbose: true,
        },
      ).log();

      // Just to make sure it doesn't crash for now
      assertEquals(true, true);
      await sdb.close();
    },
  );
  Deno.test("should update a table with natural language with cache (Ollama)", {
    sanitizeResources: false,
  }, async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    table.loadData("test/data/files/dailyTemperatures.csv");
    table.renameColumns({ t: "temperature", "id": "city" });

    await table.aiQuery(
      `I want the average temperature for each city with two decimals.`,
      {
        generation: { ...ollamaGeneration, cache: true },
        verbose: true,
      },
    ).log();

    // Just to make sure it doesn't crash for now
    assertEquals(true, true);
    await sdb.close();
  });
  Deno.test(
    "should update a table with natural language with query returned from cache (Ollama)",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/dailyTemperatures.csv");
      table.renameColumns({ t: "temperature", "id": "city" });

      await table.aiQuery(
        `I want the average temperature for each city with two decimals.`,
        {
          generation: { ...ollamaGeneration, cache: true },
          verbose: true,
        },
      ).log();

      // Just to make sure it doesn't crash for now
      assertEquals(true, true);
      await sdb.close();
    },
  );
  Deno.test(
    "should update a table with natural language and option verbose (Ollama)",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/dailyTemperatures.csv");
      table.renameColumns({ t: "temperature", "id": "city" });

      await table.aiQuery(
        `I want the average temperature for each city with two decimals.`,
        { generation: ollamaGeneration, verbose: true },
      ).log();

      // Just to make sure it doesn't crash for now
      assertEquals(true, true);
      await sdb.close();
    },
  );
  Deno.test(
    "should create a new table with aiQuery results using outputTable option (Ollama)",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      table.loadData("test/data/files/dailyTemperatures.csv");
      table.renameColumns({ t: "temperature", "id": "city" });

      const originalRowCount = await table.getRowCount();

      const resultRowCount = await table.aiQuery(
        `I want the average temperature for each city with two decimals.`,
        {
          generation: { ...ollamaGeneration },
          outputTable: "avg_temp_ollama",
          verbose: true,
        },
      ).getRowCount();

      // Original table should remain unchanged
      const currentRowCount = await table.getRowCount();
      assertEquals(currentRowCount, originalRowCount);

      // Result table should have the aggregated data
      const resultTable = await sdb.getTable("avg_temp_ollama");
      assertEquals(resultTable.name, "avg_temp_ollama");
      // We expect fewer rows since we're aggregating by city
      assertEquals(resultRowCount < originalRowCount, true);

      await sdb.close();
    },
  );
} else {
  console.log("AI_PROVIDER is not set to ollama");
}
