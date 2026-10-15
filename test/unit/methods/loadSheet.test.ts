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
    test("should load data from a google sheet", async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable();
      const data = [
        { first: "Nael", last: "Shiab" },
        { first: "Andrew", last: "Ryan" },
      ];
      table.loadArray(data);
      // First, we write some data to the sheet.
      await table.toSheet(
        "https://docs.google.com/spreadsheets/d/1Ar19cP8oGYEzacfrkLWnSH7ZqImILMUrosBwnZ43EQM/edit#gid=0",
      );

      expect([
        { first: "Nael", last: "Shiab" },
        { first: "Andrew", last: "Ryan" },
      ]).toEqual(
        await table
          .loadSheet(
            "https://docs.google.com/spreadsheets/d/1Ar19cP8oGYEzacfrkLWnSH7ZqImILMUrosBwnZ43EQM/edit#gid=0",
          )
          .getData(),
      );
    });
    test("should load data from a google sheet and skip rows", async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable();
      const data = [
        { first: "Nael", last: "Shiab" },
        { first: "Andrew", last: "Ryan" },
      ];
      table.loadArray(data);
      // First, we write some data to the sheet.
      await table.toSheet(
        "https://docs.google.com/spreadsheets/d/1Ar19cP8oGYEzacfrkLWnSH7ZqImILMUrosBwnZ43EQM/edit#gid=0",
        {
          prepend: "Hi!",
          lastUpdate: "Canada/Eastern",
        },
      );

      expect([
        { first: "Nael", last: "Shiab" },
        { first: "Andrew", last: "Ryan" },
      ]).toEqual(
        await table
          .loadSheet(
            "https://docs.google.com/spreadsheets/d/1Ar19cP8oGYEzacfrkLWnSH7ZqImILMUrosBwnZ43EQM/edit#gid=0",
            { skip: 2 },
          )
          .getData(),
      );
    });
  },
);
