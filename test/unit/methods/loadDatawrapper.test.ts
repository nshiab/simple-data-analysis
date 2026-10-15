import { describe } from "vite-plus/test";
import { test, expect } from "vite-plus/test";

import { SimpleDB } from "../../../src/index.ts";

const apiKey = process.env["DATAWRAPPER_KEY"];
describe.skipIf(process.env.CI === "true" || !(typeof apiKey === "string" && apiKey !== ""))(
  "live integration: typeof apiKey === 'string' && apiKey !== ''",
  () => {
    test("should load data from a Datawrapper chart", async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable();

      // First write known data to the chart.
      table.loadArray([
        { salary: "75000", hireDate: "2022-12-15" },
        { salary: "80000", hireDate: "2023-01-20" },
      ]);
      await table.toDatawrapper("ntURh");

      // Then load it back.
      const table2 = sdb.newTable();
      expect(await table2.loadDatawrapper("ntURh").getData()).toEqual([
        { salary: "75000", hireDate: "2022-12-15" },
        { salary: "80000", hireDate: "2023-01-20" },
      ]);
    });
  },
);
