import { assertEquals } from "@std/assert";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const fixtures = new URL("../../fixtures/lazyImports/", import.meta.url);

for (
  const scenario of [
    "core",
    "queued",
    "ai",
    "datawrapper",
    "observers",
    "observers-reversed",
    "failure",
  ]
) {
  Deno.test(`lazy integrations: ${scenario}`, async () => {
    const directory = await Deno.makeTempDir();
    try {
      const config = JSON.parse(
        await Deno.readTextFile(join(root, "deno.json")),
      ) as { imports: Record<string, string> };
      const imports = { ...config.imports };
      imports["@nshiab/simple-data-analysis-core/helpers"] = `${
        imports["@nshiab/simple-data-analysis-core"]
      }/helpers`;
      for (
        const [specifier, fixture] of Object.entries({
          "@nshiab/journalism-dataviz": "dataviz",
          "@nshiab/journalism-google": scenario === "failure"
            ? "googleFailure"
            : "google",
          "@nshiab/journalism-ai": "ai",
          "@nshiab/journalism-format": "format",
          zod: "zod",
          ollama: "ollama",
        })
      ) {
        imports[specifier] = new URL(`${fixture}.ts`, fixtures).href;
      }
      const importMap = join(directory, "imports.json");
      await Deno.writeTextFile(importMap, JSON.stringify({ imports }));
      const result = await new Deno.Command(Deno.execPath(), {
        args: [
          "run",
          "-A",
          "--cached-only",
          "--frozen",
          `--config=${join(root, "deno.json")}`,
          `--import-map=${importMap}`,
          fileURLToPath(new URL("scenario.ts", fixtures)),
          scenario,
          directory,
        ],
        cwd: root,
        stdout: "piped",
        stderr: "piped",
      }).output();
      assertEquals(
        result.success,
        true,
        new TextDecoder().decode(result.stderr),
      );
    } finally {
      await Deno.remove(directory, { recursive: true });
    }
  });
}
