import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should clone a table", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/employees.csv");
  const clone = await table.cloneTable();

  assertEquals(await table.getData(), await clone.getData());
  await sdb.done();
});
Deno.test("should clone and log a table", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/employees.csv");
  const clone = await table.cloneTable();
  await clone.logTable();

  assertEquals(await table.getData(), await clone.getData());
  await sdb.done();
});
Deno.test("should clone a table and give it a different name", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/employees.csv");
  const clone = await table.cloneTable();

  assertEquals(table.name !== clone.name, true);
  await sdb.done();
});
Deno.test("should clone a table with a specific name", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/employees.csv");
  const clone = await table.cloneTable({ outputTable: "clone" });

  assertEquals(await table.getData(), await clone.getData());
  await sdb.done();
});
Deno.test("should find the table name in the DB", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/employees.csv");
  await table.cloneTable({ outputTable: "clone" });

  const tables = await sdb.getTableNames();

  assertEquals(
    tables.sort((a, b) => (a > b ? -1 : 1)),
    ["data", "clone"],
  );
  await sdb.done();
});
Deno.test("should keep the original table intact", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/employees.csv");
  const clone = await table.cloneTable();
  await clone.addColumn("test", "number", "2");

  const originalTable = sdb.newTable("original");
  await originalTable.loadData("test/data/files/employees.csv");
  const originalData = await originalTable.getData();

  assertEquals(await table.getData(), originalData);
  await sdb.done();
});
Deno.test("should clone a table with a condition", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/employees.csv");
  const clone = await table.cloneTable({
    conditions: `Job = 'Manager'`,
  });

  const originalTable = sdb.newTable("original");
  await originalTable.loadData("test/data/files/employees.csv");
  const originalData = await originalTable.getData();

  assertEquals(
    await clone.getData(),
    originalData.filter((d) => d.Job === "Manager"),
  );
  await sdb.done();
});
Deno.test("should clone a table with a specific name with spaces", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/employees.csv");
  const clone = await table.cloneTable({ outputTable: "clone table" });

  assertEquals(await table.getData(), await clone.getData());
  await sdb.done();
});
Deno.test("should clone a table with a specific name with spaces and '", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/employees.csv");
  const clone = await table.cloneTable({ outputTable: "clone 'table" });

  assertEquals(await table.getData(), await clone.getData());
  await sdb.done();
});
Deno.test("should clone a table with data and projections", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadGeoData("test/geodata/files/bigCircle.json");
  const clone = await table.cloneTable({ outputTable: "clone 'table" });

  assertEquals(table.projections, clone.projections);
  await sdb.done();
});
