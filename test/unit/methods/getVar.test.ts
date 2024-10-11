import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

const sdb = new SimpleDB();

Deno.test("should return the variance", async () => {
  const table = sdb.newTable("data");
  await table.loadData(["test/data/files/data.json"]);
  assertEquals(await table.getVar("key1"), 1.6666666666666667);
});
Deno.test("should return the variance rounded", async () => {
  const table = sdb.newTable("data");
  await table.loadData(["test/data/files/data.json"]);
  assertEquals(
    await table.getVar("key1", { decimals: 6 }),
    1.666667,
  );
});

await sdb.done();
