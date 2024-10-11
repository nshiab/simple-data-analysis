import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

const sdb = new SimpleDB();

Deno.test("should rename a table", async () => {
  const table = sdb.newTable();
  await table.loadData(["test/data/files/cities.csv"]);
  await table.renameTable("canadianCities");

  const tables = await sdb.getTables();

  assertEquals(tables, ["canadianCities"]);
});

await sdb.done();
