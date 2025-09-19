import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should flip the coordinates", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("geoData");
  await table.loadGeoData("test/geodata/files/point.json");
  await table.flipCoordinates();
  const data = await sdb.customQuery(
    `SELECT ST_AsText(geom) as geomText FROM geoData;`,
    { returnDataFrom: "query" },
  );

  assertEquals(data, [
    { geomText: "POINT (-73.62315106245389 45.51412791316409)" },
  ]);
  await sdb.done();
});

Deno.test("should flip the coordinates from a specific column", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("geoData");
  await table.loadGeoData("test/geodata/files/point.json");
  await table.flipCoordinates("geom");
  const data = await sdb.customQuery(
    `SELECT ST_AsText(geom) as geomText FROM geoData;`,
    { returnDataFrom: "query" },
  );

  assertEquals(data, [
    { geomText: "POINT (-73.62315106245389 45.51412791316409)" },
  ]);
  await sdb.done();
});
