import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

const sdb = new SimpleDB();

Deno.test("should update a column", async () => {
  const table = sdb.newTable();
  await table.loadData(["test/data/files/cities.csv"]);
  await table.updateColumn("city", `left("city", 3)`);

  const data = await table.getData();

  assertEquals(data, [
    { id: 1108380, city: "VAN" },
    { id: 6158355, city: "TOR" },
    { id: 7024745, city: "MON" },
  ]);
});
Deno.test("should update a column with a space in its name", async () => {
  const table = sdb.newTable();
  await table.loadData("test/data/files/employees.csv");
  await table.updateColumn(
    "Department or unit",
    `left("Department or unit", 1)`,
  );
  await table.selectRows(3);

  const data = await table.getData();

  assertEquals(data, [
    {
      Name: "OConnell, Donald",
      "Hire date": "21-JUN-07",
      Job: "Clerk",
      Salary: "2600",
      "Department or unit": "5",
      "End-of_year-BONUS?": "1,94%",
    },
    {
      Name: "OConnell, Donald",
      "Hire date": "21-JUN-07",
      Job: "Clerk",
      Salary: "2600",
      "Department or unit": "5",
      "End-of_year-BONUS?": "1,94%",
    },
    {
      Name: "Grant, Douglas",
      "Hire date": "13-JAN-08",
      Job: "Clerk",
      Salary: "NaN",
      "Department or unit": "5",
      "End-of_year-BONUS?": "23,39%",
    },
  ]);
});

await sdb.done();
