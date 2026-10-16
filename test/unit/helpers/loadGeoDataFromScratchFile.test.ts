import { test, expect } from "vite-plus/test";

import SimpleDB from "../../../src/class/SimpleDB.ts";
import loadGeoDataFromScratchFile from "../../../src/helpers/loadGeoDataFromScratchFile.ts";

test("loads a GeoJSON string through a scratch file", async () => {
  const sdb = new SimpleDB();
  try {
    const table = sdb.newTable();
    await loadGeoDataFromScratchFile(
      table,
      JSON.stringify({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: { type: "Point", coordinates: [-73, 45] },
            properties: { name: "Montreal" },
          },
        ],
      }),
    );

    expect(await table.getGeoData()).toEqual({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [-73, 45] },
          properties: { name: "Montreal" },
        },
      ],
    });
  } finally {
    await sdb.close();
  }
});
