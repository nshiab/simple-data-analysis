import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import type SimpleWebTable from "../class/SimpleWebTable.ts";

export default async function getStdDev(
  simpleWebTable: SimpleWebTable,
  column: string,
  options: {
    decimals?: number;
  } = {},
) {
  const queryResult = await queryDB(
    simpleWebTable,
    typeof options.decimals === "number"
      ? `SELECT ROUND(STDDEV("${column}"), ${options.decimals}) AS "${column}" FROM ${simpleWebTable.name}`
      : `SELECT STDDEV("${column}") AS "${column}" FROM ${simpleWebTable.name}`,
    mergeOptions(simpleWebTable, {
      table: simpleWebTable.name,
      returnDataFrom: "query",
      method: "getStdDev()",
      parameters: { column, options },
    }),
  );

  if (!queryResult) {
    throw new Error("No queryResults");
  }

  const result = queryResult[0][column];
  simpleWebTable.debug && console.log("Standard deviation:", result);
  return result as number;
}
