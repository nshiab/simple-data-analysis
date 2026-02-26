import { assert, assertEquals, assertRejects } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should perform a basic left fuzzy join and include all left table rows", async () => {
  const sdb = new SimpleDB();
  const peopleA = sdb.newTable("peopleA");
  await peopleA.loadData("test/data/files/people_a.csv");
  const peopleB = sdb.newTable("peopleB");
  await peopleB.loadData("test/data/files/people_b.csv");

  await peopleA.fuzzyJoin("name", peopleB, "standardName", {
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
Deno.test("should perform an inner fuzzy join and exclude non-matching rows", async () => {
  const sdb = new SimpleDB();
  const peopleA = sdb.newTable("peopleA");
  await peopleA.loadData("test/data/files/people_a.csv");
  const peopleB = sdb.newTable("peopleB");
  await peopleB.loadData("test/data/files/people_b.csv");

  await peopleA.fuzzyJoin("name", peopleB, "standardName", { type: "inner" });

  const data = await peopleA.getData();

  assertEquals(data, [
    { id: 1, name: "Alice Smith", personId: "X", standardName: "Alice Smith" },
    { id: 2, name: "Bob Johnson", personId: "Y", standardName: "Bob Jonson" },
    {
      id: 3,
      name: "Carol Williams",
      personId: "Z",
      standardName: "Carol Williams",
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

  await peopleA.fuzzyJoin("name", peopleB, "standardName", {
    threshold: 100,
  });

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

  const fuzzyResult = await peopleA.fuzzyJoin("name", peopleB, "standardName", {
    outputTable: "fuzzyResult",
  });

  const tables = await sdb.getTableNames();
  assert(tables.includes("fuzzyResult"), "fuzzyResult table should exist");

  const data = await fuzzyResult.getData();

  assertEquals(data, [
    {
      id: 1,
      name: "Alice Smith",
      personId: "X",
      standardName: "Alice Smith",
    },
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

  const result = await peopleA.fuzzyJoin("name", peopleB, "standardName", {
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

  await peopleA.fuzzyJoin("name", peopleB, "standardName", {
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

  await tableA.fuzzyJoin("label", tableB, "text", {
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

  await peopleA.fuzzyJoin("name", peopleB, "standardName");

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
  await tableB.loadArray([{ id: 2, name: "Alise" }]); // 'id' and 'name' conflict with tableA

  await assertRejects(() => tableA.fuzzyJoin("name", tableB, "name"));

  await sdb.done();
});

// ─── prefixBlockingSize tests ────────────────────────────────────────────────

// Test data used in all four blocking tests:
//   Left  table: id=1 "MacDonald", id=2 "Alice"  (+ id=3 "Zzzzz" in some tests)
//   Right table: code="A" "McDonald", code="B" "Alize"  (+ code="C" "Zzz" in some tests)
//
// "MacDonald" / "McDonald": rapidfuzz ratio ≈ 94 (above default 80), but
//   LEFT("MacDonald",3)="Mac" ≠ LEFT("McDonald",3)="McD", so phase 1 misses them
//   and phase 2 rescues the pair.
// "Alice" / "Alize": ratio ≈ 90, LEFT(...,3)="Ali" for both, so phase 1 catches them.

Deno.test("prefixBlockingSize: left join — cross-prefix match is rescued by phase 2", async () => {
  const sdb = new SimpleDB();
  const tblLeft = sdb.newTable("tblLeft");
  await tblLeft.loadArray([
    { id: 1, name: "MacDonald" },
    { id: 2, name: "Alice" },
  ]);
  const tblRight = sdb.newTable("tblRight");
  await tblRight.loadArray([
    { code: "A", label: "McDonald" },
    { code: "B", label: "Alize" },
  ]);

  const result = await tblLeft.fuzzyJoin("name", tblRight, "label", {
    outputTable: "result",
    prefixBlockingSize: 3,
  });

  const data = await result.getData();

  // "Alice"/"Alize" matched by phase 1, "MacDonald"/"McDonald" matched by phase 2.
  // ORDER BY name, label → "Alice" before "MacDonald".
  assertEquals(data, [
    { id: 2, name: "Alice", code: "B", label: "Alize" },
    { id: 1, name: "MacDonald", code: "A", label: "McDonald" },
  ]);

  await sdb.done();
});

Deno.test("prefixBlockingSize: inner join — cross-prefix match included, truly unmatched row excluded", async () => {
  const sdb = new SimpleDB();
  const tblLeft = sdb.newTable("tblLeft");
  await tblLeft.loadArray([
    { id: 1, name: "MacDonald" },
    { id: 2, name: "Alice" },
    { id: 3, name: "Zzzzz" }, // no right-side match at any threshold
  ]);
  const tblRight = sdb.newTable("tblRight");
  await tblRight.loadArray([
    { code: "A", label: "McDonald" },
    { code: "B", label: "Alize" },
  ]);

  const result = await tblLeft.fuzzyJoin("name", tblRight, "label", {
    type: "inner",
    outputTable: "result",
    prefixBlockingSize: 3,
  });

  const data = await result.getData();

  // "Zzzzz" has no match → excluded from inner join.
  // Cross-prefix pair "MacDonald"/"McDonald" is still included (phase 2).
  assertEquals(data, [
    { id: 2, name: "Alice", code: "B", label: "Alize" },
    { id: 1, name: "MacDonald", code: "A", label: "McDonald" },
  ]);

  await sdb.done();
});

Deno.test("prefixBlockingSize: right join — all right rows preserved, cross-prefix match included", async () => {
  const sdb = new SimpleDB();
  const tblLeft = sdb.newTable("tblLeft");
  await tblLeft.loadArray([
    { id: 1, name: "MacDonald" },
    { id: 2, name: "Alice" },
  ]);
  const tblRight = sdb.newTable("tblRight");
  await tblRight.loadArray([
    { code: "A", label: "McDonald" },
    { code: "B", label: "Alize" },
    { code: "C", label: "Zzz" }, // no left-side match
  ]);

  const result = await tblLeft.fuzzyJoin("name", tblRight, "label", {
    type: "right",
    outputTable: "result",
    prefixBlockingSize: 3,
  });

  const data = await result.getData();

  // ORDER BY name, label → "Alice" (2), "MacDonald" (1), then NULL name last ("Zzz").
  assertEquals(data, [
    { id: 2, name: "Alice", code: "B", label: "Alize" },
    { id: 1, name: "MacDonald", code: "A", label: "McDonald" },
    { id: null, name: null, code: "C", label: "Zzz" },
  ]);

  await sdb.done();
});

Deno.test("prefixBlockingSize: full join — unmatched rows from both sides preserved", async () => {
  const sdb = new SimpleDB();
  const tblLeft = sdb.newTable("tblLeft");
  await tblLeft.loadArray([
    { id: 1, name: "MacDonald" },
    { id: 2, name: "Alice" },
    { id: 3, name: "Zzzzz" }, // no right-side match
  ]);
  const tblRight = sdb.newTable("tblRight");
  await tblRight.loadArray([
    { code: "A", label: "McDonald" },
    { code: "B", label: "Alize" },
    { code: "C", label: "Zzz" }, // no left-side match
  ]);

  const result = await tblLeft.fuzzyJoin("name", tblRight, "label", {
    type: "full",
    outputTable: "result",
    prefixBlockingSize: 3,
  });

  const data = await result.getData();

  // ORDER BY name, label:
  //   "Alice"/"Alize", "MacDonald"/"McDonald", "Zzzzz"/null, null/"Zzz"
  assertEquals(data, [
    { id: 2, name: "Alice", code: "B", label: "Alize" },
    { id: 1, name: "MacDonald", code: "A", label: "McDonald" },
    { id: 3, name: "Zzzzz", code: null, label: null },
    { id: null, name: null, code: "C", label: "Zzz" },
  ]);

  await sdb.done();
});
