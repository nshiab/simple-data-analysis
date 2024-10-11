import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

const sdb = new SimpleDB();

Deno.test("should untidy data by expanding mutiple columns", async () => {
  const table = sdb.newTable();
  await table.loadData("test/data/files/dataTidy.json");
  await table.wider("year", "employees");

  await table.sort({ Department: "asc" });
  const data = await table.getData();

  assertEquals(data, [
    {
      "2015": 1,
      "2016": 2,
      "2017": 5,
      "2018": 2,
      "2019": 2,
      "2020": 3,
      Department: "R&D",
    },
    {
      "2015": 10,
      "2016": 9,
      "2017": 15,
      "2018": 11,
      "2019": 25,
      "2020": 32,
      Department: "accounting",
    },
    {
      "2015": 2,
      "2016": 7,
      "2017": 15,
      "2018": 32,
      "2019": 45,
      "2020": 27,
      Department: "sales",
    },
  ]);
});
Deno.test("should untidy data by expanding mutiple columns with spaces in their names", async () => {
  const table = sdb.newTable();
  await table.loadArray([
    {
      Department: "accounting",
      "approximate year": "2015",
      "employees full-time": 10,
    },
    {
      Department: "accounting",
      "approximate year": "2016",
      "employees full-time": 9,
    },
    {
      Department: "accounting",
      "approximate year": "2017",
      "employees full-time": 15,
    },
    {
      Department: "accounting",
      "approximate year": "2018",
      "employees full-time": 11,
    },
    {
      Department: "accounting",
      "approximate year": "2019",
      "employees full-time": 25,
    },
    {
      Department: "accounting",
      "approximate year": "2020",
      "employees full-time": 32,
    },
    {
      Department: "R&D",
      "approximate year": "2015",
      "employees full-time": 1,
    },
    {
      Department: "R&D",
      "approximate year": "2016",
      "employees full-time": 2,
    },
    {
      Department: "R&D",
      "approximate year": "2017",
      "employees full-time": 5,
    },
    {
      Department: "R&D",
      "approximate year": "2018",
      "employees full-time": 2,
    },
    {
      Department: "R&D",
      "approximate year": "2019",
      "employees full-time": 2,
    },
    {
      Department: "R&D",
      "approximate year": "2020",
      "employees full-time": 3,
    },
    {
      Department: "sales",
      "approximate year": "2015",
      "employees full-time": 2,
    },
    {
      Department: "sales",
      "approximate year": "2016",
      "employees full-time": 7,
    },
    {
      Department: "sales",
      "approximate year": "2017",
      "employees full-time": 15,
    },
    {
      Department: "sales",
      "approximate year": "2018",
      "employees full-time": 32,
    },
    {
      Department: "sales",
      "approximate year": "2019",
      "employees full-time": 45,
    },
    {
      Department: "sales",
      "approximate year": "2020",
      "employees full-time": 27,
    },
  ]);
  await table.wider("approximate year", "employees full-time");

  await table.sort({ Department: "asc" });
  const data = await table.getData();

  assertEquals(data, [
    {
      "2015": 1,
      "2016": 2,
      "2017": 5,
      "2018": 2,
      "2019": 2,
      "2020": 3,
      Department: "R&D",
    },
    {
      "2015": 10,
      "2016": 9,
      "2017": 15,
      "2018": 11,
      "2019": 25,
      "2020": 32,
      Department: "accounting",
    },
    {
      "2015": 2,
      "2016": 7,
      "2017": 15,
      "2018": 32,
      "2019": 45,
      "2020": 27,
      Department: "sales",
    },
  ]);
});

await sdb.done();
