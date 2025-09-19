import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should normalize values in a column", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/dataSummarize.json");

  await table.normalize("key2", "normalized");
  await table.sort({ normalized: "asc" });

  const data = await table.getData();

  assertEquals(data, [
    { key1: "Rubarbe", key2: 1, key3: 10.5, normalized: 0 },
    {
      key1: "Rubarbe",
      key2: 2,
      key3: 4.5657,
      normalized: 0.047619047619047616,
    },
    {
      key1: "Fraise",
      key2: 11,
      key3: 2.345,
      normalized: 0.47619047619047616,
    },
    { key1: "Fraise", key2: 22, key3: 12.3434, normalized: 1 },
    { key1: "Banane", key2: null, key3: null, normalized: null },
    { key1: "Banane", key2: null, key3: null, normalized: null },
  ]);

  await sdb.done();
});

Deno.test("should normalize values in a column with two decimals", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/dataSummarize.json");

  await table.normalize("key2", "normalized", {
    decimals: 2,
  });
  await table.sort({ normalized: "asc" });

  const data = await table.getData();

  assertEquals(data, [
    { key1: "Rubarbe", key2: 1, key3: 10.5, normalized: 0 },
    { key1: "Rubarbe", key2: 2, key3: 4.5657, normalized: 0.05 },
    { key1: "Fraise", key2: 11, key3: 2.345, normalized: 0.48 },
    { key1: "Fraise", key2: 22, key3: 12.3434, normalized: 1 },
    { key1: "Banane", key2: null, key3: null, normalized: null },
    { key1: "Banane", key2: null, key3: null, normalized: null },
  ]);

  await sdb.done();
});

Deno.test("should normalize values in a column and keep 4 decimals", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/dataSummarize.json");

  await table.normalize("key2", "normalized", {
    decimals: 4,
  });
  await table.sort({ normalized: "asc" });

  const data = await table.getData();

  assertEquals(data, [
    { key1: "Rubarbe", key2: 1, key3: 10.5, normalized: 0 },
    { key1: "Rubarbe", key2: 2, key3: 4.5657, normalized: 0.0476 },
    { key1: "Fraise", key2: 11, key3: 2.345, normalized: 0.4762 },
    { key1: "Fraise", key2: 22, key3: 12.3434, normalized: 1 },
    { key1: "Banane", key2: null, key3: null, normalized: null },
    { key1: "Banane", key2: null, key3: null, normalized: null },
  ]);

  await sdb.done();
});

Deno.test("should normalize values in a column with categories", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/dataSummarize.json");

  await table.normalize("key2", "normalized", {
    categories: "key1",
  });
  await table.sort({ key3: "asc" });

  const data = await table.getData();

  assertEquals(data, [
    { key1: "Fraise", key2: 11, key3: 2.345, normalized: 0 },
    { key1: "Rubarbe", key2: 2, key3: 4.5657, normalized: 1 },
    { key1: "Rubarbe", key2: 1, key3: 10.5, normalized: 0 },
    { key1: "Fraise", key2: 22, key3: 12.3434, normalized: 1 },
    { key1: "Banane", key2: null, key3: null, normalized: null },
    { key1: "Banane", key2: null, key3: null, normalized: null },
  ]);

  await sdb.done();
});

Deno.test("should normalize data with positive and negative values", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadArray([
    { key1: -1 },
    { key1: -0.5 },
    { key1: 0 },
    { key1: 0.5 },
    { key1: 1 },
  ]);

  await table.normalize("key1", "normalized");
  await table.sort({ key1: "asc" });

  const data = await table.getData();

  assertEquals(data, [
    { key1: -1, normalized: 0 },
    { key1: -0.5, normalized: 0.25 },
    { key1: 0, normalized: 0.5 },
    { key1: 0.5, normalized: 0.75 },
    { key1: 1, normalized: 1 },
  ]);

  await sdb.done();
});
