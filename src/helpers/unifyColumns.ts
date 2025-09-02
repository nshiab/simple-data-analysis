import type SimpleTable from "../class/SimpleTable.ts";

export default async function unifyColumns(
  allTables: SimpleTable[],
  allTypes: { [key: string]: string },
  allProjections: { [key: string]: string },
) {
  const columnsAdded: {
    [key: string]: string[];
  } = {};

  for (const column in allTypes) {
    for (const table of allTables) {
      if (!(await table.hasColumn(column))) {
        await table.addColumn(
          column,
          // Could be improved
          allTypes[column].toLowerCase() as
            | "string"
            | "number"
            | "bigint"
            | "boolean"
            | "integer"
            | "float"
            | "date"
            | "time"
            | "datetime"
            | "datetimeTz"
            | "double"
            | "varchar"
            | "timestamp"
            | "timestamp with time zone"
            | "geometry",
          `null`,
          {
            projection: allTypes[column] === "GEOMETRY"
              ? allProjections[column]
              : undefined,
          },
        );
        if (!columnsAdded[table.name]) {
          columnsAdded[table.name] = [];
        }
        columnsAdded[table.name].push(column);
      }
    }
  }

  return columnsAdded;
}
