import type SimpleTable from "../class/SimpleTable.ts";
import getIdenticalColumns from "../helpers/getIdenticalColumns.ts";
import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import fuzzyJoinQuery from "./fuzzyJoinQuery.ts";

export default async function fuzzyJoin(
  leftTable: SimpleTable,
  rightTable: SimpleTable,
  leftColumn: string,
  rightColumn: string,
  options: {
    method?:
      | "ratio"
      | "partial_ratio"
      | "token_sort_ratio"
      | "token_set_ratio";
    threshold?: number;
    similarityColumn?: string;
    outputTable?: string | boolean;
  } = {},
) {
  const leftCols = await leftTable.getColumns();
  const rightCols = await rightTable.getColumns();
  const identicalColumns = getIdenticalColumns(leftCols, rightCols);

  // Any column shared between both tables — other than rightColumn (whose
  // potential _1 duplicate we clean up) — would produce ambiguous output.
  const identicalColumnsForError = identicalColumns.filter(
    (d) => d !== rightColumn,
  );
  if (identicalColumnsForError.length > 0) {
    if (identicalColumnsForError.length === 1) {
      throw new Error(
        `The tables have columns with identical names. Rename or remove "${
          identicalColumnsForError[0]
        }" in one of the two tables before doing the fuzzy join.`,
      );
    } else {
      throw new Error(
        `The tables have columns with identical names. Rename or remove ${
          identicalColumnsForError.map((d) => `"${d}"`).join(", ")
        } in one of the two tables before doing the fuzzy join.`,
      );
    }
  }

  const method = options.method ?? "ratio";
  const threshold = options.threshold ?? 80;
  const similarityColumn = options.similarityColumn;
  const outputTableName = typeof options.outputTable === "string"
    ? options.outputTable
    : leftTable.name;

  const sql = `INSTALL rapidfuzz FROM community; LOAD rapidfuzz;\n` +
    fuzzyJoinQuery(
      leftTable.name,
      leftColumn,
      rightTable.name,
      rightColumn,
      method,
      threshold,
      outputTableName,
      similarityColumn,
    );

  await queryDB(
    leftTable,
    sql,
    mergeOptions(leftTable, {
      table: outputTableName,
      method: "fuzzyJoin()",
      parameters: {
        leftColumn,
        rightColumn,
        rightTable: rightTable.name,
        options,
      },
    }),
  );

  const allProjections = {
    ...leftTable.projections,
    ...rightTable.projections,
  };

  const outputTable = typeof options.outputTable === "string"
    ? leftTable.sdb.newTable(options.outputTable, allProjections)
    : leftTable;

  outputTable.projections = allProjections;

  // Remove the duplicate right-column produced when leftColumn === rightColumn
  // (DuckDB suffixes it with _1 in SELECT *)
  const outputCols = await outputTable.getColumns();
  const duplicateCol = `${rightColumn}_1`;
  if (outputCols.includes(duplicateCol)) {
    await outputTable.removeColumns([duplicateCol]);
  }

  return outputTable;
}
