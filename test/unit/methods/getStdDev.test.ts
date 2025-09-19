import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should return the standard deviation", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData(["test/data/files/data.json"]);
  assertEquals(
    await table.getStdDev("key1"),
    1.2909944487358056,
  );
  await sdb.done();
});
Deno.test("should return the standard deviation rounded", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData(["test/data/files/data.json"]);
  assertEquals(
    await table.getStdDev("key1", { decimals: 3 }),
    1.291,
  );
  await sdb.done();
});
Deno.test("should return the standard deviation even when there are spaces in the column name", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData(["test/data/files/data.json"]);
  await table.renameColumns({ key1: "key 1" });
  assertEquals(
    await table.getStdDev("key 1"),
    1.2909944487358056,
  );
  await sdb.done();
});
Deno.test("should return the standard deviation rounded even when there are spaces in the column name", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData(["test/data/files/data.json"]);
  await table.renameColumns({ key1: "key 1" });
  assertEquals(
    await table.getStdDev("key 1", { decimals: 3 }),
    1.291,
  );
  await sdb.done();
});
