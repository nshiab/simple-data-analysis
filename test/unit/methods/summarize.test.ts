import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should summarize all rows (no option values)", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/dataSummarize.json");
  await table.summarize();
  const data = await table.getData();
  assertEquals(data, [{ count: 6 }]);
  await sdb.done();
});
Deno.test("should summarize all rows into a new table", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/dataSummarize.json");
  const summaryAllRows = await table.summarize({
    categories: "key1",
    outputTable: "summaryAllRows",
  });
  const data = await summaryAllRows.getData();
  assertEquals(data, [
    { key1: "Banane", count: 2 },
    { key1: "Fraise", count: 2 },
    { key1: "Rubarbe", count: 2 },
  ]);
  await sdb.done();
});
Deno.test("should summarize all rows into a new table, even if column names have spaces", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/dataSummarize.json");
  await table.renameColumns({
    "key1": "key 1",
    "key2": "key 2",
    "key3": "key 3",
  });

  const summaryAllRows = await table.summarize({
    values: "key 2",
    categories: "key 1",
    outputTable: "summaryAllRows",
  });

  const data = await summaryAllRows.getData();
  assertEquals(data, [
    {
      value: "key 2",
      "key 1": "Banane",
      count: 2,
      countUnique: 0,
      countNull: 2,
      min: null,
      max: null,
      mean: null,
      median: null,
      sum: null,
      skew: null,
      stdDev: null,
      var: null,
    },
    {
      value: "key 2",
      "key 1": "Fraise",
      count: 2,
      countUnique: 2,
      countNull: 0,
      min: 11,
      max: 22,
      mean: 16.5,
      median: 16.5,
      sum: 33,
      skew: null,
      stdDev: 7.7781745930520225,
      var: 60.5,
    },
    {
      value: "key 2",
      "key 1": "Rubarbe",
      count: 2,
      countUnique: 2,
      countNull: 0,
      min: 1,
      max: 2,
      mean: 1.5,
      median: 1.5,
      sum: 3,
      skew: null,
      stdDev: 0.7071067811865476,
      var: 0.5,
    },
  ]);
  await sdb.done();
});
Deno.test("should summarize all rows into a new table and the original table shouldn't be modified", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/dataSummarize.json");
  const beforeData = await table.getData();
  await table.summarize({
    categories: "key1",
    outputTable: "summaryAllRows",
  });
  const afterData = await table.getData();
  assertEquals(beforeData, afterData);
  await sdb.done();
});

Deno.test("should summarize all columns in a table and overwrite the table", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/dataSummarize.json");
  await table.summarize({ values: await table.getColumns() });
  const data = await table.getData();

  assertEquals(data, [
    {
      value: "key1",
      count: 6,
      countUnique: 3,
      countNull: 0,
      min: null,
      max: null,
      mean: null,
      median: null,
      sum: null,
      skew: null,
      stdDev: null,
      var: null,
    },
    {
      value: "key2",
      count: 6,
      countUnique: 4,
      countNull: 2,
      min: 1,
      max: 22,
      mean: 9,
      median: 6.5,
      sum: 36,
      skew: 0.9668861556278396,
      stdDev: 9.763879010584539,
      var: 95.33333333333333,
    },
    {
      value: "key3",
      count: 6,
      countUnique: 4,
      countNull: 2,
      min: 2.345,
      max: 12.3434,
      mean: 7.438525,
      median: 7.53285,
      sum: 29.7541,
      skew: -0.057065942564767755,
      stdDev: 4.747895967250477,
      var: 22.542516115833337,
    },
  ]);
  await sdb.done();
});

Deno.test("should summarize with 2 decimals all columns in a table and overwrite the table", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/dataSummarize.json");
  await table.summarize({ values: await table.getColumns(), decimals: 2 });
  const data = await table.getData();

  assertEquals(data, [
    {
      value: "key1",
      count: 6,
      countUnique: 3,
      countNull: 0,
      min: null,
      max: null,
      mean: null,
      median: null,
      sum: null,
      skew: null,
      stdDev: null,
      var: null,
    },
    {
      value: "key2",
      count: 6,
      countUnique: 4,
      countNull: 2,
      min: 1,
      max: 22,
      mean: 9,
      median: 6.5,
      sum: 36,
      skew: 0.97,
      stdDev: 9.76,
      var: 95.33,
    },
    {
      value: "key3",
      count: 6,
      countUnique: 4,
      countNull: 2,
      min: 2.35,
      max: 12.34,
      mean: 7.44,
      median: 7.53,
      sum: 29.75,
      skew: -0.06,
      stdDev: 4.75,
      var: 22.54,
    },
  ]);
  await sdb.done();
});

Deno.test("should summarize all columns in a table and output the results in another table", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/dataSummarize.json");
  const newTable = await table.summarize({
    values: await table.getColumns(),
    decimals: 2,
    outputTable: true,
  });
  const data = await newTable.getData();

  assertEquals(data, [
    {
      value: "key1",
      count: 6,
      countUnique: 3,
      countNull: 0,
      min: null,
      max: null,
      mean: null,
      median: null,
      sum: null,
      skew: null,
      stdDev: null,
      var: null,
    },
    {
      value: "key2",
      count: 6,
      countUnique: 4,
      countNull: 2,
      min: 1,
      max: 22,
      mean: 9,
      median: 6.5,
      sum: 36,
      skew: 0.97,
      stdDev: 9.76,
      var: 95.33,
    },
    {
      value: "key3",
      count: 6,
      countUnique: 4,
      countNull: 2,
      min: 2.35,
      max: 12.34,
      mean: 7.44,
      median: 7.53,
      sum: 29.75,
      skew: -0.06,
      stdDev: 4.75,
      var: 22.54,
    },
  ]);
  await sdb.done();
});

Deno.test("should summarize all columns in a table and output the results in another table with a specific name in the DB", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/dataSummarize.json");
  await table.summarize({
    values: await table.getColumns(),
    decimals: 2,
    outputTable: "newTable",
  });
  const data = await sdb.customQuery("select * from newTable", {
    returnDataFrom: "query",
  });

  assertEquals(data, [
    {
      value: "key1",
      count: 6,
      countUnique: 3,
      countNull: 0,
      min: null,
      max: null,
      mean: null,
      median: null,
      sum: null,
      skew: null,
      stdDev: null,
      var: null,
    },
    {
      value: "key2",
      count: 6,
      countUnique: 4,
      countNull: 2,
      min: 1,
      max: 22,
      mean: 9,
      median: 6.5,
      sum: 36,
      skew: 0.97,
      stdDev: 9.76,
      var: 95.33,
    },
    {
      value: "key3",
      count: 6,
      countUnique: 4,
      countNull: 2,
      min: 2.35,
      max: 12.34,
      mean: 7.44,
      median: 7.53,
      sum: 29.75,
      skew: -0.06,
      stdDev: 4.75,
      var: 22.54,
    },
  ]);
  await sdb.done();
});

Deno.test("should summarize specific columns in a table", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/dataSummarize.json");
  await table.summarize({
    decimals: 2,
    values: "key2",
  });
  const data = await table.getData();

  assertEquals(data, [
    {
      value: "key2",
      count: 6,
      countUnique: 4,
      countNull: 2,
      min: 1,
      max: 22,
      mean: 9,
      median: 6.5,
      sum: 36,
      skew: 0.97,
      stdDev: 9.76,
      var: 95.33,
    },
  ]);
  await sdb.done();
});

Deno.test("should summarize specific columns in a table with a specific number of decimals", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/dataSummarize.json");
  await table.summarize({
    values: "key2",
    decimals: 4,
  });
  const data = await table.getData();

  assertEquals(data, [
    {
      value: "key2",
      count: 6,
      countUnique: 4,
      countNull: 2,
      min: 1,
      max: 22,
      mean: 9,
      median: 6.5,
      sum: 36,
      skew: 0.9669,
      stdDev: 9.7639,
      var: 95.3333,
    },
  ]);
  await sdb.done();
});
Deno.test("should summarize and output a table without the column value, when only one column is aggregated", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/dataSummarize.json");
  await table.summarize({
    values: "key2",
    decimals: 4,
    noColumnValue: true,
  });
  const data = await table.getData();

  assertEquals(data, [
    {
      count: 6,
      countUnique: 4,
      countNull: 2,
      min: 1,
      max: 22,
      mean: 9,
      median: 6.5,
      sum: 36,
      skew: 0.9669,
      stdDev: 9.7639,
      var: 95.3333,
    },
  ]);
  await sdb.done();
});
Deno.test("should summarize and output a table without the column value, when only one column is aggregated and with categories", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/dataSummarize.json");
  await table.summarize({
    values: "key2",
    categories: "key1",
    decimals: 4,
    noColumnValue: true,
  });
  const data = await table.getData();

  assertEquals(data, [
    {
      key1: "Banane",
      count: 2,
      countUnique: 0,
      countNull: 2,
      min: null,
      max: null,
      mean: null,
      median: null,
      sum: null,
      skew: null,
      stdDev: null,
      var: null,
    },
    {
      key1: "Fraise",
      count: 2,
      countUnique: 2,
      countNull: 0,
      min: 11,
      max: 22,
      mean: 16.5,
      median: 16.5,
      sum: 33,
      skew: null,
      stdDev: 7.7782,
      var: 60.5,
    },
    {
      key1: "Rubarbe",
      count: 2,
      countUnique: 2,
      countNull: 0,
      min: 1,
      max: 2,
      mean: 1.5,
      median: 1.5,
      sum: 3,
      skew: null,
      stdDev: 0.7071,
      var: 0.5,
    },
  ]);
  await sdb.done();
});

Deno.test("should summarize all columns in a table with a non numeric category", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/dataSummarize.json");
  await table.summarize({
    values: await table.getColumns(),
    decimals: 2,
    categories: "key1",
  });

  const data = await table.getData();

  assertEquals(data, [
    {
      value: "key2",
      key1: "Banane",
      count: 2,
      countUnique: 0,
      countNull: 2,
      min: null,
      max: null,
      mean: null,
      median: null,
      sum: null,
      skew: null,
      stdDev: null,
      var: null,
    },
    {
      value: "key2",
      key1: "Fraise",
      count: 2,
      countUnique: 2,
      countNull: 0,
      min: 11,
      max: 22,
      mean: 16.5,
      median: 16.5,
      sum: 33,
      skew: null,
      stdDev: 7.78,
      var: 60.5,
    },
    {
      value: "key2",
      key1: "Rubarbe",
      count: 2,
      countUnique: 2,
      countNull: 0,
      min: 1,
      max: 2,
      mean: 1.5,
      median: 1.5,
      sum: 3,
      skew: null,
      stdDev: 0.71,
      var: 0.5,
    },
    {
      value: "key3",
      key1: "Banane",
      count: 2,
      countUnique: 0,
      countNull: 2,
      min: null,
      max: null,
      mean: null,
      median: null,
      sum: null,
      skew: null,
      stdDev: null,
      var: null,
    },
    {
      value: "key3",
      key1: "Fraise",
      count: 2,
      countUnique: 2,
      countNull: 0,
      min: 2.35,
      max: 12.34,
      mean: 7.34,
      median: 7.34,
      sum: 14.69,
      skew: null,
      stdDev: 7.07,
      var: 49.98,
    },
    {
      value: "key3",
      key1: "Rubarbe",
      count: 2,
      countUnique: 2,
      countNull: 0,
      min: 4.57,
      max: 10.5,
      mean: 7.53,
      median: 7.53,
      sum: 15.07,
      skew: null,
      stdDev: 4.2,
      var: 17.61,
    },
  ]);
  await sdb.done();
});
Deno.test("should summarize all columns in a table with a numeric category", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/dataSummarize.json");
  await table.summarize({
    values: await table.getColumns(),
    decimals: 2,
    categories: "key2",
  });
  const data = await table.getData();

  assertEquals(data, [
    {
      value: "key1",
      key2: 1,
      count: 1,
      countUnique: 1,
      countNull: 0,
      min: null,
      max: null,
      mean: null,
      median: null,
      sum: null,
      skew: null,
      stdDev: null,
      var: null,
    },
    {
      value: "key1",
      key2: 2,
      count: 1,
      countUnique: 1,
      countNull: 0,
      min: null,
      max: null,
      mean: null,
      median: null,
      sum: null,
      skew: null,
      stdDev: null,
      var: null,
    },
    {
      value: "key1",
      key2: 11,
      count: 1,
      countUnique: 1,
      countNull: 0,
      min: null,
      max: null,
      mean: null,
      median: null,
      sum: null,
      skew: null,
      stdDev: null,
      var: null,
    },
    {
      value: "key1",
      key2: 22,
      count: 1,
      countUnique: 1,
      countNull: 0,
      min: null,
      max: null,
      mean: null,
      median: null,
      sum: null,
      skew: null,
      stdDev: null,
      var: null,
    },
    {
      value: "key1",
      key2: null,
      count: 2,
      countUnique: 1,
      countNull: 0,
      min: null,
      max: null,
      mean: null,
      median: null,
      sum: null,
      skew: null,
      stdDev: null,
      var: null,
    },
    {
      value: "key3",
      key2: 1,
      count: 1,
      countUnique: 1,
      countNull: 0,
      min: 10.5,
      max: 10.5,
      mean: 10.5,
      median: 10.5,
      sum: 10.5,
      skew: null,
      stdDev: null,
      var: null,
    },
    {
      value: "key3",
      key2: 2,
      count: 1,
      countUnique: 1,
      countNull: 0,
      min: 4.57,
      max: 4.57,
      mean: 4.57,
      median: 4.57,
      sum: 4.57,
      skew: null,
      stdDev: null,
      var: null,
    },
    {
      value: "key3",
      key2: 11,
      count: 1,
      countUnique: 1,
      countNull: 0,
      min: 2.35,
      max: 2.35,
      mean: 2.35,
      median: 2.35,
      sum: 2.35,
      skew: null,
      stdDev: null,
      var: null,
    },
    {
      value: "key3",
      key2: 22,
      count: 1,
      countUnique: 1,
      countNull: 0,
      min: 12.34,
      max: 12.34,
      mean: 12.34,
      median: 12.34,
      sum: 12.34,
      skew: null,
      stdDev: null,
      var: null,
    },
    {
      value: "key3",
      key2: null,
      count: 2,
      countUnique: 0,
      countNull: 2,
      min: null,
      max: null,
      mean: null,
      median: null,
      sum: null,
      skew: null,
      stdDev: null,
      var: null,
    },
  ]);
  await sdb.done();
});

Deno.test("should summarize all columns in a table with specific summaries", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/dataSummarize.json");
  await table.summarize({
    values: await table.getColumns(),
    decimals: 2,
    summaries: ["mean", "count"],
  });
  const data = await table.getData();

  assertEquals(data, [
    { value: "key1", mean: null, count: 6 },
    { value: "key2", mean: 9, count: 6 },
    { value: "key3", mean: 7.44, count: 6 },
  ]);
  await sdb.done();
});
Deno.test("should summarize all columns in a table with specific summaries in specific new columns", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/dataSummarize.json");
  await table.summarize({
    values: await table.getColumns(),
    decimals: 2,
    summaries: { "average": "mean", "total": "count" },
  });
  const data = await table.getData();

  assertEquals(data, [
    { value: "key1", average: null, total: 6 },
    { value: "key2", average: 9, total: 6 },
    { value: "key3", average: 7.44, total: 6 },
  ]);
  await sdb.done();
});
Deno.test("should summarize all columns in a table with specific summaries and specific categories", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/dataSummarize.json");
  await table.summarize({
    values: await table.getColumns(),
    decimals: 2,
    categories: "key1",
    summaries: ["mean", "count"],
  });
  const data = await table.getData();

  assertEquals(data, [
    { value: "key2", key1: "Banane", mean: null, count: 2 },
    { value: "key2", key1: "Fraise", mean: 16.5, count: 2 },
    { value: "key2", key1: "Rubarbe", mean: 1.5, count: 2 },
    { value: "key3", key1: "Banane", mean: null, count: 2 },
    { value: "key3", key1: "Fraise", mean: 7.34, count: 2 },
    { value: "key3", key1: "Rubarbe", mean: 7.53, count: 2 },
  ]);
  await sdb.done();
});
Deno.test("should summarize all columns in a table with specific summaries and columns names, based on specific categories", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/dataSummarize.json");
  await table.summarize({
    values: await table.getColumns(),
    decimals: 2,
    categories: "key1",
    summaries: { "average": "mean", "total": "count" },
  });
  const data = await table.getData();

  assertEquals(data, [
    { value: "key2", key1: "Banane", average: null, total: 2 },
    { value: "key2", key1: "Fraise", average: 16.5, total: 2 },
    { value: "key2", key1: "Rubarbe", average: 1.5, total: 2 },
    { value: "key3", key1: "Banane", average: null, total: 2 },
    { value: "key3", key1: "Fraise", average: 7.34, total: 2 },
    { value: "key3", key1: "Rubarbe", average: 7.53, total: 2 },
  ]);
  await sdb.done();
});
Deno.test("should summarize specific columns in a table with specific summaries and specific categories", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/dataSummarize.json");
  await table.summarize({
    values: "key2",
    categories: "key1",
    summaries: ["mean", "count"],
  });
  const data = await table.getData();

  assertEquals(data, [
    { value: "key2", key1: "Banane", mean: null, count: 2 },
    { value: "key2", key1: "Fraise", mean: 16.5, count: 2 },
    { value: "key2", key1: "Rubarbe", mean: 1.5, count: 2 },
  ]);
  await sdb.done();
});
Deno.test("should summarize with multiple categories", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/dataSummarize.json");
  await table.summarize({
    decimals: 2,
    values: "key3",
    categories: ["key1", "key2"],
    summaries: ["mean", "count"],
  });
  const data = await table.getData();

  assertEquals(data, [
    { value: "key3", key1: "Banane", key2: null, mean: null, count: 2 },
    { value: "key3", key1: "Fraise", key2: 11, mean: 2.35, count: 1 },
    { value: "key3", key1: "Fraise", key2: 22, mean: 12.34, count: 1 },
    { value: "key3", key1: "Rubarbe", key2: 1, mean: 10.5, count: 1 },
    { value: "key3", key1: "Rubarbe", key2: 2, mean: 4.57, count: 1 },
  ]);
  await sdb.done();
});

Deno.test("should summarize with dates", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadArray([
    { keyA: new Date("2023-01-01") },
    { keyA: new Date("2022-01-01") },
    { keyA: new Date("2022-01-01") },
    { keyA: new Date("2021-01-01") },
    { keyA: null },
  ]);

  await table.summarize({ values: "keyA" });
  const data = await table.getData();

  assertEquals(data, [
    {
      value: "keyA",
      count: 5,
      countUnique: 3,
      countNull: 1,
      min: new Date("2021-01-01"),
      max: new Date("2023-01-01"),
      mean: null,
      median: new Date("2022-01-01"),
      sum: null,
      skew: null,
      stdDev: null,
      var: null,
    },
  ]);
  await sdb.done();
});

Deno.test("should summarize with dates converted to milliseconds", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadArray([
    { keyA: new Date("2023-01-01") },
    { keyA: new Date("2022-01-01") },
    { keyA: new Date("2022-01-01") },
    { keyA: new Date("2021-01-01") },
    { keyA: null },
  ]);

  await table.summarize({ values: "keyA", toMs: true });
  const data = await table.getData();

  assertEquals(data, [
    {
      value: "keyA",
      count: 5,
      countUnique: 3,
      countNull: 1,
      min: 1609459200000,
      max: 1672531200000,
      mean: 1640995200000,
      median: 1640995200000,
      sum: 6563980800000,
      skew: -1.8441043680151512e-10,
      stdDev: 25749036176.13677,
      var: 663012864000000000000,
    },
  ]);
  await sdb.done();
});

Deno.test("should summarize even with geometries", async () => {
  const sdb = new SimpleDB();
  const provinces = sdb.newTable();
  await provinces.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );
  await provinces.summarize({ values: await provinces.getColumns() });

  const data = await provinces.getData();

  assertEquals(data, [
    {
      value: "geom",
      count: null,
      countUnique: null,
      countNull: null,
      min: null,
      max: null,
      mean: null,
      median: null,
      sum: null,
      skew: null,
      stdDev: null,
      var: null,
    },
    {
      value: "nameEnglish",
      count: 13,
      countUnique: 13,
      countNull: 0,
      min: null,
      max: null,
      mean: null,
      median: null,
      sum: null,
      skew: null,
      stdDev: null,
      var: null,
    },
    {
      value: "nameFrench",
      count: 13,
      countUnique: 13,
      countNull: 0,
      min: null,
      max: null,
      mean: null,
      median: null,
      sum: null,
      skew: null,
      stdDev: null,
      var: null,
    },
  ]);
  await sdb.done();
});
