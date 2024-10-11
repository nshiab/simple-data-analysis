import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

const sdb = new SimpleDB();

Deno.test("should return the standard deviation", async () => {
  const table = sdb.newTable("data");
  await table.loadData(["test/data/files/data.json"]);
  assertEquals(
    await table.getStdDev("key1"),
    1.2909944487358056,
  );
});
Deno.test("should return the standard deviation rounded", async () => {
  const table = sdb.newTable("data");
  await table.loadData(["test/data/files/data.json"]);
  assertEquals(
    await table.getStdDev("key1", { decimals: 3 }),
    1.291,
  );
});

await sdb.done();
