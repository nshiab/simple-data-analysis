import { test, expect, vi, afterEach } from "vite-plus/test";

afterEach(() => vi.restoreAllMocks());

import SimpleDB from "../../../src/class/SimpleDB.ts";

test("should log a bar chart", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  const log = vi.spyOn(console, "log").mockImplementation(() => {});

  const data = [
    { category: "A", value: 10 },
    { category: "B", value: 20 },
  ];
  table.loadArray(data);
  await table.logBarChart("category", "value");

  expect(log).toHaveBeenCalled();
  expect(log.mock.calls.flat().map(String).join("\n").trim().length).toBeGreaterThan(0);
  expect(await table.getRowCount()).toBeGreaterThan(0);
  await sdb.close();
});

test("should log a bar chart with options", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  const log = vi.spyOn(console, "log").mockImplementation(() => {});

  const data = [
    { category: "A", value: 10 },
    { category: "B", value: 20 },
  ];
  table.loadArray(data);
  await table.logBarChart("category", "value", {
    formatLabels: (label: unknown) => (label as string).toUpperCase(),
    formatValues: (value: unknown) => "$" + (value as number),
  });

  expect(log).toHaveBeenCalled();
  expect(log.mock.calls.flat().map(String).join("\n").trim().length).toBeGreaterThan(0);
  expect(await table.getRowCount()).toBeGreaterThan(0);
  await sdb.close();
});
