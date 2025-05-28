import { existsSync, rmSync, writeFileSync } from "node:fs";
import type { SimpleDB } from "../index.ts";

export default function writeProjectionsAndIndexes(
  simpleDB: SimpleDB,
  extension: string,
  file: string,
) {
  const allProjections: { [key: string]: { [key: string]: string } } = {};
  for (const table of simpleDB.tables) {
    if (Object.keys(table.projections).length > 0) {
      allProjections[table.name] = table.projections;
    }
  }
  const allProjectionsFile = `${
    file.replace(`.${extension}`, "")
  }_projections.json`;
  if (existsSync(allProjectionsFile)) {
    rmSync(allProjectionsFile);
  }
  if (Object.keys(allProjections).length > 0) {
    writeFileSync(allProjectionsFile, JSON.stringify(allProjections));
  }

  const allIndexes: { [key: string]: string[] } = {};
  for (const table of simpleDB.tables) {
    if (table.indexes.length > 0) {
      allIndexes[table.name] = table.indexes;
    }
  }
  const allIndexesFile = `${file.replace(`.${extension}`, "")}_indexes.json`;
  if (existsSync(allIndexesFile)) {
    rmSync(allIndexesFile);
  }
  if (Object.keys(allIndexes).length > 0) {
    writeFileSync(allIndexesFile, JSON.stringify(allIndexes));
  }
}
