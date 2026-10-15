import { execFileSync } from "node:child_process";

const branch = execFileSync("git", ["branch", "--show-current"], { encoding: "utf8" }).trim();

if (branch !== "main") {
  throw new Error("Releases must be run from main. Switch to main before releasing.");
}
