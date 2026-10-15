import { test, expect } from "vite-plus/test";
import { fileURLToPath } from "node:url";
import { runNode } from "../../helpers/runNode.ts";

const fixtures = new URL("../../fixtures/lazyImports/", import.meta.url);
for (const entry of ["src/index.ts", "dist/index.mjs"]) {
  for (const scenario of [
    "core",
    "queued",
    "ai",
    "datawrapper",
    "bucket",
    "bucket-queued",
    "observers",
    "observers-reversed",
    "observer-returns",
    "failure",
  ]) {
    test(`lazy integrations (${entry}): ${scenario}`, async () => {
      const result = await runNode(
        [
          "--import",
          fileURLToPath(new URL("register.ts", fixtures)),
          fileURLToPath(new URL("scenario.ts", fixtures)),
          scenario,
          process.cwd(),
        ],
        process.cwd(),
        {
          SDA_LAZY_ENTRY: new URL(`../../../${entry}`, import.meta.url).href,
          SDA_LAZY_SCENARIO: scenario,
        },
      );
      expect(result.success, new TextDecoder().decode(result.stderr)).toBe(true);
    });
  }
}

test("built ESM package runs real integrations without provider requests", async () => {
  const result = await runNode(
    [
      fileURLToPath(new URL("../../runtime/lazyImports.ts", import.meta.url)),
      fileURLToPath(new URL("../../../dist/index.mjs", import.meta.url)),
    ],
    process.cwd(),
  );
  expect(result.success, new TextDecoder().decode(result.stderr)).toBe(true);
});
