import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should sort one number column ascendingly", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/dataSort.csv");
  await table.sort({ key1: "asc" });

  const data = await table.getData();

  assertEquals(data, [
    { key1: 1, key2: "Roi", key3: "A" },
    { key1: 2, key2: "Alambic", key3: "B" },
    { key1: 4, key2: "Extérieur", key3: "B" },
    { key1: 5, key2: "À l'ouest", key3: "A" },
    { key1: 56.7, key2: "Éléphant", key3: "A" },
    { key1: 900, key2: "Zéphir", key3: "A" },
  ]);

  await sdb.done();
});

Deno.test("should sort one column with spaces in its name", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadArray([{ "column 1": 2 }, { "column 1": 1 }]);
  await table.sort({ "column 1": "asc" });

  const data = await table.getData();

  assertEquals(data, [{ "column 1": 1 }, { "column 1": 2 }]);

  await sdb.done();
});

Deno.test("should sort one number column descendingly", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/dataSort.csv");
  await table.sort({ key1: "desc" });
  const data = await table.getData();

  assertEquals(data, [
    { key1: 900, key2: "Zéphir", key3: "A" },
    { key1: 56.7, key2: "Éléphant", key3: "A" },
    { key1: 5, key2: "À l'ouest", key3: "A" },
    { key1: 4, key2: "Extérieur", key3: "B" },
    { key1: 2, key2: "Alambic", key3: "B" },
    { key1: 1, key2: "Roi", key3: "A" },
  ]);

  await sdb.done();
});

Deno.test("should sort one text column ascendingly with a specific language", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/dataSort.csv");
  await table.sort(
    { key2: "asc" },
    {
      lang: { key2: "fr" },
    },
  );
  const data = await table.getData();
  assertEquals(data, [
    { key1: 5, key2: "À l'ouest", key3: "A" },
    { key1: 2, key2: "Alambic", key3: "B" },
    { key1: 56.7, key2: "Éléphant", key3: "A" },
    { key1: 4, key2: "Extérieur", key3: "B" },
    { key1: 1, key2: "Roi", key3: "A" },
    { key1: 900, key2: "Zéphir", key3: "A" },
  ]);

  await sdb.done();
});

Deno.test("should sort one text column descendingly with a specific language", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/dataSort.csv");
  await table.sort(
    { key2: "desc" },
    {
      lang: { key2: "fr" },
    },
  );
  const data = await table.getData();

  assertEquals(data, [
    { key1: 900, key2: "Zéphir", key3: "A" },
    { key1: 1, key2: "Roi", key3: "A" },
    { key1: 4, key2: "Extérieur", key3: "B" },
    { key1: 56.7, key2: "Éléphant", key3: "A" },
    { key1: 2, key2: "Alambic", key3: "B" },
    { key1: 5, key2: "À l'ouest", key3: "A" },
  ]);

  await sdb.done();
});

Deno.test("should sort mutiple columns ascendingly or descendingly with a specific language", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/dataSort.csv");
  await table.sort(
    { key3: "asc", key1: "desc" },
    {
      lang: { key2: "fr" },
    },
  );
  const data = await table.getData();

  assertEquals(data, [
    { key1: 900, key2: "Zéphir", key3: "A" },
    { key1: 56.7, key2: "Éléphant", key3: "A" },
    { key1: 5, key2: "À l'ouest", key3: "A" },
    { key1: 1, key2: "Roi", key3: "A" },
    { key1: 4, key2: "Extérieur", key3: "B" },
    { key1: 2, key2: "Alambic", key3: "B" },
  ]);

  await sdb.done();
});
