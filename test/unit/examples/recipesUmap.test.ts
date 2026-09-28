import { assert, assertEquals } from "@std/assert";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import assertArtifact from "../helpers/assertArtifact.ts";

const root = fileURLToPath(new URL("../../../", import.meta.url));

// Run with the same environment as the README. Other test runs need no Ollama.
Deno.test({
  name:
    "README recipe HDBSCAN and UMAP example renders with local Nomic embeddings",
  ignore: Deno.env.get("AI_EMBEDDINGS_PROVIDER") !== "ollama" ||
    Deno.env.get("AI_EMBEDDINGS_MODEL") !== "nomic-embed-text:latest",
  fn: async () => {
    const readme = await Deno.readTextFile(join(root, "README.md"));
    const section = readme.split(
      "#### Visualize recipe embeddings with UMAP\n",
    )[1]?.split("\n#### ")[0];
    const code = section?.match(/```ts\n([\s\S]*?)\n```/)?.[1];
    assert(code, "Expected the recipe UMAP example in the README");

    const directory = await Deno.makeTempDir({ prefix: "sda-recipe-umap-" });
    try {
      const output = join(directory, "recipes-umap.png");
      const script = join(directory, "recipes.ts");
      // Execute the actual README code with this checkout and temporary output.
      // Keep remote data, embeddings, HDBSCAN, UMAP, and the chart unchanged.
      await Deno.writeTextFile(
        script,
        code.replace(
          '"@nshiab/simple-data-analysis"',
          JSON.stringify(
            new URL("../../../src/index.ts", import.meta.url).href,
          ),
        ).replace('"sda/output/recipes-umap.png"', JSON.stringify(output)),
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
      await assertArtifact(output);
    } finally {
      await Deno.remove(directory, { recursive: true });
    }
  },
});
