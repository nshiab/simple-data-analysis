import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should return a table without any missing values", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/employees.csv"]);
  await table.cleanColumnNames();

  await table.removeMissing();
  const data = await table.getData();

  assertEquals(data, dataNoNulls);
  await sdb.done();
});

Deno.test("should return a table without any missing values even if there is a type JSON", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/employees.json"]);
  await table.cleanColumnNames();

  await table.removeMissing();
  const data = await table.getData();

  assertEquals(data, dataNoNullsJSON);
  await sdb.done();
});

Deno.test("should return a table without any missing values even if there is a type associated with numbers", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/dataWithMissingValues.json"]);

  await table.removeMissing();

  const data = await table.getData();

  assertEquals(data, [
    { key1: 4, key2: "quatre", key3: 11545.12 },
  ]);
  await sdb.done();
});

Deno.test("should return a table without any missing values even if there is a type associated with numbers and otherMissingValues as number", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/dataWithMissingValues.json"]);

  await table.removeMissing({
    columns: "key3",
    missingValues: [0.5],
  });
  const data = await table.getData();

  assertEquals(data, [
    { key1: null, key2: "deux", key3: 12 },
    { key1: 4, key2: "quatre", key3: 11545.12 },
  ]);
  await sdb.done();
});

Deno.test("should return a table without any missing values for a specific column", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/employees.csv"]);
  await table.cleanColumnNames();

  await table.removeMissing({
    columns: "name",
  });
  const data = await table.getData();

  assertEquals(data, dataNoNullsName);
  await sdb.done();
});

Deno.test("should return a table without any missing values for multiple specific columns", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/employees.csv"]);
  await table.cleanColumnNames();

  await table.removeMissing({
    columns: ["name", "salary"],
  });

  const data = await table.getData();

  assertEquals(data, dataNoNullsMultipleColumns);
  await sdb.done();
});

Deno.test("should return a table with null values in any columns", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/employees.csv"]);
  await table.cleanColumnNames();

  await table.removeMissing({
    invert: true,
  });
  await table.sort({ name: "asc" });

  const data = await table.getData();

  assertEquals(data, dataJustNulls);
  await sdb.done();
});

Deno.test("should return a table with null values in a specific column", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/employees.csv"]);
  await table.cleanColumnNames();

  await table.removeMissing({
    columns: "name",
    invert: true,
  });

  const data = await table.getData();

  assertEquals(data, dataNullsInName);
  await sdb.done();
});

const dataNoNulls = [
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
    name: "Hartstein, Michael",
    hireDate: "17-FEB-04",
    job: "Manager",
    salary: "13000",
    departmentOrUnit: "20",
    endOfYearBonus: "2,71%",
  },
  {
    name: "Fay, Pat",
    hireDate: "17-AUG-05",
    job: "Representative",
    salary: "6000",
    departmentOrUnit: "20",
    endOfYearBonus: "18,68%",
  },
  {
    name: "Mavris, Susan",
    hireDate: "07-JUN-02",
    job: "Salesperson",
    salary: "6500",
    departmentOrUnit: "40",
    endOfYearBonus: "23,47%",
  },
  {
    name: "Higgins, Shelley",
    hireDate: "07-JUN-02",
    job: "Manager",
    salary: "12008",
    departmentOrUnit: "110",
    endOfYearBonus: "17,09%",
  },
  {
    name: "Kochhar, Neena",
    hireDate: "21-SEP-05",
    job: "Vice-president",
    salary: "&6%",
    departmentOrUnit: "90",
    endOfYearBonus: "11,6%",
  },
  {
    name: "Hunold, Alexander",
    hireDate: "03-JAN-06",
    job: "Programmer",
    salary: "9000",
    departmentOrUnit: "60",
    endOfYearBonus: "23,01%",
  },
  {
    name: "Ernst, Bruce",
    hireDate: "21-MAY-07",
    job: "Programmer",
    salary: "6000",
    departmentOrUnit: "60",
    endOfYearBonus: "25,91%",
  },
  {
    name: "Lorentz, Diana",
    hireDate: "07-ARB-07",
    job: "Programmer",
    salary: "4200",
    departmentOrUnit: "60",
    endOfYearBonus: "13,17%",
  },
  {
    name: "Greenberg, Nancy",
    hireDate: "17-AUG-02",
    job: "Manager",
    salary: "12008",
    departmentOrUnit: "100",
    endOfYearBonus: "74,69%",
  },
  {
    name: "Faviet, Daniel",
    hireDate: "16-AUG-02",
    job: "Accountant",
    salary: "9000",
    departmentOrUnit: "100",
    endOfYearBonus: "2,92%",
  },
  {
    name: "Chen, John",
    hireDate: "28-SEP-05",
    job: "Accountant",
    salary: "8200",
    departmentOrUnit: "100",
    endOfYearBonus: "9,31%",
  },
  {
    name: "Sciarra, Ismael",
    hireDate: "30-SEP-05",
    job: "Accountant",
    salary: "7700",
    departmentOrUnit: "100",
    endOfYearBonus: "13,18%",
  },
  {
    name: "Urman, Jose Manuel",
    hireDate: "07-MAR-06",
    job: "Accountant",
    salary: "7800",
    departmentOrUnit: "100",
    endOfYearBonus: "1,33%",
  },
  {
    name: "Popp, Luis",
    hireDate: "07-DEC-07",
    job: "Accountant",
    salary: "6900",
    departmentOrUnit: "100",
    endOfYearBonus: "2,98%",
  },
  {
    name: "Raphaely, Den",
    hireDate: "07-DEC-02",
    job: "Manager",
    salary: "11000",
    departmentOrUnit: "30",
    endOfYearBonus: "3,35%",
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
  {
    name: "Weiss, Matthew",
    hireDate: "18-JUL-04",
    job: "Manager",
    salary: "8000",
    departmentOrUnit: "50",
    endOfYearBonus: "25,17%",
  },
  {
    name: "Fripp, Adam",
    hireDate: "10-APR-05",
    job: "Manager",
    salary: "8200",
    departmentOrUnit: "50",
    endOfYearBonus: "21%",
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
    name: "Marlow, James",
    hireDate: "16-FEB-05",
    job: "Clerk",
    salary: "2500",
    departmentOrUnit: "50",
    endOfYearBonus: "15,74%",
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
];

const dataNoNullsJSON = [
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
    name: "Hartstein, Michael",
    hireDate: "17-FEB-04",
    job: "Manager",
    salary: "13000",
    departmentOrUnit: "20",
    endOfYearBonus: "2,71%",
  },
  {
    name: "Fay, Pat",
    hireDate: "17-AUG-05",
    job: "Representative",
    salary: "6000",
    departmentOrUnit: "20",
    endOfYearBonus: "18,68%",
  },
  {
    name: "Mavris, Susan",
    hireDate: "07-JUN-02",
    job: "Salesperson",
    salary: "6500",
    departmentOrUnit: "40",
    endOfYearBonus: "23,47%",
  },
  {
    name: "Higgins, Shelley",
    hireDate: "07-JUN-02",
    job: "Manager",
    salary: "12008",
    departmentOrUnit: "110",
    endOfYearBonus: "17,09%",
  },
  {
    name: "Kochhar, Neena",
    hireDate: "21-SEP-05",
    job: "Vice-president",
    salary: '"&6%"',
    departmentOrUnit: "90",
    endOfYearBonus: "11,6%",
  },
  {
    name: "Hunold, Alexander",
    hireDate: "03-JAN-06",
    job: "Programmer",
    salary: "9000",
    departmentOrUnit: "60",
    endOfYearBonus: "23,01%",
  },
  {
    name: "Ernst, Bruce",
    hireDate: "21-MAY-07",
    job: "Programmer",
    salary: "6000",
    departmentOrUnit: "60",
    endOfYearBonus: "25,91%",
  },
  {
    name: "Lorentz, Diana",
    hireDate: "07-ARB-07",
    job: "Programmer",
    salary: "4200",
    departmentOrUnit: "60",
    endOfYearBonus: "13,17%",
  },
  {
    name: "Greenberg, Nancy",
    hireDate: "17-AUG-02",
    job: "Manager",
    salary: "12008",
    departmentOrUnit: "100",
    endOfYearBonus: "74,69%",
  },
  {
    name: "Faviet, Daniel",
    hireDate: "16-AUG-02",
    job: "Accountant",
    salary: "9000",
    departmentOrUnit: "100",
    endOfYearBonus: "2,92%",
  },
  {
    name: "Chen, John",
    hireDate: "28-SEP-05",
    job: "Accountant",
    salary: "8200",
    departmentOrUnit: "100",
    endOfYearBonus: "9,31%",
  },
  {
    name: "Sciarra, Ismael",
    hireDate: "30-SEP-05",
    job: "Accountant",
    salary: "7700",
    departmentOrUnit: "100",
    endOfYearBonus: "13,18%",
  },
  {
    name: "Urman, Jose Manuel",
    hireDate: "07-MAR-06",
    job: "Accountant",
    salary: "7800",
    departmentOrUnit: "100",
    endOfYearBonus: "1,33%",
  },
  {
    name: "Popp, Luis",
    hireDate: "07-DEC-07",
    job: "Accountant",
    salary: "6900",
    departmentOrUnit: "100",
    endOfYearBonus: "2,98%",
  },
  {
    name: "Raphaely, Den",
    hireDate: "07-DEC-02",
    job: "Manager",
    salary: "11000",
    departmentOrUnit: "30",
    endOfYearBonus: "3,35%",
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
  {
    name: "Weiss, Matthew",
    hireDate: "18-JUL-04",
    job: "Manager",
    salary: "8000",
    departmentOrUnit: "50",
    endOfYearBonus: "25,17%",
  },
  {
    name: "Fripp, Adam",
    hireDate: "10-APR-05",
    job: "Manager",
    salary: "8200",
    departmentOrUnit: "50",
    endOfYearBonus: "21%",
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
    name: "Marlow, James",
    hireDate: "16-FEB-05",
    job: "Clerk",
    salary: "2500",
    departmentOrUnit: "50",
    endOfYearBonus: "15,74%",
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
];

const dataNoNullsName = [
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
    name: "Hartstein, Michael",
    hireDate: "17-FEB-04",
    job: "Manager",
    salary: "13000",
    departmentOrUnit: "20",
    endOfYearBonus: "2,71%",
  },
  {
    name: "Fay, Pat",
    hireDate: "17-AUG-05",
    job: "Representative",
    salary: "6000",
    departmentOrUnit: "20",
    endOfYearBonus: "18,68%",
  },
  {
    name: "Mavris, Susan",
    hireDate: "07-JUN-02",
    job: "Salesperson",
    salary: "6500",
    departmentOrUnit: "40",
    endOfYearBonus: "23,47%",
  },
  {
    name: "Higgins, Shelley",
    hireDate: "07-JUN-02",
    job: "Manager",
    salary: "12008",
    departmentOrUnit: "110",
    endOfYearBonus: "17,09%",
  },
  {
    name: "King, Steven",
    hireDate: null,
    job: "President",
    salary: "24000",
    departmentOrUnit: "90",
    endOfYearBonus: "2,46%",
  },
  {
    name: "Kochhar, Neena",
    hireDate: "21-SEP-05",
    job: "Vice-president",
    salary: "&6%",
    departmentOrUnit: "90",
    endOfYearBonus: "11,6%",
  },
  {
    name: "De Haan, Lex",
    hireDate: "null",
    job: "Vice-president",
    salary: "17000",
    departmentOrUnit: "90",
    endOfYearBonus: "23,43%",
  },
  {
    name: "Hunold, Alexander",
    hireDate: "03-JAN-06",
    job: "Programmer",
    salary: "9000",
    departmentOrUnit: "60",
    endOfYearBonus: "23,01%",
  },
  {
    name: "Ernst, Bruce",
    hireDate: "21-MAY-07",
    job: "Programmer",
    salary: "6000",
    departmentOrUnit: "60",
    endOfYearBonus: "25,91%",
  },
  {
    name: "Austin, David",
    hireDate: "NaN",
    job: "Programmer",
    salary: "4800",
    departmentOrUnit: "null",
    endOfYearBonus: "6,89%",
  },
  {
    name: "Pataballa, Valli",
    hireDate: "abc",
    job: "Programmer",
    salary: null,
    departmentOrUnit: "60",
    endOfYearBonus: "1,62%",
  },
  {
    name: "Lorentz, Diana",
    hireDate: "07-ARB-07",
    job: "Programmer",
    salary: "4200",
    departmentOrUnit: "60",
    endOfYearBonus: "13,17%",
  },
  {
    name: "Greenberg, Nancy",
    hireDate: "17-AUG-02",
    job: "Manager",
    salary: "12008",
    departmentOrUnit: "100",
    endOfYearBonus: "74,69%",
  },
  {
    name: "Faviet, Daniel",
    hireDate: "16-AUG-02",
    job: "Accountant",
    salary: "9000",
    departmentOrUnit: "100",
    endOfYearBonus: "2,92%",
  },
  {
    name: "Chen, John",
    hireDate: "28-SEP-05",
    job: "Accountant",
    salary: "8200",
    departmentOrUnit: "100",
    endOfYearBonus: "9,31%",
  },
  {
    name: "Sciarra, Ismael",
    hireDate: "30-SEP-05",
    job: "Accountant",
    salary: "7700",
    departmentOrUnit: "100",
    endOfYearBonus: "13,18%",
  },
  {
    name: "Urman, Jose Manuel",
    hireDate: "07-MAR-06",
    job: "Accountant",
    salary: "7800",
    departmentOrUnit: "100",
    endOfYearBonus: "1,33%",
  },
  {
    name: "Popp, Luis",
    hireDate: "07-DEC-07",
    job: "Accountant",
    salary: "6900",
    departmentOrUnit: "100",
    endOfYearBonus: "2,98%",
  },
  {
    name: "Raphaely, Den",
    hireDate: "07-DEC-02",
    job: "Manager",
    salary: "11000",
    departmentOrUnit: "30",
    endOfYearBonus: "3,35%",
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
    name: "Tobias, Sigal",
    hireDate: "24-JUL-05",
    job: "NaN",
    salary: "2800",
    departmentOrUnit: null,
    endOfYearBonus: "undefined",
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
  {
    name: "Weiss, Matthew",
    hireDate: "18-JUL-04",
    job: "Manager",
    salary: "8000",
    departmentOrUnit: "50",
    endOfYearBonus: "25,17%",
  },
  {
    name: "Fripp, Adam",
    hireDate: "10-APR-05",
    job: "Manager",
    salary: "8200",
    departmentOrUnit: "50",
    endOfYearBonus: "21%",
  },
  {
    name: "Kaufling, Payam",
    hireDate: "01-MAY-03",
    job: "Manager",
    salary: "7900",
    departmentOrUnit: "undefined",
    endOfYearBonus: "21,33%",
  },
  {
    name: "Vollman, Shanta",
    hireDate: "10-OCT-05",
    job: "null",
    salary: "6500",
    departmentOrUnit: "50",
    endOfYearBonus: "3,45%",
  },
  {
    name: "Mourgos, Kevin",
    hireDate: "undefined",
    job: "Manager",
    salary: "5800",
    departmentOrUnit: "50",
    endOfYearBonus: "19,07%",
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
    name: "Bissot, Laura",
    hireDate: "20-AUG-05",
    job: "undefined",
    salary: "3300",
    departmentOrUnit: "50",
    endOfYearBonus: "4,53%",
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
    name: "Olson, TJ",
    hireDate: "10-APR-07",
    job: "Clerk",
    salary: "2100",
    departmentOrUnit: "null",
    endOfYearBonus: "22,3%",
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
    name: "Gee, Ki",
    hireDate: "12-DEC-07",
    job: "NaN",
    salary: "2400",
    departmentOrUnit: "50",
    endOfYearBonus: "12,64%",
  },
  {
    name: "Philtanker, Hazel",
    hireDate: "06-FEB-08",
    job: "Clerk",
    salary: "2200",
    departmentOrUnit: "NaN",
    endOfYearBonus: "24,17%",
  },
  {
    name: "Ladwig, Renske",
    hireDate: "14-JUL-03",
    job: null,
    salary: "3600",
    departmentOrUnit: "50",
    endOfYearBonus: "17,86%",
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
];

const dataNoNullsMultipleColumns = [
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
    name: "Hartstein, Michael",
    hireDate: "17-FEB-04",
    job: "Manager",
    salary: "13000",
    departmentOrUnit: "20",
    endOfYearBonus: "2,71%",
  },
  {
    name: "Fay, Pat",
    hireDate: "17-AUG-05",
    job: "Representative",
    salary: "6000",
    departmentOrUnit: "20",
    endOfYearBonus: "18,68%",
  },
  {
    name: "Mavris, Susan",
    hireDate: "07-JUN-02",
    job: "Salesperson",
    salary: "6500",
    departmentOrUnit: "40",
    endOfYearBonus: "23,47%",
  },
  {
    name: "Higgins, Shelley",
    hireDate: "07-JUN-02",
    job: "Manager",
    salary: "12008",
    departmentOrUnit: "110",
    endOfYearBonus: "17,09%",
  },
  {
    name: "King, Steven",
    hireDate: null,
    job: "President",
    salary: "24000",
    departmentOrUnit: "90",
    endOfYearBonus: "2,46%",
  },
  {
    name: "Kochhar, Neena",
    hireDate: "21-SEP-05",
    job: "Vice-president",
    salary: "&6%",
    departmentOrUnit: "90",
    endOfYearBonus: "11,6%",
  },
  {
    name: "De Haan, Lex",
    hireDate: "null",
    job: "Vice-president",
    salary: "17000",
    departmentOrUnit: "90",
    endOfYearBonus: "23,43%",
  },
  {
    name: "Hunold, Alexander",
    hireDate: "03-JAN-06",
    job: "Programmer",
    salary: "9000",
    departmentOrUnit: "60",
    endOfYearBonus: "23,01%",
  },
  {
    name: "Ernst, Bruce",
    hireDate: "21-MAY-07",
    job: "Programmer",
    salary: "6000",
    departmentOrUnit: "60",
    endOfYearBonus: "25,91%",
  },
  {
    name: "Austin, David",
    hireDate: "NaN",
    job: "Programmer",
    salary: "4800",
    departmentOrUnit: "null",
    endOfYearBonus: "6,89%",
  },
  {
    name: "Lorentz, Diana",
    hireDate: "07-ARB-07",
    job: "Programmer",
    salary: "4200",
    departmentOrUnit: "60",
    endOfYearBonus: "13,17%",
  },
  {
    name: "Greenberg, Nancy",
    hireDate: "17-AUG-02",
    job: "Manager",
    salary: "12008",
    departmentOrUnit: "100",
    endOfYearBonus: "74,69%",
  },
  {
    name: "Faviet, Daniel",
    hireDate: "16-AUG-02",
    job: "Accountant",
    salary: "9000",
    departmentOrUnit: "100",
    endOfYearBonus: "2,92%",
  },
  {
    name: "Chen, John",
    hireDate: "28-SEP-05",
    job: "Accountant",
    salary: "8200",
    departmentOrUnit: "100",
    endOfYearBonus: "9,31%",
  },
  {
    name: "Sciarra, Ismael",
    hireDate: "30-SEP-05",
    job: "Accountant",
    salary: "7700",
    departmentOrUnit: "100",
    endOfYearBonus: "13,18%",
  },
  {
    name: "Urman, Jose Manuel",
    hireDate: "07-MAR-06",
    job: "Accountant",
    salary: "7800",
    departmentOrUnit: "100",
    endOfYearBonus: "1,33%",
  },
  {
    name: "Popp, Luis",
    hireDate: "07-DEC-07",
    job: "Accountant",
    salary: "6900",
    departmentOrUnit: "100",
    endOfYearBonus: "2,98%",
  },
  {
    name: "Raphaely, Den",
    hireDate: "07-DEC-02",
    job: "Manager",
    salary: "11000",
    departmentOrUnit: "30",
    endOfYearBonus: "3,35%",
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
    name: "Tobias, Sigal",
    hireDate: "24-JUL-05",
    job: "NaN",
    salary: "2800",
    departmentOrUnit: null,
    endOfYearBonus: "undefined",
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
  {
    name: "Weiss, Matthew",
    hireDate: "18-JUL-04",
    job: "Manager",
    salary: "8000",
    departmentOrUnit: "50",
    endOfYearBonus: "25,17%",
  },
  {
    name: "Fripp, Adam",
    hireDate: "10-APR-05",
    job: "Manager",
    salary: "8200",
    departmentOrUnit: "50",
    endOfYearBonus: "21%",
  },
  {
    name: "Kaufling, Payam",
    hireDate: "01-MAY-03",
    job: "Manager",
    salary: "7900",
    departmentOrUnit: "undefined",
    endOfYearBonus: "21,33%",
  },
  {
    name: "Vollman, Shanta",
    hireDate: "10-OCT-05",
    job: "null",
    salary: "6500",
    departmentOrUnit: "50",
    endOfYearBonus: "3,45%",
  },
  {
    name: "Mourgos, Kevin",
    hireDate: "undefined",
    job: "Manager",
    salary: "5800",
    departmentOrUnit: "50",
    endOfYearBonus: "19,07%",
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
    name: "Bissot, Laura",
    hireDate: "20-AUG-05",
    job: "undefined",
    salary: "3300",
    departmentOrUnit: "50",
    endOfYearBonus: "4,53%",
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
    name: "Olson, TJ",
    hireDate: "10-APR-07",
    job: "Clerk",
    salary: "2100",
    departmentOrUnit: "null",
    endOfYearBonus: "22,3%",
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
    name: "Gee, Ki",
    hireDate: "12-DEC-07",
    job: "NaN",
    salary: "2400",
    departmentOrUnit: "50",
    endOfYearBonus: "12,64%",
  },
  {
    name: "Philtanker, Hazel",
    hireDate: "06-FEB-08",
    job: "Clerk",
    salary: "2200",
    departmentOrUnit: "NaN",
    endOfYearBonus: "24,17%",
  },
  {
    name: "Ladwig, Renske",
    hireDate: "14-JUL-03",
    job: null,
    salary: "3600",
    departmentOrUnit: "50",
    endOfYearBonus: "17,86%",
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
];

const dataJustNulls = [
  {
    name: "Atkinson, Mozhe",
    hireDate: "30-OCT-05",
    job: "Clerk",
    salary: "undefined",
    departmentOrUnit: "50",
    endOfYearBonus: "9,61%",
  },
  {
    name: "Austin, David",
    hireDate: "NaN",
    job: "Programmer",
    salary: "4800",
    departmentOrUnit: "null",
    endOfYearBonus: "6,89%",
  },
  {
    name: "Bissot, Laura",
    hireDate: "20-AUG-05",
    job: "undefined",
    salary: "3300",
    departmentOrUnit: "50",
    endOfYearBonus: "4,53%",
  },
  {
    name: "De Haan, Lex",
    hireDate: "null",
    job: "Vice-president",
    salary: "17000",
    departmentOrUnit: "90",
    endOfYearBonus: "23,43%",
  },
  {
    name: "Gee, Ki",
    hireDate: "12-DEC-07",
    job: "NaN",
    salary: "2400",
    departmentOrUnit: "50",
    endOfYearBonus: "12,64%",
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
    name: "Kaufling, Payam",
    hireDate: "01-MAY-03",
    job: "Manager",
    salary: "7900",
    departmentOrUnit: "undefined",
    endOfYearBonus: "21,33%",
  },
  {
    name: "King, Steven",
    hireDate: null,
    job: "President",
    salary: "24000",
    departmentOrUnit: "90",
    endOfYearBonus: "2,46%",
  },
  {
    name: "Ladwig, Renske",
    hireDate: "14-JUL-03",
    job: null,
    salary: "3600",
    departmentOrUnit: "50",
    endOfYearBonus: "17,86%",
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
    name: "Mourgos, Kevin",
    hireDate: "undefined",
    job: "Manager",
    salary: "5800",
    departmentOrUnit: "50",
    endOfYearBonus: "19,07%",
  },
  {
    name: "NaN",
    hireDate: "07-JUN-02",
    job: "Salesperson",
    salary: "10000",
    departmentOrUnit: "xyz",
    endOfYearBonus: "17,63%",
  },
  {
    name: "Olson, TJ",
    hireDate: "10-APR-07",
    job: "Clerk",
    salary: "2100",
    departmentOrUnit: "null",
    endOfYearBonus: "22,3%",
  },
  {
    name: "Pataballa, Valli",
    hireDate: "abc",
    job: "Programmer",
    salary: null,
    departmentOrUnit: "60",
    endOfYearBonus: "1,62%",
  },
  {
    name: "Philtanker, Hazel",
    hireDate: "06-FEB-08",
    job: "Clerk",
    salary: "2200",
    departmentOrUnit: "NaN",
    endOfYearBonus: "24,17%",
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
    name: "Tobias, Sigal",
    hireDate: "24-JUL-05",
    job: "NaN",
    salary: "2800",
    departmentOrUnit: null,
    endOfYearBonus: "undefined",
  },
  {
    name: "Vollman, Shanta",
    hireDate: "10-OCT-05",
    job: "null",
    salary: "6500",
    departmentOrUnit: "50",
    endOfYearBonus: "3,45%",
  },
  {
    name: "null",
    hireDate: "07-JUN-02",
    job: "Accountant",
    salary: "8300",
    departmentOrUnit: "110",
    endOfYearBonus: "15,7%",
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
    name: null,
    hireDate: "17-SEP-03",
    job: "Assistant",
    salary: "4400",
    departmentOrUnit: "10",
    endOfYearBonus: "17,51%",
  },
];

const dataNullsInName = [
  {
    name: null,
    hireDate: "17-SEP-03",
    job: "Assistant",
    salary: "4400",
    departmentOrUnit: "10",
    endOfYearBonus: "17,51%",
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
    name: "NaN",
    hireDate: "07-JUN-02",
    job: "Salesperson",
    salary: "10000",
    departmentOrUnit: "xyz",
    endOfYearBonus: "17,63%",
  },
  {
    name: "null",
    hireDate: "07-JUN-02",
    job: "Accountant",
    salary: "8300",
    departmentOrUnit: "110",
    endOfYearBonus: "15,7%",
  },
];
