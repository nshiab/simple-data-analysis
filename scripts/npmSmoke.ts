interface CommandOptions {
  cwd: string;
  env?: Record<string, string>;
}

interface PackReport {
  name: string;
  version: string;
  size: number;
  unpackedSize: number;
  entryCount: number;
  files: { path: string }[];
}

const decoder = new TextDecoder();
const root = new URL("../", import.meta.url);
const rootPath = root.pathname;
const npmPath = new URL("npm/", root).pathname;
const denoConfig = JSON.parse(
  await Deno.readTextFile(new URL("deno.json", root)),
) as {
  name: string;
  version: string;
  exports: Record<string, string>;
};

async function run(
  command: string,
  args: string[],
  options: CommandOptions,
): Promise<string> {
  const output = await new Deno.Command(command, {
    args,
    cwd: options.cwd,
    env: options.env,
    stdout: "piped",
    stderr: "piped",
  }).output();
  const stdout = decoder.decode(output.stdout);
  const stderr = decoder.decode(output.stderr);
  if (!output.success) {
    throw new Error(
      `${command} ${
        args.join(" ")
      } failed with exit code ${output.code}\n${stdout}${stderr}`,
    );
  }
  return stdout;
}

function readPackReport(value: unknown): PackReport {
  let report: unknown;
  if (Array.isArray(value)) {
    report = value[0];
  } else if (value !== null && typeof value === "object") {
    report = Object.values(value)[0];
  }
  if (
    report === null || typeof report !== "object" ||
    !("files" in report) || !Array.isArray(report.files)
  ) {
    throw new Error("npm pack returned an unexpected report");
  }
  return report as PackReport;
}

const packageName = JSON.stringify(denoConfig.name);
const integrationAssertions = denoConfig.name ===
    "@nshiab/simple-data-analysis"
  ? `
if (
  typeof SimpleTable.prototype.writeChart !== "function" ||
  typeof SimpleTable.prototype.aiEmbeddings !== "function"
) {
  throw new Error("Expected SDA integration methods");
}`
  : "";
const helperEsmAssertions = denoConfig.exports["./helpers"]
  ? `
const helpers = await import(${JSON.stringify(`${denoConfig.name}/helpers`)});
if (
  typeof helpers.createDirectory !== "function" ||
  typeof helpers.queueAsyncBarrier !== "function"
) {
  throw new Error("Expected core helper exports");
}`
  : "";
const helperCjsAssertions = denoConfig.exports["./helpers"]
  ? `
const helpers = require(${JSON.stringify(`${denoConfig.name}/helpers`)});
if (
  typeof helpers.createDirectory !== "function" ||
  typeof helpers.queueAsyncBarrier !== "function"
) {
  throw new Error("Expected core helper exports");
}`
  : "";

const operationAssertions = `
if (typeof SimpleDB !== "function" || typeof SimpleTable !== "function") {
  throw new Error("Expected SimpleDB and SimpleTable exports");
}
${integrationAssertions}
const sdb = new SimpleDB();
try {
  const table = sdb
    .newTable("smoke")
    .loadArray([
      { id: 1, value: 2 },
      { id: 2, value: 4 },
      { id: 3, value: 1 },
    ])
    .filter("value >= 2")
    .sort({ value: "desc" });
  if (!(table instanceof SimpleTable)) {
    throw new Error("newTable() returned the wrong class");
  }
  const actual = JSON.stringify(await table.getData());
  const expected = JSON.stringify([
    { id: 2, value: 4 },
    { id: 1, value: 2 },
  ]);
  if (actual !== expected) {
    throw new Error(\`Expected \${expected}, received \${actual}\`);
  }
} finally {
  await sdb.close();
}`;

const esmSmoke = `
const { SimpleDB, SimpleTable } = await import(${packageName});
${helperEsmAssertions}
${operationAssertions}
`;
const cjsSmoke = `
const { SimpleDB, SimpleTable } = require(${packageName});
${helperCjsAssertions}
(async () => {
  ${operationAssertions}
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
`;

const npmCache = await Deno.makeTempDir({ prefix: "sda-npm-smoke-" });
const env = { NPM_CONFIG_CACHE: npmCache };
try {
  console.log(`Building ${denoConfig.name}@${denoConfig.version} for npm...`);
  await run(
    Deno.execPath(),
    ["run", "--no-lock", "-A", "jsr:@nshiab/deno-to-npm"],
    { cwd: rootPath, env },
  );

  for (
    const [runtime, command, args] of [
      ["Node ESM", "node", ["--input-type=module", "--eval", esmSmoke]],
      ["Node CommonJS", "node", ["--eval", cjsSmoke]],
      ["Bun ESM", "bun", ["--eval", esmSmoke]],
      ["Bun CommonJS", "bun", ["--eval", cjsSmoke]],
    ] as const
  ) {
    await run(command, [...args], { cwd: npmPath, env });
    console.log(`Passed ${runtime} smoke test.`);
  }

  const packReport = readPackReport(
    JSON.parse(
      await run("npm", ["pack", "--dry-run", "--json"], {
        cwd: npmPath,
        env,
      }),
    ),
  );
  const paths = new Set(packReport.files.map(({ path }) => path));
  for (
    const required of [
      "package.json",
      "README.md",
      "LICENSE",
      "esm/index.js",
      "esm/index.d.ts",
      "script/index.js",
      "script/index.d.ts",
    ]
  ) {
    if (!paths.has(required)) {
      throw new Error(`npm package is missing ${required}`);
    }
  }
  const excludedPrefixes = [
    "node_modules/",
    "test/",
    "benchmarks/",
    ".github/",
  ];
  const unexpected = [...paths].filter((path) =>
    excludedPrefixes.some((prefix) => path.startsWith(prefix))
  );
  if (unexpected.length > 0) {
    throw new Error(`npm package contains unexpected files: ${unexpected[0]}`);
  }
  if (
    packReport.name !== denoConfig.name ||
    packReport.version !== denoConfig.version
  ) {
    throw new Error(
      `npm package identity is ${packReport.name}@${packReport.version}`,
    );
  }
  console.log(
    `Passed npm pack check (${packReport.entryCount} files, ${packReport.size} bytes packed, ${packReport.unpackedSize} bytes unpacked).`,
  );
} finally {
  await Deno.remove(npmCache, { recursive: true }).catch(() => undefined);
}
