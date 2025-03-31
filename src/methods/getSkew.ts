import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import type SimpleTable from "../class/SimpleTable.ts";

export default async function getSkew(
  SimpleTable: SimpleTable,
  column: string,
  options: {
    decimals?: number;
  } = {},
) {
  const queryResult = await queryDB(
    SimpleTable,
    typeof options.decimals === "number"
      ? `SELECT ROUND(SKEWNESS("${column}"), ${options.decimals}) AS "${column}" FROM ${SimpleTable.name}`
      : `SELECT SKEWNESS("${column}") AS "${column}" FROM ${SimpleTable.name}`,
    mergeOptions(SimpleTable, {
      table: SimpleTable.name,
      returnDataFrom: "query",
      method: "getSkew()",
      parameters: { column, options },
    }),
  );

  if (!queryResult) {
    throw new Error("No queryResults");
  }

  const result = queryResult[0][column];
  return result as number;
}
