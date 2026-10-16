import { copyFileSync, cpSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import pkg from "../package.json" with { type: "json" };
import config from "../typedoc.json" with { type: "json" };

const repository = pkg.repository.url
  .replace("https://github.com/", "https://raw.githubusercontent.com/")
  .replace(/\.git$/, "");
const baseUrl = `${repository}/v${pkg.version}/docs/`;

// Keep the standalone reference's images accessible without duplicating assets.
const reference = readFileSync("llm.md", "utf8").replaceAll(
  /\]\(_media\/([^)]+)\)/g,
  (_, file: string) => `](${repository}/v${pkg.version}/assets/${file})`,
);
writeFileSync("llm.md", reference);
rmSync("_media", { recursive: true, force: true });

renameSync("docs/llms.txt", "llms.txt");
const index = readFileSync("llms.txt", "utf8")
  .replace(/^# .+$/m, `# ${config.name} v${pkg.version}`)
  .replaceAll(/\]\(([^)]+)\)/g, (_, target: string) => `](${new URL(target, baseUrl).href})`);

writeFileSync("llms.txt", index);
cpSync("docs", "site", { recursive: true });
for (const file of ["llm.md", "llms.txt"]) copyFileSync(file, `site/${file}`);
