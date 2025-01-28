import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should return the sum", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData(["test/data/files/data.json"]);
  assertEquals(await table.getSum("key1"), 10);
  await sdb.done();
});
Deno.test("should return the sum even when there are spaces in the column name", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData(["test/data/files/data.json"]);
  await table.renameColumns({ key1: "key 1" });
  assertEquals(await table.getSum("key 1"), 10);
  await sdb.done();
});
