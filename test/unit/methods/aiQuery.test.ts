import "jsr:@std/dotenv/load";
import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import { existsSync, rmSync } from "node:fs";

const aiKey = Deno.env.get("AI_KEY");
if (typeof aiKey === "string" && aiKey !== "") {
  if (existsSync("./.journalism")) {
    rmSync("./.journalism", { recursive: true });
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
  Deno.test("should update a table with natural language with cache", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    await table.loadData("test/data/files/dailyTemperatures.csv");
    await table.renameColumns({ t: "temperature", "id": "city" });

    await table.aiQuery(
      `I want the average temperature for each city with two decimals.`,
      { cache: true, cacheVerbose: true },
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
      { cache: true, cacheVerbose: true },
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
  Deno.test("should update a table with natural language and option costEstimate", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    await table.loadData("test/data/files/dailyTemperatures.csv");
    await table.renameColumns({ t: "temperature", "id": "city" });

    await table.aiQuery(
      `I want the average temperature for each city with two decimals.`,
      { costEstimate: true },
    );

    await table.logTable();

    // Just to make sure it doesn't crash for now
    assertEquals(true, true);
    await sdb.done();
  });
  Deno.test("should update a table with natural language and options verbose and costEstimate", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    await table.loadData("test/data/files/dailyTemperatures.csv");
    await table.renameColumns({ t: "temperature", "id": "city" });

    await table.aiQuery(
      `I want the average temperature for each city with two decimals.`,
      { verbose: true, costEstimate: true },
    );

    await table.logTable();

    // Just to make sure it doesn't crash for now
    assertEquals(true, true);
    await sdb.done();
  });
} else {
  console.log("No AI_PROJECT in process.env");
}
