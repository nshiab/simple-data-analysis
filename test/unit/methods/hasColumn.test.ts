import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should return true when the column is in the data", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/data.csv");
  assertEquals(await table.hasColumn("key1"), true);
  await sdb.done();
});

Deno.test("should return false when the column is not in the data", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/data.csv");
  assertEquals(await table.hasColumn("keyX"), false);
  await sdb.done();
});
