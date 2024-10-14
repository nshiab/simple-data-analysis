import { readFileSync, writeFileSync } from "node:fs";
import process from "node:process";
import { execSync } from "node:child_process";

// Check if we are on the main branch
let branch = execSync("git rev-parse --abbrev-ref HEAD", {
  encoding: "utf-8",
}).trim();
// Remove 'heads/' prefix if present
if (branch.startsWith("heads/")) {
  branch = branch.slice(6);
}
if (branch !== "main") {
  throw new Error(
    `You can only increment the version on the main branch. Current branch is ${branch}`,
  );
}

const args = process.argv.slice(2);
const [incrementType] = args;
const filePath = "deno.json";
const data = JSON.parse(readFileSync(filePath, "utf-8"));
const versionParts = data.version.split(".").map((d: string) => parseInt(d));

if (incrementType === "major") {
  versionParts[0] += 1;
  versionParts[1] = 0;
  versionParts[2] = 0;
} else if (incrementType === "minor") {
  versionParts[1] += 1;
  versionParts[2] = 0;
} else if (incrementType === "patch") {
  versionParts[2] += 1;
} else {
  throw new Error("Invalid increment type");
}

data.version = versionParts.join(".");
writeFileSync(filePath, JSON.stringify(data, null, 2));

execSync("git add -A");
execSync(`git commit -m "v${data.version}"`);
execSync("git push");

console.log(`Version incremented to ${data.version}`);

// Tag the current version
const tagName = `v${data.version}`;
execSync(`git tag ${tagName}`);
execSync(`git push origin tag ${tagName}`);

console.log(`Tagged with ${tagName}`);
