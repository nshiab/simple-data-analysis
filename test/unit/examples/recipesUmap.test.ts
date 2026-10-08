import { assert, assertEquals } from "@std/assert";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import assertArtifact from "../helpers/assertArtifact.ts";

const root = fileURLToPath(new URL("../../../", import.meta.url));

// Run with the same environment as the README. Other test runs need no Ollama.
Deno.test({
  name:
    "README embedding, UMAP, and semantic search examples work with local Nomic embeddings",
  ignore: Deno.env.get("AI_EMBEDDINGS_PROVIDER") !== "ollama" ||
    Deno.env.get("AI_EMBEDDINGS_MODEL") !== "nomic-embed-text:latest",
  fn: async () => {
    const readme = await Deno.readTextFile(join(root, "README.md"));
    const section = readme.split(
      "#### Cluster and visualize embeddings\n",
    )[1]?.split("\n#### ")[0];
    assert(section, "Expected the clustering and UMAP section");
    const blocks = Array.from(
      section.matchAll(/```ts\n([\s\S]*?)\n```/g),
      (match) => match[1],
    );
    assertEquals(blocks.length, 2);

    const directory = await Deno.makeTempDir({ prefix: "sda-recipe-umap-" });
    try {
      const output = join(directory, "recipes-umap.png");
      const script = join(directory, "recipes.ts");
      const clusterOutput = join(directory, "cluster.json");
      // Run each code block independently with this checkout and temporary output.
      // Keep remote data, embeddings, HDBSCAN, UMAP, and the chart unchanged.
      for (const [index, code] of blocks.entries()) {
        await Deno.writeTextFile(
          script,
          code.replace(
            '"@nshiab/simple-data-analysis"',
            JSON.stringify(
              new URL("../../../src/index.ts", import.meta.url).href,
            ),
          ).replace('"sda/output/recipes-umap.png"', JSON.stringify(output))
            .replace(
              "await sdb.close();",
              `await Deno.writeTextFile(${JSON.stringify(clusterOutput)},
            JSON.stringify(await recipes.getData({ conditions: ${
                index === 0
                  ? JSON.stringify("cluster = 'cluster-0'")
                  : JSON.stringify("cluster = 'Middle Eastern dishes'")
              } })));
            await sdb.close();`,
            ),
        );

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
      }
      await assertArtifact(output);
      const cluster: Record<string, unknown>[] = JSON.parse(
        await Deno.readTextFile(clusterOutput),
      );
      const expected = [
        "Fattet Hummus",
        "Falafel",
        "Baba Ghanoush",
        "Fattoush",
        "Fatteh",
      ];
      assertEquals(cluster.map((row) => row.Dish), expected);
      assertEquals(
        Array.from(
          section.matchAll(/\|\s*([^|\n]+?)\s*\|\s*cluster-0\s*\|/g),
          (match) => match[1].trim(),
        ),
        expected,
      );
      for (const heading of ["Create embeddings", "Semantic search"]) {
        const snippet = readme.split(`#### ${heading}\n`)[1]
          ?.split("\n#### ")[0].match(/```ts\n([\s\S]*?)\n```/)?.[1];
        assert(snippet, `Expected the ${heading} example`);
        const rowsPath = join(directory, "rows.json");
        await Deno.writeTextFile(
          script,
          snippet.replace(
            '"@nshiab/simple-data-analysis"',
            JSON.stringify(
              new URL("../../../src/index.ts", import.meta.url).href,
            ),
          ).replace(
            "await sdb.close();",
            `await Deno.writeTextFile(${JSON.stringify(rowsPath)},
              JSON.stringify(await (await sdb.getTable("recipes")).getData()));
            await sdb.close();`,
          ),
        );
        const run = await new Deno.Command(Deno.execPath(), {
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
        assertEquals(run.success, true, new TextDecoder().decode(run.stderr));
        const rows: Record<string, unknown>[] = JSON.parse(
          await Deno.readTextFile(rowsPath),
        );
        assertEquals(rows.length, heading === "Create embeddings" ? 335 : 5);
        for (const row of rows) {
          assert(Array.isArray(row.embedding));
          assert(row.embedding.length > 0);
          assert(
            row.embedding.every((value) =>
              typeof value === "number" && Number.isFinite(value)
            ),
          );
        }
        if (heading === "Semantic search") {
          const scores = rows.map((row) => {
            assert(
              typeof row.similarity === "number" &&
                Number.isFinite(row.similarity),
            );
            return row.similarity;
          });
          assertEquals(scores, [...scores].sort((a, b) => b - a));
        }
      }
    } finally {
      await Deno.remove(directory, { recursive: true });
    }
  },
});
