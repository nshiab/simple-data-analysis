import { assert, assertEquals, assertStringIncludes } from "@std/assert";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("../../../", import.meta.url));

Deno.test("README wine similarity example retains all matches and agrees with its table preview", async () => {
  const readme = await Deno.readTextFile(join(root, "README.md"));
  const section = readme.split("### Similarity analysis\n")[1]
    ?.split("\n### ")[0];
  assert(section, "Expected the similarity section in the README");
  const code = section.match(/```ts\n([\s\S]*?)\n```/)?.[1];
  assert(code, "Expected the wine similarity example in the README");

  const directory = await Deno.makeTempDir({ prefix: "sda-wine-similarity-" });
  try {
    const output = join(directory, "wine-similarity.json");
    const script = join(directory, "wines.ts");
    const example = code.replace(
      '"@nshiab/simple-data-analysis"',
      JSON.stringify(new URL("../../../src/index.ts", import.meta.url).href),
    ).replace(
      ".log();",
      `.log();\n    await Deno.writeTextFile(${
        JSON.stringify(output)
      }, JSON.stringify(await wines.getData()));`,
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
    const expected = [
      {
        "fullName": "Moillard-Grivot Bourgogne Pinot Noir",
        "distance": 0.119,
        "similarity": 0.979,
      },
      {
        "fullName": "Michel Magnien Bourgogne Pinot Noir",
        "distance": 0.191,
        "similarity": 0.966,
      },
      {
        "fullName": "Louis Latour Bourgogne Pinot Noir",
        "distance": 0.192,
        "similarity": 0.966,
      },
      {
        "fullName": "Jean-Claude Boisset Pinot Noir Bourgogne 'Les Ursulines'",
        "distance": 0.209,
        "similarity": 0.963,
      },
      {
        "fullName": "Joseph Drouhin Laforet Bourgogne Pinot Noir",
        "distance": 0.24,
        "similarity": 0.957,
      },
    ];
    const rows: Record<string, unknown>[] = JSON.parse(
      await Deno.readTextFile(output),
    );
    assertEquals(rows.length, 1026);
    assertEquals(rows[0].fullName, "Louis Jadot Bourgogne Pinot Noir");
    assertEquals(rows[0].distance, 0);
    assertEquals(rows[0].similarity, 1);
    assertEquals(Object.keys(rows[0]), [
      "fullName",
      "wineType",
      "regionName",
      "acidity",
      "intensity",
      "sweetness",
      "tannin",
      "vintageYear",
      "isNatural",
      "distance",
      "similarity",
    ]);
    const preview = rows.filter((row) =>
      row.fullName !== "Louis Jadot Bourgogne Pinot Noir"
    ).slice(0, 5).map((row) => ({
      fullName: row.fullName,
      distance: Number(Number(row.distance).toFixed(3)),
      similarity: Number(Number(row.similarity).toFixed(3)),
    }));
    assertEquals(preview, expected);
    assertStringIncludes(
      new TextDecoder().decode(result.stdout),
      "Table wines:",
    );
    const displayed = Array.from(
      section.matchAll(/\|\s*([^|\n]+?)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|/g),
      (match) => ({
        fullName: match[1].trim(),
        distance: Number(match[2]),
        similarity: Number(match[3]),
      }),
    );
    assertEquals(displayed, expected);
  } finally {
    await Deno.remove(directory, { recursive: true });
  }
});
