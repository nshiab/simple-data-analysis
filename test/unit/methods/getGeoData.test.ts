import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import { readFileSync } from "node:fs";
import { rewind } from "@nshiab/journalism-dataviz";

Deno.test("should find the column with geometries and return geospatial data as a geojson", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("geoData");
  await table.loadGeoData("test/geodata/files/polygons.geojson");
  await table.renameColumns({ geom: "newGeom" });
  const geoData = await table.getGeoData();

  assertEquals(geoData, {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { name: "polygonA" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-80.5925744, 50.3447571],
              [-81.4683036, 44.963885],
              [-75.0907732, 46.9689849],
              [-75.5601513, 50.1474736],
              [-80.5925744, 50.3447571],
            ],
          ],
        },
      },
      {
        type: "Feature",
        properties: { name: "polygonB" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-121.9581024, 62.0110577],
              [-122.3017867, 56.0464801],
              [-112.2459009, 51.5685044],
              [-104.838484, 51.4335657],
              [-96.8420125, 53.4420801],
              [-98.0491012, 62.4259071],
              [-121.9581024, 62.0110577],
            ],
          ],
        },
      },
    ],
  });

  await sdb.done();
});

Deno.test("should return geospatial data as a geojson with a specific geometry column", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("geoData");
  await table.loadGeoData("test/geodata/files/polygons.geojson");
  await table.renameColumns({ geom: "newGeom" });
  const geoData = await table.getGeoData("newGeom");

  assertEquals(geoData, {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { name: "polygonA" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-80.5925744, 50.3447571],
              [-81.4683036, 44.963885],
              [-75.0907732, 46.9689849],
              [-75.5601513, 50.1474736],
              [-80.5925744, 50.3447571],
            ],
          ],
        },
      },
      {
        type: "Feature",
        properties: { name: "polygonB" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-121.9581024, 62.0110577],
              [-122.3017867, 56.0464801],
              [-112.2459009, 51.5685044],
              [-104.838484, 51.4335657],
              [-96.8420125, 53.4420801],
              [-98.0491012, 62.4259071],
              [-121.9581024, 62.0110577],
            ],
          ],
        },
      },
    ],
  });

  await sdb.done();
});
Deno.test("should return geospatial data not rewinded", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("geoData");
  await table.loadGeoData("test/geodata/files/economicRegions-simplified.json");
  const geoData = await table.getGeoData();

  const originalData = JSON.parse(
    readFileSync("test/geodata/files/economicRegions-simplified.json", "utf-8"),
  );

  assertEquals(geoData, originalData);

  await sdb.done();
});
Deno.test("should return geospatial data rewinded", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("geoData");
  await table.loadGeoData("test/geodata/files/economicRegions-simplified.json");
  const geoData = await table.getGeoData(undefined, { rewind: true });

  const rewindedData = rewind(JSON.parse(
    readFileSync("test/geodata/files/economicRegions-simplified.json", "utf-8"),
  )) as {
    type: string;
    features: unknown[];
  };

  assertEquals(geoData, rewindedData);

  await sdb.done();
});
