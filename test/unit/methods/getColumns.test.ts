import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should return the columns of a table", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/data.csv");

  const columns = await table.getColumns();

  assertEquals(columns, ["key1", "key2"]);
  await sdb.done();
});
