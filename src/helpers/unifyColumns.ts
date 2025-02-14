import type { SimpleWebTable } from "../web.ts";

export default async function unifyColumns(allTables: SimpleWebTable[]) {
  const columnsAdded: {
    [key: string]: string[];
  } = {};
  const allTypes: { [key: string]: string } = {};
  const allProjections: { [key: string]: string } = {};
  for (const table of allTables) {
    const types = await table.getTypes();
    for (const key in types) {
      if (!allTypes[key]) {
        allTypes[key] = types[key];
        allProjections[key] = table.projections[key];
      } else {
        if (allTypes[key] !== types[key]) {
          throw new Error(
            `The column ${key} has different types in the tables.`,
          );
        } else if (allProjections[key] !== table.projections[key]) {
          throw new Error(
            `The column ${key} has different projections in the tables.`,
          );
        }
      }
    }
  }
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
