import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

const sdb = new SimpleDB();

Deno.test("should return the number of columns", async () => {
  const table = sdb.newTable("data");
  await table.loadData(["test/data/files/employees.json"]);
  assertEquals(await table.getNbColumns(), 6);
});

await sdb.done();
