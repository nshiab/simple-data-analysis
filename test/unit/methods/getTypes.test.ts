import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should return the types of a table", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData(["test/data/files/data.csv"]);

  const types = await table.getTypes();

  assertEquals(types, { key1: "VARCHAR", key2: "VARCHAR" });
  await sdb.done();
});
