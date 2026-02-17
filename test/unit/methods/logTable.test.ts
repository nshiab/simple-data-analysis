import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should log a table", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/employees.csv");
  await table.logTable();

  // How to test?
  assertEquals(true, true);
  await sdb.done();
});
Deno.test("should log a table with 100 rows", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/employees.csv");
  await table.logTable(100);

  // How to test?
  assertEquals(true, true);
  await sdb.done();
});
Deno.test("should log a table with 100 rows in options", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/employees.csv");
  await table.logTable({ nbRowsToLog: 100 });

  // How to test?
  assertEquals(true, true);
  await sdb.done();
});
Deno.test("should log a table with types", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/employees.csv");
  await table.logTable({ types: true });

  // How to test?
  assertEquals(true, true);
  await sdb.done();
});
Deno.test("should log a table with 100 rows and types", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/employees.csv");
  await table.logTable({ types: true, nbRowsToLog: 100 });

  // How to test?
  assertEquals(true, true);
  await sdb.done();
});
Deno.test("should not throw an error when there is no table", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.logTable();

  // How to test?
  assertEquals(true, true);
  await sdb.done();
});

Deno.test("should log '<Geometry>' for geospatial data", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );
  await table.logTable();

  // How to test?
  assertEquals(true, true);
  await sdb.done();
});

Deno.test("should log types even if there is just one column in the table", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/employees.csv");
  await table.selectColumns("Name");
  await table.logTable();

  // How to test?
  assertEquals(true, true);
  await sdb.done();
});
Deno.test("should log a table with a condition", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/employees.csv");
  await table.logTable({ conditions: `Name === 'OConnell, Donald'` });

  // How to test?
  assertEquals(true, true);
  await sdb.done();
});
Deno.test("should log a table with 'all'", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/employees.csv");
  await table.logTable("all");

  // How to test?
  assertEquals(true, true);
  await sdb.done();
});
Deno.test("should log a table with { nbRowsToLog: 'all'}", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/employees.csv");
  await table.logTable({ nbRowsToLog: "all" });

  // How to test?
  assertEquals(true, true);
  await sdb.done();
});
Deno.test("should log a table with long strings and word wrap the columns", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/recipes.parquet");
  await table.logTable();

  // How to test?
  assertEquals(true, true);
  await sdb.done();
});
Deno.test("should log different colors for different data types", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  const dataArray = [
    {
      name: "Alice",
      age: 30,
      isStudent: false,
      birthday: new Date("1993-01-01"),
      salary: null,
    },
    {
      name: "Bob",
      age: 25,
      isStudent: true,
      birthday: new Date("1998-05-15"),
      salary: 50000,
    },
  ];
  console.table(dataArray);
  await table.loadArray(dataArray);
  await table.logTable();
  await table.logTable({ types: true });

  // How to test?
  assertEquals(true, true);
  await sdb.done();
});
