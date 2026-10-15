import { test, expect, vi, afterEach } from "vite-plus/test";

afterEach(() => vi.restoreAllMocks());

import SimpleDB from "../../../src/class/SimpleDB.ts";
import { formatDate, formatNumber } from "@nshiab/journalism-format";

test("should log a line chart", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  const log = vi.spyOn(console, "log").mockImplementation(() => {});

  const data = [
    { date: new Date("2023-01-01"), value: 10 * 1000 },
    { date: new Date("2023-02-01"), value: 20 * 1000 },
    { date: new Date("2023-03-01"), value: 30 * 1000 },
    { date: new Date("2023-04-01"), value: 40 * 1000 },
  ];
  table.loadArray(data);
  await table.logLineChart("date", "value");

  expect(log).toHaveBeenCalled();
  expect(log.mock.calls.flat().map(String).join("\n").trim().length).toBeGreaterThan(0);
  expect(await table.getRowCount()).toBeGreaterThan(0);
  await sdb.close();
});
test("should log a line chart with formatting options", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  const log = vi.spyOn(console, "log").mockImplementation(() => {});

  const data = [
    { date: new Date("2023-01-01"), value: 10 * 1000 },
    { date: new Date("2023-02-01"), value: 20 * 1000 },
    { date: new Date("2023-03-01"), value: 30 * 1000 },
    { date: new Date("2023-04-01"), value: 40 * 1000 },
  ];
  table.loadArray(data);
  await table.logLineChart("date", "value", {
    formatX: (d) => formatDate(d as Date, "Month DD", { utc: true }),
    formatY: (d) => formatNumber(d as number, { abbreviation: true }),
  });

  expect(log).toHaveBeenCalled();
  expect(log.mock.calls.flat().map(String).join("\n").trim().length).toBeGreaterThan(0);
  expect(await table.getRowCount()).toBeGreaterThan(0);
  await sdb.close();
});
test("should log a line chart with small multiples", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  const log = vi.spyOn(console, "log").mockImplementation(() => {});

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
  table.loadArray(data);
  await table.logLineChart("date", "value", {
    smallMultiples: "category",
  });

  expect(log).toHaveBeenCalled();
  expect(log.mock.calls.flat().map(String).join("\n").trim().length).toBeGreaterThan(0);
  expect(await table.getRowCount()).toBeGreaterThan(0);
  await sdb.close();
});

test("should log another line chart with small multiples", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  const log = vi.spyOn(console, "log").mockImplementation(() => {});

  table.loadData("test/data/files/aircraftByEvents.csv");
  await table.log();
  await table.logLineChart("occurenceYear", "count", {
    smallMultiples: "aircraftEvent",
  });

  expect(log).toHaveBeenCalled();
  expect(log.mock.calls.flat().map(String).join("\n").trim().length).toBeGreaterThan(0);
  expect(await table.getRowCount()).toBeGreaterThan(0);
  await sdb.close();
});
