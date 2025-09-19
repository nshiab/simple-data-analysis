import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import SimpleTable from "../../../src/class/SimpleTable.ts";

Deno.test("should load an array of objects into a table", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadArray([
    {
      key1: 1,
      key2: "un",
      key3: new Date("2010-01-01"),
      key4: true,
    },
    {
      key1: NaN,
      key2: "deux",
      key3: new Date("2010-01-02"),
      key4: null,
    },
    {
      key1: 3,
      key2: undefined,
      key3: new Date("2010-01-03"),
      key4: false,
    },
    {
      key1: 4,
      key2: "quatre",
      key3: new Date("2010-01-04"),
      key4: false,
    },
  ]);

  const data = await table.getData();

  assertEquals(data, [
    { key1: 1, key2: "un", key3: new Date("2010-01-01"), key4: true },
    {
      key1: null,
      key2: "deux",
      key3: new Date("2010-01-02"),
      key4: null,
    },
    { key1: 3, key2: null, key3: new Date("2010-01-03"), key4: false },
    {
      key1: 4,
      key2: "quatre",
      key3: new Date("2010-01-04"),
      key4: false,
    },
  ]);

  await sdb.done();
});

Deno.test("should load an array of objects into a table and return the table", async () => {
  const sdb = new SimpleDB();
  const table = await sdb.newTable().loadArray([
    {
      key1: 1,
      key2: "un",
      key3: new Date("2010-01-01"),
      key4: true,
    },
    {
      key1: NaN,
      key2: "deux",
      key3: new Date("2010-01-02"),
      key4: null,
    },
    {
      key1: 3,
      key2: undefined,
      key3: new Date("2010-01-03"),
      key4: false,
    },
    {
      key1: 4,
      key2: "quatre",
      key3: new Date("2010-01-04"),
      key4: false,
    },
  ]);

  assertEquals(table instanceof SimpleTable, true);
  await sdb.done();
});

Deno.test("should load an array of objects into a table with spaces in column names", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadArray([
    {
      "column 1": 1,
      "column 2": "un",
    },
    {
      "column 1": 2,
      "column 2": "deux",
    },
    {
      "column 1": 3,
      "column 2": "trois",
    },
    {
      "column 1": 4,
      "column 2": "quatre",
    },
  ]);

  const data = await table.getData();

  assertEquals(data, [
    {
      "column 1": 1,
      "column 2": "un",
    },
    {
      "column 1": 2,
      "column 2": "deux",
    },
    {
      "column 1": 3,
      "column 2": "trois",
    },
    {
      "column 1": 4,
      "column 2": "quatre",
    },
  ]);

  await sdb.done();
});
Deno.test("should load an array of objects even if the first rows have null values", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadArray([
    {
      "column 1": 1,
      "column 2": null,
    },
    {
      "column 1": 2,
      "column 2": "deux",
    },
    {
      "column 1": 3,
      "column 2": "trois",
    },
    {
      "column 1": 4,
      "column 2": "quatre",
    },
  ]);

  const data = await table.getData();

  assertEquals(data, [
    {
      "column 1": 1,
      "column 2": null,
    },
    {
      "column 1": 2,
      "column 2": "deux",
    },
    {
      "column 1": 3,
      "column 2": "trois",
    },
    {
      "column 1": 4,
      "column 2": "quatre",
    },
  ]);

  await sdb.done();
});
