import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import { formatDate, formatNumber } from "@nshiab/journalism";

Deno.test("should log a line chart", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();

  const data = [
    { date: new Date("2023-01-01"), value: 10 * 1000 },
    { date: new Date("2023-02-01"), value: 20 * 1000 },
    { date: new Date("2023-03-01"), value: 30 * 1000 },
    { date: new Date("2023-04-01"), value: 40 * 1000 },
  ];
  await table.loadArray(data);
  await table.logLineChart("date", "value");

  // How to test?
  assertEquals(true, true);
  await sdb.done();
});
Deno.test("should log a line chart with formatting options", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();

  const data = [
    { date: new Date("2023-01-01"), value: 10 * 1000 },
    { date: new Date("2023-02-01"), value: 20 * 1000 },
    { date: new Date("2023-03-01"), value: 30 * 1000 },
    { date: new Date("2023-04-01"), value: 40 * 1000 },
  ];
  await table.loadArray(data);
  await table.logLineChart("date", "value", {
    formatX: (d) => formatDate(d as Date, "Month DD", { utc: true }),
    formatY: (d) => formatNumber(d as number, { abreviation: true }),
  });

  // How to test?
  assertEquals(true, true);
  await sdb.done();
});
Deno.test("should log a line chart with small multiples", async () => {
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
  await table.logLineChart("date", "value", {
    smallMultiples: "category",
  });

  // How to test?
  assertEquals(true, true);
  await sdb.done();
});
Deno.test("should log another line chart with small multiples", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();

  await table.loadData("test/data/files/aircraftByEvents.csv");
  await table.logTable();
  await table.logLineChart("occurenceYear", "count", {
    smallMultiples: "aircraftEvent",
  });

  // How to test?
  assertEquals(true, true);
  await sdb.done();
});
