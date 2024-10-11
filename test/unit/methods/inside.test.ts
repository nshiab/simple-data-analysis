import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

const sdb = new SimpleDB();

Deno.test("should check if geometries are inside other geometries", async () => {
  const points = sdb.newTable("points");
  await points.loadGeoData("test/geodata/files/pointsInside.json");
  await points.renameColumns({
    name: "points",
    geom: "geomPoints",
  });

  const polygon = sdb.newTable("polygon");
  await polygon.loadGeoData("test/geodata/files/polygonInside.json");
  await polygon.renameColumns({
    name: "polygon",
    geom: "geomPolygon",
  });

  await points.crossJoin(polygon);
  await points.inside("geomPoints", "geomPolygon", "isInside");
  await points.selectColumns(["points", "polygon", "isInside"]);
  await points.sort({ points: "asc" });

  const data = await points.getData();

  assertEquals(data, [
    { points: "pointA", polygon: "container", isInside: false },
    { points: "pointB", polygon: "container", isInside: false },
    { points: "pointC", polygon: "container", isInside: true },
    { points: "pointD", polygon: "container", isInside: true },
  ]);
});

await sdb.done();
