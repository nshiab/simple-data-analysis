import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should add the cumulative sum in a new column", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadArray([
    { key1: 1 },
    { key1: 2 },
    { key1: 3 },
  ]);
  await table.accumulate("key1", "cumulative");
  const data = await table.getData();
  assertEquals(data, [
    { key1: 1, cumulative: 1 },
    { key1: 2, cumulative: 3 },
    { key1: 3, cumulative: 6 },
  ]);
  await sdb.done();
});
Deno.test("should add the cumulative sum in a new column without reordering the rows", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadArray([
    { key1: 3 },
    { key1: 1 },
    { key1: 2 },
  ]);
  await table.accumulate("key1", "cumulative");
  const data = await table.getData();
  assertEquals(data, [
    { key1: 3, cumulative: 3 },
    { key1: 1, cumulative: 4 },
    { key1: 2, cumulative: 6 },
  ]);
  await sdb.done();
});
Deno.test("should add the cumulative sum in a new column with categories", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadArray([
    { key1: 6, key2: "b" },
    { key1: 1, key2: "a" },
    { key1: 4, key2: "b" },
    { key1: 2, key2: "a" },
    { key1: 3, key2: "a" },
    { key1: 5, key2: "b" },
  ]);
  await table.accumulate("key1", "cumulative", { categories: "key2" });
  const data = await table.getData();
  assertEquals(data, [
    { key1: 6, key2: "b", cumulative: 6 },
    { key1: 1, key2: "a", cumulative: 1 },
    { key1: 4, key2: "b", cumulative: 10 },
    { key1: 2, key2: "a", cumulative: 3 },
    { key1: 3, key2: "a", cumulative: 6 },
    { key1: 5, key2: "b", cumulative: 15 },
  ]);
  await sdb.done();
});
Deno.test("should add the cumulative sum in a new column with multiple categories", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadArray([
    { key1: 6, key2: "b", key3: "c" },
    { key1: 1, key2: "a", key3: "c" },
    { key1: 4, key2: "b", key3: "c" },
    { key1: 2, key2: "a", key3: "d" },
    { key1: 3, key2: "a", key3: "c" },
    { key1: 5, key2: "b", key3: "d" },
  ]);
  await table.accumulate("key1", "cumulative", {
    categories: ["key2", "key3"],
  });
  const data = await table.getData();
  assertEquals(data, [
    { key1: 6, key2: "b", key3: "c", cumulative: 6 },
    { key1: 1, key2: "a", key3: "c", cumulative: 1 },
    { key1: 4, key2: "b", key3: "c", cumulative: 10 },
    { key1: 2, key2: "a", key3: "d", cumulative: 2 },
    { key1: 3, key2: "a", key3: "c", cumulative: 4 },
    { key1: 5, key2: "b", key3: "d", cumulative: 5 },
  ]);
  await sdb.done();
});
