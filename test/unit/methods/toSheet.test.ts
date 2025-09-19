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
  Deno.test("should write the data to a google sheet", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable();
    await table.loadArray([
      { first: "Nael", last: "Shiab" },
      { first: "Andrew", last: "Ryan" },
    ]);
    await table.toSheet(
      "https://docs.google.com/spreadsheets/d/1Ar19cP8oGYEzacfrkLWnSH7ZqImILMUrosBwnZ43EQM/edit#gid=0",
      {
        prepend: "Hi!",
        lastUpdate: true,
        timeZone: "Canada/Eastern",
      },
    );

    // Just for now.
    assertEquals(
      true,
      true,
    );
  });
} else {
  console.log(
    "No GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY in process.env",
  );
}
