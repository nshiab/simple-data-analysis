import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should return the bounding box in [minX, minY, maxX, maxY]", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );
  const bbox = await table.getBoundingBox();
  assertEquals(bbox, [-141.014, 41.981, -52.636, 83.111]);
  await sdb.done();
});

Deno.test("should return the bounding box in [minX, minY, maxX, maxY] from a specific column", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );
  const bbox = await table.getBoundingBox("geom");
  assertEquals(bbox, [-141.014, 41.981, -52.636, 83.111]);
  await sdb.done();
});
