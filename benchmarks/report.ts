import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { barX, plot, ruleX, text as plotText } from "@observablehq/plot";
import { SimpleDB } from "../src/index.ts";
import {
  type Aggregate,
  aggregateObservations,
  type BenchmarkName,
  observationsFromCSV,
} from "./helpers.ts";

export type BenchmarkMetric = "duration" | "memory";

export type ChartDatum = {
  implementation: string;
  versionedImplementation: string;
  value: number;
  difference: number;
  label: string;
  isSDA: boolean;
};

const benchmarkDir = dirname(fileURLToPath(import.meta.url));
const rootDir = join(benchmarkDir, "..");
const assetsDir = join(rootDir, "assets");

const markers: Record<BenchmarkName, { start: string; end: string }> = {
  tabular: {
    start: "<!-- benchmark-tabular:start -->",
    end: "<!-- benchmark-tabular:end -->",
  },
  spatial: {
    start: "<!-- benchmark-spatial:start -->",
    end: "<!-- benchmark-spatial:end -->",
  },
};

const implementationNames: Record<string, string> = {
  local: "SDA",
  duckdb: "DuckDB",
  geopandas: "GeoPandas",
  pandas: "pandas",
  sf: "sf",
  tidyverse: "tidyverse",
};

export function percentageDifference(value: number, baseline: number): number {
  return (value / baseline - 1) * 100;
}

function formatDifference(difference: number): string {
  if (Math.abs(difference) < 0.05) return "baseline";
  return `${difference > 0 ? "+" : ""}${difference.toFixed(1)}%`;
}

function absoluteLabel(value: number, metric: BenchmarkMetric): string {
  return metric === "duration"
    ? `${value.toFixed(2)} s`
    : `${Math.round(value).toLocaleString("en-US")} MB`;
}

function chartImplementation(row: Aggregate): string {
  const formatted = formatVersion(row);
  if (row.implementation === "duckdb") {
    return formatted.split("; ").find((part) => part.startsWith("DuckDB ")) ??
      "DuckDB";
  }
  return formatted.split("; ")[0];
}

export function createChartData(
  rows: Aggregate[],
  benchmark: BenchmarkName,
  metric: BenchmarkMetric,
): ChartDatum[] {
  const benchmarkRows = rows.filter((row) => row.benchmark === benchmark);
  const sda = benchmarkRows.find((row) => row.implementation === "local");
  if (sda === undefined) {
    throw new Error(`Cannot create a ${benchmark} chart without local SDA.`);
  }
  const value = (row: Aggregate): number =>
    metric === "duration" ? row.meanSeconds : row.meanPeakMemoryMB;
  const baseline = value(sda);
  return benchmarkRows.map((row) => {
    const measured = value(row);
    const difference = percentageDifference(measured, baseline);
    return {
      implementation: implementationNames[row.implementation] ??
        row.implementation,
      versionedImplementation: chartImplementation(row),
      value: measured,
      difference,
      label: `${absoluteLabel(measured, metric)} (${
        formatDifference(difference)
      })`,
      isSDA: row.implementation === "local",
    };
  }).sort((left, right) => left.value - right.value);
}

export function formatVersion(row: Aggregate): string {
  const runtimeMatch = row.version.match(/\/(deno|python|R)@([^/]+)$/);
  const libraryVersion = runtimeMatch?.index === undefined
    ? row.version
    : row.version.slice(0, runtimeMatch.index);
  let library: string;
  const duckDBMatch = libraryVersion.match(
    /^(@[^@]+)@([^/]+)\/duckdb@(.+)$/,
  );
  if (duckDBMatch !== null) {
    library = `${duckDBMatch[1]} ${duckDBMatch[2]}; DuckDB ${duckDBMatch[3]}`;
  } else {
    const separator = libraryVersion.lastIndexOf("@");
    if (separator <= 0) {
      library = row.implementation === "local"
        ? `SDA ${libraryVersion}`
        : libraryVersion;
    } else {
      const name = libraryVersion.slice(0, separator);
      const version = libraryVersion.slice(separator + 1);
      library = `${name === "geopandas" ? "GeoPandas" : name} ${version}`;
    }
  }
  if (runtimeMatch === null) return library;
  const runtimeNames: Record<string, string> = {
    deno: "Deno",
    python: "Python",
    R: "R",
  };
  return `${library}; ${runtimeNames[runtimeMatch[1]]} ${runtimeMatch[2]}`;
}

function chart(
  rows: ChartDatum[],
  aggregates: Aggregate[],
  benchmark: BenchmarkName,
  metric: BenchmarkMetric,
): SVGSVGElement | HTMLElement {
  const workload = benchmark === "tabular" ? "Tabular" : "Spatial";
  const measure = metric === "duration" ? "duration" : "peak memory";
  const unit = metric === "duration" ? "seconds" : "MB";
  const max = Math.max(...rows.map((row) => row.value));
  return plot({
    width: 960,
    height: 330,
    marginLeft: 115,
    marginRight: 120,
    title: `${workload} workload: mean ${measure}`,
    subtitle: "Lower is better. Percentages are compared with SDA.",
    x: {
      domain: [0, max],
      grid: true,
      label: unit,
    },
    y: {
      domain: rows.map((row) => row.versionedImplementation),
      label: null,
    },
    marks: [
      ruleX([0]),
      barX(rows, {
        x: "value",
        y: "versionedImplementation",
        fill: (row) => row.isSDA ? "#087f8c" : "#adb5bd",
      }),
      plotText(rows, {
        x: "value",
        y: "versionedImplementation",
        text: "label",
        dx: 7,
        textAnchor: "start",
      }),
    ],
    caption: `${runtimeContext(aggregates)} Labels show the absolute mean.`,
  });
}

function runtimeContext(rows: Aggregate[]): string {
  const runtimes = new Set<string>();
  for (const row of rows) {
    const runtime = formatVersion(row).split("; ").at(-1);
    if (runtime !== undefined) runtimes.add(runtime);
  }
  const duckDB = rows.find((row) => row.implementation === "duckdb");
  const nodeAPI = duckDB?.version.match(/^@duckdb\/node-api@([^/]+)/)?.[1];
  const details = [...runtimes];
  if (nodeAPI !== undefined) details.push(`@duckdb/node-api ${nodeAPI}`);
  return `Runtimes: ${details.join(" · ")}.`;
}

export function renderBenchmarkResults(
  rows: Aggregate[],
  benchmark: BenchmarkName,
): string {
  const workloadRows = rows.filter((row) => row.benchmark === benchmark);
  if (workloadRows.length === 0) {
    throw new Error(`Cannot render empty ${benchmark} benchmark results.`);
  }
  const title = benchmark === "tabular" ? "tabular" : "spatial";
  return `![Horizontal bars comparing mean duration for the ${title} workload; lower is better](./assets/benchmark-${benchmark}-duration.png)

![Horizontal bars comparing mean peak memory for the ${title} workload; lower is better](./assets/benchmark-${benchmark}-memory.png)`;
}

export function replaceBenchmarkResults(
  readme: string,
  results: string,
  benchmark: BenchmarkName,
): string {
  const { start: startMarker, end: endMarker } = markers[benchmark];
  const start = readme.indexOf(startMarker);
  const end = readme.indexOf(endMarker);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(
      `README ${benchmark} benchmark markers are missing or out of order.`,
    );
  }
  const contentStart = start + startMarker.length;
  return `${readme.slice(0, contentStart)}\n\n${results.trim()}\n\n${
    readme.slice(end)
  }`;
}

async function writeChart(
  aggregates: Aggregate[],
  benchmark: BenchmarkName,
  metric: BenchmarkMetric,
): Promise<void> {
  const path = join(assetsDir, `benchmark-${benchmark}-${metric}.png`);
  await Deno.remove(path).catch((error) => {
    if (!(error instanceof Deno.errors.NotFound)) throw error;
  });
  const sdb = new SimpleDB();
  try {
    await sdb
      .newTable()
      .loadArray(aggregates)
      .writeChart(
        (data) =>
          chart(
            createChartData(data as Aggregate[], benchmark, metric),
            (data as Aggregate[]).filter((row) => row.benchmark === benchmark),
            benchmark,
            metric,
          ),
        path,
      );
    const stat = await Deno.stat(path);
    if (!stat.isFile || stat.size === 0) {
      throw new Error(`Benchmark chart was not written to ${path}.`);
    }
  } finally {
    await sdb.close();
  }
}

export async function generateBenchmarkReport(
  resultsPath: string,
  readmePath = join(rootDir, "README.md"),
): Promise<void> {
  const observations = observationsFromCSV(
    await Deno.readTextFile(resultsPath),
  );
  const aggregates = aggregateObservations(observations);
  const benchmarks = [...new Set(aggregates.map((row) => row.benchmark))];
  let readme = await Deno.readTextFile(readmePath);
  for (const benchmark of benchmarks) {
    await writeChart(aggregates, benchmark, "duration");
    await writeChart(aggregates, benchmark, "memory");
    readme = replaceBenchmarkResults(
      readme,
      renderBenchmarkResults(aggregates, benchmark),
      benchmark,
    );
  }
  await Deno.writeTextFile(readmePath, readme);
}
