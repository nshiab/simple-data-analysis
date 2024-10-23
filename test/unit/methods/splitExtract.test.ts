import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should extract a substring based on a separator and substring", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadArray([
    { name: "Shiab, Nael" },
    { name: "Bruce, Graeme" },
  ]);

  await table.splitExtract("name", ",", 0);

  const data = await table.getData();

  assertEquals(data, [{ name: "Shiab" }, { name: "Bruce" }]);
  await sdb.done();
});
