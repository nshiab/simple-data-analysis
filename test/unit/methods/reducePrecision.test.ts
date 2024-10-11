import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

const sdb = new SimpleDB();

Deno.test("should round the coordinates to 3 decimals", async () => {
  const table = sdb.newTable("geoData");
  await table.loadGeoData("test/geodata/files/point.json");
  await table.reducePrecision(3);
  const data = await sdb.customQuery(
    `SELECT ST_AsText(geom) as geomText FROM geoData;`,
    { returnDataFrom: "query" },
  );
  assertEquals(data, [{ geomText: "POINT (45.514 -73.623)" }]);
});
Deno.test("should round the coordinates to 3 decimals from a specific column", async () => {
  const table = sdb.newTable("geoData");
  await table.loadGeoData("test/geodata/files/point.json");
  await table.reducePrecision(3, { column: "geom" });
  const data = await sdb.customQuery(
    `SELECT ST_AsText(geom) as geomText FROM geoData;`,
    { returnDataFrom: "query" },
  );
  assertEquals(data, [{ geomText: "POINT (45.514 -73.623)" }]);
});

await sdb.done();
