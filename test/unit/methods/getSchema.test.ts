import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

const sdb = new SimpleDB();

Deno.test("should return the schema of a table", async () => {
  const table = sdb.newTable("data");
  await table.loadData(["test/data/files/data.json"]);

  const schema = await table.getSchema();
  assertEquals(schema, [
    {
      column_name: "key1",
      column_type: "BIGINT",
      null: "YES",
      key: null,
      default: null,
      extra: null,
    },
    {
      column_name: "key2",
      column_type: "VARCHAR",
      null: "YES",
      key: null,
      default: null,
      extra: null,
    },
  ]);
});

await sdb.done();
