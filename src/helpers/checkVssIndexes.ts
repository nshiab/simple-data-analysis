import { readFileSync } from "node:fs";
import { existsSync } from "node:fs";

export default function checkVssIndexes(allIndexesFile: string): boolean {
  let vssIndex = false;

  if (existsSync(allIndexesFile)) {
    const indexes = JSON.parse(readFileSync(allIndexesFile, "utf-8"));
    for (const table of Object.keys(indexes)) {
      for (const index of indexes[table]) {
        if (index.startsWith("vss_")) {
          vssIndex = true;
        }
      }
    }
  }

  return vssIndex;
}
