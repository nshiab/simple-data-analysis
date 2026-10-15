import { describe } from "vite-plus/test";
import { test, expect } from "vite-plus/test";
import assertLiveDatawrapperExport from "../helpers/assertLiveDatawrapperExport.ts";
import { SimpleDB } from "../../../src/index.ts";

const apiKey = process.env["DATAWRAPPER_KEY"];
describe.skipIf(process.env.CI === "true" || !(typeof apiKey === "string" && apiKey !== ""))(
  "live integration: typeof apiKey === 'string' && apiKey !== ''",
  () => {
    test("should write the data to a Datawrapper chart", async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable();
      table.loadArray([
        { salary: 75000, hireDate: "2022-12-15" },
        { salary: 80000, hireDate: "2023-01-20" },
      ]);
      await table.toDatawrapper("ntURh");

      // Just making sure it doesn't crash for now.
      expect(true).toEqual(true);
    });

    test("should write the data to a Datawrapper chart with a note", async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable();
      table.loadArray([{ salary: 75000, hireDate: "2022-12-15" }]);
      await table.toDatawrapper("ntURh", { note: "Last updated: June 2026" });

      // Just making sure it doesn't crash for now.
      expect(true).toEqual(true);
    });

    test("should write the data to a Datawrapper chart and republish", async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable();
      table.loadArray([{ salary: 75000, hireDate: "2022-12-15" }]);
      await table.toDatawrapper("ntURh", { republish: true });

      // Just making sure it doesn't crash for now.
      expect(true).toEqual(true);
    });
  },
);

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
