import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import SimpleTable from "../../../src/class/SimpleTable.ts";

Deno.test("should load a geojson file and return the table", async () => {
  const sdb = new SimpleDB();
  const table = await sdb
    .newTable()
    .loadGeoData(
      "test/geodata/files/CanadianProvincesAndTerritories.json",
    );

  assertEquals(table instanceof SimpleTable, true);
  await sdb.done();
});

Deno.test("should load a geojson file", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );

  const types = await table.getTypes();

  assertEquals(types, {
    nameEnglish: "VARCHAR",
    nameFrench: "VARCHAR",
    geom: "GEOMETRY",
  });
  await sdb.done();
});

Deno.test("should load a geojson file and add a projection", async () => {
  const sdb = new SimpleDB();
  const table = await sdb
    .newTable()
    .loadGeoData(
      "test/geodata/files/CanadianProvincesAndTerritories.json",
    );

  assertEquals(table.projections, {
    geom: "+proj=latlong +datum=WGS84 +no_defs",
  });
  await sdb.done();
});

Deno.test("should load a geojson file from a URL", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadGeoData(
    "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/geodata/files/CanadianProvincesAndTerritories.json",
  );

  const types = await table.getTypes();

  assertEquals(types, {
    nameEnglish: "VARCHAR",
    nameFrench: "VARCHAR",
    geom: "GEOMETRY",
  });
  await sdb.done();
});

Deno.test("should load a shapefile file", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.shp.zip",
  );

  const types = await table.getTypes();

  assertEquals(types, {
    nameEnglis: "VARCHAR",
    nameFrench: "VARCHAR",
    geom: "GEOMETRY",
  });
  await sdb.done();
});

Deno.test("should load a geojson file and convert it to WGS84", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadGeoData("test/geodata/files/point.json");
  await table.latLon("geom", "lat", "lon");
  await table.selectColumns(["lat", "lon"]);

  const data = await table.getData();

  assertEquals(data, [
    { lat: 45.51412791316409, lon: -73.62315106245389 },
  ]);
  await sdb.done();
});
