import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

const sdb = new SimpleDB();

Deno.test("should log a description of the table", async () => {
  const table = sdb.newTable();
  await table.loadData("test/data/files/employees.csv");

  await table.logDescription();

  // How to test?
  assertEquals(true, true);
});
Deno.test("should not throw an error when there is no table", async () => {
  const table = sdb.newTable();
  await table.logDescription();

  // How to test?
  assertEquals(true, true);
});

await sdb.done();
