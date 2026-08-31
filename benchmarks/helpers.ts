export type BenchmarkName = "tabular" | "spatial";

export type Observation = {
  package: string;
  benchmark: BenchmarkName;
  implementation: string;
  version: string;
  iteration: number;
  seconds: number;
  peakMemoryMB: number;
};

export type Aggregate = {
  benchmark: BenchmarkName;
  implementation: string;
  version: string;
  meanSeconds: number;
  stdDevSeconds: number;
  meanPeakMemoryMB: number;
};

export function rotateValues<T>(values: T[], offset: number): T[] {
  if (values.length === 0) return [];
  const normalized = ((offset % values.length) + values.length) % values.length;
  return [...values.slice(normalized), ...values.slice(0, normalized)];
}

export function parsePeakMemoryMB(stderr: string): number | null {
  const match = stderr.match(
    /(?:^|\n)\s*(\d+)\s+maximum resident set size\s*(?:\n|$)/,
  );
  return match === null ? null : Number(match[1]) / (1024 * 1024);
}

export function csvEscape(value: string | number): string {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function observationsToCSV(rows: Observation[]): string {
  const header =
    "package,benchmark,implementation,version,iteration,seconds,peakMemoryMB";
  return `${header}\n${
    rows.map((row) =>
      [
        row.package,
        row.benchmark,
        row.implementation,
        row.version,
        row.iteration,
        row.seconds.toFixed(6),
        row.peakMemoryMB.toFixed(3),
      ].map(csvEscape).join(",")
    ).join("\n")
  }${rows.length === 0 ? "" : "\n"}`;
}

export function parseCSV(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < csv.length; i++) {
    const character = csv[i];
    if (quoted) {
      if (character === '"' && csv[i + 1] === '"') {
        field += '"';
        i++;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"' && field.length === 0) {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (quoted) {
    throw new Error("CSV ended inside a quoted field.");
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }
  return rows.filter((values) => values.some((value) => value.length > 0));
}

function keyedRows(
  csv: string,
  benchmark: BenchmarkName,
): { key: string; value: number }[] {
  const rows = parseCSV(csv);
  const expected = benchmark === "tabular"
    ? ["station", "station_name", "decade", "mean"]
    : ["nom_qr", "count"];
  const header = rows.shift();
  if (header === undefined || header.join("\0") !== expected.join("\0")) {
    throw new Error(
      `${benchmark} result columns must be ${expected.join(",")}. Received ${
        header?.join(",") ?? "no header"
      }.`,
    );
  }

  const numericIndex = expected.length - 1;
  return rows.map((values, index) => {
    if (values.length !== expected.length) {
      throw new Error(
        `${benchmark} result row ${
          index + 2
        } has ${values.length} columns; expected ${expected.length}.`,
      );
    }
    const value = Number(values[numericIndex]);
    if (!Number.isFinite(value)) {
      throw new Error(
        `${benchmark} result row ${index + 2} has a non-numeric ${
          expected[numericIndex]
        }.`,
      );
    }
    return {
      key: values.slice(0, numericIndex).join("\0"),
      value,
    };
  }).sort((left, right) => left.key.localeCompare(right.key));
}

export function assertEquivalentResults(
  expectedCSV: string,
  actualCSV: string,
  benchmark: BenchmarkName,
  implementation: string,
): void {
  const expected = keyedRows(expectedCSV, benchmark);
  const actual = keyedRows(actualCSV, benchmark);
  if (actual.length !== expected.length) {
    throw new Error(
      `${implementation} produced ${actual.length} ${benchmark} rows; raw DuckDB produced ${expected.length}.`,
    );
  }

  for (let i = 0; i < expected.length; i++) {
    if (actual[i].key !== expected[i].key) {
      throw new Error(
        `${implementation} produced a different ${benchmark} key at sorted row ${
          i + 1
        }.`,
      );
    }
    const tolerance = benchmark === "tabular"
      ? Math.max(1e-10, Math.abs(expected[i].value) * 1e-10)
      : 0;
    if (Math.abs(actual[i].value - expected[i].value) > tolerance) {
      throw new Error(
        `${implementation} produced ${actual[i].value} for ${
          actual[i].key
        }; raw DuckDB produced ${expected[i].value}.`,
      );
    }
  }
}

export function aggregateObservations(rows: Observation[]): Aggregate[] {
  const groups = new Map<string, Observation[]>();
  for (const row of rows) {
    const key = [row.benchmark, row.implementation, row.version].join("\0");
    const group = groups.get(key) ?? [];
    group.push(row);
    groups.set(key, group);
  }

  return [...groups.values()].map((group) => {
    const meanSeconds = group.reduce((sum, row) => sum + row.seconds, 0) /
      group.length;
    const variance = group.reduce(
      (sum, row) => sum + (row.seconds - meanSeconds) ** 2,
      0,
    ) / group.length;
    return {
      benchmark: group[0].benchmark,
      implementation: group[0].implementation,
      version: group[0].version,
      meanSeconds,
      stdDevSeconds: Math.sqrt(variance),
      meanPeakMemoryMB: group.reduce(
        (sum, row) => sum + row.peakMemoryMB,
        0,
      ) / group.length,
    };
  }).sort((left, right) =>
    left.benchmark.localeCompare(right.benchmark) ||
    left.meanSeconds - right.meanSeconds
  );
}

export function observationsFromCSV(csv: string): Observation[] {
  const rows = parseCSV(csv);
  const header = rows.shift();
  const expected = [
    "package",
    "benchmark",
    "implementation",
    "version",
    "iteration",
    "seconds",
    "peakMemoryMB",
  ];
  if (header?.join("\0") !== expected.join("\0")) {
    throw new Error("Unexpected benchmark result schema.");
  }
  return rows.map((values) => ({
    package: values[0],
    benchmark: values[1] as BenchmarkName,
    implementation: values[2],
    version: values[3],
    iteration: Number(values[4]),
    seconds: Number(values[5]),
    peakMemoryMB: Number(values[6]),
  }));
}
