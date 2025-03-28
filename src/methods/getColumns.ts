import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import type SimpleWebTable from "../class/SimpleWebTable.ts";

export default async function getColumns(simpleWebTable: SimpleWebTable) {
  const queryResult = await queryDB(
    simpleWebTable,
    `DESCRIBE ${simpleWebTable.name}`,
    mergeOptions(simpleWebTable, {
      table: simpleWebTable.name,
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
