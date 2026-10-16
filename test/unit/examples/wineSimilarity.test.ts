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
  "README wine similarity example retains all matches and agrees with its table preview",
  async () => {
    const readme = await readFile(join(root, "README.md"), "utf8");
    const section = readme.split("#### Similarity analysis\n")[1]?.split(/\n#{3,4} /)[0];
    assert(section, "Expected the similarity section in the README");
    const code = section.match(/```ts\n([\s\S]*?)\n```/)?.[1];
    assert(code, "Expected the wine similarity example in the README");

    const directory = mkdtempSync(tmpdir() + "/" + "sda-wine-similarity-");
    symlinkSync(join(root, "node_modules"), join(directory, "node_modules"), "junction");
    try {
      const output = join(directory, "wine-similarity.json");
      const script = join(directory, "wines.ts");
      const example = code
        .replace(
          '"@nshiab/simple-data-analysis"',
          JSON.stringify(new URL("../../../src/index.ts", import.meta.url).href),
        )
        .replace(
          ".log();",
          `.log();\n    await (await import("node:fs/promises")).writeFile(${JSON.stringify(
            output,
          )}, JSON.stringify(await wines.getData()));`,
        );
      await writeFile(script, example);

      const result = await runNode([script], directory);
      expect(
        result.success,
        new TextDecoder().decode(result.stderr) + new TextDecoder().decode(result.stdout),
      ).toEqual(true);
      const expected = [
        {
          fullName: "Maison Roche de Bellene Pinot Noir Bourgogne Vieilles Vignes",
          distance: 0.094,
          similarity: 0.982,
        },
        {
          fullName: "Moillard-Grivot Bourgogne Pinot Noir",
          distance: 0.117,
          similarity: 0.977,
        },
        {
          fullName: "Joseph Drouhin Laforet Bourgogne Pinot Noir",
          distance: 0.119,
          similarity: 0.977,
        },
        {
          fullName: "Louis Latour Bourgogne Pinot Noir",
          distance: 0.151,
          similarity: 0.971,
        },
        {
          fullName: "Albert Bichot Bourgogne Vieilles Vignes de Pinot Noir",
          distance: 0.165,
          similarity: 0.968,
        },
      ];
      const rows: Record<string, unknown>[] = JSON.parse(await readFile(output, "utf8")) as Record<
        string,
        unknown
      >[];
      expect(rows.length).toEqual(1988);
      expect(rows[0].fullName).toEqual("Louis Jadot Bourgogne Pinot Noir");
      expect(rows[0].distance).toEqual(0);
      expect(rows[0].similarity).toEqual(1);
      expect(Object.keys(rows[0])).toEqual([
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
      const preview = rows
        .filter((row) => row.fullName !== "Louis Jadot Bourgogne Pinot Noir")
        .slice(0, 5)
        .map((row) => ({
          fullName: row.fullName,
          distance: Number(Number(row.distance).toFixed(3)),
          similarity: Number(Number(row.similarity).toFixed(3)),
        }));
      expect(preview).toEqual(expected);
      expect(new TextDecoder().decode(result.stdout)).toContain("Table wines:");
      const displayed = Array.from(
        section.matchAll(/\|\s*([^|\n]+?)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|/g),
        (match) => ({
          fullName: match[1].trim(),
          distance: Number(match[2]),
          similarity: Number(match[3]),
        }),
      );
      expect(displayed).toEqual(expected);
    } finally {
      await rm(directory, { recursive: true });
    }
  },
);

test.skipIf(process.env.CI === "true")(
  "README wine UMAP example maps all complete wines and retains reference similarity",
  async () => {
    const readme = await readFile(join(root, "README.md"), "utf8");
    const section = readme.split("#### Similarity analysis\n")[1]?.split(/\n#{3,4} /)[0];
    assert(section);
    const blocks = Array.from(section.matchAll(/```ts\n([\s\S]*?)\n```/g));
    expect(blocks.length).toEqual(2);
    const directory = mkdtempSync(tmpdir() + "/" + "sda-wine-umap-");
    symlinkSync(join(root, "node_modules"), join(directory, "node_modules"), "junction");
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
          `await (await import("node:fs/promises")).writeFile(${JSON.stringify(
            rowsPath,
          )}, JSON.stringify(await wines.getData()));\nawait sdb.close();`,
        );
      await writeFile(script, code);
      const result = await runNode([script], directory);
      expect(result.success, new TextDecoder().decode(result.stderr)).toEqual(true);
      const rows: Record<string, unknown>[] = JSON.parse(
        await readFile(rowsPath, "utf8"),
      ) as Record<string, unknown>[];
      expect(rows.length).toEqual(1988);
      for (const row of rows) {
        assert(typeof row.tannin === "number");
        for (const column of ["umapX", "umapY", "similarity"]) {
          assert(typeof row[column] === "number" && Number.isFinite(row[column]));
        }
      }
      const reference = rows.filter((row) => row.fullName === "Louis Jadot Bourgogne Pinot Noir");
      expect(reference.length).toEqual(1);
      expect(reference[0].similarity).toEqual(1);
      expect(reference[0].distance).toEqual(0);
      expect(reference[0].cluster).toEqual("Higher-intensity reds");
      const clusterCounts: Record<string, number> = {};
      for (const row of rows) {
        const cluster = String(row.cluster);
        clusterCounts[cluster] = (clusterCounts[cluster] ?? 0) + 1;
      }
      expect(clusterCounts).toEqual({
        "Higher-intensity whites": 640,
        "Higher-intensity reds": 896,
        noise: 233,
        "Mostly Chablis whites": 93,
        "Lower-acidity whites & rosés": 67,
        "Lower-intensity reds": 59,
      });
      expect(rows.filter((row) => row.wineType === "Red").length).toEqual(1026);
      expect(rows.filter((row) => row.wineType === "White").length).toEqual(941);
      expect(rows.filter((row) => row.wineType === "Rosé").length).toEqual(21);
      expect(rows.filter((row) => row.tannin === 0).length).toEqual(962);
      const image = await readFile(output);
      expect(Array.from(image.subarray(0, 8))).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
      assert(image.length > 1000);
    } finally {
      await rm(directory, { recursive: true });
    }
  },
);
