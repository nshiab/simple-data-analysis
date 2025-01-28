import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should return the mean value", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/data.json");
  assertEquals(await table.getMean("key1"), 2.5);
  await sdb.done();
});

Deno.test("should return the mean value rounded", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/data.json");
  assertEquals(await table.getMean("key1", { decimals: 0 }), 3);
  await sdb.done();
});
Deno.test("should return the mean value even when there are spaces in the column name", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/data.json");
  await table.renameColumns({ key1: "key 1" });
  assertEquals(await table.getMean("key 1"), 2.5);
  await sdb.done();
});

Deno.test("should return the mean value rounded even when there are spaces in the column name", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/data.json");
  await table.renameColumns({ key1: "key 1" });
  assertEquals(await table.getMean("key 1", { decimals: 0 }), 3);
  await sdb.done();
});
