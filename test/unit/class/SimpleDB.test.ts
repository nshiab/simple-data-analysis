import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import pkg from "npm:duckdb@1";
const { Database, Connection } = pkg;

const sdb = new SimpleDB();

Deno.test("should instantiate a SimpleDB class", () => {
  assertEquals(sdb instanceof SimpleDB, true);
});
Deno.test("should start and instantiate a db", async () => {
  await sdb.start();
  assertEquals(sdb.db instanceof Database, true);
});
Deno.test("should start and return an instance of SimpleDB", async () => {
  const returned = await sdb.start();
  assertEquals(returned instanceof SimpleDB, true);
});
Deno.test("should start and instantiate a connection", async () => {
  await sdb.start();
  assertEquals(sdb.connection instanceof Connection, true);
});
Deno.test("should run a custom query and return the result", async () => {
  const result = await sdb.customQuery(`select 42 as result`, {
    returnDataFrom: "query",
  });
  assertEquals(result, [{ result: 42 }]);
});
Deno.test("should create tables without names", async () => {
  const table1 = sdb.newTable();
  await table1.loadData(["test/data/files/data.json"]);
  const table2 = sdb.newTable();
  await table2.loadData(["test/data/files/data.json"]);

  const tables = await sdb.getTables();

  assertEquals(
    tables.sort((a, b) => (a > b ? 1 : -1)),
    ["table1", "table2"],
  );
});
Deno.test("should create multiple tables without names before loading data", async () => {
  const sdb = new SimpleDB();

  const table1 = sdb.newTable();
  const table2 = sdb.newTable();

  await table1.loadData(["test/data/files/data.json"]);
  await table2.loadData(["test/data/files/data.json"]);

  const tables = await sdb.getTables();

  assertEquals(
    tables.sort((a, b) => (a > b ? 1 : -1)),
    ["table1", "table2"],
  );
});
Deno.test("should create tables with names", async () => {
  const table = sdb.newTable("tableWithName");
  await table.loadData(["test/data/files/data.json"]);

  const tables = await sdb.getTables();

  assertEquals(
    tables.sort((a, b) => (a > b ? 1 : -1)),
    ["table1", "table2", "tableWithName"],
  );
});
Deno.test("should remove one table", async () => {
  // Overwriting tables above to have them stored in variables
  const table1 = sdb.newTable("table1");
  await table1.loadData(["test/data/files/data.json"]);

  await sdb.removeTables(table1);

  const tables = await sdb.getTables();

  assertEquals(
    tables.sort((a, b) => (a > b ? 1 : -1)),
    ["table2", "tableWithName"],
  );
});
Deno.test("should remove multiple tables", async () => {
  // Overwriting tables above to have them stored in variables
  const table2 = sdb.newTable("table2");
  await table2.loadData(["test/data/files/data.json"]);
  const tableWithName = sdb.newTable("tableWithName");
  await tableWithName.loadData(["test/data/files/data.json"]);

  await sdb.removeTables([table2, tableWithName]);

  const tables = await sdb.getTables();

  assertEquals(tables, []);
});
Deno.test("should return tables", async () => {
  const tableJSON = sdb.newTable("tableJSON");
  await tableJSON.loadData(["test/data/files/data.json"]);
  const tableCSV = sdb.newTable("tableCSV");
  await tableCSV.loadData(["test/data/files/data.csv"]);

  const tables = await sdb.getTables();

  assertEquals(
    tables.sort((a, b) => (a > b ? 1 : -1)),
    ["tableCSV", "tableJSON"],
  );
});
Deno.test("should check a return true when a table exists", async () => {
  const tableJSON = sdb.newTable("tableJSON");
  await tableJSON.loadData(["test/data/files/data.json"]);

  assertEquals(await sdb.hasTable("tableJSON"), true);
});
Deno.test("should check a return false when a table doesn't exist", async () => {
  const tableJSON = sdb.newTable("tableJSON");
  await tableJSON.loadData(["test/data/files/data.json"]);

  assertEquals(await sdb.hasTable("tableX"), false);
});
Deno.test("should return the DuckDB extensions", async () => {
  await sdb.getExtensions();
  // Not sure how to test. Different depending on the environment?
});
Deno.test("should close the db", async () => {
  await sdb.done();
  // How to test?
});
Deno.test("should log debugging information when debug is true", async () => {
  const sdb = new SimpleDB({ debug: true });
  await sdb.newTable("test").loadData("test/data/files/cities.csv");
  // How to test?
  await sdb.done();
});
Deno.test("should log a specific number of rows", async () => {
  const sdb = new SimpleDB({ nbRowsToLog: 2 });
  const test = sdb.newTable("test");
  await test.loadData("test/data/files/cities.csv");
  await test.logTable();
  // How to test?
  await sdb.done();
});
Deno.test("should log a specific number of characters", async () => {
  const sdb = new SimpleDB({ nbCharactersToLog: 5 });
  const test = sdb.newTable("test");
  await test.loadData("test/data/files/cities.csv");
  await test.logTable();
  // How to test?
  await sdb.done();
});
Deno.test("should log the total duration", async () => {
  const sdb = new SimpleDB({ logDuration: true });
  const test = sdb.newTable("test");
  await test.loadData("test/data/files/cities.csv");
  // How to test?
  await sdb.done();
});
