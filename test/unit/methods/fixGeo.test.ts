import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should fix invalid geometries", async () => {
  const sdb = new SimpleDB();
  // From https://github.com/chrieke/geojson-invalid-geometry
  const table = sdb.newTable("geodata");
  await table.loadGeoData("test/geodata/files/invalid.geojson");
  await table.fixGeo();
  const data = await table.getGeoData();

  assertEquals(data, {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "MultiPolygon",
          coordinates: [
            [
              [
                [13.383529, 52.515496],
                [13.383060641522562, 52.5154695817136],
                [13.383144, 52.515321],
                [13.383127, 52.514867],
                [13.382603, 52.514954],
                [13.382609404455074, 52.51544412917958],
                [13.382288, 52.515426],
                [13.382096, 52.514797],
                [13.383424, 52.51464],
                [13.383529, 52.515496],
              ],
            ],
            [
              [
                [13.38262, 52.516255],
                [13.382609404455074, 52.51544412917958],
                [13.383060641522562, 52.5154695817136],
                [13.38262, 52.516255],
              ],
            ],
          ],
        },
        properties: {},
      },
    ],
  });

  await sdb.done();
});

Deno.test("should fix invalid geometries in a specific column", async () => {
  const sdb = new SimpleDB();
  // From https://github.com/chrieke/geojson-invalid-geometry
  const table = sdb.newTable("geodata");
  await table.loadGeoData("test/geodata/files/invalid.geojson");
  await table.fixGeo("geom");
  const data = await table.getGeoData();

  assertEquals(data, {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "MultiPolygon",
          coordinates: [
            [
              [
                [13.383529, 52.515496],
                [13.383060641522562, 52.5154695817136],
                [13.383144, 52.515321],
                [13.383127, 52.514867],
                [13.382603, 52.514954],
                [13.382609404455074, 52.51544412917958],
                [13.382288, 52.515426],
                [13.382096, 52.514797],
                [13.383424, 52.51464],
                [13.383529, 52.515496],
              ],
            ],
            [
              [
                [13.38262, 52.516255],
                [13.382609404455074, 52.51544412917958],
                [13.383060641522562, 52.5154695817136],
                [13.38262, 52.516255],
              ],
            ],
          ],
        },
        properties: {},
      },
    ],
  });

  await sdb.done();
});

Deno.test("should flag fixed geo as valid", async () => {
  const sdb = new SimpleDB();
  // From https://github.com/chrieke/geojson-invalid-geometry
  const table = sdb.newTable("geodata");
  await table.loadGeoData("test/geodata/files/invalid.geojson");
  await table.fixGeo();
  await table.isValidGeo("isValid");
  await table.selectColumns("isValid");
  const data = await table.getData();

  assertEquals(data, [{ isValid: true }]);

  await sdb.done();
});
