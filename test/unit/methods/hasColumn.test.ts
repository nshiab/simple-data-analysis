import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should return true when the column is in the data", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/data.csv");
  const boolean = await table.hasColumn("key1");
  assertEquals(boolean, true);
  await sdb.done();
});

Deno.test("should return false when the column is not in the data", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/data.csv");
  const boolean = await table.hasColumn("keyX");
  assertEquals(boolean, false);
  await sdb.done();
});
