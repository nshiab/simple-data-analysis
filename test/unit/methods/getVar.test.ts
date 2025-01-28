import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should return the variance", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData(["test/data/files/data.json"]);
  assertEquals(await table.getVar("key1"), 1.6666666666666667);
  await sdb.done();
});
Deno.test("should return the variance rounded", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData(["test/data/files/data.json"]);
  assertEquals(
    await table.getVar("key1", { decimals: 6 }),
    1.666667,
  );
  await sdb.done();
});
Deno.test("should return the variance even when there are spaces in the column name", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData(["test/data/files/data.json"]);
  await table.renameColumns({ key1: "key 1" });
  assertEquals(await table.getVar("key 1"), 1.6666666666666667);
  await sdb.done();
});
Deno.test("should return the variance rounded even when there are spaces in the column name", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData(["test/data/files/data.json"]);
  await table.renameColumns({ key1: "key 1" });
  assertEquals(
    await table.getVar("key 1", { decimals: 6 }),
    1.666667,
  );
  await sdb.done();
});
