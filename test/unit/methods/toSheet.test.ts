import { describe } from "vite-plus/test";
import { test, expect } from "vite-plus/test";

import { SimpleDB } from "../../../src/index.ts";

const email = process.env["GOOGLE_SERVICE_ACCOUNT_EMAIL"];
const key = process.env["GOOGLE_PRIVATE_KEY"];

describe.skipIf(
  process.env.CI === "true" ||
    !(typeof email === "string" && email !== "" && typeof key === "string" && key !== ""),
)(
  "live integration: typeof email === 'string' &&\n  email !== '' &&\n  typeof key === 'string' &&\n  key !== ''",
  () => {
    test("should write the data to a google sheet", async () => {
      const sdb = new SimpleDB();
      const sheetUrl =
        "https://docs.google.com/spreadsheets/d/1Ar19cP8oGYEzacfrkLWnSH7ZqImILMUrosBwnZ43EQM/edit#gid=0";
      const table = sdb.newTable();
      table.loadArray([
        { first: "Nael", last: "Shiab" },
        { first: "Andrew", last: "Ryan" },
      ]);
      await table.toSheet(sheetUrl, {
        prepend: "Hi!",
        lastUpdate: "Canada/Eastern",
      });

      const additionalRows = sdb.newTable();
      additionalRows.loadArray([{ first: "Ada", last: "Lovelace" }]);
      await additionalRows.toSheet(sheetUrl, { mode: "append" });

      const writtenData = sdb.newTable();
      expect(await writtenData.loadSheet(sheetUrl, { skip: 2 }).getData()).toEqual([
        { first: "Nael", last: "Shiab" },
        { first: "Andrew", last: "Ryan" },
        { first: "Ada", last: "Lovelace" },
      ]);

      await sdb.close();
    });
  },
);
