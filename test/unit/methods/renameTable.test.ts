import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should rename a table", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/cities.csv"]);
  await table.renameTable("canadianCities");

  const tables = await sdb.getTableNames();

  assertEquals(tables, ["canadianCities"]);
  await sdb.done();
});
