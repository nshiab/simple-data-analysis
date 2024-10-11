import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

const sdb = new SimpleDB();

Deno.test("should clean column names", async () => {
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
});

await sdb.done();
