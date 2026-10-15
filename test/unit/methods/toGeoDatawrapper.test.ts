import { describe } from "vite-plus/test";
import { test, expect } from "vite-plus/test";
import assertLiveDatawrapperExport from "../helpers/assertLiveDatawrapperExport.ts";
import { SimpleDB } from "../../../src/index.ts";

const apiKey = process.env["DATAWRAPPER_KEY"];
describe.skipIf(process.env.CI === "true" || !(typeof apiKey === "string" && apiKey !== ""))(
  "live integration: typeof apiKey === 'string' && apiKey !== ''",
  () => {
    test("should write geo data to a Datawrapper map", async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable();
      table.loadGeoData("test/geodata/files/CanadianProvincesAndTerritories.json");
      await table.toGeoDatawrapper("lDO6F");

      // Just making sure it doesn't crash for now.
      expect(true).toEqual(true);
    });

    test("should write geo data to a Datawrapper map with a note", async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable();
      table.loadGeoData("test/geodata/files/CanadianProvincesAndTerritories.json");
      await table.toGeoDatawrapper("lDO6F", {
        note: "Last updated: June 2026",
      });

      // Just making sure it doesn't crash for now.
      expect(true).toEqual(true);
    });

    test("should write geo data to a Datawrapper map and republish", async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable();
      table.loadGeoData("test/geodata/files/CanadianProvincesAndTerritories.json");
      await table.toGeoDatawrapper("lDO6F", { republish: true });

      // Just making sure it doesn't crash for now.
      expect(true).toEqual(true);
    });
  },
);

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
