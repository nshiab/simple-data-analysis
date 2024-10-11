import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

const sdb = new SimpleDB();

Deno.test("should return the unique values of a column", async () => {
  const table = sdb.newTable("data");
  await table.loadData(["test/data/files/dataDuplicates.csv"]);

  const uniques = await table.getUniques("key1");

  assertEquals(uniques, ["1", "3", "8", "brioche"]);
});

await sdb.done();
