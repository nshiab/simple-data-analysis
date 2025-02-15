import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should simplify the geometries", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );
  await table.simplify(0.5);
  await table.reducePrecision(1);

  const data = await table.getGeoData();

  assertEquals(data, {
    "type": "FeatureCollection",
    "features": [{
      "type": "Feature",
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [[[
          [-57.3, 50.7],
          [-59.2, 47.6],
          [-56, 47.7],
          [-55.2, 47.5],
          [-56, 46.9],
          [-55.4, 46.9],
          [-54.2, 47.8],
          [-54.2, 46.9],
          [-52.9, 46.8],
          [-52.7, 47.8],
          [-53.8, 47.7],
          [-53, 48.6],
          [-54, 48.8],
          [-53.5, 49.2],
          [-55.7, 49.4],
          [-56.2, 50.2],
          [-56.7, 49.7],
          [-55.4, 51.6],
          [-57.3, 50.7],
        ]], [[
          [-55.7, 52.1],
          [-55.7, 53.3],
          [-58.1, 54.2],
          [-60.1, 53.5],
          [-57.6, 54.6],
          [-61.7, 56.2],
          [-61.9, 57.9],
          [-64.5, 60.3],
          [-63.6, 55],
          [-66.6, 55.3],
          [-67.8, 54.4],
          [-66.9, 53.4],
          [-67.3, 52.9],
          [-65.2, 51.8],
          [-64.3, 51.7],
          [-64.1, 52.7],
          [-63.6, 52.8],
          [-63.8, 52],
          [-57.1, 52],
          [-57.1, 51.4],
          [-55.7, 52.1],
        ]]],
      },
      "properties": {
        "nameEnglish": "Newfoundland and Labrador",
        "nameFrench": "Terre-Neuve-et-Labrador",
      },
    }, {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[-64.2, 47], [-64.4, 46.7], [-62.8, 46], [-62, 46.5], [
          -64.2,
          47,
        ]]],
      },
      "properties": {
        "nameEnglish": "Prince Edward Island",
        "nameFrench": "Île-du-Prince-Édouard",
      },
    }, {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-64.9, 45.4],
          [-63.7, 45.3],
          [-65.7, 44.7],
          [-66.1, 43.8],
          [-65.5, 43.5],
          [-59.8, 46],
          [-60.7, 46.9],
          [-61.5, 45.7],
          [-64.9, 45.4],
        ]],
      },
      "properties": {
        "nameEnglish": "Nova Scotia",
        "nameFrench": "Nouvelle-Écosse",
      },
    }, {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-65, 47.8],
          [-68.1, 48],
          [-69, 47.3],
          [-67.8, 47.1],
          [-67.4, 45.1],
          [-64, 46],
          [-65, 47.8],
        ]],
      },
      "properties": {
        "nameEnglish": "New Brunswick",
        "nameFrench": "Nouveau-Brunswick",
      },
    }, {
      "type": "Feature",
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [[[
          [-74, 45.2],
          [-74.4, 45.1],
          [-71.5, 45],
          [-69.2, 47.5],
          [-64.2, 48.9],
          [-67.8, 48.8],
          [-70.5, 47],
          [-71.2, 46.8],
          [-66.9, 50],
          [-59.9, 50.3],
          [-57.1, 52],
          [-63.8, 52],
          [-63.6, 52.8],
          [-64.7, 51.7],
          [-67.3, 52.9],
          [-66.9, 53.4],
          [-67.8, 54.4],
          [-66.6, 55.3],
          [-63.6, 55],
          [-64.5, 60.3],
          [-67.6, 58.3],
          [-69.4, 58.9],
          [-69.4, 60.9],
          [-73.8, 62.5],
          [-78.1, 62.4],
          [-77.6, 61.5],
          [-78.2, 60.9],
          [-77.3, 60],
          [-78.6, 58.9],
          [-76.9, 57.7],
          [-76.5, 56.3],
          [-79.6, 54.7],
          [-78.5, 52.4],
          [-79.5, 51.5],
          [-79.6, 47.4],
          [-76.7, 45.6],
          [-74.4, 45.6],
          [-74, 45.2],
        ], [
          [-74, 45.4],
          [-74.1, 45.5],
          [-73, 46.2],
          [-71.9, 46.7],
          [-73.5, 45.4],
          [-73.8, 45.4],
          [-74, 45.2],
          [-74, 45.4],
        ], [[-71.6, 46.6], [-71.8, 46.7], [-71.2, 46.8], [-71.6, 46.6]]], [[
          [-64.1, 50],
          [-64.4, 49.8],
          [-61.8, 49.1],
          [-64.1, 50],
        ]]],
      },
      "properties": { "nameEnglish": "Quebec", "nameFrench": "Québec" },
    }, {
      "type": "Feature",
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [
          [[[-77.5, 44.1], [-77.5, 43.9], [-77, 44], [-77.5, 44.1]]],
          [[[-82.7, 46], [-81.8, 45.5], [-81.9, 46], [-82.7, 46]]],
          [[
            [-94.3, 49.5],
            [-94.5, 48.7],
            [-91.3, 48.1],
            [-86.4, 48.8],
            [-84.9, 48],
            [-84.5, 46.5],
            [-80.7, 45.9],
            [-79.8, 44.9],
            [-81.6, 45.3],
            [-81.7, 43.4],
            [-82.9, 42],
            [-79.1, 42.9],
            [-79.7, 43.2],
            [-79.1, 43.8],
            [-74.3, 45.2],
            [-79.4, 47.1],
            [-79.5, 51.5],
            [-80.4, 51.4],
            [-82.2, 52.9],
            [-82.3, 55.1],
            [-84.8, 55.2],
            [-89, 56.9],
            [-95.2, 52.8],
            [-95.2, 49.6],
            [-94.3, 49.5],
          ]],
        ],
      },
      "properties": { "nameEnglish": "Ontario", "nameFrench": "Ontario" },
    }, {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-102, 60],
          [-101.4, 49],
          [-95.2, 49],
          [-95.2, 52.8],
          [-89, 56.9],
          [-92.5, 57],
          [-93.2, 58.8],
          [-94.8, 59],
          [-94.8, 60],
          [-102, 60],
        ]],
      },
      "properties": { "nameEnglish": "Manitoba", "nameFrench": "Manitoba" },
    }, {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[-110, 60], [-110, 49], [-101.4, 49], [-102, 60], [
          -110,
          60,
        ]]],
      },
      "properties": {
        "nameEnglish": "Saskatchewan",
        "nameFrench": "Saskatchewan",
      },
    }, {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-110, 60],
          [-120, 60],
          [-119.7, 53.4],
          [-115, 50.6],
          [-114.1, 49],
          [-110, 49],
          [-110, 60],
        ]],
      },
      "properties": { "nameEnglish": "Alberta", "nameFrench": "Alberta" },
    }, {
      "type": "Feature",
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [
          [[[-130, 53.2], [-129.8, 53.2], [-130.1, 53.5], [-130, 53.2]]],
          [[[-129.8, 53.4], [-129.5, 53.4], [-130.2, 53.9], [-129.8, 53.4]]],
          [[[-129.1, 52.7], [-128.6, 52.6], [-128.6, 53.2], [-129.1, 52.7]]],
          [[[-132.2, 52.8], [-131.6, 52.5], [-132.1, 53.1], [-132.2, 52.8]]],
          [[[-132.6, 53.2], [-132, 53.3], [-131.7, 54], [-133.1, 54.2], [
            -132.6,
            53.2,
          ]]],
          [[[-126.6, 49.4], [-123.5, 48.4], [-125.4, 50.3], [-128.4, 50.8], [
            -126.6,
            49.4,
          ]]],
          [[
            [-125.5, 60],
            [-139.1, 60],
            [-137.4, 58.9],
            [-135.5, 59.8],
            [-132.1, 56.9],
            [-130.1, 56.1],
            [-130.5, 54.4],
            [-129.3, 53.4],
            [-128.8, 53.8],
            [-127.5, 52.3],
            [-127.5, 51],
            [-124.6, 50.3],
            [-122.8, 49],
            [-114.1, 49],
            [-115, 50.6],
            [-120, 53.8],
            [-120, 60],
            [-125.5, 60],
          ]],
        ],
      },
      "properties": {
        "nameEnglish": "British Columbia",
        "nameFrench": "Colombie-Britannique",
      },
    }, {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-141, 69.6],
          [-141, 60.3],
          [-123.8, 60],
          [-124.8, 61],
          [-126.8, 60.8],
          [-129.1, 62.1],
          [-130.1, 63.9],
          [-132.6, 64.8],
          [-132.2, 65.6],
          [-133.7, 66],
          [-134, 67],
          [-136.2, 67],
          [-136.5, 68.9],
          [-141, 69.6],
        ]],
      },
      "properties": { "nameEnglish": "Yukon", "nameFrench": "Yukon" },
    }, {
      "type": "Feature",
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [
          [[[-115.1, 78], [-113.6, 77.8], [-114.4, 78.1], [-115.1, 78]]],
          [[[-118.7, 75.9], [-119.4, 75.6], [-118.3, 75.6], [-117.7, 76.1], [
            -118.7,
            75.9,
          ]]],
          [[[-111.6, 78.6], [-111.8, 78.3], [-109.8, 78.3], [-111.6, 78.6]]],
          [[[-111.5, 78.1], [-113.3, 77.8], [-112, 77.3], [-109.8, 78.1], [
            -111.5,
            78.1,
          ]]],
          [[[-121.5, 76.5], [-122.6, 76.3], [-119.7, 75.9], [-115.4, 77.3], [
            -118.8,
            77.4,
          ], [-121.5, 76.5]]],
          [[
            [-114.5, 76.5],
            [-117.7, 75.3],
            [-111.5, 75.2],
            [-114.4, 74.7],
            [-112.5, 74.4],
            [-109.8, 74.9],
            [-109.8, 75.5],
            [-114.5, 76.5],
          ]],
          [[
            [-124.1, 73.7],
            [-125.7, 72.2],
            [-122.8, 71.1],
            [-119.2, 72.6],
            [-115.3, 73.5],
            [-117.4, 74.2],
            [-124.7, 74.4],
            [-124.1, 73.7],
          ]],
          [[
            [-114.1, 72.7],
            [-114.5, 73.4],
            [-119.1, 71.9],
            [-116.2, 71.4],
            [-118.4, 71],
            [-117.3, 70.6],
            [-112, 70.4],
            [-117.4, 70],
            [-117, 69.7],
            [-109.9, 70],
            [-109.8, 72.4],
            [-114.1, 72.7],
          ]],
          [[
            [-124.5, 69.4],
            [-124, 69.7],
            [-124.9, 70],
            [-125.5, 69.3],
            [-128, 70.6],
            [-130.6, 69.4],
            [-132.1, 69.2],
            [-129.5, 70],
            [-135.7, 69.3],
            [-136.4, 67.6],
            [-132.7, 66],
            [-132.6, 64.8],
            [-130.1, 63.9],
            [-129.1, 62.1],
            [-126.8, 60.8],
            [-124.8, 61],
            [-123.8, 60],
            [-102, 60],
            [-102, 64.2],
            [-112.6, 65.4],
            [-120.6, 67.8],
            [-120.7, 69.6],
            [-124.5, 69.4],
          ]],
        ],
      },
      "properties": {
        "nameEnglish": "Northwest Territories",
        "nameFrench": "Territoires du Nord-Ouest",
      },
    }, {
      "type": "Feature",
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [
          [[[-109.2, 78.5], [-109.8, 78.6], [-109.8, 78.3], [-109.2, 78.5]]],
          [[[-70.7, 62.6], [-70.2, 62.6], [-70.8, 62.8], [-70.7, 62.6]]],
          [[[-68.2, 60.6], [-68.4, 60.3], [-68, 60.3], [-68.2, 60.6]]],
          [[[-80.5, 69.7], [-79.9, 69.5], [-79.5, 69.8], [-80.5, 69.7]]],
          [[[-84.1, 65.8], [-83.7, 65.9], [-84.4, 66.1], [-84.1, 65.8]]],
          [[[-65, 61.7], [-65.4, 61.6], [-64.8, 61.3], [-65, 61.7]]],
          [[[-104.7, 76.6], [-103, 76.5], [-104.2, 76.7], [-104.7, 76.6]]],
          [[[-87, 68.1], [-86.9, 67.8], [-86.4, 67.9], [-87, 68.1]]],
          [[[-104.3, 76.2], [-102.8, 76.1], [-103.1, 76.3], [-104.3, 76.2]]],
          [[[-104.9, 75.1], [-103.6, 75.2], [-104.2, 75.4], [-104.9, 75.1]]],
          [[[-78.5, 63.4], [-77.5, 63.3], [-78, 63.5], [-78.5, 63.4]]],
          [[[-105.3, 77.2], [-104.5, 77.3], [-105.2, 77.6], [-106, 77.8], [
            -105.3,
            77.2,
          ]]],
          [[[-91, 77.3], [-89.6, 77.3], [-90.2, 77.6], [-91, 77.3]]],
          [[[-74.7, 67.9], [-73.4, 67.8], [-73.4, 68], [-74.7, 67.9]]],
          [[[-79.5, 56.3], [-80, 55.9], [-79.5, 55.9], [-79.5, 56.3]]],
          [[[-96.3, 77.7], [-93.2, 77.7], [-95.4, 77.8], [-96.3, 77.7]]],
          [[[-81.9, 53.1], [-81.9, 53], [-80.8, 52.7], [-81.9, 53.1]]],
          [[[-80.2, 62.1], [-80.2, 61.8], [-79.7, 61.6], [-79.6, 62.4], [
            -80.2,
            62.1,
          ]]],
          [[[-105.3, 72.9], [-104.4, 73.5], [-105.1, 73.8], [-106.7, 73.7], [
            -105.3,
            72.9,
          ]]],
          [[[-83.3, 62.9], [-84, 62.4], [-83.1, 62.2], [-82.2, 63], [
            -83.3,
            62.9,
          ]]],
          [[[-97.6, 78], [-94.9, 78.3], [-96.5, 78.7], [-98.1, 78.8], [
            -97.6,
            78,
          ]]],
          [[[-95.6, 75.6], [-96.6, 75.1], [-93.5, 74.7], [-95.6, 75.6]]],
          [[[-77.3, 67.7], [-77, 67.2], [-75, 67.6], [-75.8, 68.3], [
            -77.3,
            67.7,
          ]]],
          [[[-80.8, 73.8], [-80.9, 73.3], [-76.3, 73.1], [-80.8, 73.8]]],
          [[[-103.4, 78.8], [-105, 78.4], [-104.4, 78.3], [-98.9, 78.1], [
            -105.4,
            79.3,
          ], [-103.4, 78.8]]],
          [[[-99.4, 68.9], [-95.7, 68.8], [-96.3, 69.4], [-98, 69.9], [
            -99.4,
            68.9,
          ]]],
          [[
            [-106.2, 75],
            [-105.4, 75.7],
            [-109.1, 76.8],
            [-109.8, 76.5],
            [-109, 75.7],
            [-109.8, 74.9],
            [-106.2, 75],
          ]],
          [[
            [-102.1, 76.3],
            [-101.7, 76],
            [-102.3, 75.8],
            [-99.6, 75.7],
            [-100.6, 75.4],
            [-100.1, 75],
            [-97.6, 75.2],
            [-98.1, 75.3],
            [-97.5, 76.2],
            [-102.1, 76.3],
          ]],
          [[[-95.7, 73.7], [-95.2, 72], [-90.2, 73.9], [-95.7, 73.7]]],
          [[
            [-101.6, 73.5],
            [-100, 72.9],
            [-102.7, 72.8],
            [-99.2, 71.4],
            [-96.5, 71.8],
            [-96.5, 72.7],
            [-98, 73],
            [-97.2, 73.9],
            [-101.6, 73.5],
          ]],
          [[
            [-86.2, 64.1],
            [-87.2, 63.7],
            [-85.5, 63.1],
            [-83.5, 64.1],
            [-80.6, 63.6],
            [-85.5, 65.9],
            [-86.2, 64.1],
          ]],
          [[
            [-96.6, 79.9],
            [-92.6, 79.4],
            [-94.3, 79],
            [-92, 78.2],
            [-84.9, 79.3],
            [-93.5, 81.4],
            [-96.6, 79.9],
          ]],
          [[
            [-96.9, 76.7],
            [-93.1, 76.4],
            [-91.7, 74.7],
            [-79.4, 74.9],
            [-81.1, 75.8],
            [-88.2, 75.5],
            [-90.2, 76.1],
            [-89.3, 76.3],
            [-96.9, 76.7],
          ]],
          [[
            [-112.7, 68.5],
            [-106.2, 69.3],
            [-102.9, 68.8],
            [-102.1, 69],
            [-103, 69.4],
            [-102.6, 69.7],
            [-100.9, 69.7],
            [-104.5, 71],
            [-105.3, 72.8],
            [-105.3, 72.9],
            [-108, 73.4],
            [-107.3, 71.9],
            [-107.7, 71.6],
            [-109.8, 72.9],
            [-109.9, 70],
            [-117, 69.7],
            [-112.7, 68.5],
          ]],
          [[
            [-76.9, 83.1],
            [-91.4, 81.8],
            [-87.5, 80.6],
            [-80.6, 80.5],
            [-83.1, 80.3],
            [-82.1, 79.9],
            [-86.4, 80.3],
            [-84.3, 79.2],
            [-87.5, 78.1],
            [-84.2, 77.4],
            [-88.2, 77.8],
            [-87.1, 77.2],
            [-89.7, 76.6],
            [-80.1, 76.2],
            [-77.8, 76.7],
            [-79.4, 76.9],
            [-77.7, 77.6],
            [-78.5, 78],
            [-75.1, 78.4],
            [-74.4, 79],
            [-75.1, 79.4],
            [-61.1, 82.2],
            [-76.9, 83.1],
          ]],
          [[
            [-72.3, 70.9],
            [-71.1, 71.3],
            [-73.6, 71.4],
            [-75.2, 72.5],
            [-80.5, 72.4],
            [-81.6, 73.7],
            [-85.7, 72.9],
            [-85.6, 71.8],
            [-84.5, 71.5],
            [-86.1, 71.8],
            [-86.7, 72.7],
            [-85.1, 73.8],
            [-88.3, 73.6],
            [-90, 72],
            [-87.3, 71],
            [-89.4, 70.9],
            [-87.8, 70.2],
            [-77.7, 70.2],
            [-75.6, 69.2],
            [-76.4, 68.7],
            [-75, 69],
            [-73.4, 68],
            [-72.2, 67.2],
            [-74.4, 66.1],
            [-73.9, 65.5],
            [-77.3, 65.5],
            [-78.1, 65],
            [-77.8, 64.3],
            [-74.3, 64.6],
            [-71.3, 63.6],
            [-71.6, 63.1],
            [-65.9, 61.9],
            [-68.8, 63.7],
            [-64.9, 62.6],
            [-64.5, 63.7],
            [-67.9, 65.9],
            [-67.1, 66.5],
            [-63.4, 65.1],
            [-61.3, 66.6],
            [-68.4, 68.6],
            [-66.8, 69.3],
            [-68.5, 69.6],
            [-67.6, 70.2],
            [-72.3, 70.9],
          ]],
          [[
            [-92.1, 62.9],
            [-86.9, 65.1],
            [-89, 65.3],
            [-90, 65.8],
            [-87.2, 65.4],
            [-86, 66],
            [-86.6, 66.5],
            [-81.5, 67],
            [-82.5, 68.4],
            [-81.3, 69.2],
            [-85.5, 69.6],
            [-84.7, 68.8],
            [-87.4, 67.2],
            [-88.4, 68],
            [-87.8, 68.4],
            [-88.2, 68.9],
            [-89.4, 69.2],
            [-90.5, 68.5],
            [-90.8, 69.5],
            [-92.7, 69.7],
            [-91.5, 70.2],
            [-93, 71.4],
            [-95.2, 72],
            [-96.5, 70.2],
            [-93.3, 69.4],
            [-94.5, 68.9],
            [-93.6, 68.5],
            [-95.4, 68.1],
            [-95.3, 67.2],
            [-97.3, 68.5],
            [-98.6, 68.3],
            [-97.2, 67.7],
            [-101.6, 67.7],
            [-106.2, 68.9],
            [-108.6, 68.4],
            [-105.7, 68.4],
            [-107.7, 68],
            [-107.2, 67],
            [-107.9, 66.8],
            [-110, 68],
            [-114.8, 67.8],
            [-113.9, 68.4],
            [-120.7, 69.6],
            [-120.6, 67.8],
            [-112.6, 65.4],
            [-102, 64.2],
            [-102, 60],
            [-94.8, 60],
            [-92.1, 62.9],
          ]],
        ],
      },
      "properties": { "nameEnglish": "Nunavut", "nameFrench": "Nunavut" },
    }],
  });
  await sdb.done();
});
Deno.test("should simplify the geometries from a specific column", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );
  await table.simplify(0.5, { column: "geom" });
  await table.reducePrecision(1);

  const data = await table.getGeoData();

  assertEquals(data, {
    "type": "FeatureCollection",
    "features": [{
      "type": "Feature",
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [[[
          [-57.3, 50.7],
          [-59.2, 47.6],
          [-56, 47.7],
          [-55.2, 47.5],
          [-56, 46.9],
          [-55.4, 46.9],
          [-54.2, 47.8],
          [-54.2, 46.9],
          [-52.9, 46.8],
          [-52.7, 47.8],
          [-53.8, 47.7],
          [-53, 48.6],
          [-54, 48.8],
          [-53.5, 49.2],
          [-55.7, 49.4],
          [-56.2, 50.2],
          [-56.7, 49.7],
          [-55.4, 51.6],
          [-57.3, 50.7],
        ]], [[
          [-55.7, 52.1],
          [-55.7, 53.3],
          [-58.1, 54.2],
          [-60.1, 53.5],
          [-57.6, 54.6],
          [-61.7, 56.2],
          [-61.9, 57.9],
          [-64.5, 60.3],
          [-63.6, 55],
          [-66.6, 55.3],
          [-67.8, 54.4],
          [-66.9, 53.4],
          [-67.3, 52.9],
          [-65.2, 51.8],
          [-64.3, 51.7],
          [-64.1, 52.7],
          [-63.6, 52.8],
          [-63.8, 52],
          [-57.1, 52],
          [-57.1, 51.4],
          [-55.7, 52.1],
        ]]],
      },
      "properties": {
        "nameEnglish": "Newfoundland and Labrador",
        "nameFrench": "Terre-Neuve-et-Labrador",
      },
    }, {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[-64.2, 47], [-64.4, 46.7], [-62.8, 46], [-62, 46.5], [
          -64.2,
          47,
        ]]],
      },
      "properties": {
        "nameEnglish": "Prince Edward Island",
        "nameFrench": "Île-du-Prince-Édouard",
      },
    }, {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-64.9, 45.4],
          [-63.7, 45.3],
          [-65.7, 44.7],
          [-66.1, 43.8],
          [-65.5, 43.5],
          [-59.8, 46],
          [-60.7, 46.9],
          [-61.5, 45.7],
          [-64.9, 45.4],
        ]],
      },
      "properties": {
        "nameEnglish": "Nova Scotia",
        "nameFrench": "Nouvelle-Écosse",
      },
    }, {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-65, 47.8],
          [-68.1, 48],
          [-69, 47.3],
          [-67.8, 47.1],
          [-67.4, 45.1],
          [-64, 46],
          [-65, 47.8],
        ]],
      },
      "properties": {
        "nameEnglish": "New Brunswick",
        "nameFrench": "Nouveau-Brunswick",
      },
    }, {
      "type": "Feature",
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [[[
          [-74, 45.2],
          [-74.4, 45.1],
          [-71.5, 45],
          [-69.2, 47.5],
          [-64.2, 48.9],
          [-67.8, 48.8],
          [-70.5, 47],
          [-71.2, 46.8],
          [-66.9, 50],
          [-59.9, 50.3],
          [-57.1, 52],
          [-63.8, 52],
          [-63.6, 52.8],
          [-64.7, 51.7],
          [-67.3, 52.9],
          [-66.9, 53.4],
          [-67.8, 54.4],
          [-66.6, 55.3],
          [-63.6, 55],
          [-64.5, 60.3],
          [-67.6, 58.3],
          [-69.4, 58.9],
          [-69.4, 60.9],
          [-73.8, 62.5],
          [-78.1, 62.4],
          [-77.6, 61.5],
          [-78.2, 60.9],
          [-77.3, 60],
          [-78.6, 58.9],
          [-76.9, 57.7],
          [-76.5, 56.3],
          [-79.6, 54.7],
          [-78.5, 52.4],
          [-79.5, 51.5],
          [-79.6, 47.4],
          [-76.7, 45.6],
          [-74.4, 45.6],
          [-74, 45.2],
        ], [
          [-74, 45.4],
          [-74.1, 45.5],
          [-73, 46.2],
          [-71.9, 46.7],
          [-73.5, 45.4],
          [-73.8, 45.4],
          [-74, 45.2],
          [-74, 45.4],
        ], [[-71.6, 46.6], [-71.8, 46.7], [-71.2, 46.8], [-71.6, 46.6]]], [[
          [-64.1, 50],
          [-64.4, 49.8],
          [-61.8, 49.1],
          [-64.1, 50],
        ]]],
      },
      "properties": { "nameEnglish": "Quebec", "nameFrench": "Québec" },
    }, {
      "type": "Feature",
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [
          [[[-77.5, 44.1], [-77.5, 43.9], [-77, 44], [-77.5, 44.1]]],
          [[[-82.7, 46], [-81.8, 45.5], [-81.9, 46], [-82.7, 46]]],
          [[
            [-94.3, 49.5],
            [-94.5, 48.7],
            [-91.3, 48.1],
            [-86.4, 48.8],
            [-84.9, 48],
            [-84.5, 46.5],
            [-80.7, 45.9],
            [-79.8, 44.9],
            [-81.6, 45.3],
            [-81.7, 43.4],
            [-82.9, 42],
            [-79.1, 42.9],
            [-79.7, 43.2],
            [-79.1, 43.8],
            [-74.3, 45.2],
            [-79.4, 47.1],
            [-79.5, 51.5],
            [-80.4, 51.4],
            [-82.2, 52.9],
            [-82.3, 55.1],
            [-84.8, 55.2],
            [-89, 56.9],
            [-95.2, 52.8],
            [-95.2, 49.6],
            [-94.3, 49.5],
          ]],
        ],
      },
      "properties": { "nameEnglish": "Ontario", "nameFrench": "Ontario" },
    }, {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-102, 60],
          [-101.4, 49],
          [-95.2, 49],
          [-95.2, 52.8],
          [-89, 56.9],
          [-92.5, 57],
          [-93.2, 58.8],
          [-94.8, 59],
          [-94.8, 60],
          [-102, 60],
        ]],
      },
      "properties": { "nameEnglish": "Manitoba", "nameFrench": "Manitoba" },
    }, {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[-110, 60], [-110, 49], [-101.4, 49], [-102, 60], [
          -110,
          60,
        ]]],
      },
      "properties": {
        "nameEnglish": "Saskatchewan",
        "nameFrench": "Saskatchewan",
      },
    }, {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-110, 60],
          [-120, 60],
          [-119.7, 53.4],
          [-115, 50.6],
          [-114.1, 49],
          [-110, 49],
          [-110, 60],
        ]],
      },
      "properties": { "nameEnglish": "Alberta", "nameFrench": "Alberta" },
    }, {
      "type": "Feature",
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [
          [[[-130, 53.2], [-129.8, 53.2], [-130.1, 53.5], [-130, 53.2]]],
          [[[-129.8, 53.4], [-129.5, 53.4], [-130.2, 53.9], [-129.8, 53.4]]],
          [[[-129.1, 52.7], [-128.6, 52.6], [-128.6, 53.2], [-129.1, 52.7]]],
          [[[-132.2, 52.8], [-131.6, 52.5], [-132.1, 53.1], [-132.2, 52.8]]],
          [[[-132.6, 53.2], [-132, 53.3], [-131.7, 54], [-133.1, 54.2], [
            -132.6,
            53.2,
          ]]],
          [[[-126.6, 49.4], [-123.5, 48.4], [-125.4, 50.3], [-128.4, 50.8], [
            -126.6,
            49.4,
          ]]],
          [[
            [-125.5, 60],
            [-139.1, 60],
            [-137.4, 58.9],
            [-135.5, 59.8],
            [-132.1, 56.9],
            [-130.1, 56.1],
            [-130.5, 54.4],
            [-129.3, 53.4],
            [-128.8, 53.8],
            [-127.5, 52.3],
            [-127.5, 51],
            [-124.6, 50.3],
            [-122.8, 49],
            [-114.1, 49],
            [-115, 50.6],
            [-120, 53.8],
            [-120, 60],
            [-125.5, 60],
          ]],
        ],
      },
      "properties": {
        "nameEnglish": "British Columbia",
        "nameFrench": "Colombie-Britannique",
      },
    }, {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-141, 69.6],
          [-141, 60.3],
          [-123.8, 60],
          [-124.8, 61],
          [-126.8, 60.8],
          [-129.1, 62.1],
          [-130.1, 63.9],
          [-132.6, 64.8],
          [-132.2, 65.6],
          [-133.7, 66],
          [-134, 67],
          [-136.2, 67],
          [-136.5, 68.9],
          [-141, 69.6],
        ]],
      },
      "properties": { "nameEnglish": "Yukon", "nameFrench": "Yukon" },
    }, {
      "type": "Feature",
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [
          [[[-115.1, 78], [-113.6, 77.8], [-114.4, 78.1], [-115.1, 78]]],
          [[[-118.7, 75.9], [-119.4, 75.6], [-118.3, 75.6], [-117.7, 76.1], [
            -118.7,
            75.9,
          ]]],
          [[[-111.6, 78.6], [-111.8, 78.3], [-109.8, 78.3], [-111.6, 78.6]]],
          [[[-111.5, 78.1], [-113.3, 77.8], [-112, 77.3], [-109.8, 78.1], [
            -111.5,
            78.1,
          ]]],
          [[[-121.5, 76.5], [-122.6, 76.3], [-119.7, 75.9], [-115.4, 77.3], [
            -118.8,
            77.4,
          ], [-121.5, 76.5]]],
          [[
            [-114.5, 76.5],
            [-117.7, 75.3],
            [-111.5, 75.2],
            [-114.4, 74.7],
            [-112.5, 74.4],
            [-109.8, 74.9],
            [-109.8, 75.5],
            [-114.5, 76.5],
          ]],
          [[
            [-124.1, 73.7],
            [-125.7, 72.2],
            [-122.8, 71.1],
            [-119.2, 72.6],
            [-115.3, 73.5],
            [-117.4, 74.2],
            [-124.7, 74.4],
            [-124.1, 73.7],
          ]],
          [[
            [-114.1, 72.7],
            [-114.5, 73.4],
            [-119.1, 71.9],
            [-116.2, 71.4],
            [-118.4, 71],
            [-117.3, 70.6],
            [-112, 70.4],
            [-117.4, 70],
            [-117, 69.7],
            [-109.9, 70],
            [-109.8, 72.4],
            [-114.1, 72.7],
          ]],
          [[
            [-124.5, 69.4],
            [-124, 69.7],
            [-124.9, 70],
            [-125.5, 69.3],
            [-128, 70.6],
            [-130.6, 69.4],
            [-132.1, 69.2],
            [-129.5, 70],
            [-135.7, 69.3],
            [-136.4, 67.6],
            [-132.7, 66],
            [-132.6, 64.8],
            [-130.1, 63.9],
            [-129.1, 62.1],
            [-126.8, 60.8],
            [-124.8, 61],
            [-123.8, 60],
            [-102, 60],
            [-102, 64.2],
            [-112.6, 65.4],
            [-120.6, 67.8],
            [-120.7, 69.6],
            [-124.5, 69.4],
          ]],
        ],
      },
      "properties": {
        "nameEnglish": "Northwest Territories",
        "nameFrench": "Territoires du Nord-Ouest",
      },
    }, {
      "type": "Feature",
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [
          [[[-109.2, 78.5], [-109.8, 78.6], [-109.8, 78.3], [-109.2, 78.5]]],
          [[[-70.7, 62.6], [-70.2, 62.6], [-70.8, 62.8], [-70.7, 62.6]]],
          [[[-68.2, 60.6], [-68.4, 60.3], [-68, 60.3], [-68.2, 60.6]]],
          [[[-80.5, 69.7], [-79.9, 69.5], [-79.5, 69.8], [-80.5, 69.7]]],
          [[[-84.1, 65.8], [-83.7, 65.9], [-84.4, 66.1], [-84.1, 65.8]]],
          [[[-65, 61.7], [-65.4, 61.6], [-64.8, 61.3], [-65, 61.7]]],
          [[[-104.7, 76.6], [-103, 76.5], [-104.2, 76.7], [-104.7, 76.6]]],
          [[[-87, 68.1], [-86.9, 67.8], [-86.4, 67.9], [-87, 68.1]]],
          [[[-104.3, 76.2], [-102.8, 76.1], [-103.1, 76.3], [-104.3, 76.2]]],
          [[[-104.9, 75.1], [-103.6, 75.2], [-104.2, 75.4], [-104.9, 75.1]]],
          [[[-78.5, 63.4], [-77.5, 63.3], [-78, 63.5], [-78.5, 63.4]]],
          [[[-105.3, 77.2], [-104.5, 77.3], [-105.2, 77.6], [-106, 77.8], [
            -105.3,
            77.2,
          ]]],
          [[[-91, 77.3], [-89.6, 77.3], [-90.2, 77.6], [-91, 77.3]]],
          [[[-74.7, 67.9], [-73.4, 67.8], [-73.4, 68], [-74.7, 67.9]]],
          [[[-79.5, 56.3], [-80, 55.9], [-79.5, 55.9], [-79.5, 56.3]]],
          [[[-96.3, 77.7], [-93.2, 77.7], [-95.4, 77.8], [-96.3, 77.7]]],
          [[[-81.9, 53.1], [-81.9, 53], [-80.8, 52.7], [-81.9, 53.1]]],
          [[[-80.2, 62.1], [-80.2, 61.8], [-79.7, 61.6], [-79.6, 62.4], [
            -80.2,
            62.1,
          ]]],
          [[[-105.3, 72.9], [-104.4, 73.5], [-105.1, 73.8], [-106.7, 73.7], [
            -105.3,
            72.9,
          ]]],
          [[[-83.3, 62.9], [-84, 62.4], [-83.1, 62.2], [-82.2, 63], [
            -83.3,
            62.9,
          ]]],
          [[[-97.6, 78], [-94.9, 78.3], [-96.5, 78.7], [-98.1, 78.8], [
            -97.6,
            78,
          ]]],
          [[[-95.6, 75.6], [-96.6, 75.1], [-93.5, 74.7], [-95.6, 75.6]]],
          [[[-77.3, 67.7], [-77, 67.2], [-75, 67.6], [-75.8, 68.3], [
            -77.3,
            67.7,
          ]]],
          [[[-80.8, 73.8], [-80.9, 73.3], [-76.3, 73.1], [-80.8, 73.8]]],
          [[[-103.4, 78.8], [-105, 78.4], [-104.4, 78.3], [-98.9, 78.1], [
            -105.4,
            79.3,
          ], [-103.4, 78.8]]],
          [[[-99.4, 68.9], [-95.7, 68.8], [-96.3, 69.4], [-98, 69.9], [
            -99.4,
            68.9,
          ]]],
          [[
            [-106.2, 75],
            [-105.4, 75.7],
            [-109.1, 76.8],
            [-109.8, 76.5],
            [-109, 75.7],
            [-109.8, 74.9],
            [-106.2, 75],
          ]],
          [[
            [-102.1, 76.3],
            [-101.7, 76],
            [-102.3, 75.8],
            [-99.6, 75.7],
            [-100.6, 75.4],
            [-100.1, 75],
            [-97.6, 75.2],
            [-98.1, 75.3],
            [-97.5, 76.2],
            [-102.1, 76.3],
          ]],
          [[[-95.7, 73.7], [-95.2, 72], [-90.2, 73.9], [-95.7, 73.7]]],
          [[
            [-101.6, 73.5],
            [-100, 72.9],
            [-102.7, 72.8],
            [-99.2, 71.4],
            [-96.5, 71.8],
            [-96.5, 72.7],
            [-98, 73],
            [-97.2, 73.9],
            [-101.6, 73.5],
          ]],
          [[
            [-86.2, 64.1],
            [-87.2, 63.7],
            [-85.5, 63.1],
            [-83.5, 64.1],
            [-80.6, 63.6],
            [-85.5, 65.9],
            [-86.2, 64.1],
          ]],
          [[
            [-96.6, 79.9],
            [-92.6, 79.4],
            [-94.3, 79],
            [-92, 78.2],
            [-84.9, 79.3],
            [-93.5, 81.4],
            [-96.6, 79.9],
          ]],
          [[
            [-96.9, 76.7],
            [-93.1, 76.4],
            [-91.7, 74.7],
            [-79.4, 74.9],
            [-81.1, 75.8],
            [-88.2, 75.5],
            [-90.2, 76.1],
            [-89.3, 76.3],
            [-96.9, 76.7],
          ]],
          [[
            [-112.7, 68.5],
            [-106.2, 69.3],
            [-102.9, 68.8],
            [-102.1, 69],
            [-103, 69.4],
            [-102.6, 69.7],
            [-100.9, 69.7],
            [-104.5, 71],
            [-105.3, 72.8],
            [-105.3, 72.9],
            [-108, 73.4],
            [-107.3, 71.9],
            [-107.7, 71.6],
            [-109.8, 72.9],
            [-109.9, 70],
            [-117, 69.7],
            [-112.7, 68.5],
          ]],
          [[
            [-76.9, 83.1],
            [-91.4, 81.8],
            [-87.5, 80.6],
            [-80.6, 80.5],
            [-83.1, 80.3],
            [-82.1, 79.9],
            [-86.4, 80.3],
            [-84.3, 79.2],
            [-87.5, 78.1],
            [-84.2, 77.4],
            [-88.2, 77.8],
            [-87.1, 77.2],
            [-89.7, 76.6],
            [-80.1, 76.2],
            [-77.8, 76.7],
            [-79.4, 76.9],
            [-77.7, 77.6],
            [-78.5, 78],
            [-75.1, 78.4],
            [-74.4, 79],
            [-75.1, 79.4],
            [-61.1, 82.2],
            [-76.9, 83.1],
          ]],
          [[
            [-72.3, 70.9],
            [-71.1, 71.3],
            [-73.6, 71.4],
            [-75.2, 72.5],
            [-80.5, 72.4],
            [-81.6, 73.7],
            [-85.7, 72.9],
            [-85.6, 71.8],
            [-84.5, 71.5],
            [-86.1, 71.8],
            [-86.7, 72.7],
            [-85.1, 73.8],
            [-88.3, 73.6],
            [-90, 72],
            [-87.3, 71],
            [-89.4, 70.9],
            [-87.8, 70.2],
            [-77.7, 70.2],
            [-75.6, 69.2],
            [-76.4, 68.7],
            [-75, 69],
            [-73.4, 68],
            [-72.2, 67.2],
            [-74.4, 66.1],
            [-73.9, 65.5],
            [-77.3, 65.5],
            [-78.1, 65],
            [-77.8, 64.3],
            [-74.3, 64.6],
            [-71.3, 63.6],
            [-71.6, 63.1],
            [-65.9, 61.9],
            [-68.8, 63.7],
            [-64.9, 62.6],
            [-64.5, 63.7],
            [-67.9, 65.9],
            [-67.1, 66.5],
            [-63.4, 65.1],
            [-61.3, 66.6],
            [-68.4, 68.6],
            [-66.8, 69.3],
            [-68.5, 69.6],
            [-67.6, 70.2],
            [-72.3, 70.9],
          ]],
          [[
            [-92.1, 62.9],
            [-86.9, 65.1],
            [-89, 65.3],
            [-90, 65.8],
            [-87.2, 65.4],
            [-86, 66],
            [-86.6, 66.5],
            [-81.5, 67],
            [-82.5, 68.4],
            [-81.3, 69.2],
            [-85.5, 69.6],
            [-84.7, 68.8],
            [-87.4, 67.2],
            [-88.4, 68],
            [-87.8, 68.4],
            [-88.2, 68.9],
            [-89.4, 69.2],
            [-90.5, 68.5],
            [-90.8, 69.5],
            [-92.7, 69.7],
            [-91.5, 70.2],
            [-93, 71.4],
            [-95.2, 72],
            [-96.5, 70.2],
            [-93.3, 69.4],
            [-94.5, 68.9],
            [-93.6, 68.5],
            [-95.4, 68.1],
            [-95.3, 67.2],
            [-97.3, 68.5],
            [-98.6, 68.3],
            [-97.2, 67.7],
            [-101.6, 67.7],
            [-106.2, 68.9],
            [-108.6, 68.4],
            [-105.7, 68.4],
            [-107.7, 68],
            [-107.2, 67],
            [-107.9, 66.8],
            [-110, 68],
            [-114.8, 67.8],
            [-113.9, 68.4],
            [-120.7, 69.6],
            [-120.6, 67.8],
            [-112.6, 65.4],
            [-102, 64.2],
            [-102, 60],
            [-94.8, 60],
            [-92.1, 62.9],
          ]],
        ],
      },
      "properties": { "nameEnglish": "Nunavut", "nameFrench": "Nunavut" },
    }],
  });

  await sdb.done();
});
