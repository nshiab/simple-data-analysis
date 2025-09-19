import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should return one column", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/employees.csv"]);

  await table.selectColumns("Name");
  const data = await table.getData();

  assertEquals(data, [
    { Name: "OConnell, Donald" },
    { Name: "OConnell, Donald" },
    { Name: "Grant, Douglas" },
    { Name: null },
    { Name: "Hartstein, Michael" },
    { Name: "Fay, Pat" },
    { Name: "Mavris, Susan" },
    { Name: "NaN" },
    { Name: "Higgins, Shelley" },
    { Name: "null" },
    { Name: "King, Steven" },
    { Name: "Kochhar, Neena" },
    { Name: "De Haan, Lex" },
    { Name: "Hunold, Alexander" },
    { Name: "Ernst, Bruce" },
    { Name: "Austin, David" },
    { Name: "Pataballa, Valli" },
    { Name: "Lorentz, Diana" },
    { Name: "Greenberg, Nancy" },
    { Name: "Faviet, Daniel" },
    { Name: "Chen, John" },
    { Name: "Sciarra, Ismael" },
    { Name: "Urman, Jose Manuel" },
    { Name: "Popp, Luis" },
    { Name: "Raphaely, Den" },
    { Name: "Khoo, Alexander" },
    { Name: "Baida, Shelli" },
    { Name: "Tobias, Sigal" },
    { Name: "Himuro, Guy" },
    { Name: "Colmenares, Karen" },
    { Name: "Weiss, Matthew" },
    { Name: "Fripp, Adam" },
    { Name: "Kaufling, Payam" },
    { Name: "Vollman, Shanta" },
    { Name: "Mourgos, Kevin" },
    { Name: "Nayer, Julia" },
    { Name: "Mikkilineni, Irene" },
    { Name: "Landry, James" },
    { Name: "Markle, Steven" },
    { Name: "Bissot, Laura" },
    { Name: "Atkinson, Mozhe" },
    { Name: "Marlow, James" },
    { Name: "Olson, TJ" },
    { Name: "undefined" },
    { Name: "Rogers, Michael" },
    { Name: "Gee, Ki" },
    { Name: "Philtanker, Hazel" },
    { Name: "Ladwig, Renske" },
    { Name: "Stiles, Stephen" },
    { Name: "Seo, John" },
    { Name: "Patel, Joshua" },
  ]);

  await sdb.done();
});

Deno.test("should return one column with spaces in its name", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/employees.csv"]);

  await table.selectColumns("Department or unit");
  const data = await table.getData();

  assertEquals(data, [
    { "Department or unit": "50" },
    { "Department or unit": "50" },
    { "Department or unit": "50" },
    { "Department or unit": "10" },
    { "Department or unit": "20" },
    { "Department or unit": "20" },
    { "Department or unit": "40" },
    { "Department or unit": "xyz" },
    { "Department or unit": "110" },
    { "Department or unit": "110" },
    { "Department or unit": "90" },
    { "Department or unit": "90" },
    { "Department or unit": "90" },
    { "Department or unit": "60" },
    { "Department or unit": "60" },
    { "Department or unit": "null" },
    { "Department or unit": "60" },
    { "Department or unit": "60" },
    { "Department or unit": "100" },
    { "Department or unit": "100" },
    { "Department or unit": "100" },
    { "Department or unit": "100" },
    { "Department or unit": "100" },
    { "Department or unit": "100" },
    { "Department or unit": "30" },
    { "Department or unit": "30" },
    { "Department or unit": "30" },
    { "Department or unit": null },
    { "Department or unit": "30" },
    { "Department or unit": "30" },
    { "Department or unit": "50" },
    { "Department or unit": "50" },
    { "Department or unit": "undefined" },
    { "Department or unit": "50" },
    { "Department or unit": "50" },
    { "Department or unit": "50" },
    { "Department or unit": "50" },
    { "Department or unit": "50" },
    { "Department or unit": "50" },
    { "Department or unit": "50" },
    { "Department or unit": "50" },
    { "Department or unit": "50" },
    { "Department or unit": "null" },
    { "Department or unit": "50" },
    { "Department or unit": "50" },
    { "Department or unit": "50" },
    { "Department or unit": "NaN" },
    { "Department or unit": "50" },
    { "Department or unit": "50" },
    { "Department or unit": "50" },
    { "Department or unit": "50" },
  ]);

  await sdb.done();
});

Deno.test("should return multiple columns", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/employees.csv"]);

  await table.selectColumns(["Name", "Salary"]);
  const data = await table.getData();

  assertEquals(data, [
    { Name: "OConnell, Donald", Salary: "2600" },
    { Name: "OConnell, Donald", Salary: "2600" },
    { Name: "Grant, Douglas", Salary: "NaN" },
    { Name: null, Salary: "4400" },
    { Name: "Hartstein, Michael", Salary: "13000" },
    { Name: "Fay, Pat", Salary: "6000" },
    { Name: "Mavris, Susan", Salary: "6500" },
    { Name: "NaN", Salary: "10000" },
    { Name: "Higgins, Shelley", Salary: "12008" },
    { Name: "null", Salary: "8300" },
    { Name: "King, Steven", Salary: "24000" },
    { Name: "Kochhar, Neena", Salary: "&6%" },
    { Name: "De Haan, Lex", Salary: "17000" },
    { Name: "Hunold, Alexander", Salary: "9000" },
    { Name: "Ernst, Bruce", Salary: "6000" },
    { Name: "Austin, David", Salary: "4800" },
    { Name: "Pataballa, Valli", Salary: null },
    { Name: "Lorentz, Diana", Salary: "4200" },
    { Name: "Greenberg, Nancy", Salary: "12008" },
    { Name: "Faviet, Daniel", Salary: "9000" },
    { Name: "Chen, John", Salary: "8200" },
    { Name: "Sciarra, Ismael", Salary: "7700" },
    { Name: "Urman, Jose Manuel", Salary: "7800" },
    { Name: "Popp, Luis", Salary: "6900" },
    { Name: "Raphaely, Den", Salary: "11000" },
    { Name: "Khoo, Alexander", Salary: "3100" },
    { Name: "Baida, Shelli", Salary: "2900" },
    { Name: "Tobias, Sigal", Salary: "2800" },
    { Name: "Himuro, Guy", Salary: "2600" },
    { Name: "Colmenares, Karen", Salary: "2500" },
    { Name: "Weiss, Matthew", Salary: "8000" },
    { Name: "Fripp, Adam", Salary: "8200" },
    { Name: "Kaufling, Payam", Salary: "7900" },
    { Name: "Vollman, Shanta", Salary: "6500" },
    { Name: "Mourgos, Kevin", Salary: "5800" },
    { Name: "Nayer, Julia", Salary: "3200" },
    { Name: "Mikkilineni, Irene", Salary: "2700" },
    { Name: "Landry, James", Salary: "2400" },
    { Name: "Markle, Steven", Salary: "2200" },
    { Name: "Bissot, Laura", Salary: "3300" },
    { Name: "Atkinson, Mozhe", Salary: "undefined" },
    { Name: "Marlow, James", Salary: "2500" },
    { Name: "Olson, TJ", Salary: "2100" },
    { Name: "undefined", Salary: "3300" },
    { Name: "Rogers, Michael", Salary: "2900" },
    { Name: "Gee, Ki", Salary: "2400" },
    { Name: "Philtanker, Hazel", Salary: "2200" },
    { Name: "Ladwig, Renske", Salary: "3600" },
    { Name: "Stiles, Stephen", Salary: "3200" },
    { Name: "Seo, John", Salary: "2700" },
    { Name: "Patel, Joshua", Salary: "2500" },
  ]);

  await sdb.done();
});
