import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should compute the centroids", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("geodata");
  await table.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );
  await table.centroid("centroid");

  await table.selectColumns(["nameEnglish", "centroid"]);
  await table.reducePrecision(4);

  const data = await table.getGeoData("centroid");

  assertEquals(data, {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            -60.5139,
            52.8937,
          ],
        },
        "properties": {
          "nameEnglish": "Newfoundland and Labrador",
        },
      },
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            -63.236,
            46.3817,
          ],
        },
        "properties": {
          "nameEnglish": "Prince Edward Island",
        },
      },
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            -63.2779,
            45.1573,
          ],
        },
        "properties": {
          "nameEnglish": "Nova Scotia",
        },
      },
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            -66.3916,
            46.6263,
          ],
        },
        "properties": {
          "nameEnglish": "New Brunswick",
        },
      },
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            -71.7923,
            53.3983,
          ],
        },
        "properties": {
          "nameEnglish": "Quebec",
        },
      },
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            -86.0445,
            50.4664,
          ],
        },
        "properties": {
          "nameEnglish": "Ontario",
        },
      },
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            -97.4286,
            54.9305,
          ],
        },
        "properties": {
          "nameEnglish": "Manitoba",
        },
      },
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            -105.8881,
            54.4164,
          ],
        },
        "properties": {
          "nameEnglish": "Saskatchewan",
        },
      },
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            -114.5088,
            55.1708,
          ],
        },
        "properties": {
          "nameEnglish": "Alberta",
        },
      },
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            -124.7182,
            54.7777,
          ],
        },
        "properties": {
          "nameEnglish": "British Columbia",
        },
      },
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            -135.5131,
            63.6325,
          ],
        },
        "properties": {
          "nameEnglish": "Yukon",
        },
      },
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            -118.9911,
            66.368,
          ],
        },
        "properties": {
          "nameEnglish": "Northwest Territories",
        },
      },
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            -88.6627,
            71.19,
          ],
        },
        "properties": {
          "nameEnglish": "Nunavut",
        },
      },
    ],
  });

  await sdb.done();
});

Deno.test("should compute the centroids and add a projection", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("geodata");
  await table.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );
  await table.centroid("centroid");

  assertEquals(table.projections, {
    geom: "+proj=latlong +datum=WGS84 +no_defs",
    centroid: "+proj=latlong +datum=WGS84 +no_defs",
  });

  await sdb.done();
});

Deno.test("should compute the centroids from a specific column", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("geodata");
  await table.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );
  await table.centroid("centroid", { column: "geom" });

  await table.selectColumns(["nameEnglish", "centroid"]);
  await table.reducePrecision(4);

  const data = await table.getGeoData("centroid");

  assertEquals(data, {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            -60.5139,
            52.8937,
          ],
        },
        "properties": {
          "nameEnglish": "Newfoundland and Labrador",
        },
      },
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            -63.236,
            46.3817,
          ],
        },
        "properties": {
          "nameEnglish": "Prince Edward Island",
        },
      },
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            -63.2779,
            45.1573,
          ],
        },
        "properties": {
          "nameEnglish": "Nova Scotia",
        },
      },
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            -66.3916,
            46.6263,
          ],
        },
        "properties": {
          "nameEnglish": "New Brunswick",
        },
      },
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            -71.7923,
            53.3983,
          ],
        },
        "properties": {
          "nameEnglish": "Quebec",
        },
      },
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            -86.0445,
            50.4664,
          ],
        },
        "properties": {
          "nameEnglish": "Ontario",
        },
      },
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            -97.4286,
            54.9305,
          ],
        },
        "properties": {
          "nameEnglish": "Manitoba",
        },
      },
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            -105.8881,
            54.4164,
          ],
        },
        "properties": {
          "nameEnglish": "Saskatchewan",
        },
      },
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            -114.5088,
            55.1708,
          ],
        },
        "properties": {
          "nameEnglish": "Alberta",
        },
      },
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            -124.7182,
            54.7777,
          ],
        },
        "properties": {
          "nameEnglish": "British Columbia",
        },
      },
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            -135.5131,
            63.6325,
          ],
        },
        "properties": {
          "nameEnglish": "Yukon",
        },
      },
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            -118.9911,
            66.368,
          ],
        },
        "properties": {
          "nameEnglish": "Northwest Territories",
        },
      },
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            -88.6627,
            71.19,
          ],
        },
        "properties": {
          "nameEnglish": "Nunavut",
        },
      },
    ],
  });

  await sdb.done();
});
