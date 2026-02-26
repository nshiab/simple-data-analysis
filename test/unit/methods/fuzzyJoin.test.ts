import { assert, assertEquals, assertRejects } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should perform a basic left fuzzy join and include all left table rows", async () => {
  const sdb = new SimpleDB();
  const peopleA = sdb.newTable("peopleA");
  await peopleA.loadData("test/data/files/people_a.csv");
  const peopleB = sdb.newTable("peopleB");
  await peopleB.loadData("test/data/files/people_b.csv");

  await peopleA.fuzzyJoin(peopleB, "name", "standardName", {
    similarityColumn: "fuzzyScore",
  });

  const data = await peopleA.getData();

  assertEquals(data, [
    {
      id: 1,
      name: "Alice Smith",
      personId: "X",
      standardName: "Alice Smith",
      fuzzyScore: 100,
    },
    {
      id: 2,
      name: "Bob Johnson",
      personId: "Y",
      standardName: "Bob Jonson",
      fuzzyScore: 95.24,
    },
    {
      id: 3,
      name: "Carol Williams",
      personId: "Z",
      standardName: "Carol Williams",
      fuzzyScore: 100,
    },
    {
      id: 4,
      name: "David Jones",
      personId: null,
      standardName: null,
      fuzzyScore: null,
    },
  ]);

  await sdb.done();
});

Deno.test("should respect a custom threshold and only match exact strings at threshold 100", async () => {
  const sdb = new SimpleDB();
  const peopleA = sdb.newTable("peopleA");
  await peopleA.loadData("test/data/files/people_a.csv");
  const peopleB = sdb.newTable("peopleB");
  await peopleB.loadData("test/data/files/people_b.csv");

  await peopleA.fuzzyJoin(peopleB, "name", "standardName", { threshold: 100 });

  const data = await peopleA.getData();

  assertEquals(data, [
    { id: 1, name: "Alice Smith", personId: "X", standardName: "Alice Smith" },
    { id: 2, name: "Bob Johnson", personId: null, standardName: null },
    {
      id: 3,
      name: "Carol Williams",
      personId: "Z",
      standardName: "Carol Williams",
    },
    { id: 4, name: "David Jones", personId: null, standardName: null },
  ]);

  await sdb.done();
});

Deno.test("should store result in a new table when outputTable is a string", async () => {
  const sdb = new SimpleDB();
  const peopleA = sdb.newTable("peopleA");
  await peopleA.loadData("test/data/files/people_a.csv");
  const peopleB = sdb.newTable("peopleB");
  await peopleB.loadData("test/data/files/people_b.csv");

  const fuzzyResult = await peopleA.fuzzyJoin(
    peopleB,
    "name",
    "standardName",
    { outputTable: "fuzzyResult" },
  );

  const tables = await sdb.getTableNames();
  assert(tables.includes("fuzzyResult"), "fuzzyResult table should exist");

  const data = await fuzzyResult.getData();

  assertEquals(data, [
    { id: 1, name: "Alice Smith", personId: "X", standardName: "Alice Smith" },
    { id: 2, name: "Bob Johnson", personId: "Y", standardName: "Bob Jonson" },
    {
      id: 3,
      name: "Carol Williams",
      personId: "Z",
      standardName: "Carol Williams",
    },
    { id: 4, name: "David Jones", personId: null, standardName: null },
  ]);

  // Original tables should be unchanged
  assertEquals(await peopleA.getData(), [
    { id: 1, name: "Alice Smith" },
    { id: 2, name: "Bob Johnson" },
    { id: 3, name: "Carol Williams" },
    { id: 4, name: "David Jones" },
  ]);
  assertEquals(await peopleB.getData(), [
    { personId: "X", standardName: "Alice Smith" },
    { personId: "Y", standardName: "Bob Jonson" },
    { personId: "Z", standardName: "Carol Williams" },
    { personId: "W", standardName: "Emma Wilson" },
  ]);

  await sdb.done();
});

Deno.test("should store result in a new auto-named table when outputTable is true", async () => {
  const sdb = new SimpleDB();
  const peopleA = sdb.newTable("peopleA");
  await peopleA.loadData("test/data/files/people_a.csv");
  const peopleB = sdb.newTable("peopleB");
  await peopleB.loadData("test/data/files/people_b.csv");

  const result = await peopleA.fuzzyJoin(peopleB, "name", "standardName", {
    outputTable: true,
  });

  assertEquals(await result.getData(), [
    { id: 1, name: "Alice Smith", personId: "X", standardName: "Alice Smith" },
    { id: 2, name: "Bob Johnson", personId: "Y", standardName: "Bob Jonson" },
    {
      id: 3,
      name: "Carol Williams",
      personId: "Z",
      standardName: "Carol Williams",
    },
    { id: 4, name: "David Jones", personId: null, standardName: null },
  ]);

  // peopleA should be unchanged (original table)
  assertEquals(await peopleA.getData(), [
    { id: 1, name: "Alice Smith" },
    { id: 2, name: "Bob Johnson" },
    { id: 3, name: "Carol Williams" },
    { id: 4, name: "David Jones" },
  ]);

  await sdb.done();
});

Deno.test("should use a custom similarity column name", async () => {
  const sdb = new SimpleDB();
  const peopleA = sdb.newTable("peopleA");
  await peopleA.loadData("test/data/files/people_a.csv");
  const peopleB = sdb.newTable("peopleB");
  await peopleB.loadData("test/data/files/people_b.csv");

  await peopleA.fuzzyJoin(peopleB, "name", "standardName", {
    similarityColumn: "matchScore",
  });

  assertEquals(await peopleA.getData(), [
    {
      id: 1,
      name: "Alice Smith",
      personId: "X",
      standardName: "Alice Smith",
      matchScore: 100,
    },
    {
      id: 2,
      name: "Bob Johnson",
      personId: "Y",
      standardName: "Bob Jonson",
      matchScore: 95.24,
    },
    {
      id: 3,
      name: "Carol Williams",
      personId: "Z",
      standardName: "Carol Williams",
      matchScore: 100,
    },
    {
      id: 4,
      name: "David Jones",
      personId: null,
      standardName: null,
      matchScore: null,
    },
  ]);

  await sdb.done();
});

Deno.test("should work with the token_sort_ratio method for reordered words", async () => {
  const sdb = new SimpleDB();
  const tableA = sdb.newTable("tableA");
  await tableA.loadArray([
    { rowId: 1, label: "world hello" },
  ]);
  const tableB = sdb.newTable("tableB");
  await tableB.loadArray([
    { itemId: "a", text: "hello world" },
  ]);

  await tableA.fuzzyJoin(tableB, "label", "text", {
    method: "token_sort_ratio",
    threshold: 90,
    similarityColumn: "fuzzyScore",
  });

  assertEquals(await tableA.getData(), [
    {
      rowId: 1,
      label: "world hello",
      itemId: "a",
      text: "hello world",
      fuzzyScore: 100,
    },
  ]);

  await sdb.done();
});

Deno.test("should not include a similarity column when similarityColumn is not provided", async () => {
  const sdb = new SimpleDB();
  const peopleA = sdb.newTable("peopleA");
  await peopleA.loadData("test/data/files/people_a.csv");
  const peopleB = sdb.newTable("peopleB");
  await peopleB.loadData("test/data/files/people_b.csv");

  await peopleA.fuzzyJoin(peopleB, "name", "standardName");

  assertEquals(await peopleA.getData(), [
    { id: 1, name: "Alice Smith", personId: "X", standardName: "Alice Smith" },
    { id: 2, name: "Bob Johnson", personId: "Y", standardName: "Bob Jonson" },
    {
      id: 3,
      name: "Carol Williams",
      personId: "Z",
      standardName: "Carol Williams",
    },
    { id: 4, name: "David Jones", personId: null, standardName: null },
  ]);

  await sdb.done();
});

Deno.test("should throw an error when tables have conflicting column names", async () => {
  const sdb = new SimpleDB();
  const tableA = sdb.newTable("tableA");
  await tableA.loadArray([{ id: 1, name: "Alice" }]);
  const tableB = sdb.newTable("tableB");
  await tableB.loadArray([{ id: 2, name: "Alise" }]); // 'id' conflicts

  await assertRejects(() => tableA.fuzzyJoin(tableB, "name", "name"));

  await sdb.done();
});

Deno.test("should throw an error when leftColumn and rightColumn have the same name", async () => {
  const sdb = new SimpleDB();
  const tableA = sdb.newTable("tableA");
  await tableA.loadArray([{ name: "Alice" }]);
  const tableB = sdb.newTable("tableB");
  await tableB.loadArray([{ name: "Alise", score: 1 }]); // only 'name' is shared, it's also the join key

  await assertRejects(() => tableA.fuzzyJoin(tableB, "name", "name"));

  await sdb.done();
});
