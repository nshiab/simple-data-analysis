import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

const sdb = new SimpleDB();
const originalTable = sdb.newTable("original");
await originalTable.loadData("test/data/files/employees.csv");
const originalData = await originalTable.getData();

Deno.test("should clone a table", async () => {
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/employees.csv");
  const clone = await table.cloneTable();

  assertEquals(await table.getData(), await clone.getData());
});
Deno.test("should clone a table with a specific name", async () => {
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/employees.csv");
  const clone = await table.cloneTable({ outputTable: "clone" });

  assertEquals(await table.getData(), await clone.getData());
});
Deno.test("should find the table name in the DB", async () => {
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/employees.csv");
  await table.cloneTable({ outputTable: "clone" });

  const tables = await sdb.getTables();

  assertEquals(
    tables.sort((a, b) => (a > b ? -1 : 1)),
    ["table1", "original", "data", "clone"],
  );
});
Deno.test("should keep the original table intact", async () => {
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/employees.csv");
  const clone = await table.cloneTable();
  await clone.addColumn("test", "number", "2");

  assertEquals(await table.getData(), originalData);
});
Deno.test("should clone a table with a condition", async () => {
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/employees.csv");
  const clone = await table.cloneTable({
    condition: `Job = 'Manager'`,
  });

  assertEquals(
    await clone.getData(),
    originalData.filter((d) => d.Job === "Manager"),
  );
});

await sdb.done();
