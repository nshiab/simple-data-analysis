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
Deno.test("should return the skew even when there are spaces in the column name", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData(["test/data/files/dataJustNumbers.csv"]);
  await table.renameColumns({ key1: "key 1" });
  assertEquals(await table.getSkew("key 1"), 1.6460497551716866);
  await sdb.done();
});
Deno.test("should return the skew rounded even when there are spaces in the column name", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData(["test/data/files/dataJustNumbers.csv"]);
  await table.renameColumns({ key1: "key 1" });
  assertEquals(
    await table.getSkew("key 1", { decimals: 2 }),
    1.65,
  );
  await sdb.done();
});
