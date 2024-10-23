import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should keep only specific rows", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/employees.csv"]);
  await table.cleanColumnNames();

  await table.keep({
    job: ["Clerk"],
    departmentOrUnit: ["50", "30"],
  });
  const data = await table.getData();

  assertEquals(data, [
    {
      name: "OConnell, Donald",
      hireDate: "21-JUN-07",
      job: "Clerk",
      salary: "2600",
      departmentOrUnit: "50",
      endOfYearBonus: "1,94%",
    },
    {
      name: "OConnell, Donald",
      hireDate: "21-JUN-07",
      job: "Clerk",
      salary: "2600",
      departmentOrUnit: "50",
      endOfYearBonus: "1,94%",
    },
    {
      name: "Grant, Douglas",
      hireDate: "13-JAN-08",
      job: "Clerk",
      salary: "NaN",
      departmentOrUnit: "50",
      endOfYearBonus: "23,39%",
    },
    {
      name: "Nayer, Julia",
      hireDate: "16-JUL-05",
      job: "Clerk",
      salary: "3200",
      departmentOrUnit: "50",
      endOfYearBonus: "18,7%",
    },
    {
      name: "Mikkilineni, Irene",
      hireDate: "28-SEP-06",
      job: "Clerk",
      salary: "2700",
      departmentOrUnit: "50",
      endOfYearBonus: "11,82%",
    },
    {
      name: "Landry, James",
      hireDate: "14-JAN-07",
      job: "Clerk",
      salary: "2400",
      departmentOrUnit: "50",
      endOfYearBonus: "NaN",
    },
    {
      name: "Markle, Steven",
      hireDate: "NaN",
      job: "Clerk",
      salary: "2200",
      departmentOrUnit: "50",
      endOfYearBonus: "11,26%",
    },
    {
      name: "Atkinson, Mozhe",
      hireDate: "30-OCT-05",
      job: "Clerk",
      salary: "undefined",
      departmentOrUnit: "50",
      endOfYearBonus: "9,61%",
    },
    {
      name: "Marlow, James",
      hireDate: "16-FEB-05",
      job: "Clerk",
      salary: "2500",
      departmentOrUnit: "50",
      endOfYearBonus: "15,74%",
    },
    {
      name: "undefined",
      hireDate: "14-JUN-04",
      job: "Clerk",
      salary: "3300",
      departmentOrUnit: "50",
      endOfYearBonus: "18,54%",
    },
    {
      name: "Rogers, Michael",
      hireDate: "26-AUG-06",
      job: "Clerk",
      salary: "2900",
      departmentOrUnit: "50",
      endOfYearBonus: "null",
    },
    {
      name: "Stiles, Stephen",
      hireDate: "26-OCT-05",
      job: "Clerk",
      salary: "3200",
      departmentOrUnit: "50",
      endOfYearBonus: null,
    },
    {
      name: "Seo, John",
      hireDate: "12-FEB-06",
      job: "Clerk",
      salary: "2700",
      departmentOrUnit: "50",
      endOfYearBonus: "0,16%",
    },
    {
      name: "Patel, Joshua",
      hireDate: "06-APR-06",
      job: "Clerk",
      salary: "2500",
      departmentOrUnit: "50",
      endOfYearBonus: "16,19%",
    },
    {
      name: "Khoo, Alexander",
      hireDate: "18-MAY-03",
      job: "Clerk",
      salary: "3100",
      departmentOrUnit: "30",
      endOfYearBonus: "19,81%",
    },
    {
      name: "Baida, Shelli",
      hireDate: "24-DEC-05",
      job: "Clerk",
      salary: "2900",
      departmentOrUnit: "30",
      endOfYearBonus: "11,06%",
    },
    {
      name: "Himuro, Guy",
      hireDate: "15-NOV-05",
      job: "Clerk",
      salary: "2600",
      departmentOrUnit: "30",
      endOfYearBonus: "25,98%",
    },
    {
      name: "Colmenares, Karen",
      hireDate: "10-AUG-07",
      job: "Clerk",
      salary: "2500",
      departmentOrUnit: "30",
      endOfYearBonus: "15,8%",
    },
  ]);
  await sdb.done();
});
Deno.test("should keep only specific rows even with spaces in column names", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/employees.csv"]);

  await table.keep({
    job: ["Clerk"],
    "Department or unit": ["50", "30"],
  });
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
  ]);
  await sdb.done();
});
