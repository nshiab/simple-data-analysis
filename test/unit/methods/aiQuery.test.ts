import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import { existsSync, rmSync } from "node:fs";
import { Ollama } from "ollama";

const aiKey = Deno.env.get("AI_KEY") ?? Deno.env.get("AI_PROJECT");
if (typeof aiKey === "string" && aiKey !== "") {
  if (existsSync("./.journalism-cache")) {
    rmSync("./.journalism-cache", { recursive: true });
  }

  Deno.test("should update a table with natural language", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    await table.loadData("test/data/files/dailyTemperatures.csv");
    await table.renameColumns({ t: "temperature", "id": "city" });

    await table.aiQuery(
      `I want the average temperature for each city with two decimals.`,
    );

    await table.logTable();

    // Just to make sure it doesn't crash for now
    assertEquals(true, true);
    await sdb.done();
  });
  Deno.test("should update a table with natural language and thinking", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    await table.loadData("test/data/files/dailyTemperatures.csv");
    await table.renameColumns({ t: "temperature", "id": "city" });

    await table.aiQuery(
      `I want the average temperature for each city with two decimals.`,
      { thinkingBudget: 1000, verbose: true, model: "gemini-2.5-flash" },
    );

    await table.logTable();

    // Just to make sure it doesn't crash for now
    assertEquals(true, true);
    await sdb.done();
  });
  Deno.test("should update a table with natural language with cache", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    await table.loadData("test/data/files/dailyTemperatures.csv");
    await table.renameColumns({ t: "temperature", "id": "city" });

    await table.aiQuery(
      `I want the average temperature for each city with two decimals.`,
      { cache: true, verbose: true },
    );

    await table.logTable();

    // Just to make sure it doesn't crash for now
    assertEquals(true, true);
    await sdb.done();
  });
  Deno.test("should update a table with natural language with query returned from cache", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    await table.loadData("test/data/files/dailyTemperatures.csv");
    await table.renameColumns({ t: "temperature", "id": "city" });

    await table.aiQuery(
      `I want the average temperature for each city with two decimals.`,
      { cache: true, verbose: true },
    );

    await table.logTable();

    // Just to make sure it doesn't crash for now
    assertEquals(true, true);
    await sdb.done();
  });
  Deno.test("should update a table with natural language and option verbose", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    await table.loadData("test/data/files/dailyTemperatures.csv");
    await table.renameColumns({ t: "temperature", "id": "city" });

    await table.aiQuery(
      `I want the average temperature for each city with two decimals.`,
      { verbose: true },
    );

    await table.logTable();

    // Just to make sure it doesn't crash for now
    assertEquals(true, true);
    await sdb.done();
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
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    await table.loadData("test/data/files/dailyTemperatures.csv");
    await table.renameColumns({ t: "temperature", "id": "city" });

    await table.aiQuery(
      `I want the average temperature for each city with two decimals.`,
      { verbose: true },
    );

    await table.logTable();

    // Just to make sure it doesn't crash for now
    assertEquals(true, true);
    await sdb.done();
  });
  Deno.test(
    "should update a table with natural language and thinking (Ollama)",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      await table.loadData("test/data/files/dailyTemperatures.csv");
      await table.renameColumns({ t: "temperature", "id": "city" });

      await table.aiQuery(
        `I want the average temperature for each city with two decimals.`,
        { verbose: true, thinkingBudget: 1 },
      );

      await table.logTable();

      // Just to make sure it doesn't crash for now
      assertEquals(true, true);
      await sdb.done();
    },
  );
  Deno.test(
    "should update a table with natural language with a different Ollama instance",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      await table.loadData("test/data/files/dailyTemperatures.csv");
      await table.renameColumns({ t: "temperature", "id": "city" });

      const ollama = new Ollama({ host: "http://127.0.0.1:11434" });

      await table.aiQuery(
        `I want the average temperature for each city with two decimals.`,
        {
          ollama,
          verbose: true,
        },
      );

      await table.logTable();

      // Just to make sure it doesn't crash for now
      assertEquals(true, true);
      await sdb.done();
    },
  );
  Deno.test("should update a table with natural language with cache (Ollama)", {
    sanitizeResources: false,
  }, async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    await table.loadData("test/data/files/dailyTemperatures.csv");
    await table.renameColumns({ t: "temperature", "id": "city" });

    await table.aiQuery(
      `I want the average temperature for each city with two decimals.`,
      { cache: true, verbose: true },
    );

    await table.logTable();

    // Just to make sure it doesn't crash for now
    assertEquals(true, true);
    await sdb.done();
  });
  Deno.test(
    "should update a table with natural language with query returned from cache (Ollama)",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      await table.loadData("test/data/files/dailyTemperatures.csv");
      await table.renameColumns({ t: "temperature", "id": "city" });

      await table.aiQuery(
        `I want the average temperature for each city with two decimals.`,
        { cache: true, verbose: true },
      );

      await table.logTable();

      // Just to make sure it doesn't crash for now
      assertEquals(true, true);
      await sdb.done();
    },
  );
  Deno.test(
    "should update a table with natural language and option verbose (Ollama)",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      await table.loadData("test/data/files/dailyTemperatures.csv");
      await table.renameColumns({ t: "temperature", "id": "city" });

      await table.aiQuery(
        `I want the average temperature for each city with two decimals.`,
        { verbose: true },
      );

      await table.logTable();

      // Just to make sure it doesn't crash for now
      assertEquals(true, true);
      await sdb.done();
    },
  );
} else {
  console.log("No AI_PROJECT in process.env");
}
