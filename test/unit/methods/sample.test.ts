import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should return 5 random rows", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/employees.csv"]);

  await table.sample(5);

  const data = await table.getData();

  assertEquals(data.length, 5);
  await sdb.done();
});

Deno.test("should return 20% random rows", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/employees.csv"]);

  await table.sample("20%");
  const data = await table.getData();

  assertEquals(data.length, 10);
  await sdb.done();
});

Deno.test("should return the 5 same random rows based on seed", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/employees.csv"]);

  await table.sample(5, {
    seed: 10,
  });
  const data = await table.getData();

  assertEquals(data, [
    {
      Name: "Mavris, Susan",
      "Hire date": "07-JUN-02",
      Job: "Salesperson",
      Salary: "6500",
      "Department or unit": "40",
      "End-of_year-BONUS?": "23,47%",
    },
    {
      Name: "Hunold, Alexander",
      "Hire date": "03-JAN-06",
      Job: "Programmer",
      Salary: "9000",
      "Department or unit": "60",
      "End-of_year-BONUS?": "23,01%",
    },
    {
      Name: "Lorentz, Diana",
      "Hire date": "07-ARB-07",
      Job: "Programmer",
      Salary: "4200",
      "Department or unit": "60",
      "End-of_year-BONUS?": "13,17%",
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
      Name: "Mourgos, Kevin",
      "Hire date": "undefined",
      Job: "Manager",
      Salary: "5800",
      "Department or unit": "50",
      "End-of_year-BONUS?": "19,07%",
    },
  ]);
  await sdb.done();
});

Deno.test("should return the same 20% random rows based on a seed", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/employees.csv"]);

  await table.sample("20%", {
    seed: 1,
  });

  const data = await table.getData();

  assertEquals(data, [
    {
      Name: "Grant, Douglas",
      "Hire date": "13-JAN-08",
      Job: "Clerk",
      Salary: "NaN",
      "Department or unit": "50",
      "End-of_year-BONUS?": "23,39%",
    },
    {
      Name: "Mourgos, Kevin",
      "Hire date": "undefined",
      Job: "Manager",
      Salary: "5800",
      "Department or unit": "50",
      "End-of_year-BONUS?": "19,07%",
    },
    {
      Name: "Faviet, Daniel",
      "Hire date": "16-AUG-02",
      Job: "Accountant",
      Salary: "9000",
      "Department or unit": "100",
      "End-of_year-BONUS?": "2,92%",
    },
    {
      Name: "Gee, Ki",
      "Hire date": "12-DEC-07",
      Job: "NaN",
      Salary: "2400",
      "Department or unit": "50",
      "End-of_year-BONUS?": "12,64%",
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
      Name: "null",
      "Hire date": "07-JUN-02",
      Job: "Accountant",
      Salary: "8300",
      "Department or unit": "110",
      "End-of_year-BONUS?": "15,7%",
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
      Name: "Hartstein, Michael",
      "Hire date": "17-FEB-04",
      Job: "Manager",
      Salary: "13000",
      "Department or unit": "20",
      "End-of_year-BONUS?": "2,71%",
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
      Name: "Markle, Steven",
      "Hire date": "NaN",
      Job: "Clerk",
      Salary: "2200",
      "Department or unit": "50",
      "End-of_year-BONUS?": "11,26%",
    },
  ]);
  await sdb.done();
});
