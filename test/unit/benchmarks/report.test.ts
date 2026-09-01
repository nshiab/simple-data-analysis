import { assertEquals, assertStringIncludes, assertThrows } from "@std/assert";
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
    version: "@duckdb/node-api@1.5.5-r.4/duckdb@v1.5.5/deno@2.9.6",
    meanSeconds: 1,
    stdDevSeconds: 0.1,
    meanPeakMemoryMB: 300,
  },
  {
    benchmark: "tabular",
    implementation: "local",
    version: "6.0.0-rc.9/deno@2.9.6",
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

Deno.test("benchmark report calculates SDA-relative percentages", () => {
  assertEquals(percentageDifference(1, 2), -50);
  assertEquals(percentageDifference(2, 2), 0);
  assertEquals(percentageDifference(3, 2), 50);
});

Deno.test("benchmark report presents discovered library and runtime versions", () => {
  assertEquals(
    formatVersion(aggregates[0]),
    "@duckdb/node-api 1.5.5-r.4; DuckDB v1.5.5; Deno 2.9.6",
  );
  assertEquals(formatVersion(aggregates[1]), "SDA 6.0.0-rc.9; Deno 2.9.6");
  assertEquals(formatVersion(aggregates[2]), "pandas 3.0.3; Python 3.14.5");
});

Deno.test("benchmark report sorts each chart by its measured value", () => {
  const duration = createChartData(aggregates, "tabular", "duration");
  assertEquals(duration.map((row) => row.implementation), [
    "DuckDB",
    "SDA",
    "pandas",
  ]);
  assertEquals(duration.map((row) => row.versionedImplementation), [
    "DuckDB v1.5.5",
    "SDA 6.0.0-rc.9",
    "pandas 3.0.3",
  ]);
  assertEquals(duration.map((row) => row.label), [
    "1.00 s (-50.0%)",
    "2.00 s (baseline)",
    "4.00 s (+100.0%)",
  ]);

  const memory = createChartData(aggregates, "tabular", "memory");
  assertEquals(memory.map((row) => row.implementation), [
    "pandas",
    "SDA",
    "DuckDB",
  ]);
  assertEquals(memory.map((row) => row.label), [
    "100 MB (-50.0%)",
    "200 MB (baseline)",
    "300 MB (+50.0%)",
  ]);
  assertEquals(memory.find((row) => row.isSDA)?.implementation, "SDA");
});

Deno.test("benchmark report renders only chart references", () => {
  const markdown = renderBenchmarkResults(aggregates, "tabular");
  assertStringIncludes(markdown, "benchmark-tabular-duration.png");
  assertStringIncludes(markdown, "benchmark-tabular-memory.png");
  assertStringIncludes(markdown, "lower is better");
  assertEquals(markdown.includes("**Versions:**"), false);
  assertEquals(markdown.includes("| Mean duration |"), false);
});

Deno.test("benchmark report replaces only the selected README marker", () => {
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
  assertEquals(
    replaceBenchmarkResults(readme, "new tabular", "tabular"),
    `before
<!-- benchmark-tabular:start -->

new tabular

<!-- benchmark-tabular:end -->
middle
<!-- benchmark-spatial:start -->
old spatial
<!-- benchmark-spatial:end -->
after
`,
  );
  assertThrows(
    () => replaceBenchmarkResults("no markers", "new", "spatial"),
    Error,
    "markers are missing",
  );
});
