import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

const sdb = new SimpleDB();

Deno.test("should return the first row", async () => {
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/data.json");
  const data = await table.getFirstRow();
  assertEquals(data, { key1: 1, key2: "un" });
});

Deno.test("should return the first row found based on a condition", async () => {
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/data.json");
  const data = await table.getFirstRow({
    condition: `key2 = 'trois'`,
  });
  assertEquals(data, {
    key1: 3,
    key2: "trois",
  });
});

await sdb.done();
