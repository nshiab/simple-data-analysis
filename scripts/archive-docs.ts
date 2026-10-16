import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import pkg from "../package.json" with { type: "json" };

const destination = process.argv[2];
if (!destination) throw new Error("Usage: node scripts/archive-docs.ts <archive.tar.gz>");
const archive = resolve(destination);
const staging = mkdtempSync(join(tmpdir(), "documentation-"));
const repository = pkg.repository.url
  .replace("https://github.com/", "https://raw.githubusercontent.com/")
  .replace(/\.git$/, "");

try {
  for (const file of ["README.md", "LICENSE", "docs"]) {
    cpSync(file, join(staging, file), { recursive: true });
  }
  if (existsSync("assets")) cpSync("assets", join(staging, "assets"), { recursive: true });
  const index = readFileSync("llms.txt", "utf8").replaceAll(`${repository}/v${pkg.version}/`, "./");
  writeFileSync(join(staging, "llms.txt"), index);
  execFileSync("tar", ["-czf", archive, "-C", staging, "."]);
} finally {
  rmSync(staging, { recursive: true, force: true });
}
