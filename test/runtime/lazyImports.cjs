// After building the npm package, run with Node and Bun, using each entry point:
// node test/runtime/lazyImports.cjs /absolute/path/to/npm esm
// bun test/runtime/lazyImports.cjs /absolute/path/to/npm script
const assert = require("node:assert/strict");
const { mkdtempSync, readFileSync, rmSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { join, resolve } = require("node:path");
const { pathToFileURL } = require("node:url");

async function main() {
  const packageDirectory = resolve(process.argv[2] ?? "npm");
  const mode = process.argv[3] ?? "esm";
  assert.ok(["esm", "script"].includes(mode));
  const entry = join(packageDirectory, mode, "index.js");
  const { SimpleDB } = mode === "esm"
    ? await import(pathToFileURL(entry).href)
    : require(entry);
  const directory = mkdtempSync(join(tmpdir(), "sda-runtime-"));
  const sdb = new SimpleDB();
  const originalFetch = globalThis.fetch;
  try {
    const table = sdb.newTable("data").loadArray([{ value: 1 }, { value: 2 }]);
    assert.deepEqual(await table.filter("value > 1").getData(), [{ value: 2 }]);
    // CommonJS exposes its evaluated modules, so also check the import boundary.
    if (mode === "script") {
      assert.deepEqual(
        Object.keys(require.cache).filter((path) =>
          /journalism-(ai|google|dataviz|format)/.test(path)
        ),
        [],
      );
    }

    // Use real integration modules without contacting external services.
    const chart = (data) => {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", "120");
      svg.setAttribute("height", "60");
      svg.textContent = String(data[0].value);
      return svg;
    };
    for (let i = 0; i < 2; i++) {
      const path = join(directory, `chart-${i}.svg`);
      await table.writeChart(chart, path);
      assert.match(readFileSync(path, "utf8"), /<svg/);
    }

    await assert.rejects(
      table.toSheet("https://docs.google.com/spreadsheets/d/fixture/edit", {
        credentials: { email: "", privateKey: "" },
      }),
      /Google service account email is undefined or empty/,
    );

    await assert.rejects(
      table.toBucket("unsupported.txt"),
      /Bucket methods do not support the file extension/,
    );
    assert.throws(
      () => table.loadBucket("unsupported.txt"),
      /Bucket methods do not support the file extension/,
    );

    let requests = 0;
    globalThis.fetch = () => {
      requests++;
      return Promise.resolve(
        new Response(
          JSON.stringify({
            candidates: [{
              content: { parts: [{ text: JSON.stringify([{ answer: 42 }]) }] },
            }],
            usageMetadata: {
              promptTokenCount: 1,
              candidatesTokenCount: 1,
              totalTokenCount: 2,
            },
          }),
          { headers: { "content-type": "application/json" } },
        ),
      );
    };
    assert.equal(
      table.aiRowByRow("value", "answer", "Return 42", {
        generation: {
          provider: "gemini",
          model: "fixture",
          apiKey: "fixture",
          cache: false,
        },
      }),
      table,
    );
    assert.equal(requests, 0);
    assert.deepEqual(await table.getData(), [{ value: 2, answer: 42 }]);
    assert.equal(requests, 1);
    console.log(`${process.versions.bun ? "Bun" : "Node"} ${mode}: passed`);
  } finally {
    globalThis.fetch = originalFetch;
    await sdb.close();
    rmSync(directory, { recursive: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
