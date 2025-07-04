import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should remove duplicates from a table", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/employees.csv"]);

  await table.removeDuplicates();
  await table.sort({ Name: "asc" });
  const noDuplicates = await table.getData();

  assertEquals(noDuplicates, [
    {
      Name: "Atkinson, Mozhe",
      "Hire date": "30-OCT-05",
      Job: "Clerk",
      Salary: "undefined",
      "Department or unit": "50",
      "End-of_year-BONUS?": "9,61%",
    },
    {
      Name: "Austin, David",
      "Hire date": "NaN",
      Job: "Programmer",
      Salary: "4800",
      "Department or unit": "null",
      "End-of_year-BONUS?": "6,89%",
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
      Name: "Bissot, Laura",
      "Hire date": "20-AUG-05",
      Job: "undefined",
      Salary: "3300",
      "Department or unit": "50",
      "End-of_year-BONUS?": "4,53%",
    },
    {
      Name: "Chen, John",
      "Hire date": "28-SEP-05",
      Job: "Accountant",
      Salary: "8200",
      "Department or unit": "100",
      "End-of_year-BONUS?": "9,31%",
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
      Name: "De Haan, Lex",
      "Hire date": "null",
      Job: "Vice-president",
      Salary: "17000",
      "Department or unit": "90",
      "End-of_year-BONUS?": "23,43%",
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
      Name: "Faviet, Daniel",
      "Hire date": "16-AUG-02",
      Job: "Accountant",
      Salary: "9000",
      "Department or unit": "100",
      "End-of_year-BONUS?": "2,92%",
    },
    {
      Name: "Fay, Pat",
      "Hire date": "17-AUG-05",
      Job: "Representative",
      Salary: "6000",
      "Department or unit": "20",
      "End-of_year-BONUS?": "18,68%",
    },
    {
      Name: "Fripp, Adam",
      "Hire date": "10-APR-05",
      Job: "Manager",
      Salary: "8200",
      "Department or unit": "50",
      "End-of_year-BONUS?": "21%",
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
      Name: "Grant, Douglas",
      "Hire date": "13-JAN-08",
      Job: "Clerk",
      Salary: "NaN",
      "Department or unit": "50",
      "End-of_year-BONUS?": "23,39%",
    },
    {
      Name: "Greenberg, Nancy",
      "Hire date": "17-AUG-02",
      Job: "Manager",
      Salary: "12008",
      "Department or unit": "100",
      "End-of_year-BONUS?": "74,69%",
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
      Name: "Higgins, Shelley",
      "Hire date": "07-JUN-02",
      Job: "Manager",
      Salary: "12008",
      "Department or unit": "110",
      "End-of_year-BONUS?": "17,09%",
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
      Name: "Hunold, Alexander",
      "Hire date": "03-JAN-06",
      Job: "Programmer",
      Salary: "9000",
      "Department or unit": "60",
      "End-of_year-BONUS?": "23,01%",
    },
    {
      Name: "Kaufling, Payam",
      "Hire date": "01-MAY-03",
      Job: "Manager",
      Salary: "7900",
      "Department or unit": "undefined",
      "End-of_year-BONUS?": "21,33%",
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
      Name: "Ladwig, Renske",
      "Hire date": "14-JUL-03",
      Job: null,
      Salary: "3600",
      "Department or unit": "50",
      "End-of_year-BONUS?": "17,86%",
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
      Name: "Lorentz, Diana",
      "Hire date": "07-ARB-07",
      Job: "Programmer",
      Salary: "4200",
      "Department or unit": "60",
      "End-of_year-BONUS?": "13,17%",
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
      Name: "Marlow, James",
      "Hire date": "16-FEB-05",
      Job: "Clerk",
      Salary: "2500",
      "Department or unit": "50",
      "End-of_year-BONUS?": "15,74%",
    },
    {
      Name: "Mavris, Susan",
      "Hire date": "07-JUN-02",
      Job: "Salesperson",
      Salary: "6500",
      "Department or unit": "40",
      "End-of_year-BONUS?": "23,47%",
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
      Name: "Mourgos, Kevin",
      "Hire date": "undefined",
      Job: "Manager",
      Salary: "5800",
      "Department or unit": "50",
      "End-of_year-BONUS?": "19,07%",
    },
    {
      Name: "NaN",
      "Hire date": "07-JUN-02",
      Job: "Salesperson",
      Salary: "10000",
      "Department or unit": "xyz",
      "End-of_year-BONUS?": "17,63%",
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
      Name: "OConnell, Donald",
      "Hire date": "21-JUN-07",
      Job: "Clerk",
      Salary: "2600",
      "Department or unit": "50",
      "End-of_year-BONUS?": "1,94%",
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
      Name: "Pataballa, Valli",
      "Hire date": "abc",
      Job: "Programmer",
      Salary: null,
      "Department or unit": "60",
      "End-of_year-BONUS?": "1,62%",
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
      Name: "Philtanker, Hazel",
      "Hire date": "06-FEB-08",
      Job: "Clerk",
      Salary: "2200",
      "Department or unit": "NaN",
      "End-of_year-BONUS?": "24,17%",
    },
    {
      Name: "Popp, Luis",
      "Hire date": "07-DEC-07",
      Job: "Accountant",
      Salary: "6900",
      "Department or unit": "100",
      "End-of_year-BONUS?": "2,98%",
    },
    {
      Name: "Raphaely, Den",
      "Hire date": "07-DEC-02",
      Job: "Manager",
      Salary: "11000",
      "Department or unit": "30",
      "End-of_year-BONUS?": "3,35%",
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
      Name: "Sciarra, Ismael",
      "Hire date": "30-SEP-05",
      Job: "Accountant",
      Salary: "7700",
      "Department or unit": "100",
      "End-of_year-BONUS?": "13,18%",
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
      Name: "Stiles, Stephen",
      "Hire date": "26-OCT-05",
      Job: "Clerk",
      Salary: "3200",
      "Department or unit": "50",
      "End-of_year-BONUS?": null,
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
      Name: "Urman, Jose Manuel",
      "Hire date": "07-MAR-06",
      Job: "Accountant",
      Salary: "7800",
      "Department or unit": "100",
      "End-of_year-BONUS?": "1,33%",
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
      Name: "Weiss, Matthew",
      "Hire date": "18-JUL-04",
      Job: "Manager",
      Salary: "8000",
      "Department or unit": "50",
      "End-of_year-BONUS?": "25,17%",
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
      Name: "undefined",
      "Hire date": "14-JUN-04",
      Job: "Clerk",
      Salary: "3300",
      "Department or unit": "50",
      "End-of_year-BONUS?": "18,54%",
    },
    {
      Name: null,
      "Hire date": "17-SEP-03",
      Job: "Assistant",
      Salary: "4400",
      "Department or unit": "10",
      "End-of_year-BONUS?": "17,51%",
    },
  ]);
  await sdb.done();
});

Deno.test("should remove duplicates from a table based on a specific column", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/employees.csv"]);

  await table.removeDuplicates({
    on: "Job",
  });
  await table.sort({ Name: "asc" });
  const noDuplicates = await table.getData();

  assertEquals(noDuplicates, [
    {
      Name: "Bissot, Laura",
      "Hire date": "20-AUG-05",
      Job: "undefined",
      Salary: "3300",
      "Department or unit": "50",
      "End-of_year-BONUS?": "4,53%",
    },
    {
      Name: "Fay, Pat",
      "Hire date": "17-AUG-05",
      Job: "Representative",
      Salary: "6000",
      "Department or unit": "20",
      "End-of_year-BONUS?": "18,68%",
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
      Name: "Hunold, Alexander",
      "Hire date": "03-JAN-06",
      Job: "Programmer",
      Salary: "9000",
      "Department or unit": "60",
      "End-of_year-BONUS?": "23,01%",
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
      Name: "Ladwig, Renske",
      "Hire date": "14-JUL-03",
      Job: null,
      Salary: "3600",
      "Department or unit": "50",
      "End-of_year-BONUS?": "17,86%",
    },
    {
      Name: "Mavris, Susan",
      "Hire date": "07-JUN-02",
      Job: "Salesperson",
      Salary: "6500",
      "Department or unit": "40",
      "End-of_year-BONUS?": "23,47%",
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
      Name: "null",
      "Hire date": "07-JUN-02",
      Job: "Accountant",
      Salary: "8300",
      "Department or unit": "110",
      "End-of_year-BONUS?": "15,7%",
    },
    {
      Name: null,
      "Hire date": "17-SEP-03",
      Job: "Assistant",
      Salary: "4400",
      "Department or unit": "10",
      "End-of_year-BONUS?": "17,51%",
    },
  ]);
  await sdb.done();
});
Deno.test("should remove duplicates from a table based on a specific column with special characters", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/employees.csv"]);

  await table.removeDuplicates({
    on: "Department or unit",
  });
  await table.sort({ Name: "asc" });
  const noDuplicates = await table.getData();

  assertEquals(noDuplicates, [
    {
      Name: "Austin, David",
      "Hire date": "NaN",
      Job: "Programmer",
      Salary: "4800",
      "Department or unit": "null",
      "End-of_year-BONUS?": "6,89%",
    },
    {
      Name: "Greenberg, Nancy",
      "Hire date": "17-AUG-02",
      Job: "Manager",
      Salary: "12008",
      "Department or unit": "100",
      "End-of_year-BONUS?": "74,69%",
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
      Name: "Higgins, Shelley",
      "Hire date": "07-JUN-02",
      Job: "Manager",
      Salary: "12008",
      "Department or unit": "110",
      "End-of_year-BONUS?": "17,09%",
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
      Name: "Kaufling, Payam",
      "Hire date": "01-MAY-03",
      Job: "Manager",
      Salary: "7900",
      "Department or unit": "undefined",
      "End-of_year-BONUS?": "21,33%",
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
      Name: "Mavris, Susan",
      "Hire date": "07-JUN-02",
      Job: "Salesperson",
      Salary: "6500",
      "Department or unit": "40",
      "End-of_year-BONUS?": "23,47%",
    },
    {
      Name: "NaN",
      "Hire date": "07-JUN-02",
      Job: "Salesperson",
      Salary: "10000",
      "Department or unit": "xyz",
      "End-of_year-BONUS?": "17,63%",
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
      Name: "Philtanker, Hazel",
      "Hire date": "06-FEB-08",
      Job: "Clerk",
      Salary: "2200",
      "Department or unit": "NaN",
      "End-of_year-BONUS?": "24,17%",
    },
    {
      Name: "Raphaely, Den",
      "Hire date": "07-DEC-02",
      Job: "Manager",
      Salary: "11000",
      "Department or unit": "30",
      "End-of_year-BONUS?": "3,35%",
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
      Name: null,
      "Hire date": "17-SEP-03",
      Job: "Assistant",
      Salary: "4400",
      "Department or unit": "10",
      "End-of_year-BONUS?": "17,51%",
    },
  ]);
  await sdb.done();
});
