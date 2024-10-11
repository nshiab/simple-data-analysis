import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

const sdb = new SimpleDB();

Deno.test("should lowercase strings in one column", async () => {
  const table = sdb.newTable();
  await table.loadArray([{ firstName: "NAEL", lastName: "SHIAB" }]);

  await table.lower("firstName");

  const data = await table.getData();

  assertEquals(data, [{ firstName: "nael", lastName: "SHIAB" }]);
});
Deno.test("should lowercase strings in two columns", async () => {
  const table = sdb.newTable();
  await table.loadArray([{ firstName: "NAEL", lastName: "SHIAB" }]);

  await table.lower(["firstName", "lastName"]);

  const data = await table.getData();

  assertEquals(data, [{ firstName: "nael", lastName: "shiab" }]);
});
Deno.test("should lowercase strings in two columns with column names containing spaces", async () => {
  const table = sdb.newTable();
  await table.loadArray([{ "first Name": "NAEL", "last Name": "SHIAB" }]);

  await table.lower(["first Name", "last Name"]);

  const data = await table.getData();

  assertEquals(data, [
    { "first Name": "nael", "last Name": "shiab" },
  ]);
});

await sdb.done();
