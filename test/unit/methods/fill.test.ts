import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should fill empty cells for one column", async () => {
  const sdb = new SimpleDB();
  const table = await sdb
    .newTable()
    .loadArray([
      { first: "Nael" },
      { first: null },
      { first: null },
      { first: "Graeme" },
      { first: null },
      { first: null },
      { first: null },
      { first: null },
      { first: "Andrew" },
    ]);
  await table.fill("first");
  const data = await table.getData();
  assertEquals(data, [
    { first: "Nael" },
    { first: "Nael" },
    { first: "Nael" },
    { first: "Graeme" },
    { first: "Graeme" },
    { first: "Graeme" },
    { first: "Graeme" },
    { first: "Graeme" },
    { first: "Andrew" },
  ]);
  await sdb.done();
});

Deno.test("should fill empty cells for multiple columns", async () => {
  const sdb = new SimpleDB();
  const table = await sdb.newTable().loadArray([
    { first: "Nael", job: "Senior producer" },
    { first: null, job: null },
    { first: null, job: "Senior producer" },
    { first: "Graeme", job: "Producer" },
    { first: null, job: null },
    { first: null, job: "Super producer" },
    { first: null, job: null },
    { first: null, job: null },
    { first: "Andrew", job: "Senior dev" },
  ]);
  await table.fill(["first", "job"]);
  const data = await table.getData();
  assertEquals(data, [
    { first: "Nael", job: "Senior producer" },
    { first: "Nael", job: "Senior producer" },
    { first: "Nael", job: "Senior producer" },
    { first: "Graeme", job: "Producer" },
    { first: "Graeme", job: "Producer" },
    { first: "Graeme", job: "Super producer" },
    { first: "Graeme", job: "Super producer" },
    { first: "Graeme", job: "Super producer" },
    { first: "Andrew", job: "Senior dev" },
  ]);
  await sdb.done();
});

Deno.test("should fill empty cells with categories (single category)", async () => {
  const sdb = new SimpleDB();
  const table = await sdb.newTable().loadArray([
    { group: "A", value: 1 },
    { group: "B", value: null },
    { group: "A", value: null },
    { group: "B", value: 2 },
    { group: "A", value: null },
  ]);
  await table.fill("value", { categories: "group" });
  const data = await table.getData();
  assertEquals(data, [
    { group: "A", value: 1 },
    { group: "B", value: null },
    { group: "A", value: 1 },
    { group: "B", value: 2 },
    { group: "A", value: 1 },
  ]);
  await sdb.done();
});

Deno.test("should fill empty cells with categories (multiple categories)", async () => {
  const sdb = new SimpleDB();
  const table = await sdb.newTable().loadArray([
    { group: "A", subgroup: "X", value: 10 },
    { group: "A", subgroup: "X", value: null },
    { group: "A", subgroup: "Y", value: null },
    { group: "B", subgroup: "X", value: 20 },
    { group: "B", subgroup: "X", value: null },
  ]);
  await table.fill("value", { categories: ["group", "subgroup"] });
  const data = await table.getData();
  assertEquals(data, [
    { group: "A", subgroup: "X", value: 10 },
    { group: "A", subgroup: "X", value: 10 },
    { group: "A", subgroup: "Y", value: null },
    { group: "B", subgroup: "X", value: 20 },
    { group: "B", subgroup: "X", value: 20 },
  ]);
  await sdb.done();
});
