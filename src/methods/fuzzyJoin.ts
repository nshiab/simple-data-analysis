import type SimpleTable from "../class/SimpleTable.ts";
import getIdenticalColumns from "../helpers/getIdenticalColumns.ts";
import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import fuzzyJoinQuery from "./fuzzyJoinQuery.ts";

export default async function fuzzyJoin(
  leftTable: SimpleTable,
  leftColumn: string,
  rightTable: SimpleTable,
  rightColumn: string,
  options: {
    method?:
      | "ratio"
      | "partial_ratio"
      | "token_sort_ratio"
      | "token_set_ratio";
    threshold?: number;
    type?: "inner" | "left" | "right" | "full";
    similarityColumn?: string;
    outputTable?: string | boolean;
  } = {},
) {
  const method = options.method ?? "ratio";
  const threshold = options.threshold ?? 80;
  const joinType = options.type ?? "left";
  const similarityColumn = options.similarityColumn;
  const outputTableName = typeof options.outputTable === "string"
    ? options.outputTable
    : leftTable.name;

  const identicalColumns = getIdenticalColumns(
    await leftTable.getColumns(),
    await rightTable.getColumns(),
  );
  if (identicalColumns.length > 0) {
    if (identicalColumns.length === 1) {
      throw new Error(
        `The tables have columns with identical names. Rename or remove "${
          identicalColumns[0]
        }" in one of the two tables before doing the fuzzy join.`,
      );
    } else {
      throw new Error(
        `The tables have columns with identical names. Rename or remove ${
          identicalColumns.map((d) => `"${d}"`).join(", ")
        } in one of the two tables before doing the fuzzy join.`,
      );
    }
  }

  await queryDB(
    leftTable,
    `INSTALL rapidfuzz FROM community; LOAD rapidfuzz;\n` +
      fuzzyJoinQuery(
        leftTable.name,
        leftColumn,
        rightTable.name,
        rightColumn,
        method,
        threshold,
        joinType,
        outputTableName,
        similarityColumn,
      ),
    mergeOptions(leftTable, {
      table: outputTableName,
      method: "fuzzyJoin()",
      parameters: {
        leftColumn,
        rightTable: rightTable.name,
        rightColumn,
        options,
      },
    }),
  );

  const allProjections = {
    ...leftTable.projections,
    ...rightTable.projections,
  };

  if (typeof options.outputTable === "string") {
    const newTable = leftTable.sdb.newTable(
      options.outputTable,
      allProjections,
    );
    return newTable;
  } else {
    leftTable.projections = allProjections;
    return leftTable;
  }
}
