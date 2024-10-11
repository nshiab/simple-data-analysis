import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

const sdb = new SimpleDB();

Deno.test("should return the last row", async () => {
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/data.json");
  const data = await table.getLastRow();
  assertEquals(data, { key1: 4, key2: "quatre" });
});

Deno.test("should return the last row found based on a condition", async () => {
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/data.json");
  const data = await table.getLastRow({
    condition: `key2 = 'trois'`,
  });
  assertEquals(data, { key1: 3, key2: "trois" });
});

await sdb.done();
