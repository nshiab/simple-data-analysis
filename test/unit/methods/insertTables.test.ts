import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

const sdb = new SimpleDB();

Deno.test("should add rows from a table into another table", async () => {
  const table1 = sdb.newTable("table1");
  await table1.loadData("test/data/files/data.json");

  const table2 = sdb.newTable("table2");
  await table2.loadData("test/data/files/data.json");

  await table1.insertTables(table2);
  const data = await table1.getData();
  assertEquals(data, [
    { key1: 1, key2: "un" },
    { key1: 2, key2: "deux" },
    { key1: 3, key2: "trois" },
    { key1: 4, key2: "quatre" },
    { key1: 1, key2: "un" },
    { key1: 2, key2: "deux" },
    { key1: 3, key2: "trois" },
    { key1: 4, key2: "quatre" },
  ]);
});
Deno.test("should add rows from a table into another table even if the column order is not the same", async () => {
  const table1 = sdb.newTable("table1");
  await table1.loadData("test/data/files/data.json");

  const table2 = sdb.newTable("table2");
  await table2.loadData("test/data/files/data.json");
  await table2.selectColumns(["key2", "key1"]);

  await table1.insertTables(table2);
  const data = await table1.getData();
  assertEquals(data, [
    { key1: 1, key2: "un" },
    { key1: 2, key2: "deux" },
    { key1: 3, key2: "trois" },
    { key1: 4, key2: "quatre" },
    { key1: 1, key2: "un" },
    { key1: 2, key2: "deux" },
    { key1: 3, key2: "trois" },
    { key1: 4, key2: "quatre" },
  ]);
});
Deno.test("should add rows from multiple tables into another table", async () => {
  const table1 = sdb.newTable("table1");
  await table1.loadData("test/data/files/data.json");

  const table2 = sdb.newTable("table2");
  await table2.loadData("test/data/files/data.json");

  const table3 = sdb.newTable("table3");
  await table3.loadData("test/data/files/data.json");

  await table1.insertTables([table2, table3]);
  const data = await table1.getData();
  assertEquals(data, [
    { key1: 1, key2: "un" },
    { key1: 2, key2: "deux" },
    { key1: 3, key2: "trois" },
    { key1: 4, key2: "quatre" },
    { key1: 1, key2: "un" },
    { key1: 2, key2: "deux" },
    { key1: 3, key2: "trois" },
    { key1: 4, key2: "quatre" },
    { key1: 1, key2: "un" },
    { key1: 2, key2: "deux" },
    { key1: 3, key2: "trois" },
    { key1: 4, key2: "quatre" },
  ]);
});

await sdb.done();
