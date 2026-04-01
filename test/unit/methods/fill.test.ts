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

// Linear interpolation

Deno.test("should linearly interpolate NULL values between non-NULL values", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadArray([
    { val: 1 },
    { val: null },
    { val: 3 },
  ]);
  await table.fill("val", { interpolate: true });
  const data = await table.getData();
  assertEquals(data, [{ val: 1 }, { val: 2 }, { val: 3 }]);
  await sdb.done();
});

Deno.test("should linearly interpolate NULL values independently within each category", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadArray([
    { group: "a", val: 1 },
    { group: "a", val: null },
    { group: "a", val: 3 },
    { group: "b", val: 10 },
    { group: "b", val: null },
    { group: "b", val: 30 },
  ]);
  await table.fill("val", { categories: "group", interpolate: true });
  const data = await table.getData();
  assertEquals(data, [
    { group: "a", val: 1 },
    { group: "a", val: 2 },
    { group: "a", val: 3 },
    { group: "b", val: 10 },
    { group: "b", val: 20 },
    { group: "b", val: 30 },
  ]);
  await sdb.done();
});

Deno.test("should linearly extrapolate NULL values at the end of the table", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadArray([
    { val: 2 },
    { val: 4 },
    { val: null },
  ]);
  await table.fill("val", { interpolate: true });
  const data = await table.getData();
  assertEquals(data, [{ val: 2 }, { val: 4 }, { val: 6 }]);
  await sdb.done();
});

Deno.test("should interpolate proportionally to a non-equidistant x column", async () => {
  // x=[0,1,3], y=[0,null,6]: y at x=1 should be 2 (1/3 of the way), not 3 (row midpoint)
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadArray([
    { x: 0, y: 0 },
    { x: 1, y: null },
    { x: 3, y: 6 },
  ]);
  await table.fill("y", { interpolate: true, interpolateBy: "x" });
  const data = await table.getData();
  assertEquals(data, [{ x: 0, y: 0 }, { x: 1, y: 2 }, { x: 3, y: 6 }]);
  await sdb.done();
});

Deno.test("should interpolate proportionally to a non-equidistant x column within categories", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadArray([
    { group: "a", x: 0, y: 0 },
    { group: "a", x: 1, y: null },
    { group: "a", x: 3, y: 6 },
    { group: "b", x: 0, y: 10 },
    { group: "b", x: 2, y: null },
    { group: "b", x: 10, y: 50 },
  ]);
  await table.fill("y", {
    interpolate: true,
    interpolateBy: "x",
    categories: "group",
  });
  const data = await table.getData();
  assertEquals(data, [
    { group: "a", x: 0, y: 0 },
    { group: "b", x: 0, y: 10 },
    { group: "a", x: 1, y: 2 },
    { group: "b", x: 2, y: 18 },
    { group: "a", x: 3, y: 6 },
    { group: "b", x: 10, y: 50 },
  ]);
  await sdb.done();
});
