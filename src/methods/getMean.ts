import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import type SimpleTable from "../class/SimpleTable.ts";

export default async function getMean(
  simpleTable: SimpleTable,
  column: string,
  options: {
    decimals?: number;
  } = {},
) {
  const queryResult = await queryDB(
    simpleTable,
    typeof options.decimals === "number"
      ? `SELECT ROUND(AVG("${column}"), ${options.decimals}) AS "${column}" FROM "${simpleTable.name}"`
      : `SELECT AVG("${column}") AS "${column}" FROM "${simpleTable.name}"`,
    mergeOptions(simpleTable, {
      table: simpleTable.name,
      returnDataFrom: "query",
      method: "getMean()",
      parameters: { column, options },
    }),
  );

  if (!queryResult) {
    throw new Error("No queryResults");
  }

  const result = queryResult[0][column];

  return result as number;
}
