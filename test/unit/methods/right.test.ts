import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

const sdb = new SimpleDB();

Deno.test("should return the last two strings", async () => {
  const table = sdb.newTable();
  await table.loadArray([
    { firstName: "Nael", lastName: "Shiab" },
    { firstName: "Graeme", lastName: "Bruce" },
  ]);

  await table.right("firstName", 2);

  const data = await table.getData();

  assertEquals(data, [
    { firstName: "el", lastName: "Shiab" },
    { firstName: "me", lastName: "Bruce" },
  ]);
});

await sdb.done();
