import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should truncate strings in one column to specified length", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadArray([
    { description: "This is a long description" },
  ]);

  await table.truncate("description", 10);

  const data = await table.getData();

  assertEquals(data, [{ description: "This is a " }]);
  await sdb.done();
});

Deno.test("should truncate strings shorter than specified length unchanged", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadArray([
    { name: "John" },
  ]);

  await table.truncate("name", 10);

  const data = await table.getData();

  assertEquals(data, [{ name: "John" }]);
  await sdb.done();
});

Deno.test("should truncate strings to zero characters", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadArray([
    { text: "Hello World" },
  ]);

  await table.truncate("text", 0);

  const data = await table.getData();

  assertEquals(data, [{ text: "" }]);
  await sdb.done();
});

Deno.test("should truncate multiple rows", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadArray([
    { firstName: "Alexander", lastName: "Washington" },
    { firstName: "Elizabeth", lastName: "Montgomery" },
    { firstName: "Christopher", lastName: "Anderson" },
  ]);

  await table.truncate("firstName", 5);

  const data = await table.getData();

  assertEquals(data, [
    { firstName: "Alexa", lastName: "Washington" },
    { firstName: "Eliza", lastName: "Montgomery" },
    { firstName: "Chris", lastName: "Anderson" },
  ]);
  await sdb.done();
});

Deno.test("should truncate strings in column with spaces in name", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadArray([
    { "full name": "Alexander Washington" },
  ]);

  await table.truncate("full name", 9);

  const data = await table.getData();

  assertEquals(data, [
    { "full name": "Alexander" },
  ]);
  await sdb.done();
});
