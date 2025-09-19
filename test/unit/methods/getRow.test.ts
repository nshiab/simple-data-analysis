import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should return a specific row", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/employees.csv");
  const data = await table.getRow(`Name === 'Grant, Douglas'`);

  assertEquals(data, {
    Name: "Grant, Douglas",
    "Hire date": "13-JAN-08",
    Job: "Clerk",
    Salary: "NaN",
    "Department or unit": "50",
    "End-of_year-BONUS?": "23,39%",
  });
  await sdb.done();
});
