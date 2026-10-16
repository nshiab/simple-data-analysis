import { runNode } from "../../helpers/runNode.ts";
import { test, expect } from "vite-plus/test";
import { mkdtempSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { rm } from "node:fs/promises";
import { writeFile } from "node:fs/promises";
import { readFile } from "node:fs/promises";
import { assert } from "../../helpers/assertions.ts";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("../../../", import.meta.url));

test.skipIf(process.env.CI === "true")(
  "README flight routing examples agree with their Markdown tables",
  async () => {
    const readme = await readFile(join(root, "README.md"), "utf8");
    const section = readme.split("#### Network analysis\n")[1]?.split(/\n#{3,4} /)[0];
    assert(section, "Expected the network analysis section");
    const blocks = Array.from(section.matchAll(/```ts\n([\s\S]*?)\n```/g), (match) => match[1]);
    expect(blocks.length).toEqual(2);

    const directory = mkdtempSync(tmpdir() + "/" + "sda-flight-routing-");
    symlinkSync(join(root, "node_modules"), join(directory, "node_modules"), "junction");
    try {
      const results: {
        original: Record<string, unknown>[];
        rows: Record<string, unknown>[];
      }[] = [];
      for (const [index, code] of blocks.entries()) {
        const output = join(directory, `results-${index}.json`);
        const script = join(directory, `flights-${index}.ts`);
        const dataUrl = code.match(/\.loadData\(\s*("[^"]+")/)?.[1];
        assert(dataUrl, "Expected a dataset URL in each example");
        const example = code
          .replace(
            '"@nshiab/simple-data-analysis"',
            JSON.stringify(new URL("../../../src/index.ts", import.meta.url).href),
          )
          .replace(
            "const sdb = new SimpleDB();",
            `const sdb = new SimpleDB();
        const originalFlights = await sdb.newTable("original")
          .loadData(${dataUrl}).getData();`,
          )
          .replace(
            "await sdb.close();",
            `await (await import("node:fs/promises")).writeFile(${JSON.stringify(output)}, JSON.stringify({
          original: originalFlights,
          rows: await (await sdb.getTable("flights")).getData(),
        }));\nawait sdb.close();`,
          );
        await writeFile(script, example);
        const result = await runNode([script], directory);
        expect(
          result.success,
          new TextDecoder().decode(result.stderr) + new TextDecoder().decode(result.stdout),
        ).toEqual(true);
        results.push(JSON.parse(await readFile(output, "utf8")) as (typeof results)[number]);
      }
      expect(results[0].original).toEqual(results[1].original);
      const data = {
        original: results[0].original,
        steps: results[0].rows,
        distances: results[1].rows,
      };
      expect(data.original.length).toEqual(33);
      expect(data.distances.length).toEqual(11);
      const tokyo = data.distances.find((row) => row.node === "Tokyo");
      expect(tokyo).toEqual({
        start: "Montreal",
        node: "Tokyo",
        steps: 2,
        total: 700,
        elapsedTimeMs: 17 * 60 * 60 * 1000,
      });
      expect(data.steps.length).toEqual(11);
      expect(data.steps.find((row) => row.node === "Tokyo")).toEqual({
        start: "Montreal",
        node: "Tokyo",
        steps: 2,
      });
      const tables = Array.from(section.matchAll(/(?:^\|[^\n]+\|\n)+/gm), (match) =>
        match[0]
          .trim()
          .split("\n")
          .slice(2)
          .map((line) =>
            line
              .split("|")
              .slice(1, -1)
              .map((cell) => cell.trim()),
          ),
      );
      const selectedCities = tables[2].map((row) => row[0]);
      const selected = selectedCities.map((city) => {
        const row = data.distances.find((row) => row.node === city);
        assert(row, `Expected a route to ${city}`);
        return [row.node, row.steps, row.total, Number(row.elapsedTimeMs) / 3600000].map(String);
      });
      expect(tables).toEqual([
        data.original
          .slice(0, 3)
          .map((row) =>
            [
              row.flightId,
              row.origin,
              row.destination,
              String(row.departure).replace("T", " ").slice(0, 16),
              String(row.arrival).replace("T", " ").slice(0, 16),
              row.price,
            ].map(String),
          ),
        tables[1].map(([city]) => {
          const row = data.steps.find((row) => row.node === city);
          assert(row, `Expected connections to ${city}`);
          return [row.node, row.steps].map(String);
        }),
        selected,
      ]);
    } finally {
      await rm(directory, { recursive: true });
    }
  },
);
