import type SimpleWebTable from "../class/SimpleWebTable.ts";
import getIdenticalColumns from "../helpers/getIdenticalColumns.ts";
import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import joinQuery from "./joinQuery.ts";

export default async function join(
  leftTable: SimpleWebTable,
  rightTable: SimpleWebTable,
  options: {
    commonColumn?: string | string[];
    type?: "inner" | "left" | "right" | "full";
    outputTable?: string | boolean;
  } = {},
) {
  const leftTableColumns = await leftTable.getColumns();
  const rightTableColumns = await rightTable.getColumns();
  const identicalColumns = getIdenticalColumns(
    leftTableColumns,
    rightTableColumns,
  );

  let commonColumn: string[] | undefined;
  if (typeof options.commonColumn === "string") {
    commonColumn = [options.commonColumn];
  } else if (Array.isArray(options.commonColumn)) {
    commonColumn = options.commonColumn;
  } else {
    if (identicalColumns.length === 0) {
      throw new Error("No common column");
    } else if (identicalColumns.length === 1) {
      commonColumn = identicalColumns;
    } else {
      throw new Error(
        "Multiple columns with identical names in the tables. You need to pick the ones you want.",
      );
    }
  }

  const identicalColumnsForError = identicalColumns.filter(
    (d) => !commonColumn.includes(d),
  );
  if (identicalColumnsForError.length > 0) {
    if (identicalColumnsForError.length === 1) {
      throw new Error(
        `The tables have columns with identical names (excluding ${
          commonColumn.map((d) => `"${d}"`).join(", ")
        } used for the join). Rename or remove ${
          identicalColumnsForError.map((d) => `"${d}"`).join(", ")
        } in one of the two tables before doing the join. If relevant, you can also add it to the commonColumn option.`,
      );
    } else {
      throw new Error(
        `The tables have columns with identical names (excluding ${
          commonColumn.map((d) => `"${d}"`).join(", ")
        } used for the join). Rename or remove ${
          identicalColumnsForError.map((d) => `"${d}"`).join(", ")
        } in one of the two tables before doing the join. If relevant, you can also add them to the commonColumn option.`,
      );
    }
  }

  await queryDB(
    leftTable,
    joinQuery(
      leftTable.name,
      rightTable.name,
      commonColumn,
      options.type ?? "left",
      typeof options.outputTable === "string"
        ? options.outputTable
        : leftTable.name,
    ),
    mergeOptions(leftTable, {
      table: typeof options.outputTable === "string"
        ? options.outputTable
        : leftTable.name,
      method: "join()",
      parameters: {
        rightTable,
        options,
      },
    }),
  );

  const outputTable = typeof options.outputTable === "string"
    ? leftTable.sdb.newTable(options.outputTable, leftTable.projections) // missing projections here...
    : leftTable;

  // So we reassign here
  const allProjections = {
    ...leftTable.projections,
    ...rightTable.projections,
  };
  outputTable.projections = allProjections;

  // Need to remove the extra common columns. Ideally, this would happen in the query. :1 is with web assembly version. _1 is with nodejs version. At some point, both will be the same.
  const columns = await outputTable.getColumns();
  const extraCommonColumns = columns.filter(
    (d) =>
      commonColumn.map((c) => `${c}_1`).includes(d) ||
      commonColumn.map((c) => `${c}:1`).includes(d),
  );
  if (extraCommonColumns.length > 0) {
    await outputTable.removeColumns(extraCommonColumns);
  }

  return outputTable;
}
