import { test, expect } from "vite-plus/test";
import { SimpleDB } from "../../../src/index.ts";
import withTestSheet from "../helpers/withTestSheet.ts";

const configured = Boolean(
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY,
);
test.skipIf(process.env.CI === "true" || !configured)(
  "toSheet overwrites and appends in an isolated tab",
  async () => {
    await withTestSheet(async (sheetUrl) => {
      const sdb = new SimpleDB();
      try {
        await sdb
          .newTable("old")
          .loadArray([{ first: "Old", last: "Row" }])
          .toSheet(sheetUrl);
        const data = [
          { first: "Nael", last: "Shiab" },
          { first: "Andrew", last: "Ryan" },
        ];
        await sdb
          .newTable("source")
          .loadArray(data)
          .toSheet(sheetUrl, { prepend: "Hi!", lastUpdate: "Canada/Eastern" });
        const appended = { first: "Ada", last: "Lovelace" };
        await sdb.newTable("append").loadArray([appended]).toSheet(sheetUrl, { mode: "append" });
        expect(await sdb.newTable("loaded").loadSheet(sheetUrl, { skip: 2 }).getData()).toEqual([
          ...data,
          appended,
        ]);
      } finally {
        await sdb.close();
      }
    });
  },
);
