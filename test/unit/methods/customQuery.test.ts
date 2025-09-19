import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should return the results of a custom query", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("employees");
  await table.loadData(["test/data/files/employees.csv"]);

  const data = await sdb.customQuery(
    "SELECT * FROM employees WHERE Job = 'Clerk'",
    { returnDataFrom: "query" },
  );

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
Deno.test("should work with ==", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("employees");
  await table.loadData("test/data/files/employees.csv");

  const data = await sdb.customQuery(
    "SELECT * FROM employees WHERE Name == 'Patel, Joshua'",
    { returnDataFrom: "query" },
  );

  assertEquals(data, [
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
Deno.test("should work with ===", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("employees");
  await table.loadData("test/data/files/employees.csv");

  const data = await sdb.customQuery(
    "SELECT * FROM employees WHERE Name === 'Patel, Joshua'",
    { returnDataFrom: "query" },
  );

  assertEquals(data, [
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
Deno.test("should work with &&", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("employees");
  await table.loadData("test/data/files/employees.csv");

  const data = await sdb.customQuery(
    `SELECT * FROM employees WHERE Job === 'Clerk' && Salary == '2500' && "Department or unit" = '30'`,
    { returnDataFrom: "query" },
  );

  assertEquals(data, [
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
Deno.test("should work with ||", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("employees");
  await table.loadData("test/data/files/employees.csv");

  const data = await sdb.customQuery(
    `SELECT * FROM employees WHERE Job === 'Clerk' && Salary === '2500' && ("Department or unit" = '30' || "Department or unit" = '50')`,
    { returnDataFrom: "query" },
  );

  assertEquals(data, [
    {
      Name: "Colmenares, Karen",
      "Hire date": "10-AUG-07",
      Job: "Clerk",
      Salary: "2500",
      "Department or unit": "30",
      "End-of_year-BONUS?": "15,8%",
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
Deno.test("should work with !==", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("employees");
  await table.loadData("test/data/files/employees.csv");

  const data = await sdb.customQuery(
    `SELECT * FROM employees WHERE Job !== 'Clerk' && Job !== 'Assistant' && Job !== 'Accountant' && Job !== 'Salesperson' && Job !== 'Programmer' && Job !== 'Manager'`,
    { returnDataFrom: "query" },
  );

  assertEquals(data, [
    {
      Name: "Fay, Pat",
      "Hire date": "17-AUG-05",
      Job: "Representative",
      Salary: "6000",
      "Department or unit": "20",
      "End-of_year-BONUS?": "18,68%",
    },
    {
      Name: "King, Steven",
      "Hire date": null,
      Job: "President",
      Salary: "24000",
      "Department or unit": "90",
      "End-of_year-BONUS?": "2,46%",
    },
    {
      Name: "Kochhar, Neena",
      "Hire date": "21-SEP-05",
      Job: "Vice-president",
      Salary: "&6%",
      "Department or unit": "90",
      "End-of_year-BONUS?": "11,6%",
    },
    {
      Name: "De Haan, Lex",
      "Hire date": "null",
      Job: "Vice-president",
      Salary: "17000",
      "Department or unit": "90",
      "End-of_year-BONUS?": "23,43%",
    },
    {
      Name: "Tobias, Sigal",
      "Hire date": "24-JUL-05",
      Job: "NaN",
      Salary: "2800",
      "Department or unit": null,
      "End-of_year-BONUS?": "undefined",
    },
    {
      Name: "Vollman, Shanta",
      "Hire date": "10-OCT-05",
      Job: "null",
      Salary: "6500",
      "Department or unit": "50",
      "End-of_year-BONUS?": "3,45%",
    },
    {
      Name: "Bissot, Laura",
      "Hire date": "20-AUG-05",
      Job: "undefined",
      Salary: "3300",
      "Department or unit": "50",
      "End-of_year-BONUS?": "4,53%",
    },
    {
      Name: "Gee, Ki",
      "Hire date": "12-DEC-07",
      Job: "NaN",
      Salary: "2400",
      "Department or unit": "50",
      "End-of_year-BONUS?": "12,64%",
    },
  ]);
  await sdb.done();
});
Deno.test("should work with === null", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("test");
  await table.loadArray([{ key1: 1 }, { key1: 2 }, { key1: null }]);

  const data = await sdb.customQuery(
    `SELECT * FROM test WHERE key1 === null`,
    { returnDataFrom: "query" },
  );

  assertEquals(data, [{ key1: null }]);
  await sdb.done();
});
Deno.test("should work with = null", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("test");
  await table.loadArray([{ key1: 1 }, { key1: 2 }, { key1: null }]);

  const data = await sdb.customQuery(
    `SELECT * FROM test WHERE key1 = null`,
    { returnDataFrom: "query" },
  );

  assertEquals(data, [{ key1: null }]);
  await sdb.done();
});
Deno.test("should work with === NULL", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("test");
  await table.loadArray([{ key1: 1 }, { key1: 2 }, { key1: null }]);

  const data = await sdb.customQuery(
    `SELECT * FROM test WHERE key1 === NULL`,
    { returnDataFrom: "query" },
  );

  assertEquals(data, [{ key1: null }]);
  await sdb.done();
});
Deno.test("should work with == NULL", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("test");
  await table.loadArray([{ key1: 1 }, { key1: 2 }, { key1: null }]);

  const data = await sdb.customQuery(
    `SELECT * FROM test WHERE key1 == NULL`,
    { returnDataFrom: "query" },
  );

  assertEquals(data, [{ key1: null }]);
  await sdb.done();
});
Deno.test("should work with = NULL", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("test");
  await table.loadArray([{ key1: 1 }, { key1: 2 }, { key1: null }]);

  const data = await sdb.customQuery(
    `SELECT * FROM test WHERE key1 = NULL`,
    { returnDataFrom: "query" },
  );

  assertEquals(data, [{ key1: null }]);
  await sdb.done();
});
Deno.test("should work with !== null", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("test");
  await table.loadArray([{ key1: 1 }, { key1: 2 }, { key1: null }]);

  const data = await sdb.customQuery(
    `SELECT * FROM test WHERE key1 !== null`,
    { returnDataFrom: "query" },
  );

  assertEquals(data, [{ key1: 1 }, { key1: 2 }]);
  await sdb.done();
});
Deno.test("should work with != null", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("test");
  await table.loadArray([{ key1: 1 }, { key1: 2 }, { key1: null }]);

  const data = await sdb.customQuery(
    `SELECT * FROM test WHERE key1 != null`,
    { returnDataFrom: "query" },
  );

  assertEquals(data, [{ key1: 1 }, { key1: 2 }]);
  await sdb.done();
});
Deno.test("should work with !== NULL", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("test");
  await table.loadArray([{ key1: 1 }, { key1: 2 }, { key1: null }]);

  const data = await sdb.customQuery(
    `SELECT * FROM test WHERE key1 !== NULL`,
    { returnDataFrom: "query" },
  );

  assertEquals(data, [{ key1: 1 }, { key1: 2 }]);
  await sdb.done();
});
Deno.test("should work with != NULL", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("test");
  await table.loadArray([{ key1: 1 }, { key1: 2 }, { key1: null }]);

  const data = await sdb.customQuery(
    `SELECT * FROM test WHERE key1 != NULL`,
    { returnDataFrom: "query" },
  );

  assertEquals(data, [{ key1: 1 }, { key1: 2 }]);
  await sdb.done();
});
Deno.test("should work with === null not at the end of query", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("test");
  await table.loadArray([{ key1: 1 }, { key1: 2 }, { key1: null }]);

  const data = await sdb.customQuery(
    `SELECT * FROM test WHERE key1 === null || key1 === 2`,
    { returnDataFrom: "query" },
  );

  assertEquals(data, [{ key1: 2 }, { key1: null }]);
  await sdb.done();
});
