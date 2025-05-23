import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import { DuckDBConnection, DuckDBInstance } from "@duckdb/node-api";
import { existsSync, mkdirSync } from "node:fs";

const output = "./test/output/";
if (!existsSync(output)) {
  mkdirSync(output);
}

Deno.test("should instantiate a SimpleDB class", async () => {
  const sdb = new SimpleDB();
  assertEquals(sdb instanceof SimpleDB, true);
  await sdb.done();
});
Deno.test("should start and instantiate a db", async () => {
  const sdb = new SimpleDB();
  await sdb.start();
  assertEquals(sdb.db instanceof DuckDBInstance, true);
  await sdb.done();
});

Deno.test("should start and return an instance of SimpleDB", async () => {
  const sdb = new SimpleDB();
  const returned = await sdb.start();
  assertEquals(returned instanceof SimpleDB, true);
  await sdb.done();
});
Deno.test("should start and instantiate a connection", async () => {
  const sdb = new SimpleDB();
  await sdb.start();
  assertEquals(sdb.connection instanceof DuckDBConnection, true);
  await sdb.done();
});

Deno.test("should run a custom query and return the result", async () => {
  const sdb = new SimpleDB();
  const result = await sdb.customQuery(`select 42 as result`, {
    returnDataFrom: "query",
  });
  assertEquals(result, [{ result: 42 }]);
  await sdb.done();
});

Deno.test("should create tables without names", async () => {
  const sdb = new SimpleDB();
  const table1 = sdb.newTable();
  await table1.loadData(["test/data/files/data.json"]);
  const table2 = sdb.newTable();
  await table2.loadData(["test/data/files/data.json"]);

  const tables = await sdb.getTableNames();

  assertEquals(
    tables.sort((a, b) => (a > b ? 1 : -1)),
    ["table1", "table2"],
  );
  await sdb.done();
});

Deno.test("should create multiple tables without names before loading data", async () => {
  const sdb = new SimpleDB();

  const table1 = sdb.newTable();
  const table2 = sdb.newTable();

  await table1.loadData(["test/data/files/data.json"]);
  await table2.loadData(["test/data/files/data.json"]);

  const tables = await sdb.getTableNames();

  assertEquals(
    tables.sort((a, b) => (a > b ? 1 : -1)),
    ["table1", "table2"],
  );
  await sdb.done();
});

Deno.test("should create tables with names", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("tableWithName");
  await table.loadData(["test/data/files/data.json"]);

  const tables = await sdb.getTableNames();

  assertEquals(
    tables.sort((a, b) => (a > b ? 1 : -1)),
    ["tableWithName"],
  );
  await sdb.done();
});

Deno.test("should remove one table", async () => {
  const sdb = new SimpleDB();
  const table1 = sdb.newTable("table1");
  await table1.loadData(["test/data/files/data.json"]);
  const table2 = sdb.newTable("table2");
  await table2.loadData(["test/data/files/data.json"]);

  await sdb.removeTables(table1);

  const tables = await sdb.getTableNames();

  assertEquals(
    tables.sort((a, b) => (a > b ? 1 : -1)),
    ["table2"],
  );
  await sdb.done();
});

Deno.test("should remove multiple tables", async () => {
  const sdb = new SimpleDB();
  const table1 = sdb.newTable("table1");
  await table1.loadData(["test/data/files/data.json"]);
  const tableWithName = sdb.newTable("tableWithName");
  await tableWithName.loadData(["test/data/files/data.json"]);

  await sdb.removeTables([table1, tableWithName]);

  const tables = await sdb.getTables();

  assertEquals(tables, []);
  await sdb.done();
});

Deno.test("should retrieve a SimpleTable instance", async () => {
  const sdb = new SimpleDB();
  const tableJSON = sdb.newTable("tableJSON");
  await tableJSON.loadData(["test/data/files/data.json"]);

  const tableJsonAgain = await sdb.getTable("tableJSON");

  assertEquals(
    {
      instance: tableJsonAgain,
      name: tableJsonAgain.name,
      data: await tableJsonAgain.getData(),
    },
    {
      instance: tableJSON,
      name: tableJSON.name,
      data: await tableJSON.getData(),
    },
  );
  await sdb.done();
});
Deno.test("should retrieve a SimpleTable instance with geo data", async () => {
  const sdb = new SimpleDB();
  const tableJSON = sdb.newTable("tableGEOJSON");
  await tableJSON.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );

  const tableJsonAgain = await sdb.getTable("tableGEOJSON");

  assertEquals(
    {
      instance: tableJsonAgain,
      name: tableJsonAgain.name,
      data: await tableJsonAgain.getGeoData(),
      projection: tableJsonAgain.projections,
    },
    {
      instance: tableJSON,
      name: tableJSON.name,
      data: await tableJSON.getGeoData(),
      projection: tableJSON.projections,
    },
  );
  await sdb.done();
});

Deno.test("should return table names", async () => {
  const sdb = new SimpleDB();
  const tableJSON = sdb.newTable("tableJSON");
  await tableJSON.loadData(["test/data/files/data.json"]);
  const tableCSV = sdb.newTable("tableCSV");
  await tableCSV.loadData(["test/data/files/data.csv"]);

  const tables = await sdb.getTableNames();

  assertEquals(
    tables.sort((a, b) => (a > b ? 1 : -1)),
    ["tableCSV", "tableJSON"],
  );
  await sdb.done();
});

Deno.test("should return true when a table exists", async () => {
  const sdb = new SimpleDB();
  const tableJSON = sdb.newTable("tableJSON");
  await tableJSON.loadData(["test/data/files/data.json"]);

  assertEquals(await sdb.hasTable("tableJSON"), true);
  await sdb.done();
});

Deno.test("should return false when a table doesn't exist", async () => {
  const sdb = new SimpleDB();
  const tableJSON = sdb.newTable("tableJSON");
  await tableJSON.loadData(["test/data/files/data.json"]);

  assertEquals(await sdb.hasTable("tableX"), false);
  await sdb.done();
});

Deno.test("should return the DuckDB extensions", async () => {
  const sdb = new SimpleDB();
  await sdb.getExtensions();
  // Not sure how to test. Different depending on the environment?
  await sdb.done();
});

Deno.test("should close the db", async () => {
  const sdb = new SimpleDB();
  await sdb.done();
  // How to test?
});

Deno.test("should log debugging information when debug is true", async () => {
  const sdb = new SimpleDB({ debug: true });
  const test = await sdb.newTable("test");
  await test.loadData("test/data/files/cities.csv");

  // How to test?
  await sdb.done();
});

Deno.test("should log the types", async () => {
  const sdb = new SimpleDB({ types: true });
  const test = sdb.newTable("test");
  await test.loadData("test/data/files/cities.csv");
  await test.logTable();
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
Deno.test("should enable a progress bar", async () => {
  const sdb = new SimpleDB({ progressBar: true });
  const test = sdb.newTable("test");
  await test.loadData("test/data/files/cities.csv");
  // How to test?
  await sdb.done();
});
Deno.test("should write the db", async () => {
  const sdb = new SimpleDB();
  const test = sdb.newTable("test");
  await test.loadData("test/data/files/cities.csv");

  await sdb.writeDB(`${output}database.db`);
  // How to test?
  await sdb.done();
});
Deno.test("should write the SQLite db", async () => {
  const sdb = new SimpleDB();
  const test = sdb.newTable("test");
  await test.loadData("test/data/files/cities.csv");

  await sdb.writeDB(`${output}database.sqlite`);
  // How to test?
  await sdb.done();
});
Deno.test("should load the db", async () => {
  const sdb = new SimpleDB();

  await sdb.loadDB(`${output}database.db`);
  const test = await sdb.getTable("test");
  await test.logTable();

  // How to test?
  await sdb.done();
});
Deno.test("should load the sqlite db", async () => {
  const sdb = new SimpleDB();

  await sdb.loadDB(`${output}database.sqlite`);
  const test = await sdb.getTable("test");
  await test.logTable();

  await sdb.done();
});
Deno.test("should write the db with geometries", async () => {
  const sdb = new SimpleDB();
  const test = sdb.newTable("test");
  await test.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );
  await test.logProjections();
  await test.logTable();

  await sdb.writeDB(`${output}database_geometry.db`);
  // How to test?
  await sdb.done();
});
Deno.test("should load the db with geometries", async () => {
  const sdb = new SimpleDB();
  await sdb.loadDB(`${output}database_geometry.db`);
  const test = await sdb.getTable("test");
  await test.logProjections();
  await test.logTable();
  // How to test?
  await sdb.done();
});

Deno.test("should log the table names in the db", async () => {
  const sdb = new SimpleDB();
  const test = sdb.newTable("test");
  await test.loadData("test/data/files/cities.csv");
  const test1 = sdb.newTable("test1");
  await test1.loadData("test/data/files/cities.csv");

  await sdb.logTableNames();

  // How to test?
  await sdb.done();
});
