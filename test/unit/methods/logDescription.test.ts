import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should log a description of the table", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/employees.csv");

  await table.logDescription();

  // How to test?
  assertEquals(true, true);
  await sdb.done();
});

Deno.test("should not throw an error when there is no table", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.logDescription();

  // How to test?
  assertEquals(true, true);
  await sdb.done();
});

Deno.test("should log a description of the table containing dates", async () => {
  const sdb = new SimpleDB();
  const temperatures = sdb.newTable("temperatures");
  await temperatures.loadData(
    "test/data/files/dailyTemperatures.csv",
  );
  await temperatures.logDescription();

  // How to test?
  assertEquals(true, true);
  await sdb.done();
});
