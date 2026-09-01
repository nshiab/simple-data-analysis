import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { generateBenchmarkReport } from "./report.ts";
import assertEquivalentCleanOutputs from "./cleanValidation.ts";
import {
  assertEquivalentResults,
  type BenchmarkName,
  csvEscape,
  type Observation,
  observationsToCSV,
  parsePeakMemoryMB,
  rotateValues,
} from "./helpers.ts";
import {
  type QueryProfile,
  queryProfileEnvironment,
  readQueryProfile,
} from "./queryProfile.ts";

type CommandSpec = {
  command: string;
  args: string[];
};

type Implementation = {
  name: string;
  version: string;
  command: (benchmark: BenchmarkName) => CommandSpec;
};

type RunResult = {
  resultCSV: string;
  seconds: number;
  peakMemoryMB: number;
  profile: QueryProfile | null;
  artifacts: { directory: string; cleanOutput: string } | null;
};

type ProfileRun = {
  benchmark: BenchmarkName;
  implementation: string;
  processMilliseconds: number;
  profile: QueryProfile;
};

const decoder = new TextDecoder();
const benchmarkDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(benchmarkDir, "..");
const workRoot = join(benchmarkDir, ".work");
const observationsPath = join(workRoot, "observations.csv");

function parseArguments(): {
  iterations: number;
  dataDir: string;
  benchmarks: BenchmarkName[];
  profile: boolean;
} {
  let iterations = 3;
  let dataDir = join(benchmarkDir, "data");
  let benchmarks: BenchmarkName[] = ["tabular", "spatial"];
  let profile = false;
  for (const argument of Deno.args) {
    if (argument.startsWith("--iterations=")) {
      iterations = Number(argument.slice("--iterations=".length));
    } else if (argument.startsWith("--data-dir=")) {
      dataDir = resolve(argument.slice("--data-dir=".length));
    } else if (argument.startsWith("--only=")) {
      const value = argument.slice("--only=".length);
      if (value !== "tabular" && value !== "spatial") {
        throw new Error(
          `--only must be tabular or spatial. Received ${value}.`,
        );
      }
      benchmarks = [value];
    } else if (argument === "--profile") {
      profile = true;
    } else {
      throw new Error(`Unknown benchmark argument ${argument}.`);
    }
  }
  if (!Number.isInteger(iterations) || iterations < 1) {
    throw new Error(`--iterations must be a positive integer.`);
  }
  return { iterations, dataDir, benchmarks, profile };
}

async function commandText(spec: CommandSpec): Promise<string> {
  const output = await new Deno.Command(spec.command, {
    args: spec.args,
    cwd: rootDir,
    stdout: "piped",
    stderr: "piped",
  }).output();
  if (!output.success) {
    throw new Error(
      `${spec.command} ${spec.args.join(" ")} failed:\n${
        decoder.decode(output.stderr)
      }`,
    );
  }
  return decoder.decode(output.stdout).trim();
}

async function localVersion(): Promise<string> {
  const config = JSON.parse(
    await Deno.readTextFile(join(rootDir, "deno.json")),
  ) as { version: string };
  return `${config.version}/deno@${Deno.version.deno}`;
}

async function pythonVersions(): Promise<{
  pandas: string;
  geopandas: string;
}> {
  const output = await commandText({
    command: "python3",
    args: [
      "-c",
      "import sys,pandas,geopandas; print(f'{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}|{pandas.__version__}|{geopandas.__version__}')",
    ],
  });
  const [python, pandas, geopandas] = output.split("|");
  return {
    pandas: `pandas@${pandas}/python@${python}`,
    geopandas: `geopandas@${geopandas}/python@${python}`,
  };
}

async function rVersions(): Promise<{ tidyverse: string; sf: string }> {
  const output = await commandText({
    command: "Rscript",
    args: [
      "-e",
      'cat(paste(R.version$major, R.version$minor, sep="."), as.character(packageVersion("tidyverse")), as.character(packageVersion("sf")), sep="|")',
    ],
  });
  const [r, tidyverse, sf] = output.split("|");
  return {
    tidyverse: `tidyverse@${tidyverse}/R@${r}`,
    sf: `sf@${sf}/R@${r}`,
  };
}

async function rawDuckDBVersion(): Promise<string> {
  const config = JSON.parse(
    await Deno.readTextFile(join(rootDir, "deno.json")),
  ) as { imports?: { [key: string]: string } };
  const nodeAPISpecifier = config.imports?.["@duckdb/node-api"];
  const nodeAPIVersion = nodeAPISpecifier?.match(
    /^npm:@duckdb\/node-api@(.+)$/,
  )?.[1];
  if (nodeAPIVersion === undefined) {
    throw new Error(
      'deno.json must pin "@duckdb/node-api" as "npm:@duckdb/node-api@<version>".',
    );
  }
  const version = await commandText({
    command: "deno",
    args: [
      "run",
      "-A",
      `--config=${join(rootDir, "deno.json")}`,
      join(benchmarkDir, "duckdbVersion.ts"),
    ],
  });
  return `@duckdb/node-api@${nodeAPIVersion}/duckdb@${version}/deno@${Deno.version.deno}`;
}

function localImplementation(version: string): Implementation {
  return {
    name: "local",
    version,
    command: (benchmark) => ({
      command: "deno",
      args: [
        "run",
        "-A",
        `--config=${join(rootDir, "deno.json")}`,
        join(benchmarkDir, benchmark, "sda.ts"),
      ],
    }),
  };
}

function duckDBImplementation(version: string): Implementation {
  return {
    name: "duckdb",
    version,
    command: (benchmark) => ({
      command: "deno",
      args: [
        "run",
        "-A",
        `--config=${join(rootDir, "deno.json")}`,
        join(benchmarkDir, benchmark, "duckdb.ts"),
      ],
    }),
  };
}

async function profiledImplementations(): Promise<Implementation[]> {
  const [local, duckdb] = await Promise.all([
    localVersion(),
    rawDuckDBVersion(),
  ]);
  return [localImplementation(local), duckDBImplementation(duckdb)];
}

async function implementations(): Promise<Implementation[]> {
  const [local, python, r, duckdb] = await Promise.all([
    localVersion(),
    pythonVersions(),
    rVersions(),
    rawDuckDBVersion(),
  ]);
  return [
    localImplementation(local),
    {
      name: "pandas",
      version: python.pandas,
      command: () => ({
        command: "python3",
        args: [join(benchmarkDir, "tabular", "pandas.py")],
      }),
    },
    {
      name: "tidyverse",
      version: r.tidyverse,
      command: () => ({
        command: "Rscript",
        args: [join(benchmarkDir, "tabular", "tidyverse.R")],
      }),
    },
    {
      name: "geopandas",
      version: python.geopandas,
      command: () => ({
        command: "python3",
        args: [join(benchmarkDir, "spatial", "geopandas.py")],
      }),
    },
    {
      name: "sf",
      version: r.sf,
      command: () => ({
        command: "Rscript",
        args: [join(benchmarkDir, "spatial", "sf.R")],
      }),
    },
    duckDBImplementation(duckdb),
  ];
}

function forBenchmark(
  all: Implementation[],
  benchmark: BenchmarkName,
): Implementation[] {
  const names = benchmark === "tabular"
    ? ["local", "pandas", "tidyverse", "duckdb"]
    : ["local", "geopandas", "sf", "duckdb"];
  return names.map((name) => {
    const implementation = all.find((candidate) => candidate.name === name);
    if (implementation === undefined) {
      throw new Error(`Missing implementation ${name}.`);
    }
    return implementation;
  });
}

async function assertFile(path: string, description: string): Promise<void> {
  try {
    const stat = await Deno.stat(path);
    if (!stat.isFile) throw new Error("not a file");
  } catch {
    throw new Error(
      `Missing ${description} at ${path}. See the Performance benchmarks section in README.md for data setup.`,
    );
  }
}

async function inputPaths(
  dataDir: string,
  benchmarks: BenchmarkName[],
): Promise<Record<BenchmarkName, { input: string; polygons?: string }>> {
  const tabular = join(dataDir, "ahccd.csv");
  const legacyTabular = join(rootDir, "test", "data", "files", "ahccd.csv");
  const tabularInput = await Deno.stat(tabular).then(() => tabular).catch(() =>
    legacyTabular
  );
  const spatial = join(dataDir, "arbres-publics.csv");
  const polygons = join(dataDir, "quartierreferencehabitation.geojson");
  if (benchmarks.includes("tabular")) {
    await assertFile(tabularInput, "AHCCD CSV");
  }
  if (benchmarks.includes("spatial")) {
    await assertFile(spatial, "Montreal trees CSV");
    await assertFile(polygons, "Montreal neighbourhoods GeoJSON");
  }
  return {
    tabular: { input: tabularInput },
    spatial: { input: spatial, polygons },
  };
}

async function runImplementation(
  implementation: Implementation,
  benchmark: BenchmarkName,
  paths: { input: string; polygons?: string },
  preserveArtifacts = false,
  profile = false,
): Promise<RunResult> {
  const runDir = await Deno.makeTempDir({
    dir: workRoot,
    prefix: `${benchmark}-${implementation.name}-`,
  });
  const resultOutput = join(runDir, "result.csv");
  const cleanOutput = join(runDir, "clean.csv");
  const profileOutput = join(runDir, "query-profile.json");
  const environment: { [key: string]: string } = {
    BENCHMARK_INPUT: paths.input,
    BENCHMARK_RESULT_OUTPUT: resultOutput,
    BENCHMARK_CLEAN_OUTPUT: cleanOutput,
  };
  if (paths.polygons !== undefined) {
    environment.BENCHMARK_POLYGONS = paths.polygons;
  }
  if (profile) {
    environment[queryProfileEnvironment] = profileOutput;
  }
  const spec = implementation.command(benchmark);
  const timed = Deno.build.os === "darwin";
  const command = timed ? "/usr/bin/time" : spec.command;
  const args = timed ? ["-l", spec.command, ...spec.args] : spec.args;
  const start = performance.now();
  const output = await new Deno.Command(command, {
    args,
    cwd: rootDir,
    env: environment,
    stdout: "piped",
    stderr: "piped",
  }).output();
  const seconds = (performance.now() - start) / 1000;
  const stdout = decoder.decode(output.stdout);
  const stderr = decoder.decode(output.stderr);
  if (!output.success) {
    throw new Error(
      `${implementation.name} ${benchmark} failed. Artifacts are preserved in ${runDir}.\n${stdout}${stderr}`,
    );
  }
  const peakMemoryMB = timed ? parsePeakMemoryMB(stderr) : null;
  if (timed && peakMemoryMB === null) {
    throw new Error(
      `Could not parse maximum resident set size for ${implementation.name}. Artifacts are preserved in ${runDir}.\n${stderr}`,
    );
  }
  const resultCSV = await Deno.readTextFile(resultOutput);
  const queryProfile = profile ? await readQueryProfile(profileOutput) : null;
  if (!preserveArtifacts) {
    await Deno.remove(runDir, { recursive: true });
  }
  return {
    resultCSV,
    seconds,
    peakMemoryMB: peakMemoryMB ?? Number.NaN,
    profile: queryProfile,
    artifacts: preserveArtifacts ? { directory: runDir, cleanOutput } : null,
  };
}

function profileRunsToCSV(runs: ProfileRun[]): string {
  const header =
    "benchmark,implementation,processMilliseconds,programMilliseconds,sequence,label,table,milliseconds,query";
  const rows = runs.flatMap((run) =>
    run.profile.queries.map((query) =>
      [
        run.benchmark,
        run.implementation,
        run.processMilliseconds.toFixed(3),
        run.profile.totalMilliseconds.toFixed(3),
        query.sequence,
        query.label,
        query.table ?? "",
        query.milliseconds.toFixed(3),
        query.query,
      ].map(csvEscape).join(",")
    )
  );
  return `${header}\n${rows.join("\n")}\n`;
}

function printProfile(run: ProfileRun): void {
  const queryMilliseconds = run.profile.queries.reduce(
    (sum, query) => sum + query.milliseconds,
    0,
  );
  const residualMilliseconds = run.profile.totalMilliseconds -
    queryMilliseconds;
  const startupMilliseconds = run.processMilliseconds -
    run.profile.totalMilliseconds;
  console.log(`\n${run.benchmark} ${run.implementation}`);
  for (const query of run.profile.queries) {
    const sql = query.query.replaceAll(/\s+/g, " ").trim();
    const preview = sql.length > 100 ? `${sql.slice(0, 97)}...` : sql;
    const table = query.table === null ? "" : ` [${query.table}]`;
    console.log(
      `  ${query.sequence}. ${
        query.milliseconds.toFixed(1)
      } ms  ${query.label}${table}  ${preview}`,
    );
  }
  console.log(`  SQL total: ${queryMilliseconds.toFixed(1)} ms`);
  console.log(`  In-program residual: ${residualMilliseconds.toFixed(1)} ms`);
  console.log(`  Runtime/module startup: ${startupMilliseconds.toFixed(1)} ms`);
  console.log(`  Process total: ${run.processMilliseconds.toFixed(1)} ms`);
}

async function runProfiles(
  benchmarks: BenchmarkName[],
  paths: Record<BenchmarkName, { input: string; polygons?: string }>,
): Promise<void> {
  const candidates = await profiledImplementations();
  const runs: ProfileRun[] = [];
  console.log(`Profile benchmarks: ${benchmarks.join(", ")}`);
  console.log(
    "One warm-up, then one profiled fresh process for SDA and raw DuckDB.",
  );
  console.log(
    "Profile mode splits raw DuckDB statements and does not update README.",
  );

  for (const benchmark of benchmarks) {
    for (const implementation of candidates) {
      console.log(`Warm-up profile ${benchmark}: ${implementation.name}`);
      await runImplementation(
        implementation,
        benchmark,
        paths[benchmark],
      );
    }
    const results = new Map<string, RunResult>();
    for (const implementation of candidates) {
      console.log(`Profile ${benchmark}: ${implementation.name}`);
      const result = await runImplementation(
        implementation,
        benchmark,
        paths[benchmark],
        benchmark === "tabular",
        true,
      );
      results.set(implementation.name, result);
      if (result.profile === null) {
        throw new Error(
          `${implementation.name} ${benchmark} did not write a query profile.`,
        );
      }
      runs.push({
        benchmark,
        implementation: implementation.name,
        processMilliseconds: result.seconds * 1000,
        profile: result.profile,
      });
    }

    const expected = results.get("duckdb")?.resultCSV;
    if (expected === undefined) {
      throw new Error("Raw DuckDB profile is missing.");
    }
    for (const implementation of candidates) {
      assertEquivalentResults(
        expected,
        results.get(implementation.name)?.resultCSV ?? "",
        benchmark,
        implementation.name,
      );
    }
    if (benchmark === "tabular") {
      const expectedClean = results.get("duckdb")?.artifacts?.cleanOutput;
      const actualClean = results.get("local")?.artifacts?.cleanOutput;
      if (expectedClean === undefined || actualClean === undefined) {
        throw new Error("Tabular profile cleaned outputs are missing.");
      }
      await assertEquivalentCleanOutputs(expectedClean, actualClean, "local");
    }
    for (const result of results.values()) {
      if (result.artifacts !== null) {
        await Deno.remove(result.artifacts.directory, { recursive: true });
      }
    }
  }

  for (const run of runs) printProfile(run);
  const path = join(workRoot, "query-profile.csv");
  await Deno.writeTextFile(path, profileRunsToCSV(runs));
  console.log(`\nWrote ${path}`);
}

async function runBenchmarks(
  iterations: number,
  benchmarks: BenchmarkName[],
  paths: Record<BenchmarkName, { input: string; polygons?: string }>,
): Promise<void> {
  const allImplementations = await implementations();
  const observations: Observation[] = [];

  console.log(`Benchmarks: ${benchmarks.join(", ")}`);
  console.log(`Measured iterations: ${iterations}`);
  console.log("Warm-up: one fresh process per implementation");

  for (const benchmark of benchmarks) {
    const candidates = forBenchmark(allImplementations, benchmark);
    const warmups = new Map<string, RunResult>();
    for (const implementation of candidates) {
      console.log(`Warm-up ${benchmark}: ${implementation.name}`);
      const result = await runImplementation(
        implementation,
        benchmark,
        paths[benchmark],
        benchmark === "tabular",
      );
      warmups.set(implementation.name, result);
    }
    const expected = warmups.get("duckdb")?.resultCSV;
    if (expected === undefined) {
      throw new Error("Raw DuckDB warm-up is missing.");
    }
    for (const implementation of candidates) {
      assertEquivalentResults(
        expected,
        warmups.get(implementation.name)?.resultCSV ?? "",
        benchmark,
        implementation.name,
      );
    }
    console.log(`${benchmark} warm-up results are equivalent.`);

    if (benchmark === "tabular") {
      const expectedClean = warmups.get("duckdb")?.artifacts?.cleanOutput;
      if (expectedClean === undefined) {
        throw new Error("Raw DuckDB cleaned warm-up output is missing.");
      }
      for (const implementation of candidates) {
        if (implementation.name === "duckdb") continue;
        const actualClean = warmups.get(implementation.name)?.artifacts
          ?.cleanOutput;
        if (actualClean === undefined) {
          throw new Error(
            `${implementation.name} cleaned warm-up output is missing.`,
          );
        }
        await assertEquivalentCleanOutputs(
          expectedClean,
          actualClean,
          implementation.name,
        );
      }
      for (const result of warmups.values()) {
        if (result.artifacts !== null) {
          await Deno.remove(result.artifacts.directory, { recursive: true });
        }
      }
      console.log("tabular cleaned warm-up outputs are equivalent.");
    }

    for (let iteration = 1; iteration <= iterations; iteration++) {
      for (const implementation of rotateValues(candidates, iteration)) {
        console.log(
          `Measure ${benchmark}: ${implementation.name} (${iteration}/${iterations})`,
        );
        const result = await runImplementation(
          implementation,
          benchmark,
          paths[benchmark],
        );
        assertEquivalentResults(
          expected,
          result.resultCSV,
          benchmark,
          implementation.name,
        );
        observations.push({
          package: "simple-data-analysis",
          benchmark,
          implementation: implementation.name,
          version: implementation.version,
          iteration,
          seconds: result.seconds,
          peakMemoryMB: result.peakMemoryMB,
        });
        await Deno.writeTextFile(
          observationsPath,
          observationsToCSV(observations),
        );
      }
    }
  }

  await generateBenchmarkReport(observationsPath);
  await Deno.remove(observationsPath);
  console.log(`Updated benchmark assets and ${join(rootDir, "README.md")}`);
}

const { iterations, dataDir, benchmarks, profile } = parseArguments();
if (Deno.build.os !== "darwin") {
  throw new Error(
    "This benchmark currently requires macOS so /usr/bin/time -l can capture peak memory consistently.",
  );
}
await Deno.mkdir(workRoot, { recursive: true });
const paths = await inputPaths(dataDir, benchmarks);
if (profile) {
  await runProfiles(benchmarks, paths);
} else {
  await runBenchmarks(iterations, benchmarks, paths);
}
