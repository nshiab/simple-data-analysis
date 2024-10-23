import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should capitalize strings in one column", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadArray([{ firstName: "NAEL", lastName: "SHIAB" }]);

  await table.capitalize("firstName");

  const data = await table.getData();

  assertEquals(data, [{ firstName: "Nael", lastName: "SHIAB" }]);
  await sdb.done();
});

Deno.test("should capitalize strings in two columns", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadArray([{ firstName: "NAEL", lastName: "SHIAB" }]);

  await table.capitalize(["firstName", "lastName"]);

  const data = await table.getData();

  assertEquals(data, [{ firstName: "Nael", lastName: "Shiab" }]);
  await sdb.done();
});

Deno.test("should capitalize strings in two columns with column names containing spaces", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadArray([{ "first Name": "NAEL", "last Name": "SHIAB" }]);

  await table.capitalize(["first Name", "last Name"]);

  const data = await table.getData();

  assertEquals(data, [
    { "first Name": "Nael", "last Name": "Shiab" },
  ]);
  await sdb.done();
});
