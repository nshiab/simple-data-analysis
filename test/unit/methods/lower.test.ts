import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should lowercase strings in one column", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadArray([{ firstName: "NAEL", lastName: "SHIAB" }]);

  await table.lower("firstName");

  const data = await table.getData();

  assertEquals(data, [{ firstName: "nael", lastName: "SHIAB" }]);
  await sdb.done();
});

Deno.test("should lowercase strings in two columns", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadArray([{ firstName: "NAEL", lastName: "SHIAB" }]);

  await table.lower(["firstName", "lastName"]);

  const data = await table.getData();

  assertEquals(data, [{ firstName: "nael", lastName: "shiab" }]);
  await sdb.done();
});

Deno.test("should lowercase strings in two columns with column names containing spaces", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadArray([{ "first Name": "NAEL", "last Name": "SHIAB" }]);

  await table.lower(["first Name", "last Name"]);

  const data = await table.getData();

  assertEquals(data, [
    { "first Name": "nael", "last Name": "shiab" },
  ]);
  await sdb.done();
});
