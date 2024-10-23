import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should return a column with the row number", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadArray([
    { first: "Nael", last: "Shiab" },
    { first: "Graeme", last: "Bruce" },
  ]);
  await table.addRowNumber("rowNumber");

  const data = await table.getData();

  assertEquals(data, [
    { first: "Nael", last: "Shiab", rowNumber: 1 },
    { first: "Graeme", last: "Bruce", rowNumber: 2 },
  ]);
  await sdb.done();
});
