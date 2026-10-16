import { describe } from "vite-plus/test";
import { test, expect } from "vite-plus/test";

import { SimpleDB } from "../../../src/index.ts";

const apiKey = process.env["DATAWRAPPER_KEY"];
describe.skipIf(process.env.CI === "true" || !(typeof apiKey === "string" && apiKey !== ""))(
  "live integration: typeof apiKey === 'string' && apiKey !== ''",
  () => {
    test("should load geo data from a Datawrapper map", async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable();

      // First write known geo data to the map.
      table.loadGeoData("test/geodata/files/CanadianProvincesAndTerritories.json");
      await table.toGeoDatawrapper("lDO6F");

      // Then load it back.
      const table2 = sdb.newTable();
      const geoData = await table2.loadGeoDatawrapper("lDO6F").getGeoData();
      expect(geoData.type).toEqual("FeatureCollection");
      expect(Array.isArray(geoData.features)).toEqual(true);
    });
  },
);
