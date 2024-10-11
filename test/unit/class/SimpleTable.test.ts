import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import SimpleTable from "../../../src/class/SimpleTable.ts";

const sdb = new SimpleDB();

Deno.test("should create a new SimpleTable", () => {
  const table = sdb.newTable("data");
  assertEquals(table instanceof SimpleTable, true);
});

await sdb.done();
