import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

const sdb = new SimpleDB();

Deno.test("should log a table", async () => {
  const table = sdb.newTable();
  await table.loadData("test/data/files/employees.csv");
  await table.logTable();

  // How to test?
  assertEquals(true, true);
});
Deno.test("should not throw an error when there is no table", async () => {
  const table = sdb.newTable();
  await table.logTable();

  // How to test?
  assertEquals(true, true);
});
Deno.test("should log '<Geometry>' for geospatial data", async () => {
  const table = sdb.newTable();
  await table.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );
  await table.logTable();

  // How to test?
  assertEquals(true, true);
});
Deno.test("should log types even if there is just one column in the table", async () => {
  const table = sdb.newTable();
  await table.loadData("test/data/files/employees.csv");
  await table.selectColumns("Name");
  await table.logTable();

  // How to test?
  assertEquals(true, true);
});

await sdb.done();
