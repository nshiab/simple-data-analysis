import { test, expect } from "vite-plus/test";
import { assertThrows } from "../../helpers/assertions.ts";
import type { Aggregate } from "../../../benchmarks/helpers.ts";
import {
  createChartData,
  formatVersion,
  percentageDifference,
  renderBenchmarkResults,
  replaceBenchmarkResults,
} from "../../../benchmarks/report.ts";

const aggregates: Aggregate[] = [
  {
    benchmark: "tabular",
    implementation: "duckdb",
    version: "@duckdb/node-api@1.5.5-r.4/duckdb@v1.5.5/node@24.21.0",
    meanSeconds: 1,
    stdDevSeconds: 0.1,
    meanPeakMemoryMB: 300,
  },
  {
    benchmark: "tabular",
    implementation: "local",
    version: "6.0.0-rc.9/node@24.21.0",
    meanSeconds: 2,
    stdDevSeconds: 0.2,
    meanPeakMemoryMB: 200,
  },
  {
    benchmark: "tabular",
    implementation: "pandas",
    version: "pandas@3.0.3/python@3.14.5",
    meanSeconds: 4,
    stdDevSeconds: 0.3,
    meanPeakMemoryMB: 100,
  },
];

test("benchmark report calculates SDA-relative percentages", () => {
  expect(percentageDifference(1, 2)).toEqual(-50);
  expect(percentageDifference(2, 2)).toEqual(0);
  expect(percentageDifference(3, 2)).toEqual(50);
});

test("benchmark report presents discovered library and runtime versions", () => {
  expect(formatVersion(aggregates[0])).toEqual(
    "@duckdb/node-api 1.5.5-r.4; DuckDB v1.5.5; Node 24.21.0",
  );
  expect(formatVersion(aggregates[1])).toEqual("SDA 6.0.0-rc.9; Node 24.21.0");
  expect(formatVersion(aggregates[2])).toEqual("pandas 3.0.3; Python 3.14.5");
});

test("benchmark report sorts each chart by its measured value", () => {
  const duration = createChartData(aggregates, "tabular", "duration");
  expect(duration.map((row) => row.implementation)).toEqual(["DuckDB", "SDA", "pandas"]);
  expect(duration.map((row) => row.versionedImplementation)).toEqual([
    "DuckDB v1.5.5",
    "SDA 6.0.0-rc.9",
    "pandas 3.0.3",
  ]);
  expect(duration.map((row) => row.label)).toEqual([
    "1.00 s (-50.0%)",
    "2.00 s (baseline)",
    "4.00 s (+100.0%)",
  ]);

  const memory = createChartData(aggregates, "tabular", "memory");
  expect(memory.map((row) => row.implementation)).toEqual(["pandas", "SDA", "DuckDB"]);
  expect(memory.map((row) => row.label)).toEqual([
    "100 MiB (-50.0%)",
    "200 MiB (baseline)",
    "300 MiB (+50.0%)",
  ]);
  expect(memory.find((row) => row.isSDA)?.implementation).toEqual("SDA");
});

test("benchmark report renders only chart references", () => {
  const markdown = renderBenchmarkResults(aggregates, "tabular");
  expect(markdown).toContain("benchmark-tabular-duration.png");
  expect(markdown).toContain("benchmark-tabular-memory.png");
  expect(markdown).toContain("lower is better");
  expect(markdown.includes("**Versions:**")).toEqual(false);
  expect(markdown.includes("| Mean duration |")).toEqual(false);
});

test("benchmark report replaces only the selected README marker", () => {
  const readme = `before
<!-- benchmark-tabular:start -->
old tabular
<!-- benchmark-tabular:end -->
middle
<!-- benchmark-spatial:start -->
old spatial
<!-- benchmark-spatial:end -->
after
`;
  expect(replaceBenchmarkResults(readme, "new tabular", "tabular")).toEqual(`before
<!-- benchmark-tabular:start -->

new tabular

<!-- benchmark-tabular:end -->
middle
<!-- benchmark-spatial:start -->
old spatial
<!-- benchmark-spatial:end -->
after
`);
  assertThrows(
    () => replaceBenchmarkResults("no markers", "new", "spatial"),
    Error,
    "markers are missing",
  );
});
