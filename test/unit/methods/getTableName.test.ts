import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should return the name of the table before loading data", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("employees");

  const tableName = table.getTableName();

  assertEquals(tableName, "employees");
  await sdb.done();
});
Deno.test("should return the name of the table after loading data", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/data.csv");
  const tableName = table.getTableName();

  assertEquals(tableName, "data");
  await sdb.done();
});
Deno.test("should return the updated name after renaming the table", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("oldName");
  await table.loadData("test/data/files/data.csv");

  await table.renameTable("newName");
  const tableName = table.getTableName();

  assertEquals(tableName, "newName");
  await sdb.done();
});
