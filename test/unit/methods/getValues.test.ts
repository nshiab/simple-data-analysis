import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should return the values of a column", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData(["test/data/files/data.csv"]);

  const values = await table.getValues("key1");

  assertEquals(values, ["1", "3", "8", "brioche"]);
  await sdb.done();
});
Deno.test("should return the values of a column even the name has a space in it", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadArray([
    { "key 1": "1", "key2": "2" },
    { "key 1": "3", "key2": "4" },
  ]);

  const values = await table.getValues("key 1");

  assertEquals(values, ["1", "3"]);
  await sdb.done();
});
