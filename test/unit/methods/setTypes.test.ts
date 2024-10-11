import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

const sdb = new SimpleDB();

Deno.test("should create a new SimpleTable with types", async () => {
  const table = sdb.newTable("data");
  await table.setTypes({ name: "string", age: "number" });
  const types = await table.getTypes();
  assertEquals(types, { name: "VARCHAR", age: "DOUBLE" });
});
Deno.test("should create a new SimpleTable with geometrye in types", async () => {
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
});

await sdb.done();
