import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should return the skew", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData(["test/data/files/dataJustNumbers.csv"]);
  assertEquals(await table.getSkew("key1"), 1.6460497551716866);
  await sdb.done();
});

Deno.test("should return the skew rounded", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData(["test/data/files/dataJustNumbers.csv"]);
  assertEquals(
    await table.getSkew("key1", { decimals: 2 }),
    1.65,
  );
  await sdb.done();
});
