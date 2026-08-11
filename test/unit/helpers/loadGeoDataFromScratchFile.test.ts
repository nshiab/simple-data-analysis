import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import loadGeoDataFromScratchFile from "../../../src/helpers/loadGeoDataFromScratchFile.ts";

Deno.test("loads a GeoJSON string through a scratch file", async () => {
  const sdb = new SimpleDB({ dataTransport: "file" });
  try {
    const table = sdb.newTable();
    await loadGeoDataFromScratchFile(
      table,
      JSON.stringify({
        type: "FeatureCollection",
        features: [{
          type: "Feature",
          geometry: { type: "Point", coordinates: [-73, 45] },
          properties: { name: "Montreal" },
        }],
      }),
    );

    assertEquals(await table.getGeoData(), {
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        geometry: { type: "Point", coordinates: [-73, 45] },
        properties: { name: "Montreal" },
      }],
    });
  } finally {
    await sdb.done();
  }
});
