import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import getProjection from "../../../src/helpers/getProjection.ts";

Deno.test("should retrieve the projection of a json file", async () => {
  const sdb = new SimpleDB();
  const proj = await getProjection(
    sdb,
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );
  assertEquals(proj, "+proj=longlat +datum=WGS84 +no_defs");
  await sdb.done();
});

Deno.test("should retrieve the projection of a zipped shapefile", async () => {
  const sdb = new SimpleDB();
  const proj = await getProjection(
    sdb,
    "test/geodata/files/canada-not-4326.shp.zip",
  );
  assertEquals(
    proj,
    "+proj=lcc +lat_0=63.390675 +lon_0=-91.8666666666667 +lat_1=49 +lat_2=77 +x_0=6200000 +y_0=3000000 +datum=NAD83 +units=m +no_defs",
  );
  await sdb.done();
});
