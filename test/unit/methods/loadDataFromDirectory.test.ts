import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import SimpleTable from "../../../src/class/SimpleTable.ts";

const sdb = new SimpleDB();

Deno.test("should load data from a directory and return the table", async () => {
  const table = await sdb
    .newTable()
    .loadDataFromDirectory("test/data/directory/", {
      unifyColumns: true,
    });

  assertEquals(table instanceof SimpleTable, true);
});
Deno.test("should load data from a directory", async () => {
  const table = sdb.newTable();
  await table.loadDataFromDirectory("test/data/directory/", {
    unifyColumns: true,
  });

  const data = await table.getData() as {
    key1: number;
    key2: string;
    key3: null | string;
  }[];

  assertEquals(
    data.sort((a, b) => a.key1 - b.key1),
    [
      { key1: 9, key2: "neuf", key3: null },
      { key1: 10, key2: "dix", key3: null },
      { key1: 11, key2: "onze", key3: null },
      { key1: 5, key2: "cinq", key3: null },
      { key1: 6, key2: "six", key3: null },
      { key1: 7, key2: "sept", key3: null },
      { key1: 8, key2: "huit", key3: null },
      { key1: 1, key2: "un", key3: null },
      { key1: 2, key2: "deux", key3: null },
      { key1: 3, key2: "trois", key3: null },
      { key1: 4, key2: "quatre", key3: null },
      { key1: 9, key2: "neuf", key3: "nine" },
      { key1: 10, key2: "dix", key3: "ten" },
      { key1: 11, key2: "onze", key3: "eleven" },
    ].sort((a, b) => a.key1 - b.key1),
  );
});
Deno.test("should load data from a directory even when the path doesn't have '/' at the end", async () => {
  const table = sdb.newTable();
  await table.loadDataFromDirectory("test/data/directory", {
    unifyColumns: true,
  });

  const data = await table.getData() as {
    key1: number;
    key2: string;
    key3: null | string;
  }[];

  assertEquals(
    data.sort((a, b) => a.key1 - b.key1),
    [
      { key1: 9, key2: "neuf", key3: null },
      { key1: 10, key2: "dix", key3: null },
      { key1: 11, key2: "onze", key3: null },
      { key1: 5, key2: "cinq", key3: null },
      { key1: 6, key2: "six", key3: null },
      { key1: 7, key2: "sept", key3: null },
      { key1: 8, key2: "huit", key3: null },
      { key1: 1, key2: "un", key3: null },
      { key1: 2, key2: "deux", key3: null },
      { key1: 3, key2: "trois", key3: null },
      { key1: 4, key2: "quatre", key3: null },
      { key1: 9, key2: "neuf", key3: "nine" },
      { key1: 10, key2: "dix", key3: "ten" },
      { key1: 11, key2: "onze", key3: "eleven" },
    ].sort((a, b) => a.key1 - b.key1),
  );
});
Deno.test("should load data from a directory with a limit option", async () => {
  const table = sdb.newTable();
  await table.loadDataFromDirectory("test/data/directory/", {
    unifyColumns: true,
    limit: 3,
  });

  const data = await table.getData();

  assertEquals(data, [
    { key1: 9, key2: "neuf", key3: null },
    { key1: 10, key2: "dix", key3: null },
    { key1: 11, key2: "onze", key3: null },
  ]);
});

await sdb.done();
