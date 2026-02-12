import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import SimpleTable from "../../../src/class/SimpleTable.ts";

Deno.test("should load data from a csv file and return the table", async () => {
  const sdb = new SimpleDB();
  const table = await sdb
    .newTable()
    .loadData(["test/data/files/data.csv"]);

  assertEquals(table instanceof SimpleTable, true);
  await sdb.done();
});
Deno.test("should load data from a csv file with a specific encoding and return the table", async () => {
  const sdb = new SimpleDB();
  const table = await sdb
    .newTable()
    .loadData(["test/data/files/data.csv"], { encoding: "latin-1" });

  assertEquals(table instanceof SimpleTable, true);
  await sdb.done();
});
Deno.test("should load data from a csv file with strict false", async () => {
  const sdb = new SimpleDB();
  const table = await sdb
    .newTable()
    .loadData(["test/data/files/data.csv"], { strict: false });

  assertEquals(table instanceof SimpleTable, true);
  await sdb.done();
});
Deno.test("should load data from a csv file", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/data.csv"]);

  const data = await table.getData();

  assertEquals(data, [
    { key1: "1", key2: "2" },
    { key1: "3", key2: "coucou" },
    { key1: "8", key2: "10" },
    { key1: "brioche", key2: "croissant" },
  ]);
  await sdb.done();
});
Deno.test("should load data from a csv file with a limit", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/data.csv"], {
    limit: 2,
  });

  const data = await table.getData();

  assertEquals(data, [
    { key1: "1", key2: "2" },
    { key1: "3", key2: "coucou" },
  ]);
  await sdb.done();
});
Deno.test("should load data from a compressed csv file", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/data.csv.gz"]);

  const data = await table.getData();

  assertEquals(data, [
    { key1: "1", key2: "2" },
    { key1: "3", key2: "coucou" },
    { key1: "8", key2: "10" },
    { key1: "brioche", key2: "croissant" },
  ]);
  await sdb.done();
});
Deno.test("should load data with dates", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/dataDates.csv"]);

  const data = await table.getData();

  assertEquals(data, [
    {
      date: new Date("2010-01-01T00:00:00.000Z"),
      datetime: new Date("2010-01-01T14:01:12.000Z"),
      datetimeWithMs: new Date("2010-01-01T14:12:12.014Z"),
      time: "14:12:12",
      timeMs: "14:12:12.014",
      weirdDatetime: "2010/01/01_14h_01min_12sec",
    },
    {
      date: new Date("2010-01-02T00:00:00.000Z"),
      datetime: new Date("2010-01-02T01:12:54.000Z"),
      datetimeWithMs: new Date("2010-01-02T01:12:54.955Z"),
      time: "01:12:54",
      timeMs: "01:12:54.955",
      weirdDatetime: "2010/01/02_01h_12min_54sec",
    },
    {
      date: new Date("2010-01-03T00:00:00.000Z"),
      datetime: new Date("2010-01-03T02:25:01.000Z"),
      datetimeWithMs: new Date("2010-01-03T02:25:01.111Z"),
      time: "02:25:01",
      timeMs: "02:25:01.111",
      weirdDatetime: "2010/01/03_02h_25min_54sec",
    },
    {
      date: new Date("2010-01-04T00:00:00.000Z"),
      datetime: new Date("2010-01-04T23:25:15.000Z"),
      datetimeWithMs: new Date("2010-01-04T12:01:15.123Z"),
      time: "12:01:15",
      timeMs: "12:01:15.123",
      weirdDatetime: "2010/01/04_23h_25min_15sec",
    },
  ]);
  await sdb.done();
});
Deno.test("should load data while keeping everything as text", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/dataDates.csv"], {
    allText: true,
  });

  const data = await table.getData();

  assertEquals(data, [
    {
      date: "2010-01-01",
      datetime: "2010-01-01 14:01:12",
      datetimeWithMs: "2010-01-01 14:12:12.014",
      time: "14:12:12",
      timeMs: "14:12:12.014",
      weirdDatetime: "2010/01/01_14h_01min_12sec",
    },
    {
      date: "2010-01-02",
      datetime: "2010-01-02 01:12:54",
      datetimeWithMs: "2010-01-02 01:12:54.955",
      time: "01:12:54",
      timeMs: "01:12:54.955",
      weirdDatetime: "2010/01/02_01h_12min_54sec",
    },
    {
      date: "2010-01-03",
      datetime: "2010-01-03 02:25:01",
      datetimeWithMs: "2010-01-03 02:25:01.111",
      time: "02:25:01",
      timeMs: "02:25:01.111",
      weirdDatetime: "2010/01/03_02h_25min_54sec",
    },
    {
      date: "2010-01-04",
      datetime: "2010-01-04 23:25:15",
      datetimeWithMs: "2010-01-04 12:01:15.123",
      time: "12:01:15",
      timeMs: "12:01:15.123",
      weirdDatetime: "2010/01/04_23h_25min_15sec",
    },
  ]);
  await sdb.done();
});
Deno.test("should load a messy csv", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/activefires.csv"], {
    nullPadding: true,
  });

  const data = await table.getTop(3);

  assertEquals(data, [
    {
      agency: "bc",
      firename: " G70149",
      lat: 55.642,
      lon: -121.444,
      startdate: " 2024-04-22 20:17:00",
      hectares: 0.2,
      stage_of_control: " UC",
      timezone: " PDT",
      response_type: " FUL",
    },
    {
      agency: "nb",
      firename: " 63424",
      lat: 46.309,
      lon: -66.718,
      startdate: " 2024-04-27 16:55:19",
      hectares: 0.1,
      stage_of_control: " UC",
      timezone: " ADT",
      response_type: " FUL",
    },
    {
      agency: "conus",
      firename: " Anvil - ORRSF",
      lat: 42.7458,
      lon: -124.344,
      startdate: " ",
      hectares: 8978.85,
      stage_of_control: " 95% contained",
      timezone: " GMT",
      response_type: null,
    },
  ]);
  await sdb.done();
});
Deno.test("should load data from a fetched csv file", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData([
    "https://raw.githubusercontent.com/nshiab/simple-data-analysis.js/main/test/data/files/data.csv",
  ]);

  const data = await table.getData();

  assertEquals(data, [
    { key1: "1", key2: "2" },
    { key1: "3", key2: "coucou" },
    { key1: "8", key2: "10" },
    { key1: "brioche", key2: "croissant" },
  ]);
  await sdb.done();
});
Deno.test("should load data from a csv file after skypping some lines at the top", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/dataExtraLines.csv"], {
    skip: 2,
  });
  const data = await table.getData();
  assertEquals(data, [
    { key1: "1", key2: "2" },
    { key1: "3", key2: "coucou" },
    { key1: "8", key2: "10" },
    { key1: "brioche", key2: "croissant" },
  ]);
  await sdb.done();
});
Deno.test("should load data from a tsv file", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/data.tsv"], {
    fileType: "dsv",
  });

  const data = await table.getData();

  assertEquals(data, [
    { key1: "1", key2: "2" },
    { key1: "3", key2: "coucou" },
    { key1: "8", key2: "10" },
    { key1: "brioche", key2: "croissant" },
  ]);
  await sdb.done();
});
Deno.test("should load data from a txt file", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/data.txt"], {
    fileType: "dsv",
  });

  const data = await table.getData();

  assertEquals(data, [
    { key1: "1", key2: "2" },
    { key1: "3", key2: "coucou" },
    { key1: "8", key2: "10" },
    { key1: "brioche", key2: "croissant" },
  ]);
  await sdb.done();
});
Deno.test("should load data from a compressed txt file", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/dataCsvCompressed.txt"], {
    fileType: "csv",
    compression: "gzip",
  });

  const data = await table.getData();

  assertEquals(data, [
    { key1: "1", key2: "2" },
    { key1: "3", key2: "coucou" },
    { key1: "8", key2: "10" },
    { key1: "brioche", key2: "croissant" },
  ]);
  await sdb.done();
});
Deno.test("should load data from a json file", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/data.json"]);

  const data = await table.getData();

  assertEquals(data, [
    {
      key1: 1,
      key2: "un",
    },
    {
      key1: 2,
      key2: "deux",
    },
    {
      key1: 3,
      key2: "trois",
    },
    {
      key1: 4,
      key2: "quatre",
    },
  ]);
  await sdb.done();
});

Deno.test("should load data from a json file with a limit", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/data.json"], {
    limit: 2,
  });

  const data = await table.getData();

  assertEquals(data, [
    {
      key1: 1,
      key2: "un",
    },
    {
      key1: 2,
      key2: "deux",
    },
  ]);
  await sdb.done();
});

Deno.test("should load data from a parquet file", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/data.parquet"]);

  const data = await table.getData();

  assertEquals(data, [
    {
      key1: 1,
      key2: "un",
    },
    {
      key1: 3,
      key2: "deux",
    },
    {
      key1: 8,
      key2: "trois",
    },
    {
      key1: 3,
      key2: "quatre",
    },
  ]);
  await sdb.done();
});

Deno.test("should load data from a parquet file", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/data.parquet"], {
    limit: 2,
  });

  const data = await table.getData();

  assertEquals(data, [
    {
      key1: 1,
      key2: "un",
    },
    {
      key1: 3,
      key2: "deux",
    },
  ]);
  await sdb.done();
});

Deno.test("should load data from a compressed parquet file", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/data.parquet"]);

  const data = await table.getData();

  assertEquals(data, [
    {
      key1: 1,
      key2: "un",
    },
    {
      key1: 3,
      key2: "deux",
    },
    {
      key1: 8,
      key2: "trois",
    },
    {
      key1: 3,
      key2: "quatre",
    },
  ]);
  await sdb.done();
});

Deno.test("should load data from multiple files", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData([
    "test/data/directory/data1.csv",
    "test/data/directory/data2.csv",
    "test/data/directory/data3.csv",
  ]);

  const data = await table.getData();

  assertEquals(data, [
    { key1: 1, key2: "un" },
    { key1: 2, key2: "deux" },
    { key1: 3, key2: "trois" },
    { key1: 4, key2: "quatre" },
    { key1: 5, key2: "cinq" },
    { key1: 6, key2: "six" },
    { key1: 7, key2: "sept" },
    { key1: 8, key2: "huit" },
    { key1: 9, key2: "neuf" },
    { key1: 10, key2: "dix" },
    { key1: 11, key2: "onze" },
  ]);
  await sdb.done();
});

Deno.test("should load data from multiple files and add a column with the file name.", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(
    [
      "test/data/directory/data1.csv",
      "test/data/directory/data2.csv",
      "test/data/directory/data3.csv",
    ],
    { fileName: true },
  );

  const data = await table.getData();

  assertEquals(data, [
    {
      key1: 1,
      key2: "un",
      filename: "test/data/directory/data1.csv",
    },
    {
      key1: 2,
      key2: "deux",
      filename: "test/data/directory/data1.csv",
    },
    {
      key1: 3,
      key2: "trois",
      filename: "test/data/directory/data1.csv",
    },
    {
      key1: 4,
      key2: "quatre",
      filename: "test/data/directory/data1.csv",
    },
    {
      key1: 5,
      key2: "cinq",
      filename: "test/data/directory/data2.csv",
    },
    {
      key1: 6,
      key2: "six",
      filename: "test/data/directory/data2.csv",
    },
    {
      key1: 7,
      key2: "sept",
      filename: "test/data/directory/data2.csv",
    },
    {
      key1: 8,
      key2: "huit",
      filename: "test/data/directory/data2.csv",
    },
    {
      key1: 9,
      key2: "neuf",
      filename: "test/data/directory/data3.csv",
    },
    {
      key1: 10,
      key2: "dix",
      filename: "test/data/directory/data3.csv",
    },
    {
      key1: 11,
      key2: "onze",
      filename: "test/data/directory/data3.csv",
    },
  ]);
  await sdb.done();
});

Deno.test("should load data from multiple files and unify the columns.", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(
    [
      "test/data/directory/data1.csv",
      "test/data/directory/data2.csv",
      "test/data/directory/data3.csv",
      "test/data/directory/data4ExtraColumn.csv",
    ],
    { unifyColumns: true },
  );

  const data = await table.getData();
  assertEquals(data, [
    { key1: 1, key2: "un", key3: null },
    { key1: 2, key2: "deux", key3: null },
    { key1: 3, key2: "trois", key3: null },
    { key1: 4, key2: "quatre", key3: null },
    { key1: 5, key2: "cinq", key3: null },
    { key1: 6, key2: "six", key3: null },
    { key1: 7, key2: "sept", key3: null },
    { key1: 8, key2: "huit", key3: null },
    { key1: 9, key2: "neuf", key3: null },
    { key1: 10, key2: "dix", key3: null },
    { key1: 11, key2: "onze", key3: null },
    { key1: 9, key2: "neuf", key3: "nine" },
    { key1: 10, key2: "dix", key3: "ten" },
    { key1: 11, key2: "onze", key3: "eleven" },
  ]);
  await sdb.done();
});

Deno.test("should load data from a json file with specific types for each column", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/data.json"], {
    columnTypes: {
      key1: "VARCHAR",
      key2: "VARCHAR",
    },
  });

  const data = await table.getData();

  assertEquals(data, [
    {
      key1: "1",
      key2: "un",
    },
    {
      key1: "2",
      key2: "deux",
    },
    {
      key1: "3",
      key2: "trois",
    },
    {
      key1: "4",
      key2: "quatre",
    },
  ]);
  await sdb.done();
});

Deno.test("should load data from a xlsx url", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData([
    "https://github.com/nshiab/simple-data-analysis/raw/main/test/data/files/populations-one-sheet.xlsx",
  ]);
  const data = await table.getData();

  assertEquals(data, [
    { Country: "Canada", "Population (million)": 38 },
    { Country: "US", "Population (million)": 332 },
    { Country: "France", "Population (million)": 68 },
  ]);
  await sdb.done();
});

Deno.test("should load data from a xlsx file", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/populations-one-sheet.xlsx"]);
  const data = await table.getData();

  assertEquals(data, [
    { Country: "Canada", "Population (million)": 38 },
    { Country: "US", "Population (million)": 332 },
    { Country: "France", "Population (million)": 68 },
  ]);
  await sdb.done();
});
Deno.test("should load data from a specific sheet in an xlsx file", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/populations-two-sheets.xlsx", {
    sheet: "provinces",
  });
  const data = await table.getData();

  assertEquals(data, [
    { Provinces: "Quebec", "Population (million)": 8 },
    { Provinces: "Ontario", "Population (million)": 15 },
    { Provinces: "British Columbia", "Population (million)": 5 },
  ]);
  await sdb.done();
});
Deno.test("should load data from a specific sheet in an xlsx file and all as text", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/populations-two-sheets.xlsx", {
    sheet: "provinces",
    allText: true,
  });
  const data = await table.getData();

  assertEquals(data, [
    { Provinces: "Quebec", "Population (million)": "8.0" },
    { Provinces: "Ontario", "Population (million)": "15.0" },
    { Provinces: "British Columbia", "Population (million)": "5.0" },
  ]);
  await sdb.done();
});
Deno.test("should load data from a specific sheet in an xlsx file and all as text without a header", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/populations-two-sheets.xlsx", {
    sheet: "provinces",
    allText: true,
    header: false,
  });
  const data = await table.getData();

  assertEquals(data, [
    { A1: "Provinces", B1: "Population (million)" },
    { A1: "Quebec", B1: "8.0" },
    { A1: "Ontario", B1: "15.0" },
    { A1: "British Columbia", B1: "5.0" },
  ]);
  await sdb.done();
});
