import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should return a column with new computed values", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData(["test/data/files/dataSummarize.json"]);
  await table.addColumn("multiply", "double", `key2 * key3`);
  const data = await table.getData();

  assertEquals(data, [
    { key1: "Rubarbe", key2: 1, key3: 10.5, multiply: 10.5 },
    { key1: "Fraise", key2: 11, key3: 2.345, multiply: 25.795 },
    { key1: "Rubarbe", key2: 2, key3: 4.5657, multiply: 9.1314 },
    { key1: "Fraise", key2: 22, key3: 12.3434, multiply: 271.5548 },
    { key1: "Banane", key2: null, key3: null, multiply: null },
    { key1: "Banane", key2: null, key3: null, multiply: null },
  ]);
  await sdb.done();
});
Deno.test("should return a column with booleans", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData(["test/data/files/dataSummarize.json"]);
  await table.addColumn("key2GreaterThanTen", "boolean", `key2 > 10`);

  const data = await table.getData();

  assertEquals(data, [
    {
      key1: "Rubarbe",
      key2: 1,
      key3: 10.5,
      key2GreaterThanTen: false,
    },
    {
      key1: "Fraise",
      key2: 11,
      key3: 2.345,
      key2GreaterThanTen: true,
    },
    {
      key1: "Rubarbe",
      key2: 2,
      key3: 4.5657,
      key2GreaterThanTen: false,
    },
    {
      key1: "Fraise",
      key2: 22,
      key3: 12.3434,
      key2GreaterThanTen: true,
    },
    {
      key1: "Banane",
      key2: null,
      key3: null,
      key2GreaterThanTen: null,
    },
    {
      key1: "Banane",
      key2: null,
      key3: null,
      key2GreaterThanTen: null,
    },
  ]);
  await sdb.done();
});
Deno.test("should return a column with geometry", async () => {
  const sdb = new SimpleDB();
  const geo = sdb.newTable("geo");
  await geo.loadGeoData("test/geodata/files/polygons.geojson");

  await geo.addColumn("centroid", "geometry", `ST_Centroid(geom)`, {
    projection: geo.projections.geom,
  });
  await geo.selectColumns(["name", "centroid"]);
  const data = await geo.getGeoData("centroid");

  assertEquals(data, {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [-78.40431518960061, 47.9928579141529],
        },
        properties: { name: "polygonA" },
      },
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [-109.10283617191051, 57.319258201410996],
        },
        properties: { name: "polygonB" },
      },
    ],
  });

  await sdb.done();
});
Deno.test("should return a column with geometry and a new projection", async () => {
  const sdb = new SimpleDB();
  const geo = sdb.newTable("geo");
  await geo.loadGeoData("test/geodata/files/polygons.geojson");

  await geo.addColumn("centroid", "geometry", `ST_Centroid(geom)`, {
    projection: geo.projections.geom,
  });

  assertEquals(geo.projections, {
    geom: "+proj=latlong +datum=WGS84 +no_defs",
    centroid: "+proj=latlong +datum=WGS84 +no_defs",
  });
  await sdb.done();
});
Deno.test("should return a column with a space in its name", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData(["test/data/files/dataSummarize.json"]);
  await table.addColumn("key 4", "double", `key2 * key3`);
  const data = await table.getData();

  assertEquals(data, [
    { key1: "Rubarbe", key2: 1, key3: 10.5, "key 4": 10.5 },
    { key1: "Fraise", key2: 11, key3: 2.345, "key 4": 25.795 },
    { key1: "Rubarbe", key2: 2, key3: 4.5657, "key 4": 9.1314 },
    { key1: "Fraise", key2: 22, key3: 12.3434, "key 4": 271.5548 },
    { key1: "Banane", key2: null, key3: null, "key 4": null },
    { key1: "Banane", key2: null, key3: null, "key 4": null },
  ]);
  await sdb.done();
});
Deno.test("should return a column with a $ in its name", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData(["test/data/files/dataSummarize.json"]);
  await table.addColumn("$key4", "double", `key2 * key3`);
  const data = await table.getData();

  assertEquals(data, [
    { key1: "Rubarbe", key2: 1, key3: 10.5, "$key4": 10.5 },
    { key1: "Fraise", key2: 11, key3: 2.345, "$key4": 25.795 },
    { key1: "Rubarbe", key2: 2, key3: 4.5657, "$key4": 9.1314 },
    { key1: "Fraise", key2: 22, key3: 12.3434, "$key4": 271.5548 },
    { key1: "Banane", key2: null, key3: null, "$key4": null },
    { key1: "Banane", key2: null, key3: null, "$key4": null },
  ]);
  await sdb.done();
});
