import { assertEquals } from "@std/assert";
import { SimpleDB } from "../../../src/index.ts";

const apiKey = Deno.env.get("DATAWRAPPER_KEY");
if (typeof apiKey === "string" && apiKey !== "") {
  Deno.test("should load geo data from a Datawrapper map", {
    sanitizeResources: false,
  }, async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable();

    // First write known geo data to the map.
    await table.loadGeoData(
      "test/geodata/files/CanadianProvincesAndTerritories.json",
    );
    await table.toGeoDW("lDO6F");

    // Then load it back.
    const table2 = sdb.newTable();
    await table2.loadGeoDW("lDO6F");

    const geoData = await table2.getGeoData();
    assertEquals(geoData.type, "FeatureCollection");
    assertEquals(Array.isArray(geoData.features), true);
  });
} else {
  console.log("No DATAWRAPPER_KEY in process.env");
}
