import { readFileSync } from "node:fs";
import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

const output = "./test/output/";

Deno.test("should write a json file", async () => {
  const sdb = new SimpleDB();
  const originalFile = "test/geodata/files/polygons.geojson";

  const table = sdb.newTable();
  await table.loadGeoData(originalFile);
  await table.writeGeoData(`${output}data.json`);

  const originalData = JSON.parse(readFileSync(originalFile, "utf-8"));
  const writtenData = JSON.parse(
    readFileSync(`${output}data.geojson`, "utf-8"),
  );

  assertEquals(writtenData, originalData);
  await sdb.done();
});

Deno.test("should write a geojson file", async () => {
  const sdb = new SimpleDB();
  const originalFile = "test/geodata/files/polygons.geojson";

  const table = sdb.newTable();
  await table.loadGeoData(originalFile);
  await table.writeGeoData(`${output}data.geojson`, { rewind: false });

  const originalData = JSON.parse(readFileSync(originalFile, "utf-8"));
  const writtenData = JSON.parse(
    readFileSync(`${output}data.geojson`, "utf-8"),
  );

  assertEquals(writtenData, originalData);
  await sdb.done();
});

Deno.test("should write a geojson file and create the path if it doesn't exist", async () => {
  const sdb = new SimpleDB();
  const originalFile = "test/geodata/files/polygons.geojson";

  const table = sdb.newTable();
  await table.loadGeoData(originalFile);
  await table.writeGeoData(`${output}/subfolderGeoData/data.geojson`, {
    rewind: false,
  });

  const originalData = JSON.parse(readFileSync(originalFile, "utf-8"));
  const writtenData = JSON.parse(
    readFileSync(`${output}subfolderGeoData/data.geojson`, "utf-8"),
  );

  assertEquals(writtenData, originalData);
  await sdb.done();
});

Deno.test("should write geojson file that has been converted to WGS84", async () => {
  const sdb = new SimpleDB();
  const originalFile = "test/geodata/files/canada-not-4326.shp.zip";

  const table = sdb.newTable();
  await table.loadGeoData(originalFile, { toWGS84: true });
  await table.writeGeoData(`${output}dataWithOptionsToWGS84.geojson`, {
    precision: 2,
    rewind: false,
  });
  const writtenData = JSON.parse(
    readFileSync(`${output}dataWithOptionsToWGS84.geojson`, "utf-8"),
  );

  const canada = JSON.parse(
    readFileSync("test/geodata/files/canada.json", "utf-8"),
  );

  assertEquals(writtenData, canada);
  await sdb.done();
});

Deno.test("should write geojson file that has been manually converted to WGS84", async () => {
  const sdb = new SimpleDB();
  const originalFile = "test/geodata/files/canada-not-4326.shp.zip";

  const table = sdb.newTable();
  await table.loadGeoData(originalFile);
  await table.reproject("WGS84");
  await table.writeGeoData(`${output}dataWithOptionsToWGS84.geojson`, {
    precision: 2,
    rewind: false,
  });

  const writtenData = JSON.parse(
    readFileSync(`${output}dataWithOptionsToWGS84.geojson`, "utf-8"),
  );

  const canada = JSON.parse(
    readFileSync("test/geodata/files/canada.json", "utf-8"),
  );

  assertEquals(writtenData, canada);
  await sdb.done();
});

Deno.test("should write geojson file with coordinates rounded to 3 decimals", async () => {
  const originalFile = "test/geodata/files/polygons.geojson";

  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadGeoData(originalFile);
  await table.writeGeoData(`${output}dataPrecision.geojson`, {
    precision: 3,
    rewind: false,
  });

  const writtenData = JSON.parse(
    readFileSync(`${output}dataPrecision.geojson`, "utf-8"),
  );

  assertEquals(writtenData, {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { name: "polygonA" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-80.593, 50.345],
              [-81.468, 44.964],
              [-75.091, 46.969],
              [-75.56, 50.147],
              [-80.593, 50.345],
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
              [-121.958, 62.011],
              [-122.302, 56.046],
              [-112.246, 51.569],
              [-104.838, 51.434],
              [-96.842, 53.442],
              [-98.049, 62.426],
              [-121.958, 62.011],
            ],
          ],
        },
      },
    ],
  });

  await sdb.done();
});
Deno.test("should write a geojson without rewinding the file", async () => {
  const sdb = new SimpleDB();

  const data = sdb.newTable();
  await data.loadGeoData(
    "test/geodata/files/economicRegions-simplified.json",
  );
  await data.writeGeoData(`${output}no-rewind-data.geojson`, { rewind: false });

  const writtenData = JSON.parse(
    readFileSync(`${output}no-rewind-data.geojson`, "utf-8"),
  );
  const originalData = JSON.parse(
    readFileSync("test/geodata/files/economicRegions-simplified.json", "utf-8"),
  );

  assertEquals(writtenData, originalData);
});
Deno.test("should write a geojson and rewind the file", async () => {
  const sdb = new SimpleDB();

  const data = sdb.newTable();
  await data.loadGeoData(
    "test/geodata/files/economicRegions-simplified.json",
  );
  await data.writeGeoData(`${output}rewind-data.geojson`, { rewind: true });

  const writtenData = JSON.parse(
    readFileSync(`${output}rewind-data.geojson`, "utf-8"),
  );
  const originalData = JSON.parse(
    readFileSync("test/geodata/files/economicRegions-rewinded.json", "utf-8"),
  );

  assertEquals(writtenData, originalData);
});
Deno.test("should write a geoparquet file", async () => {
  const sdb = new SimpleDB();
  const originalFile = "test/geodata/files/polygons.geojson";

  const originalData = sdb.newTable();
  await originalData.loadGeoData(originalFile);
  await originalData.writeGeoData(`${output}data.geoparquet`);

  const writtenData = sdb.newTable();
  await writtenData.loadGeoData(`${output}data.geoparquet`);

  assertEquals(await writtenData.getGeoData(), await originalData.getGeoData());
  await sdb.done();
});

Deno.test("should write a compressed geoparquet file", async () => {
  const sdb = new SimpleDB();
  const originalFile = "test/geodata/files/polygons.geojson";

  const originalData = sdb.newTable();
  await originalData.loadGeoData(originalFile);
  await originalData.writeGeoData(`${output}data-compressed.geoparquet`, {
    compression: true,
  });

  const writtenData = sdb.newTable();
  await writtenData.loadGeoData(`${output}data-compressed.geoparquet`);

  assertEquals(await writtenData.getGeoData(), await originalData.getGeoData());
  await sdb.done();
});

Deno.test("should write a geoparquet file and keep the projection", async () => {
  const sdb = new SimpleDB();
  const originalFile = "test/geodata/files/polygons.geojson";

  const originalData = sdb.newTable();
  await originalData.loadGeoData(originalFile);
  await originalData.writeGeoData(`${output}data.geoparquet`);

  const writtenData = sdb.newTable();
  await writtenData.loadGeoData(`${output}data.geoparquet`);

  assertEquals(writtenData.projections, {
    geom: "+proj=latlong +datum=WGS84 +no_defs",
  });
  await sdb.done();
});

Deno.test("should write a geoparquet file with multiple geo columns", async () => {
  const sdb = new SimpleDB();
  const originalFile = "test/geodata/files/polygons.geojson";

  const originalData = sdb.newTable();
  await originalData.loadGeoData(originalFile);
  await originalData.cloneColumn("geom", "anotherGeom");
  await originalData.writeGeoData(`${output}data-multiple-columns.geoparquet`);

  const writtenData = sdb.newTable();
  await writtenData.loadGeoData(`${output}data-multiple-columns.geoparquet`);

  assertEquals(await writtenData.getData(), await originalData.getData());
  await sdb.done();
});

Deno.test("should write a geoparquet file with multiple geo columns and keep the projections", async () => {
  const sdb = new SimpleDB();
  const originalFile = "test/geodata/files/polygons.geojson";

  const originalData = sdb.newTable();
  await originalData.loadGeoData(originalFile);
  await originalData.cloneColumn("geom", "anotherGeom");
  await originalData.writeGeoData(`${output}data-multiple-columns.geoparquet`);

  const writtenData = sdb.newTable();
  await writtenData.loadGeoData(`${output}data-multiple-columns.geoparquet`);

  assertEquals(writtenData.projections, {
    geom: "+proj=latlong +datum=WGS84 +no_defs",
    anotherGeom: "+proj=latlong +datum=WGS84 +no_defs",
  });
  await sdb.done();
});
