import { assertEquals } from "@std/assert";
import { SimpleDB } from "../../../src/index.ts";

const email = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_EMAIL");
const key = Deno.env.get("GOOGLE_PRIVATE_KEY");

if (
  typeof email === "string" &&
  email !== "" &&
  typeof key === "string" &&
  key !== ""
) {
  Deno.test("should write the data to a google sheet", {
    sanitizeResources: false,
  }, async () => {
    const sdb = new SimpleDB({ dataTransport: "file" });
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
    await writtenData.loadSheet(sheetUrl, { skip: 2 });
    assertEquals(
      await writtenData.getData(),
      [
        { first: "Nael", last: "Shiab" },
        { first: "Andrew", last: "Ryan" },
        { first: "Ada", last: "Lovelace" },
      ],
    );

    await sdb.close();
  });
} else {
  console.log(
    "No GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY in process.env",
  );
}
