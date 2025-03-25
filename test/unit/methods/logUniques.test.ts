import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should log unique values in a column", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/employees.csv");
  await table.logUniques("Name");

  // How to test?
  assertEquals(true, true);
  await sdb.done();
});

Deno.test("should log stringified unique values in a column", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/employees.csv");
  await table.logUniques("Name", { stringify: true });

  // How to test?
  assertEquals(true, true);
  await sdb.done();
});
