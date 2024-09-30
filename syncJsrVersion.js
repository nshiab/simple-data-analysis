import { readFileSync, writeFileSync } from "node:fs";

const packageJsonVersion = JSON.parse(
  readFileSync("package.json", "utf-8")
).version;

const denoJSON = JSON.parse(readFileSync("deno.json", "utf-8"));

denoJSON.version = packageJsonVersion;

writeFileSync("deno.json", JSON.stringify(denoJSON, null, 2));
