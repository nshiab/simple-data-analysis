import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should return a quantile", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/data.json");
  assertEquals(await table.getQuantile("key1", 0.25), 1.75);
  await sdb.done();
});

Deno.test("should return a quantile rounded", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/data.json");
  assertEquals(
    await table.getQuantile("key1", 0.25, {
      decimals: 1,
    }),
    1.8,
  );
  await sdb.done();
});

Deno.test("should return the median with a quantile of 0.5", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/data.json");
  assertEquals(await table.getQuantile("key1", 0.5), 2.5);
  await sdb.done();
});
