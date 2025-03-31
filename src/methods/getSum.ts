import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import type SimpleTable from "../class/SimpleTable.ts";

export default async function getSum(
  SimpleTable: SimpleTable,
  column: string,
) {
  const queryResult = await queryDB(
    SimpleTable,
    `SELECT SUM("${column}") AS "${column}" FROM ${SimpleTable.name}`,
    mergeOptions(SimpleTable, {
      table: SimpleTable.name,
      returnDataFrom: "query",
      method: "getSum()",
      parameters: { column },
    }),
  );

  if (!queryResult) {
    throw new Error("No queryResults");
  }

  const result = queryResult[0][column];

  return result as number;
}
