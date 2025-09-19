import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should clean column names", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/employees.csv");
  await table.cleanColumnNames();
  const columns = await table.getColumns();
  assertEquals(columns, [
    "name",
    "hireDate",
    "job",
    "salary",
    "departmentOrUnit",
    "endOfYearBonus",
  ]);
  await sdb.done();
});
