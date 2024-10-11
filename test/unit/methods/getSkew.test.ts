import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

const sdb = new SimpleDB();

Deno.test("should return the skew", async () => {
  const table = sdb.newTable("data");
  await table.loadData(["test/data/files/dataJustNumbers.csv"]);
  assertEquals(await table.getSkew("key1"), 1.6460497551716866);
});
Deno.test("should return the skew rounded", async () => {
  const table = sdb.newTable("data");
  await table.loadData(["test/data/files/dataJustNumbers.csv"]);
  assertEquals(
    await table.getSkew("key1", { decimals: 2 }),
    1.65,
  );
});

await sdb.done();
