import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should return the number of a rows in a table", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadArray([
    { name: "Evangeline", age: 21 },
    { name: "Amelia", age: 29 },
    { name: "Marie", age: 30 },
    { name: "Kiara", age: 31 },
    { name: "Isobel", age: 31 },
    { name: "Genevieve", age: 32 },
    { name: "Jane", age: 32 },
    { name: "Chloe", age: 33 },
    { name: "Philip", age: 33 },
    { name: "Morgan", age: 33 },
    { name: "Jeremy", age: 34 },
    { name: "Claudia", age: 35 },
    { name: "Sonny", age: 57 },
    { name: "Frazer", age: 64 },
    { name: "Sarah", age: 64 },
    { name: "Frankie", age: 65 },
  ]);
  const length = await table.getNbRows();

  assertEquals(length, 16);
  await sdb.done();
});

Deno.test("should return the number of a rows in a table with nul values", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadArray([
    { name: "Evangeline", age: 21 },
    { name: "Amelia", age: 29 },
    { name: "Marie", age: 30 },
    { name: null, age: null },
    { name: "Isobel", age: 31 },
    { name: "Genevieve", age: 32 },
    { name: "Jane", age: 32 },
    { name: "Chloe", age: 33 },
    { name: "Philip", age: 33 },
    { name: "Morgan", age: 33 },
    { name: "Jeremy", age: 34 },
    { name: "Claudia", age: 35 },
    { name: "Sonny", age: 57 },
    { name: "Frazer", age: 64 },
    { name: "Sarah", age: 64 },
    { name: "Frankie", age: 65 },
  ]);
  const length = await table.getNbRows();

  assertEquals(length, 16);
  await sdb.done();
});
