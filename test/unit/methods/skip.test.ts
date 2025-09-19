import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should skip rows", async () => {
  const sdb = new SimpleDB();
  const table = await sdb
    .newTable()
    .loadArray([
      { first: "Nael" },
      { first: "Graeme" },
      { first: "Andrew" },
    ]);
  await table.skip(1);
  const data = await table.getData();
  assertEquals(data, [{ first: "Graeme" }, { first: "Andrew" }]);
  await sdb.done();
});
