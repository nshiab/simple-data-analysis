import { assertEquals, assertThrows } from "@std/assert";
import {
  aggregateObservations,
  assertEquivalentResults,
  type Observation,
  observationsFromCSV,
  observationsToCSV,
  parseCSV,
  parsePeakMemoryMB,
  rotateValues,
} from "../../../benchmarks/helpers.ts";

Deno.test("benchmark helpers parse macOS peak resident memory", () => {
  const stderr = `        1.23 real         1.00 user         0.20 sys
          134217728  maximum resident set size
                   0  average shared memory size`;
  assertEquals(parsePeakMemoryMB(stderr), 128);
  assertEquals(parsePeakMemoryMB("1.23 real"), null);
});

Deno.test("benchmark helpers parse quoted CSV fields", () => {
  assertEquals(
    parseCSV('name,value\n"Montréal, Québec","a ""quote"""\n'),
    [["name", "value"], ["Montréal, Québec", 'a "quote"']],
  );
  assertThrows(() => parseCSV('name\n"unfinished'));
});

Deno.test("benchmark helpers rotate values without mutating the input", () => {
  const values = ["sda", "pandas", "tidyverse", "duckdb"];
  assertEquals(rotateValues(values, 1), [
    "pandas",
    "tidyverse",
    "duckdb",
    "sda",
  ]);
  assertEquals(rotateValues(values, 5), [
    "pandas",
    "tidyverse",
    "duckdb",
    "sda",
  ]);
  assertEquals(rotateValues(values, -1), [
    "duckdb",
    "sda",
    "pandas",
    "tidyverse",
  ]);
  assertEquals(values, ["sda", "pandas", "tidyverse", "duckdb"]);
  assertEquals(rotateValues([], 3), []);
});

Deno.test("benchmark helpers validate tabular results with numeric tolerance", () => {
  const expected =
    "station,station_name,decade,mean\n1,Montréal,1990,2.5\n2,Québec,2000,-1\n";
  const equivalent =
    "station,station_name,decade,mean\n2,Québec,2000,-1\n1,Montréal,1990,2.50000000001\n";
  assertEquivalentResults(expected, equivalent, "tabular", "pandas");
  assertThrows(
    () =>
      assertEquivalentResults(
        expected,
        equivalent.replace("2.50000000001", "2.6"),
        "tabular",
        "pandas",
      ),
    Error,
    "raw DuckDB produced 2.5",
  );
});

Deno.test("benchmark helpers validate spatial counts exactly", () => {
  const expected = "nom_qr,count\nCentre-Sud,12\n";
  assertThrows(
    () =>
      assertEquivalentResults(
        expected,
        "nom_qr,count\nCentre-Sud,13\n",
        "spatial",
        "sf",
      ),
    Error,
    "raw DuckDB produced 12",
  );
});

Deno.test("benchmark helpers round-trip and aggregate raw observations", () => {
  const rows: Observation[] = [
    {
      package: "simple-data-analysis",
      benchmark: "tabular",
      implementation: "duckdb",
      version: "1",
      iteration: 1,
      seconds: 2,
      peakMemoryMB: 100,
    },
    {
      package: "simple-data-analysis",
      benchmark: "tabular",
      implementation: "duckdb",
      version: "1",
      iteration: 2,
      seconds: 4,
      peakMemoryMB: 200,
    },
    {
      package: "simple-data-analysis",
      benchmark: "tabular",
      implementation: "local",
      version: "2,local",
      iteration: 1,
      seconds: 6,
      peakMemoryMB: 300,
    },
  ];
  const csv = observationsToCSV(rows);
  assertEquals(observationsFromCSV(csv), rows);
  assertEquals(aggregateObservations(rows), [
    {
      benchmark: "tabular",
      implementation: "duckdb",
      version: "1",
      meanSeconds: 3,
      stdDevSeconds: 1,
      meanPeakMemoryMB: 150,
    },
    {
      benchmark: "tabular",
      implementation: "local",
      version: "2,local",
      meanSeconds: 6,
      stdDevSeconds: 0,
      meanPeakMemoryMB: 300,
    },
  ]);
});

Deno.test("benchmark result parser rejects the wrong schema", () => {
  assertThrows(
    () => observationsFromCSV("wrong,schema\n"),
    Error,
    "Unexpected benchmark result schema",
  );
});
