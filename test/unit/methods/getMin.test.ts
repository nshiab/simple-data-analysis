import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should return the min value", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/data.json");
  assertEquals(await table.getMin("key1"), 1);
  await sdb.done();
});
Deno.test("should return the min value even when there are spaces in the column name", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/data.json");
  await table.renameColumns({ key1: "key 1" });
  assertEquals(await table.getMin("key 1"), 1);
  await sdb.done();
});
Deno.test("should return the min value with Dates", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadArray([
    { key1: new Date("2020-01-01") },
    { key1: new Date("2021-01-01") },
    { key1: new Date("2022-01-01") },
    { key1: new Date("2023-01-01") },
  ]);
  assertEquals(await table.getMin("key1"), new Date("2020-01-01"));
  await sdb.done();
});
