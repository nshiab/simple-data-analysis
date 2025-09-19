import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

const output = "./test/output/";
if (!existsSync(output)) {
  mkdirSync(output);
}

const expectedData = [
  { key1: "1", key2: "2" },
  { key1: "3", key2: "coucou" },
  { key1: "8", key2: "10" },
  { key1: "brioche", key2: "croissant" },
];

Deno.test("should write a csv file", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/data.csv");
  await table.writeData(`${output}test.csv`);

  // We test the content of the file
  const tableCheck = sdb.newTable();
  await tableCheck.loadData([`${output}test.csv`]);
  const data = await table.getData();

  assertEquals(data, expectedData);
  await sdb.done();
});

Deno.test("should write a csv file and create the path if it doesn't exist", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/data.csv");
  await table.writeData(`${output}subfolderData/test.csv`);

  // We test the content of the file
  const tableCheck = sdb.newTable();
  await tableCheck.loadData([`${output}subfolderData/test.csv`]);
  const data = await table.getData();

  assertEquals(data, expectedData);
  await sdb.done();
});

Deno.test("should write a compressed csv file", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/data.csv");
  await table.writeData(`${output}test.csv`, {
    compression: true,
  });

  // We test the content of the file
  const tableCheck = sdb.newTable();
  await tableCheck.loadData([`${output}test.csv.gz`]);
  const data = await tableCheck.getData();

  assertEquals(data, expectedData);
  await sdb.done();
});

Deno.test("should write a json file", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/data.csv");
  await table.writeData(`${output}test.json`);

  // We test the content of the file
  const tableCheck = sdb.newTable();
  await tableCheck.loadData([`${output}test.json`]);
  const data = await tableCheck.getData();

  assertEquals(data, expectedData);
  await sdb.done();
});
Deno.test("should write a json file with dates", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadArray([{ key1: new Date("2025-01-01T01:23:10.987Z") }, {
    key1: new Date("2025-04-08T14:09:24.155Z"),
  }]);

  await table.writeData(`${output}date-test.json`, { formatDates: true });

  // We test the content of the file
  const tableCheck = JSON.parse(
    readFileSync(`${output}date-test.json`, "utf-8"),
  );

  assertEquals(tableCheck, [
    { "key1": "2025-01-01T01:23:10.987Z" },
    { "key1": "2025-04-08T14:09:24.155Z" },
  ]);
  await sdb.done();
});
Deno.test("should write a json file with dates and keep the original table unchanged", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  const originalData = [{ key1: new Date("2025-01-01T01:23:10.987Z") }, {
    key1: new Date("2025-04-08T14:09:24.155Z"),
  }];
  await table.loadArray(originalData);

  await table.writeData(`${output}date-test.json`);

  const tableData = await table.getData();

  assertEquals(tableData, originalData);
  await sdb.done();
});
Deno.test("should write a compressed json file", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/data.csv");
  await table.writeData(`${output}test.json`, {
    compression: true,
  });

  // We test the content of the file
  const tableCheck = sdb.newTable();
  await tableCheck.loadData([`${output}test.json.gz`]);
  const data = await tableCheck.getData();

  assertEquals(data, expectedData);
  await sdb.done();
});

Deno.test("should write a parquet file", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/data.csv");
  await table.writeData(`${output}test.parquet`);

  // We test the content of the file
  const tableCheck = sdb.newTable();
  await tableCheck.loadData([`${output}test.parquet`]);
  const data = await tableCheck.getData();

  assertEquals(data, expectedData);
  await sdb.done();
});

Deno.test("should write a compressed parquet file", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/data.csv");
  await table.writeData(`${output}testCompressed.parquet`, {
    compression: true,
  });

  // We test the content of the file
  const tableCheck = sdb.newTable();
  await tableCheck.loadData([`${output}testCompressed.parquet`]);
  const data = await tableCheck.getData();

  assertEquals(data, expectedData);
  await sdb.done();
});

Deno.test("should write a file at the root", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/data.csv");
  await table.writeData(`testRoot.csv`);

  // We test the content of the file
  const tableCheck = sdb.newTable();
  await tableCheck.loadData("testRoot.csv");
  const data = await tableCheck.getData();

  assertEquals(data, expectedData);
  await sdb.done();
});

Deno.test("should write data as arrays", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/data.csv");
  await table.writeData(`${output}testRootArrays.json`, {
    dataAsArrays: true,
  });

  // We test the content of the file
  const data = JSON.parse(
    readFileSync(`${output}testRootArrays.json`, "utf-8"),
  );

  assertEquals(data, {
    key1: ["1", "3", "8", "brioche"],
    key2: ["2", "coucou", "10", "croissant"],
  });
  await sdb.done();
});
Deno.test("should write data as a db", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/data.csv");
  await table.writeData(`${output}data.db`);

  // Just making sure it doesn't throw
  assertEquals(true, true);
  await sdb.done();
});

Deno.test("should write data as a SQLite db", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/data.csv");
  await table.writeData(`${output}data.sqlite`);

  // Just making sure it doesn't throw
  assertEquals(true, true);
  await sdb.done();
});
