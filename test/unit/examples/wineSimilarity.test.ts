import { assert, assertEquals, assertStringIncludes } from "@std/assert";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("../../../", import.meta.url));

Deno.test("README wine similarity example retains all matches and agrees with its table preview", async () => {
  const readme = await Deno.readTextFile(join(root, "README.md"));
  const section = readme.split("#### Similarity analysis\n")[1]
    ?.split(/\n#{3,4} /)[0];
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
        "fullName":
          "Maison Roche de Bellene Pinot Noir Bourgogne Vieilles Vignes",
        "distance": 0.094,
        "similarity": 0.982,
      },
      {
        "fullName": "Moillard-Grivot Bourgogne Pinot Noir",
        "distance": 0.117,
        "similarity": 0.977,
      },
      {
        "fullName": "Joseph Drouhin Laforet Bourgogne Pinot Noir",
        "distance": 0.119,
        "similarity": 0.977,
      },
      {
        "fullName": "Louis Latour Bourgogne Pinot Noir",
        "distance": 0.151,
        "similarity": 0.971,
      },
      {
        "fullName": "Albert Bichot Bourgogne Vieilles Vignes de Pinot Noir",
        "distance": 0.165,
        "similarity": 0.968,
      },
    ];
    const rows: Record<string, unknown>[] = JSON.parse(
      await Deno.readTextFile(output),
    );
    assertEquals(rows.length, 1988);
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

Deno.test("README wine UMAP example maps all complete wines and retains reference similarity", async () => {
  const readme = await Deno.readTextFile(join(root, "README.md"));
  const section = readme.split("#### Similarity analysis\n")[1]
    ?.split(/\n#{3,4} /)[0];
  assert(section);
  const blocks = Array.from(section.matchAll(/```ts\n([\s\S]*?)\n```/g));
  assertEquals(blocks.length, 2);
  const directory = await Deno.makeTempDir({ prefix: "sda-wine-umap-" });
  try {
    const output = join(directory, "wines.png");
    const rowsPath = join(directory, "rows.json");
    const script = join(directory, "wines.ts");
    const code = blocks[1][1]
      .replace(
        '"@nshiab/simple-data-analysis"',
        JSON.stringify(new URL("../../../src/index.ts", import.meta.url).href),
      )
      .replace('"sda/output/wines-umap.png"', JSON.stringify(output))
      .replace(
        "await sdb.close();",
        `await Deno.writeTextFile(${
          JSON.stringify(rowsPath)
        }, JSON.stringify(await wines.getData()));\nawait sdb.close();`,
      );
    await Deno.writeTextFile(script, code);
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
    assertEquals(result.success, true, new TextDecoder().decode(result.stderr));
    const rows: Record<string, unknown>[] = JSON.parse(
      await Deno.readTextFile(rowsPath),
    );
    assertEquals(rows.length, 1988);
    for (const row of rows) {
      assert(typeof row.tannin === "number");
      for (const column of ["umapX", "umapY", "similarity"]) {
        assert(typeof row[column] === "number" && Number.isFinite(row[column]));
      }
    }
    const reference = rows.filter((row) =>
      row.fullName === "Louis Jadot Bourgogne Pinot Noir"
    );
    assertEquals(reference.length, 1);
    assertEquals(reference[0].similarity, 1);
    assertEquals(reference[0].distance, 0);
    assertEquals(rows.filter((row) => row.wineType === "Red").length, 1026);
    assertEquals(rows.filter((row) => row.wineType === "White").length, 941);
    assertEquals(rows.filter((row) => row.wineType === "Rosé").length, 21);
    assertEquals(rows.filter((row) => row.tannin === 0).length, 962);
    const image = await Deno.readFile(output);
    assertEquals([...image.slice(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
    assert(image.length > 1000);
  } finally {
    await Deno.remove(directory, { recursive: true });
  }
});
