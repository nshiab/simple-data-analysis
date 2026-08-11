import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("default direct data transport smoke test", async () => {
  const sdb = new SimpleDB();
  try {
    assertEquals(sdb.dataTransport, "direct");
    const table = sdb.newTable();
    table.loadArray([{ value: 1 }]);

    assertEquals(await table.getData(), [{ value: 1 }]);
  } finally {
    await sdb.done();
  }
});

Deno.test("forwards file data transport to core", async () => {
  const sdb = new SimpleDB({ dataTransport: "file" });
  try {
    assertEquals(sdb.dataTransport, "file");
  } finally {
    await sdb.done();
  }
});
