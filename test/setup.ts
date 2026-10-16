import { existsSync, mkdirSync, mkdtempSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadEnvFile } from "node:process";
import { afterAll } from "vite-plus/test";

if (process.env.CI !== "true" && existsSync(".env")) loadEnvFile(".env");

// Each forked test file owns its cache and output; fixtures remain shared.
const root = process.cwd();
const directory = mkdtempSync(join(tmpdir(), "sda-test-"));
mkdirSync(join(directory, "test/output"), { recursive: true });
for (const fixture of ["test/data", "test/geodata", "benchmarks"]) {
  symlinkSync(join(root, fixture), join(directory, fixture), "junction");
}
process.chdir(directory);

afterAll(() => {
  process.chdir(root);
  rmSync(directory, { recursive: true, force: true });
});
