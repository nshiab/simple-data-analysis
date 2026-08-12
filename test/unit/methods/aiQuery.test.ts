import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import { existsSync, rmSync } from "node:fs";
import { Ollama } from "ollama";

const geminiGeneration = {
  provider: "gemini",
  model: "gemini-3-flash-preview",
} as const;
const ollamaGeneration = { provider: "ollama" } as const;

const aiKey = Deno.env.get("AI_KEY") ?? Deno.env.get("AI_PROJECT");
if (typeof aiKey === "string" && aiKey !== "") {
  if (existsSync("./.journalism-cache")) {
    rmSync("./.journalism-cache", { recursive: true });
  }

  Deno.test("should update a table with natural language", async () => {
    const sdb = new SimpleDB({ dataTransport: "file" });
    const table = sdb.newTable("data");
    table.loadData("test/data/files/dailyTemperatures.csv");
    table.renameColumns({ t: "temperature", "id": "city" });

    await table.aiQuery(
      `I want the average temperature for each city with two decimals.`,
      { generation: geminiGeneration },
    );

    await table.log();

    // Just to make sure it doesn't crash for now
    assertEquals(true, true);
    await sdb.close();
  });
  Deno.test("should update a table with natural language and thinking", async () => {
    const sdb = new SimpleDB({ dataTransport: "file" });
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
    );

    await table.log();

    // Just to make sure it doesn't crash for now
    assertEquals(true, true);
    await sdb.close();
  });
  Deno.test("should update a table with natural language with cache", async () => {
    const sdb = new SimpleDB({ dataTransport: "file" });
    const table = sdb.newTable("data");
    table.loadData("test/data/files/dailyTemperatures.csv");
    table.renameColumns({ t: "temperature", "id": "city" });

    await table.aiQuery(
      `I want the average temperature for each city with two decimals.`,
      {
        generation: { ...geminiGeneration, cache: true },
        verbose: true,
      },
    );

    await table.log();

    // Just to make sure it doesn't crash for now
    assertEquals(true, true);
    await sdb.close();
  });
  Deno.test("should update a table with natural language with query returned from cache", async () => {
    const sdb = new SimpleDB({ dataTransport: "file" });
    const table = sdb.newTable("data");
    table.loadData("test/data/files/dailyTemperatures.csv");
    table.renameColumns({ t: "temperature", "id": "city" });

    await table.aiQuery(
      `I want the average temperature for each city with two decimals.`,
      {
        generation: { ...geminiGeneration, cache: true },
        verbose: true,
      },
    );

    await table.log();

    // Just to make sure it doesn't crash for now
    assertEquals(true, true);
    await sdb.close();
  });
  Deno.test("should update a table with natural language and safetyEnabled", async () => {
    const sdb = new SimpleDB({ dataTransport: "file" });
    const table = sdb.newTable("data");
    table.loadData("test/data/files/dailyTemperatures.csv");
    table.renameColumns({ t: "temperature", "id": "city" });

    await table.aiQuery(
      `I want the average temperature for each city with two decimals.`,
      {
        generation: { ...geminiGeneration, safetyEnabled: false },
        verbose: true,
      },
    );

    await table.log();

    // Just to make sure it doesn't crash for now
    assertEquals(true, true);
    await sdb.close();
  });
  Deno.test("should update a table with natural language and option verbose", async () => {
    const sdb = new SimpleDB({ dataTransport: "file" });
    const table = sdb.newTable("data");
    table.loadData("test/data/files/dailyTemperatures.csv");
    table.renameColumns({ t: "temperature", "id": "city" });

    await table.aiQuery(
      `I want the average temperature for each city with two decimals.`,
      { generation: geminiGeneration, verbose: true },
    );

    await table.log();

    // Just to make sure it doesn't crash for now
    assertEquals(true, true);
    await sdb.close();
  });
  Deno.test("should create a new table with aiQuery results using outputTable option", async () => {
    const sdb = new SimpleDB({ dataTransport: "file" });
    const table = sdb.newTable("data");
    table.loadData("test/data/files/dailyTemperatures.csv");
    table.renameColumns({ t: "temperature", "id": "city" });

    const originalRowCount = await table.getRowCount();

    const resultTable = await table.aiQuery(
      `I want the average temperature for each city with two decimals.`,
      {
        generation: { ...geminiGeneration, cache: true },
        outputTable: "avg_temp",
        verbose: true,
      },
    );

    // Original table should remain unchanged
    const currentRowCount = await table.getRowCount();
    assertEquals(currentRowCount, originalRowCount);

    // Result table should have the aggregated data
    const resultRowCount = await resultTable.getRowCount();
    assertEquals(resultTable.name, "avg_temp");
    // We expect fewer rows since we're aggregating by city
    assertEquals(resultRowCount < originalRowCount, true);

    await sdb.close();
  });
} else {
  console.log("No AI_PROJECT in process.env");
}

const ollama = Deno.env.get("OLLAMA");
if (typeof ollama === "string" && ollama !== "") {
  if (existsSync("./.journalism-cache")) {
    rmSync("./.journalism-cache", { recursive: true });
  }
  Deno.test("should update a table with natural language (Ollama)", {
    sanitizeResources: false,
  }, async () => {
    const sdb = new SimpleDB({ dataTransport: "file" });
    const table = sdb.newTable("data");
    table.loadData("test/data/files/dailyTemperatures.csv");
    table.renameColumns({ t: "temperature", "id": "city" });

    await table.aiQuery(
      `I want the average temperature for each city with two decimals.`,
      { generation: ollamaGeneration, verbose: true },
    );

    await table.log();

    // Just to make sure it doesn't crash for now
    assertEquals(true, true);
    await sdb.close();
  });
  Deno.test(
    "should update a table with natural language and thinking (Ollama)",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB({ dataTransport: "file" });
      const table = sdb.newTable("data");
      table.loadData("test/data/files/dailyTemperatures.csv");
      table.renameColumns({ t: "temperature", "id": "city" });

      await table.aiQuery(
        `I want the average temperature for each city with two decimals.`,
        {
          generation: { ...ollamaGeneration, thinkingLevel: true },
          verbose: true,
        },
      );

      await table.log();

      // Just to make sure it doesn't crash for now
      assertEquals(true, true);
      await sdb.close();
    },
  );
  Deno.test(
    "should update a table with natural language with a different Ollama instance",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB({ dataTransport: "file" });
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
      );

      await table.log();

      // Just to make sure it doesn't crash for now
      assertEquals(true, true);
      await sdb.close();
    },
  );
  Deno.test("should update a table with natural language with cache (Ollama)", {
    sanitizeResources: false,
  }, async () => {
    const sdb = new SimpleDB({ dataTransport: "file" });
    const table = sdb.newTable("data");
    table.loadData("test/data/files/dailyTemperatures.csv");
    table.renameColumns({ t: "temperature", "id": "city" });

    await table.aiQuery(
      `I want the average temperature for each city with two decimals.`,
      {
        generation: { ...ollamaGeneration, cache: true },
        verbose: true,
      },
    );

    await table.log();

    // Just to make sure it doesn't crash for now
    assertEquals(true, true);
    await sdb.close();
  });
  Deno.test(
    "should update a table with natural language with query returned from cache (Ollama)",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB({ dataTransport: "file" });
      const table = sdb.newTable("data");
      table.loadData("test/data/files/dailyTemperatures.csv");
      table.renameColumns({ t: "temperature", "id": "city" });

      await table.aiQuery(
        `I want the average temperature for each city with two decimals.`,
        {
          generation: { ...ollamaGeneration, cache: true },
          verbose: true,
        },
      );

      await table.log();

      // Just to make sure it doesn't crash for now
      assertEquals(true, true);
      await sdb.close();
    },
  );
  Deno.test(
    "should update a table with natural language and option verbose (Ollama)",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB({ dataTransport: "file" });
      const table = sdb.newTable("data");
      table.loadData("test/data/files/dailyTemperatures.csv");
      table.renameColumns({ t: "temperature", "id": "city" });

      await table.aiQuery(
        `I want the average temperature for each city with two decimals.`,
        { generation: ollamaGeneration, verbose: true },
      );

      await table.log();

      // Just to make sure it doesn't crash for now
      assertEquals(true, true);
      await sdb.close();
    },
  );
  Deno.test(
    "should create a new table with aiQuery results using outputTable option (Ollama)",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB({ dataTransport: "file" });
      const table = sdb.newTable("data");
      table.loadData("test/data/files/dailyTemperatures.csv");
      table.renameColumns({ t: "temperature", "id": "city" });

      const originalRowCount = await table.getRowCount();

      const resultTable = await table.aiQuery(
        `I want the average temperature for each city with two decimals.`,
        {
          generation: { ...ollamaGeneration, cache: true },
          outputTable: "avg_temp_ollama",
          verbose: true,
        },
      );

      // Original table should remain unchanged
      const currentRowCount = await table.getRowCount();
      assertEquals(currentRowCount, originalRowCount);

      // Result table should have the aggregated data
      const resultRowCount = await resultTable.getRowCount();
      assertEquals(resultTable.name, "avg_temp_ollama");
      // We expect fewer rows since we're aggregating by city
      assertEquals(resultRowCount < originalRowCount, true);

      await sdb.close();
    },
  );
} else {
  console.log("No OLLAMA in process.env");
}
