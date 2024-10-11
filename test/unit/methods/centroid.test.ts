import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

const sdb = new SimpleDB();

Deno.test("should compute the centroids", async () => {
  const table = sdb.newTable("geodata");
  await table.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );
  await table.centroid("centroid");

  await table.selectColumns(["nameEnglish", "centroid"]);

  const data = await table.getGeoData("centroid");

  assertEquals(data, {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { nameEnglish: "Newfoundland and Labrador" },
        geometry: {
          type: "Point",
          coordinates: [-60.513931135839627, 52.893675520752538],
        },
      },
      {
        type: "Feature",
        properties: { nameEnglish: "Prince Edward Island" },
        geometry: {
          type: "Point",
          coordinates: [-63.23603949323202, 46.381720093103226],
        },
      },
      {
        type: "Feature",
        properties: { nameEnglish: "Nova Scotia" },
        geometry: {
          type: "Point",
          coordinates: [-63.277862438654473, 45.157300791297118],
        },
      },
      {
        type: "Feature",
        properties: { nameEnglish: "New Brunswick" },
        geometry: {
          type: "Point",
          coordinates: [-66.39159809401113, 46.626312034896515],
        },
      },
      {
        type: "Feature",
        properties: { nameEnglish: "Quebec" },
        geometry: {
          type: "Point",
          coordinates: [-71.792253583856564, 53.398296191964086],
        },
      },
      {
        type: "Feature",
        properties: { nameEnglish: "Ontario" },
        geometry: {
          type: "Point",
          coordinates: [-86.044463664856721, 50.466352911290031],
        },
      },
      {
        type: "Feature",
        properties: { nameEnglish: "Manitoba" },
        geometry: {
          type: "Point",
          coordinates: [-97.428598473724506, 54.930503752005343],
        },
      },
      {
        type: "Feature",
        properties: { nameEnglish: "Saskatchewan" },
        geometry: {
          type: "Point",
          coordinates: [-105.888113574678528, 54.416372073562258],
        },
      },
      {
        type: "Feature",
        properties: { nameEnglish: "Alberta" },
        geometry: {
          type: "Point",
          coordinates: [-114.508819120679618, 55.170803823629385],
        },
      },
      {
        type: "Feature",
        properties: { nameEnglish: "British Columbia" },
        geometry: {
          type: "Point",
          coordinates: [-124.71820632563734, 54.777694456377866],
        },
      },
      {
        type: "Feature",
        properties: { nameEnglish: "Yukon" },
        geometry: {
          type: "Point",
          coordinates: [-135.513091951141718, 63.632549278527797],
        },
      },
      {
        type: "Feature",
        properties: { nameEnglish: "Northwest Territories" },
        geometry: {
          type: "Point",
          coordinates: [-118.991099275710255, 66.368007992776697],
        },
      },
      {
        type: "Feature",
        properties: { nameEnglish: "Nunavut" },
        geometry: {
          type: "Point",
          coordinates: [-88.662698828787768, 71.190027762260598],
        },
      },
    ],
  });
});
Deno.test("should compute the centroids and add a projection", async () => {
  const table = sdb.newTable("geodata");
  await table.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );
  await table.centroid("centroid");

  assertEquals(table.projections, {
    geom: "+proj=latlong +datum=WGS84 +no_defs",
    centroid: "+proj=latlong +datum=WGS84 +no_defs",
  });
});
Deno.test("should compute the centroids from a specific column", async () => {
  const table = sdb.newTable("geodata");
  await table.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );
  await table.centroid("centroid", { column: "geom" });

  await table.selectColumns(["nameEnglish", "centroid"]);

  const data = await table.getGeoData("centroid");

  assertEquals(data, {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { nameEnglish: "Newfoundland and Labrador" },
        geometry: {
          type: "Point",
          coordinates: [-60.513931135839627, 52.893675520752538],
        },
      },
      {
        type: "Feature",
        properties: { nameEnglish: "Prince Edward Island" },
        geometry: {
          type: "Point",
          coordinates: [-63.23603949323202, 46.381720093103226],
        },
      },
      {
        type: "Feature",
        properties: { nameEnglish: "Nova Scotia" },
        geometry: {
          type: "Point",
          coordinates: [-63.277862438654473, 45.157300791297118],
        },
      },
      {
        type: "Feature",
        properties: { nameEnglish: "New Brunswick" },
        geometry: {
          type: "Point",
          coordinates: [-66.39159809401113, 46.626312034896515],
        },
      },
      {
        type: "Feature",
        properties: { nameEnglish: "Quebec" },
        geometry: {
          type: "Point",
          coordinates: [-71.792253583856564, 53.398296191964086],
        },
      },
      {
        type: "Feature",
        properties: { nameEnglish: "Ontario" },
        geometry: {
          type: "Point",
          coordinates: [-86.044463664856721, 50.466352911290031],
        },
      },
      {
        type: "Feature",
        properties: { nameEnglish: "Manitoba" },
        geometry: {
          type: "Point",
          coordinates: [-97.428598473724506, 54.930503752005343],
        },
      },
      {
        type: "Feature",
        properties: { nameEnglish: "Saskatchewan" },
        geometry: {
          type: "Point",
          coordinates: [-105.888113574678528, 54.416372073562258],
        },
      },
      {
        type: "Feature",
        properties: { nameEnglish: "Alberta" },
        geometry: {
          type: "Point",
          coordinates: [-114.508819120679618, 55.170803823629385],
        },
      },
      {
        type: "Feature",
        properties: { nameEnglish: "British Columbia" },
        geometry: {
          type: "Point",
          coordinates: [-124.71820632563734, 54.777694456377866],
        },
      },
      {
        type: "Feature",
        properties: { nameEnglish: "Yukon" },
        geometry: {
          type: "Point",
          coordinates: [-135.513091951141718, 63.632549278527797],
        },
      },
      {
        type: "Feature",
        properties: { nameEnglish: "Northwest Territories" },
        geometry: {
          type: "Point",
          coordinates: [-118.991099275710255, 66.368007992776697],
        },
      },
      {
        type: "Feature",
        properties: { nameEnglish: "Nunavut" },
        geometry: {
          type: "Point",
          coordinates: [-88.662698828787768, 71.190027762260598],
        },
      },
    ],
  });
});

await sdb.done();
