import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

const sdb = new SimpleDB();

Deno.test("should log a dot chart", async () => {
  const table = sdb.newTable();

  const data = [
    { category: "A", value: 10 },
    { category: "B", value: 20 },
  ];
  await table.loadArray(data);
  await table.logBarChart("category", "value");

  // How to test?
  assertEquals(true, true);
});
Deno.test("should log a dot chart with options", async () => {
  const table = sdb.newTable();

  const data = [
    { category: "A", value: 10 },
    { category: "B", value: 20 },
  ];
  await table.loadArray(data);
  await table.logBarChart("category", "value", {
    formatLabels: (label: unknown) => (label as string).toUpperCase(),
    formatValues: (value: unknown) => "$" + (value as number),
  });

  // How to test?
  assertEquals(true, true);
});

await sdb.done();
