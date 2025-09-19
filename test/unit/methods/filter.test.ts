import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should filter the rows based on one condition", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData(["test/data/files/employees.csv"]);

  await table.filter(`"Job" = 'Clerk'`);
  const data = await table.getData();

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
    {
      Name: "Khoo, Alexander",
      "Hire date": "18-MAY-03",
      Job: "Clerk",
      Salary: "3100",
      "Department or unit": "30",
      "End-of_year-BONUS?": "19,81%",
    },
    {
      Name: "Baida, Shelli",
      "Hire date": "24-DEC-05",
      Job: "Clerk",
      Salary: "2900",
      "Department or unit": "30",
      "End-of_year-BONUS?": "11,06%",
    },
    {
      Name: "Himuro, Guy",
      "Hire date": "15-NOV-05",
      Job: "Clerk",
      Salary: "2600",
      "Department or unit": "30",
      "End-of_year-BONUS?": "25,98%",
    },
    {
      Name: "Colmenares, Karen",
      "Hire date": "10-AUG-07",
      Job: "Clerk",
      Salary: "2500",
      "Department or unit": "30",
      "End-of_year-BONUS?": "15,8%",
    },
    {
      Name: "Nayer, Julia",
      "Hire date": "16-JUL-05",
      Job: "Clerk",
      Salary: "3200",
      "Department or unit": "50",
      "End-of_year-BONUS?": "18,7%",
    },
    {
      Name: "Mikkilineni, Irene",
      "Hire date": "28-SEP-06",
      Job: "Clerk",
      Salary: "2700",
      "Department or unit": "50",
      "End-of_year-BONUS?": "11,82%",
    },
    {
      Name: "Landry, James",
      "Hire date": "14-JAN-07",
      Job: "Clerk",
      Salary: "2400",
      "Department or unit": "50",
      "End-of_year-BONUS?": "NaN",
    },
    {
      Name: "Markle, Steven",
      "Hire date": "NaN",
      Job: "Clerk",
      Salary: "2200",
      "Department or unit": "50",
      "End-of_year-BONUS?": "11,26%",
    },
    {
      Name: "Atkinson, Mozhe",
      "Hire date": "30-OCT-05",
      Job: "Clerk",
      Salary: "undefined",
      "Department or unit": "50",
      "End-of_year-BONUS?": "9,61%",
    },
    {
      Name: "Marlow, James",
      "Hire date": "16-FEB-05",
      Job: "Clerk",
      Salary: "2500",
      "Department or unit": "50",
      "End-of_year-BONUS?": "15,74%",
    },
    {
      Name: "Olson, TJ",
      "Hire date": "10-APR-07",
      Job: "Clerk",
      Salary: "2100",
      "Department or unit": "null",
      "End-of_year-BONUS?": "22,3%",
    },
    {
      Name: "undefined",
      "Hire date": "14-JUN-04",
      Job: "Clerk",
      Salary: "3300",
      "Department or unit": "50",
      "End-of_year-BONUS?": "18,54%",
    },
    {
      Name: "Rogers, Michael",
      "Hire date": "26-AUG-06",
      Job: "Clerk",
      Salary: "2900",
      "Department or unit": "50",
      "End-of_year-BONUS?": "null",
    },
    {
      Name: "Philtanker, Hazel",
      "Hire date": "06-FEB-08",
      Job: "Clerk",
      Salary: "2200",
      "Department or unit": "NaN",
      "End-of_year-BONUS?": "24,17%",
    },
    {
      Name: "Stiles, Stephen",
      "Hire date": "26-OCT-05",
      Job: "Clerk",
      Salary: "3200",
      "Department or unit": "50",
      "End-of_year-BONUS?": null,
    },
    {
      Name: "Seo, John",
      "Hire date": "12-FEB-06",
      Job: "Clerk",
      Salary: "2700",
      "Department or unit": "50",
      "End-of_year-BONUS?": "0,16%",
    },
    {
      Name: "Patel, Joshua",
      "Hire date": "06-APR-06",
      Job: "Clerk",
      Salary: "2500",
      "Department or unit": "50",
      "End-of_year-BONUS?": "16,19%",
    },
  ]);
  await sdb.done();
});
Deno.test("should filter the rows based on multiple conditions", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData(["test/data/files/employees.csv"]);
  await table.filter(`"Job" = 'Clerk' AND "Department or unit" != '50'`);
  const data = await table.getData();

  assertEquals(data, [
    {
      Name: "Khoo, Alexander",
      "Hire date": "18-MAY-03",
      Job: "Clerk",
      Salary: "3100",
      "Department or unit": "30",
      "End-of_year-BONUS?": "19,81%",
    },
    {
      Name: "Baida, Shelli",
      "Hire date": "24-DEC-05",
      Job: "Clerk",
      Salary: "2900",
      "Department or unit": "30",
      "End-of_year-BONUS?": "11,06%",
    },
    {
      Name: "Himuro, Guy",
      "Hire date": "15-NOV-05",
      Job: "Clerk",
      Salary: "2600",
      "Department or unit": "30",
      "End-of_year-BONUS?": "25,98%",
    },
    {
      Name: "Colmenares, Karen",
      "Hire date": "10-AUG-07",
      Job: "Clerk",
      Salary: "2500",
      "Department or unit": "30",
      "End-of_year-BONUS?": "15,8%",
    },
    {
      Name: "Olson, TJ",
      "Hire date": "10-APR-07",
      Job: "Clerk",
      Salary: "2100",
      "Department or unit": "null",
      "End-of_year-BONUS?": "22,3%",
    },
    {
      Name: "Philtanker, Hazel",
      "Hire date": "06-FEB-08",
      Job: "Clerk",
      Salary: "2200",
      "Department or unit": "NaN",
      "End-of_year-BONUS?": "24,17%",
    },
  ]);
  await sdb.done();
});
Deno.test("should filter the rows based on booleans", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadArray([
    { name: "Nael", value: true },
    { name: "Graeme", value: false },
  ]);
  await table.filter(`value = TRUE`);
  const data = await table.getData();

  assertEquals(data, [{ name: "Nael", value: true }]);
  await sdb.done();
});

Deno.test("should not throw an error when all data has been filtered out", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData(["test/data/files/employees.csv"]);
  await table.filter(`Name = 'Nael'`);
  const data = await table.getData();

  assertEquals(data, []);
  await sdb.done();
});
