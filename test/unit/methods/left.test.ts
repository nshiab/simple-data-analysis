import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

const sdb = new SimpleDB();

Deno.test("should return the first two strings", async () => {
  const table = sdb.newTable();
  await table.loadArray([
    { firstName: "Nael", lastName: "Shiab" },
    { firstName: "Graeme", lastName: "Bruce" },
  ]);

  await table.left("firstName", 2);

  const data = await table.getData();

  assertEquals(data, [
    { firstName: "Na", lastName: "Shiab" },
    { firstName: "Gr", lastName: "Bruce" },
  ]);
});

await sdb.done();
