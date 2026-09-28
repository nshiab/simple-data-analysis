import { assert, assertEquals, assertStringIncludes } from "@std/assert";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import assertArtifact from "../helpers/assertArtifact.ts";

const root = fileURLToPath(new URL("../../../", import.meta.url));

Deno.test("README village economy example renders every business and payment", async () => {
  const readme = await Deno.readTextFile(join(root, "README.md"));
  const section = readme.split("### Network analysis\n")[1]
    ?.split("\n### ")[0];
  const code = section?.match(/```ts\n([\s\S]*?)\n```/)?.[1];
  assert(code, "Expected the village economy example in the README");

  const directory = await Deno.makeTempDir({ prefix: "sda-village-economy-" });
  try {
    const output = join(directory, "village-economy.svg");
    const script = join(directory, "village.ts");
    const example = code.replace(
      '"@nshiab/simple-data-analysis"',
      JSON.stringify(new URL("../../../src/index.ts", import.meta.url).href),
    ).replace('"sda/output/village-economy.png"', JSON.stringify(output));

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
    await assertArtifact(output);
    const svg = await Deno.readTextFile(output);
    assertEquals(svg.match(/<circle\b/g)?.length, 12);
    assertEquals(svg.match(/<path\b/g)?.length, 19);
    for (const business of ["Farm", "Repair Shop", "Cafe", "Inn"]) {
      assertStringIncludes(svg, business);
    }
  } finally {
    await Deno.remove(directory, { recursive: true });
  }
});
