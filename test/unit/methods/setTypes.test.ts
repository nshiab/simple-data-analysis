import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should create a new SimpleTable with types", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.setTypes({ name: "string", age: "number" });
  const types = await table.getTypes();
  assertEquals(types, { name: "VARCHAR", age: "DOUBLE" });
  await sdb.done();
});

Deno.test("should create a new SimpleTable with geometry in types", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.setTypes({
    name: "string",
    age: "number",
    city: "geometry",
  });
  const types = await table.getTypes();
  assertEquals(
    { name: "VARCHAR", age: "DOUBLE", city: "GEOMETRY" },
    types,
  );
  await sdb.done();
});

Deno.test("should create a new SimpleTable with types and column names containing spaces", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.setTypes({ "first name": "string", age: "number" });
  const types = await table.getTypes();
  assertEquals(types, { "first name": "VARCHAR", age: "DOUBLE" });
  await sdb.done();
});

Deno.test("should create a new SimpleTable with types and column names with special uses", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.setTypes({
    "first name": "string",
    age: "number",
    Group: "string",
  });
  const types = await table.getTypes();
  assertEquals(types, {
    "first name": "VARCHAR",
    age: "DOUBLE",
    Group: "VARCHAR",
  });
  await sdb.done();
});
