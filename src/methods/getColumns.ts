import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import type SimpleTable from "../class/SimpleTable.ts";

export default async function getColumns(simpleTable: SimpleTable) {
  const queryResult = await queryDB(
    simpleTable,
    `DESCRIBE ${simpleTable.name}`,
    mergeOptions(simpleTable, {
      table: simpleTable.name,
      returnDataFrom: "query",
      method: "getColumns()",
      parameters: {},
    }),
  );

  if (!queryResult) {
    throw new Error("No result");
  }

  const columns = queryResult.map((d) => d.column_name) as string[];

  return columns;
}
