import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should log the extent", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/employees.csv");
  await table.convert({ "Salary": "number" }, { try: true });
  await table.logExtent("Salary");

  // How to test?
  assertEquals(true, true);
  await sdb.done();
});
