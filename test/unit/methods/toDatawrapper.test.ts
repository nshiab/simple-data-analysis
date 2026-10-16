import { test, expect } from "vite-plus/test";
import assertLiveDatawrapperExport from "../helpers/assertLiveDatawrapperExport.ts";
import { SimpleDB } from "../../../src/index.ts";

const apiKey = process.env["DATAWRAPPER_KEY"];

test(
  "toDatawrapper live round-trip restores data and information",
  { skip: process.env.CI === "true" || !apiKey },
  async () => {
    const sdb = new SimpleDB();
    try {
      const table = sdb.newTable();
      table.loadArray([{ salary: 75000, hireDate: "2022-12-15" }]);
      await assertLiveDatawrapperExport("ntURh", await table.getDataAsCSV(), async (options) => {
        expect(await table.toDatawrapper("ntURh", options)).toEqual(table);
      });
    } finally {
      await sdb.close();
    }
  },
);
