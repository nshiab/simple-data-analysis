import { test, expect, vi, afterEach } from "vite-plus/test";

afterEach(() => vi.restoreAllMocks());

import SimpleDB from "../../../src/class/SimpleDB.ts";
import { formatNumber } from "@nshiab/journalism-format";

test("should log a histogram", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  const log = vi.spyOn(console, "log").mockImplementation(() => {});

  table.loadData("test/data/files/dailyTemperatures.csv");

  await table.logHistogram("t");
  expect(log).toHaveBeenCalled();
  expect(log.mock.calls.flat().map(String).join("\n").trim().length).toBeGreaterThan(0);
  expect(await table.getRowCount()).toBeGreaterThan(0);

  await sdb.close();
});

test("should log a histogram with options", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  const log = vi.spyOn(console, "log").mockImplementation(() => {});

  table.loadData("test/data/files/dailyTemperatures.csv");

  await table.logHistogram("t", {
    width: 10,
    bins: 25,
    compact: true,
    formatLabels(a, b) {
      return `${formatNumber(a, { decimals: 1 })} to ${formatNumber(b, { decimals: 1 })}°C`;
    },
  });
  expect(log).toHaveBeenCalled();
  expect(log.mock.calls.flat().map(String).join("\n").trim().length).toBeGreaterThan(0);
  expect(await table.getRowCount()).toBeGreaterThan(0);

  await sdb.close();
});
