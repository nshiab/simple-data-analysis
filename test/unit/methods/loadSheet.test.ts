import { test, expect } from "vite-plus/test";
import { SimpleDB } from "../../../src/index.ts";
import withTestSheet from "../helpers/withTestSheet.ts";

const configured = Boolean(
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY,
);
for (const metadata of [false, true]) {
  test.skipIf(process.env.CI === "true" || !configured)(
    `loadSheet reads isolated data with metadata=${metadata}`,
    async () => {
      await withTestSheet(async (sheetUrl) => {
        const sdb = new SimpleDB();
        const data = [
          { first: "Nael", last: "Shiab" },
          { first: "Andrew", last: "Ryan" },
        ];
        try {
          await sdb
            .newTable("source")
            .loadArray(data)
            .toSheet(sheetUrl, metadata ? { prepend: "Hi!", lastUpdate: "Canada/Eastern" } : {});
          expect(
            await sdb
              .newTable("loaded")
              .loadSheet(sheetUrl, { skip: metadata ? 2 : 0 })
              .getData(),
          ).toEqual(data);
        } finally {
          await sdb.close();
        }
      });
    },
  );
}
