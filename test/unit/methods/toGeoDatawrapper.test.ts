import { test, expect } from "vite-plus/test";
import assertLiveDatawrapperExport from "../helpers/assertLiveDatawrapperExport.ts";
import { SimpleDB } from "../../../src/index.ts";

const apiKey = process.env["DATAWRAPPER_KEY"];

test(
  "toGeoDatawrapper live round-trip restores data and information",
  { skip: process.env.CI === "true" || !apiKey },
  async () => {
    const sdb = new SimpleDB();
    try {
      const table = sdb.newTable();
      table.loadGeoData("test/geodata/files/CanadianProvincesAndTerritories.json");
      await assertLiveDatawrapperExport(
        "lDO6F",
        JSON.stringify(await table.getGeoData()),
        async (options) => {
          expect(await table.toGeoDatawrapper("lDO6F", options)).toEqual(table);
        },
      );
    } finally {
      await sdb.close();
    }
  },
);
