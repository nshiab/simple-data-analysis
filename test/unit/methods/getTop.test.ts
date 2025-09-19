import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should return the top 3", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData(["test/data/files/employees.csv"]);
  const data = await table.getTop(3);
  assertEquals(data, [
    {
      Name: "OConnell, Donald",
      "Hire date": "21-JUN-07",
      Job: "Clerk",
      Salary: "2600",
      "Department or unit": "50",
      "End-of_year-BONUS?": "1,94%",
    },
    {
      Name: "OConnell, Donald",
      "Hire date": "21-JUN-07",
      Job: "Clerk",
      Salary: "2600",
      "Department or unit": "50",
      "End-of_year-BONUS?": "1,94%",
    },
    {
      Name: "Grant, Douglas",
      "Hire date": "13-JAN-08",
      Job: "Clerk",
      Salary: "NaN",
      "Department or unit": "50",
      "End-of_year-BONUS?": "23,39%",
    },
  ]);
  await sdb.done();
});

Deno.test("should return the top 3 with a condition", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData(["test/data/files/employees.csv"]);
  const data = await table.getTop(3, {
    conditions: `Job = 'Programmer'`,
  });
  assertEquals(data, [
    {
      Name: "Hunold, Alexander",
      "Hire date": "03-JAN-06",
      Job: "Programmer",
      Salary: "9000",
      "Department or unit": "60",
      "End-of_year-BONUS?": "23,01%",
    },
    {
      Name: "Ernst, Bruce",
      "Hire date": "21-MAY-07",
      Job: "Programmer",
      Salary: "6000",
      "Department or unit": "60",
      "End-of_year-BONUS?": "25,91%",
    },
    {
      Name: "Austin, David",
      "Hire date": "NaN",
      Job: "Programmer",
      Salary: "4800",
      "Department or unit": "null",
      "End-of_year-BONUS?": "6,89%",
    },
  ]);
  await sdb.done();
});
