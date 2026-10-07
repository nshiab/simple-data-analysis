import { assert, assertEquals } from "@std/assert";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("../../../", import.meta.url));

Deno.test("README flight routing examples agree with their Markdown tables", async () => {
  const readme = await Deno.readTextFile(join(root, "README.md"));
  const section = readme.split("### Network analysis\n")[1]?.split("\n### ")[0];
  assert(section, "Expected the network analysis section");
  const blocks = Array.from(
    section.matchAll(/```ts\n([\s\S]*?)\n```/g),
    (match) => match[1],
  );
  assertEquals(blocks.length, 2);

  const directory = await Deno.makeTempDir({ prefix: "sda-flight-routing-" });
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
      const example = code.replace(
        '"@nshiab/simple-data-analysis"',
        JSON.stringify(new URL("../../../src/index.ts", import.meta.url).href),
      ).replace(
        "const sdb = new SimpleDB();",
        `const sdb = new SimpleDB();
        const originalFlights = await sdb.newTable("original")
          .loadData(${dataUrl}).getData();`,
      ).replace(
        "await sdb.close();",
        `await Deno.writeTextFile(${JSON.stringify(output)}, JSON.stringify({
          original: originalFlights,
          rows: await (await sdb.getTable("flights")).getData(),
        }));\nawait sdb.close();`,
      );
      await Deno.writeTextFile(script, example);
      const result = await new Deno.Command(Deno.execPath(), {
        args: [
          "run",
          "-A",
          "--check",
          "--frozen",
          `--config=${join(root, "deno.json")}`,
          script,
        ],
        cwd: root,
        stdout: "piped",
        stderr: "piped",
      }).output();
      assertEquals(
        result.success,
        true,
        new TextDecoder().decode(result.stderr) +
          new TextDecoder().decode(result.stdout),
      );
      results.push(JSON.parse(await Deno.readTextFile(output)));
    }
    assertEquals(results[0].original, results[1].original);
    const data = {
      original: results[0].original,
      steps: results[0].rows,
      distances: results[1].rows,
    };
    assertEquals(data.original.length, 33);
    assertEquals(data.distances.length, 11);
    const tokyo = data.distances.find((row) => row.node === "Tokyo");
    assertEquals(tokyo, {
      start: "Montreal",
      node: "Tokyo",
      steps: 2,
      total: 700,
      elapsedTimeMs: 17 * 60 * 60 * 1000,
    });
    assertEquals(data.steps.length, 11);
    assertEquals(data.steps.find((row) => row.node === "Tokyo"), {
      start: "Montreal",
      node: "Tokyo",
      steps: 2,
    });
    const tables = Array.from(
      section.matchAll(/(?:^\|[^\n]+\|\n)+/gm),
      (match) =>
        match[0].trim().split("\n").slice(2).map((line) =>
          line.split("|").slice(1, -1).map((cell) => cell.trim())
        ),
    );
    const selectedCities = tables[2].map((row) => row[0]);
    const selected = selectedCities.map((city) => {
      const row = data.distances.find((row) => row.node === city);
      assert(row, `Expected a route to ${city}`);
      return [
        row.node,
        row.steps,
        row.total,
        Number(row.elapsedTimeMs) / 3600000,
      ].map(
        String,
      );
    });
    assertEquals(tables, [
      data.original.slice(0, 3).map((row) =>
        [
          row.flightId,
          row.origin,
          row.destination,
          String(row.departure).replace("T", " ").slice(0, 16),
          String(row.arrival).replace("T", " ").slice(0, 16),
          row.price,
        ].map(String)
      ),
      tables[1].map(([city]) => {
        const row = data.steps.find((row) => row.node === city);
        assert(row, `Expected connections to ${city}`);
        return [row.node, row.steps].map(String);
      }),
      selected,
    ]);
  } finally {
    await Deno.remove(directory, { recursive: true });
  }
});
