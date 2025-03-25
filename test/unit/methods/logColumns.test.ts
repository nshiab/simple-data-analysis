import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should log columns", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/employees.csv");
  await table.logColumns();

  // How to test?
  assertEquals(true, true);
  await sdb.done();
});
Deno.test("should log columns with types", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/employees.csv");
  await table.logColumns({ logTypes: true });

  // How to test?
  assertEquals(true, true);
  await sdb.done();
});
