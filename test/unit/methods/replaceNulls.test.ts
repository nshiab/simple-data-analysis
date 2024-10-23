import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should replace null values in one column", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadArray([
    { keyA: 1 },
    { keyA: null },
    { keyA: 3 },
    { keyA: null },
  ]);
  await table.replaceNulls("keyA", 0);

  const data = await table.getData();

  assertEquals(data, [
    { keyA: 1 },
    { keyA: 0 },
    { keyA: 3 },
    { keyA: 0 },
  ]);

  await sdb.done();
});

Deno.test("should replace null values in multiple columns", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadArray([
    { keyA: 1, keyB: 1 },
    { keyA: null, keyB: 2 },
    { keyA: 3, keyB: null },
    { keyA: null, keyB: 4 },
  ]);
  await table.replaceNulls(["keyA", "keyB"], 0);

  const data = await table.getData();

  assertEquals(data, [
    { keyA: 1, keyB: 1 },
    { keyA: 0, keyB: 2 },
    { keyA: 3, keyB: 0 },
    { keyA: 0, keyB: 4 },
  ]);

  await sdb.done();
});
