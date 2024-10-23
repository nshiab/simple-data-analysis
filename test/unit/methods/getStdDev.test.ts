import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should return the standard deviation", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData(["test/data/files/data.json"]);
  assertEquals(
    await table.getStdDev("key1"),
    1.2909944487358056,
  );
  await sdb.done();
});

Deno.test("should return the standard deviation rounded", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData(["test/data/files/data.json"]);
  assertEquals(
    await table.getStdDev("key1", { decimals: 3 }),
    1.291,
  );
  await sdb.done();
});
