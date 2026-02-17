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
  Deno.test("should load data from a google sheet", {
    sanitizeResources: false,
  }, async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable();
    const data = [
      { first: "Nael", last: "Shiab" },
      { first: "Andrew", last: "Ryan" },
    ];
    await table.loadArray(data);
    // First, we write some data to the sheet.
    await table.toSheet(
      "https://docs.google.com/spreadsheets/d/1Ar19cP8oGYEzacfrkLWnSH7ZqImILMUrosBwnZ43EQM/edit#gid=0",
    );

    // Then we load it
    await table.loadSheet(
      "https://docs.google.com/spreadsheets/d/1Ar19cP8oGYEzacfrkLWnSH7ZqImILMUrosBwnZ43EQM/edit#gid=0",
    );

    // Just for now.
    assertEquals(
      [
        { first: "Nael", last: "Shiab" },
        { first: "Andrew", last: "Ryan" },
      ],
      await table.getData(),
    );
  });
  Deno.test("should load data from a google sheet and skip rows", {
    sanitizeResources: false,
  }, async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable();
    const data = [
      { first: "Nael", last: "Shiab" },
      { first: "Andrew", last: "Ryan" },
    ];
    await table.loadArray(data);
    // First, we write some data to the sheet.
    await table.toSheet(
      "https://docs.google.com/spreadsheets/d/1Ar19cP8oGYEzacfrkLWnSH7ZqImILMUrosBwnZ43EQM/edit#gid=0",
      {
        prepend: "Hi!",
        lastUpdate: true,
        timeZone: "Canada/Eastern",
      },
    );

    // Then we load it
    await table.loadSheet(
      "https://docs.google.com/spreadsheets/d/1Ar19cP8oGYEzacfrkLWnSH7ZqImILMUrosBwnZ43EQM/edit#gid=0",
      { skip: 2 },
    );

    // Just for now.
    assertEquals(
      [
        { first: "Nael", last: "Shiab" },
        { first: "Andrew", last: "Ryan" },
      ],
      await table.getData(),
    );
  });
} else {
  console.log(
    "No GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY in process.env",
  );
}
