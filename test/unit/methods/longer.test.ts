import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should tidy data by stacking mutiple columns", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/dataUntidy.json");
  await table.longer(
    ["2015", "2016", "2017", "2018", "2019", "2020"],
    "year",
    "employees",
  );

  const data = await table.getData();
  assertEquals(data, [
    { Department: "accounting", year: "2015", employees: 10 },
    { Department: "accounting", year: "2016", employees: 9 },
    { Department: "accounting", year: "2017", employees: 15 },
    { Department: "accounting", year: "2018", employees: 11 },
    { Department: "accounting", year: "2019", employees: 25 },
    { Department: "accounting", year: "2020", employees: 32 },
    { Department: "R&D", year: "2015", employees: 1 },
    { Department: "R&D", year: "2016", employees: 2 },
    { Department: "R&D", year: "2017", employees: 5 },
    { Department: "R&D", year: "2018", employees: 2 },
    { Department: "R&D", year: "2019", employees: 2 },
    { Department: "R&D", year: "2020", employees: 3 },
    { Department: "sales", year: "2015", employees: 2 },
    { Department: "sales", year: "2016", employees: 7 },
    { Department: "sales", year: "2017", employees: 15 },
    { Department: "sales", year: "2018", employees: 32 },
    { Department: "sales", year: "2019", employees: 45 },
    { Department: "sales", year: "2020", employees: 27 },
  ]);
});
Deno.test("should tidy data by stacking mutiple columns with spaces in their names", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadArray([
    {
      "Department or unit": "accounting and others",
      "2015": 10,
      "2016": 9,
      "2017": 15,
      "2018": 11,
      "2019": 25,
      "2020": 32,
    },
    {
      "Department or unit": "R & D",
      "2015": 1,
      "2016": 2,
      "2017": 5,
      "2018": 2,
      "2019": 2,
      "2020": 3,
    },
    {
      "Department or unit": "sales and marketing",
      "2015": 2,
      "2016": 7,
      "2017": 15,
      "2018": 32,
      "2019": 45,
      "2020": 27,
    },
  ]);
  await table.longer(
    ["2015", "2016", "2017", "2018", "2019", "2020"],
    "multiples years",
    "employees full-time",
  );

  const data = await table.getData();

  assertEquals(data, [
    {
      "Department or unit": "accounting and others",
      "multiples years": "2015",
      "employees full-time": 10,
    },
    {
      "Department or unit": "accounting and others",
      "multiples years": "2016",
      "employees full-time": 9,
    },
    {
      "Department or unit": "accounting and others",
      "multiples years": "2017",
      "employees full-time": 15,
    },
    {
      "Department or unit": "accounting and others",
      "multiples years": "2018",
      "employees full-time": 11,
    },
    {
      "Department or unit": "accounting and others",
      "multiples years": "2019",
      "employees full-time": 25,
    },
    {
      "Department or unit": "accounting and others",
      "multiples years": "2020",
      "employees full-time": 32,
    },
    {
      "Department or unit": "R & D",
      "multiples years": "2015",
      "employees full-time": 1,
    },
    {
      "Department or unit": "R & D",
      "multiples years": "2016",
      "employees full-time": 2,
    },
    {
      "Department or unit": "R & D",
      "multiples years": "2017",
      "employees full-time": 5,
    },
    {
      "Department or unit": "R & D",
      "multiples years": "2018",
      "employees full-time": 2,
    },
    {
      "Department or unit": "R & D",
      "multiples years": "2019",
      "employees full-time": 2,
    },
    {
      "Department or unit": "R & D",
      "multiples years": "2020",
      "employees full-time": 3,
    },
    {
      "Department or unit": "sales and marketing",
      "multiples years": "2015",
      "employees full-time": 2,
    },
    {
      "Department or unit": "sales and marketing",
      "multiples years": "2016",
      "employees full-time": 7,
    },
    {
      "Department or unit": "sales and marketing",
      "multiples years": "2017",
      "employees full-time": 15,
    },
    {
      "Department or unit": "sales and marketing",
      "multiples years": "2018",
      "employees full-time": 32,
    },
    {
      "Department or unit": "sales and marketing",
      "multiples years": "2019",
      "employees full-time": 45,
    },
    {
      "Department or unit": "sales and marketing",
      "multiples years": "2020",
      "employees full-time": 27,
    },
  ]);
  await sdb.done();
});
Deno.test("should tidy data by stacking mutiple columns and by including null values", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/dataUntidyWithNulls.json");
  await table.longer(
    ["2015", "2016", "2017", "2018", "2019", "2020"],
    "year",
    "employees",
  );

  const data = await table.getData();

  assertEquals(data, [
    { Department: "accounting", year: "2015", employees: null },
    { Department: "accounting", year: "2016", employees: 9 },
    { Department: "accounting", year: "2017", employees: 15 },
    { Department: "accounting", year: "2018", employees: 11 },
    { Department: "accounting", year: "2019", employees: 25 },
    { Department: "accounting", year: "2020", employees: 32 },
    { Department: "R&D", year: "2015", employees: 1 },
    { Department: "R&D", year: "2016", employees: 2 },
    { Department: "R&D", year: "2017", employees: null },
    { Department: "R&D", year: "2018", employees: 2 },
    { Department: "R&D", year: "2019", employees: 2 },
    { Department: "R&D", year: "2020", employees: 3 },
    { Department: "sales", year: "2015", employees: 2 },
    { Department: "sales", year: "2016", employees: 7 },
    { Department: "sales", year: "2017", employees: 15 },
    { Department: "sales", year: "2018", employees: 32 },
    { Department: "sales", year: "2019", employees: 45 },
    { Department: "sales", year: "2020", employees: null },
  ]);
  await sdb.done();
});
