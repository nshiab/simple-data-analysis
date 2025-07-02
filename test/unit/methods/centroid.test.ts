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

  const data = await table.getGeoData("centroid");

  assertEquals(data, {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            -60.513931135839655,
            52.89367552075254,
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
            -63.23603949323203,
            46.38172009310323,
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
            -63.277862438654495,
            45.15730079129712,
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
            -66.39159809401114,
            46.62631203489651,
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
            -71.79225358385656,
            53.39829619196409,
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
            -86.04446366485669,
            50.46635291129,
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
            -97.42859847372449,
            54.930503752005336,
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
            -105.8881135746785,
            54.41637207356226,
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
            -114.50881912067959,
            55.17080382362937,
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
            -124.71820632563735,
            54.77769445637783,
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
            -135.51309195114175,
            63.63254927852782,
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
            -118.99109927571025,
            66.36800799277671,
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
            -88.66269882878774,
            71.19002776226056,
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

  const data = await table.getGeoData("centroid");

  assertEquals(data, {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            -60.513931135839655,
            52.89367552075254,
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
            -63.23603949323203,
            46.38172009310323,
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
            -63.277862438654495,
            45.15730079129712,
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
            -66.39159809401114,
            46.62631203489651,
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
            -71.79225358385656,
            53.39829619196409,
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
            -86.04446366485669,
            50.46635291129,
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
            -97.42859847372449,
            54.930503752005336,
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
            -105.8881135746785,
            54.41637207356226,
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
            -114.50881912067959,
            55.17080382362937,
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
            -124.71820632563735,
            54.77769445637783,
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
            -135.51309195114175,
            63.63254927852782,
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
            -118.99109927571025,
            66.36800799277671,
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
            -88.66269882878774,
            71.19002776226056,
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
