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
