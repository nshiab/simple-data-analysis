import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should change the name of one column", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/data.json"]);

  await table.renameColumns({
    key1: "A",
  });
  const data = await table.getData();

  assertEquals(data, [
    { A: 1, key2: "un" },
    { A: 2, key2: "deux" },
    { A: 3, key2: "trois" },
    { A: 4, key2: "quatre" },
  ]);

  await sdb.done();
});

Deno.test("should change the name of multiple columns", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/data.json"]);

  await table.renameColumns({
    key1: "A",
    key2: "B",
  });
  const data = await table.getData();

  assertEquals(data, [
    { A: 1, B: "un" },
    { A: 2, B: "deux" },
    { A: 3, B: "trois" },
    { A: 4, B: "quatre" },
  ]);

  await sdb.done();
});

Deno.test("should change the name of a column with $ in its name", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadArray([{ "$ value": 10 }, { "$ value": 20 }]);

  await table.renameColumns({
    "$ value": "value",
  });
  const data = await table.getData();

  assertEquals(data, [
    { value: 10 },
    { value: 20 },
  ]);

  await sdb.done();
});
