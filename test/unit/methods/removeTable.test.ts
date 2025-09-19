import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should remove a table and log no tables", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/cities.csv"]);
  await table.removeTable();
  const tables = await sdb.getTableNames();

  assertEquals(tables, []);
  await sdb.done();
});
Deno.test("should remove a table and show no tables in sdb", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/cities.csv"]);
  await table.removeTable();

  assertEquals(sdb.tables, []);
  await sdb.done();
});
Deno.test("should remove a table and let create the same new table", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData(["test/data/files/cities.csv"]);
  await table.removeTable();

  const table2 = sdb.newTable("data");
  await table2.loadData(["test/data/files/cities.csv"]);

  const tables = await sdb.getTableNames();

  assertEquals(tables, ["data"]);
  assertEquals(sdb.tables.map((d) => d.name), ["data"]);
  await sdb.done();
});
