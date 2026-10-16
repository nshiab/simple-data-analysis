import { expect } from "vite-plus/test";
import { runNode } from "../../helpers/runNode.ts";
import { test } from "vite-plus/test";
import { mkdtempSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { rm } from "node:fs/promises";
import { writeFile } from "node:fs/promises";
import { readFile } from "node:fs/promises";
import { assert } from "../../helpers/assertions.ts";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import assertArtifact from "../helpers/assertArtifact.ts";

const root = fileURLToPath(new URL("../../../", import.meta.url));

// Run with the same environment as the README. Other test runs need no Ollama.
test.skipIf(process.env.CI === "true")(
  "README embedding, UMAP, and semantic search examples work with local Nomic embeddings",
  {
    skip:
      process.env.CI === "true" ||
      process.env["AI_EMBEDDINGS_PROVIDER"] !== "ollama" ||
      process.env["AI_EMBEDDINGS_MODEL"] !== "nomic-embed-text:latest",
  },
  async () => {
    const readme = await readFile(join(root, "README.md"), "utf8");
    const section = readme.split("#### Cluster and visualize embeddings\n")[1]?.split("\n#### ")[0];
    assert(section, "Expected the clustering and UMAP section");
    const blocks = Array.from(section.matchAll(/```ts\n([\s\S]*?)\n```/g), (match) => match[1]);
    expect(blocks.length).toEqual(2);

    const directory = mkdtempSync(tmpdir() + "/" + "sda-recipe-umap-");
    symlinkSync(join(root, "node_modules"), join(directory, "node_modules"), "junction");
    try {
      const output = join(directory, "recipes-umap.png");
      const script = join(directory, "recipes.ts");
      const clusterOutput = join(directory, "cluster.json");
      // Run each code block independently with this checkout and temporary output.
      // Keep remote data, embeddings, HDBSCAN, UMAP, and the chart unchanged.
      for (const [index, code] of blocks.entries()) {
        await writeFile(
          script,
          code
            .replace(
              '"@nshiab/simple-data-analysis"',
              JSON.stringify(new URL("../../../src/index.ts", import.meta.url).href),
            )
            .replace('"sda/output/recipes-umap.png"', JSON.stringify(output))
            .replace(
              "await sdb.close();",
              `await (await import("node:fs/promises")).writeFile(${JSON.stringify(clusterOutput)},
            JSON.stringify(await recipes.getData({ conditions: ${
              index === 0
                ? JSON.stringify("cluster = 'cluster-0'")
                : JSON.stringify("cluster = 'Middle Eastern dishes'")
            } })));
            await sdb.close();`,
            ),
        );

        const result = await runNode([script], directory);
        expect(
          result.success,
          new TextDecoder().decode(result.stderr) + new TextDecoder().decode(result.stdout),
        ).toEqual(true);
      }
      await assertArtifact(output);
      const cluster: Record<string, unknown>[] = JSON.parse(
        await readFile(clusterOutput, "utf8"),
      ) as Record<string, unknown>[];
      const expected = ["Fattet Hummus", "Falafel", "Baba Ghanoush", "Fattoush", "Fatteh"];
      expect(cluster.map((row) => row.Dish)).toEqual(expected);
      expect(
        Array.from(section.matchAll(/\|\s*([^|\n]+?)\s*\|\s*cluster-0\s*\|/g), (match) =>
          match[1].trim(),
        ),
      ).toEqual(expected);
      for (const heading of ["Create embeddings", "Semantic search"]) {
        const snippet = readme
          .split(`#### ${heading}\n`)[1]
          ?.split("\n#### ")[0]
          .match(/```ts\n([\s\S]*?)\n```/)?.[1];
        assert(snippet, `Expected the ${heading} example`);
        const rowsPath = join(directory, "rows.json");
        await writeFile(
          script,
          snippet
            .replace(
              '"@nshiab/simple-data-analysis"',
              JSON.stringify(new URL("../../../src/index.ts", import.meta.url).href),
            )
            .replace(
              "await sdb.close();",
              `await (await import("node:fs/promises")).writeFile(${JSON.stringify(rowsPath)},
              JSON.stringify(await (await sdb.getTable("recipes")).getData()));
            await sdb.close();`,
            ),
        );
        const run = await runNode([script], directory);
        expect(run.success, new TextDecoder().decode(run.stderr)).toEqual(true);
        const rows: Record<string, unknown>[] = JSON.parse(
          await readFile(rowsPath, "utf8"),
        ) as Record<string, unknown>[];
        expect(rows.length).toEqual(heading === "Create embeddings" ? 335 : 5);
        for (const row of rows) {
          assert(Array.isArray(row.embedding));
          assert(row.embedding.length > 0);
          assert(
            row.embedding.every((value) => typeof value === "number" && Number.isFinite(value)),
          );
        }
        if (heading === "Semantic search") {
          const scores = rows.map((row) => {
            assert(typeof row.similarity === "number" && Number.isFinite(row.similarity));
            return row.similarity;
          });
          expect(scores).toEqual([...scores].sort((a, b) => b - a));
        }
      }
    } finally {
      await rm(directory, { recursive: true });
    }
  },
);
