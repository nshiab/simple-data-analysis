import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should log the projections of the table, even if there is none", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/employees.csv");

  await table.logProjections();

  // How to test?
  assertEquals(true, true);
  await sdb.done();
});
Deno.test("should log the projections of the table (Lambert conformal conic)", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadGeoData("test/geodata/files/canada-not-4326.shp.zip");

  await table.logProjections();

  // How to test?
  assertEquals(true, true);
  await sdb.done();
});
Deno.test("should log the projections of the table (Lambert conformal conic converted to WGS84)", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadGeoData("test/geodata/files/canada-not-4326.shp.zip", {
    toWGS84: true,
  });

  await table.logProjections();

  // How to test?
  assertEquals(true, true);
  await sdb.done();
});
Deno.test("should log the projections of the table (geojson WGS84)", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );

  await table.logProjections();

  // How to test?
  assertEquals(true, true);
  await sdb.done();
});
