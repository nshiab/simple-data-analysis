import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should log a dot chart", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();

  const data = [
    { date: new Date("2023-01-01"), value: 10 },
    { date: new Date("2023-02-01"), value: 20 },
    { date: new Date("2023-03-01"), value: 30 },
    { date: new Date("2023-04-01"), value: 40 },
  ];
  await table.loadArray(data);
  await table.convert({ date: "string" }, { datetimeFormat: "%x" });
  await table.logDotChart("date", "value");

  // How to test?
  assertEquals(true, true);
  await sdb.done();
});

Deno.test("should log a dot chart with small multiples", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();

  const data = [
    { date: new Date("2023-01-01"), value: 10, category: "A" },
    { date: new Date("2023-02-01"), value: 20, category: "A" },
    { date: new Date("2023-03-01"), value: 30, category: "A" },
    { date: new Date("2023-04-01"), value: 40, category: "A" },
    { date: new Date("2023-01-01"), value: 15, category: "B" },
    { date: new Date("2023-02-01"), value: 25, category: "B" },
    { date: new Date("2023-03-01"), value: 35, category: "B" },
    { date: new Date("2023-04-01"), value: 45, category: "B" },
  ];
  await table.loadArray(data);
  await table.convert({ date: "string" }, { datetimeFormat: "%x" });
  await table.logDotChart("date", "value", {
    smallMultiples: "category",
  });

  // How to test?
  assertEquals(true, true);
  await sdb.done();
});
