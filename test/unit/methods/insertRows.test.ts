import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("add rows in a table", async () => {
  const sdb = new SimpleDB();

  const table = sdb.newTable("data");
  await table.loadData("test/data/files/data.json");

  await table.insertRows([
    { key1: 5, key2: "cinq" },
    { key1: 6, key2: "six" },
  ]);

  const data = await table.getData();

  assertEquals(data, [
    { key1: 1, key2: "un" },
    { key1: 2, key2: "deux" },
    { key1: 3, key2: "trois" },
    { key1: 4, key2: "quatre" },
    { key1: 5, key2: "cinq" },
    { key1: 6, key2: "six" },
  ]);

  await sdb.done();
});
