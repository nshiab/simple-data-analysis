import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

const sdb = new SimpleDB();

Deno.test("should return a quantile", async () => {
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/data.json");
  assertEquals(await table.getQuantile("key1", 0.25), 1.75);
});
Deno.test("should return a quantile rounded", async () => {
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/data.json");
  assertEquals(
    await table.getQuantile("key1", 0.25, {
      decimals: 1,
    }),
    1.8,
  );
});
Deno.test("should return the median with a quantile of 0.5", async () => {
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/data.json");
  assertEquals(await table.getQuantile("key1", 0.5), 2.5);
});

await sdb.done();
