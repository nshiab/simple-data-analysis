import { existsSync, readFileSync } from "node:fs";
import type SimpleDB from "../class/SimpleDB.ts";

export default async function setDbProps(
  simpleDB: SimpleDB,
  file: string,
  extension: string,
  allIndexesFile: string,
) {
  for (const table of await simpleDB.getTableNames()) {
    simpleDB.newTable(table);
  }
  const allProjectionsFile = `${
    file.replace(`.${extension}`, "")
  }_projections.json`;
  if (existsSync(allProjectionsFile)) {
    const projections = JSON.parse(
      readFileSync(allProjectionsFile, "utf-8"),
    );
    for (const table of simpleDB.tables) {
      if (projections[table.name]) {
        table.projections = projections[table.name];
      }
    }
    await simpleDB.customQuery(`INSTALL spatial; LOAD spatial;`);
  }

  if (existsSync(allIndexesFile)) {
    const indexes = JSON.parse(readFileSync(allIndexesFile, "utf-8"));
    for (const table of simpleDB.tables) {
      if (indexes[table.name]) {
        table.indexes = indexes[table.name];
      }
    }
  }

  simpleDB.tableIncrement = Math.round(Math.random() * 1000000);
}
