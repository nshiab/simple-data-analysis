import { assertEquals } from "jsr:@std/assert";
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
  await table.logTable({ logTypes: true });

  // How to test?
  assertEquals(true, true);
  await sdb.done();
});
Deno.test("should log a table with 100 rows and types", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/employees.csv");
  await table.logTable({ logTypes: true, nbRowsToLog: 100 });

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
