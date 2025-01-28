import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import type SimpleWebTable from "../class/SimpleWebTable.ts";

export default async function getQuantile(
  simpleWebTable: SimpleWebTable,
  column: string,
  quantile: number,
  options: {
    decimals?: number;
  } = {},
) {
  const queryResult = await queryDB(
    simpleWebTable,
    typeof options.decimals === "number"
      ? `SELECT ROUND(QUANTILE_CONT("${column}", ${quantile}), ${options.decimals}) AS "${column}" FROM ${simpleWebTable.name}`
      : `SELECT QUANTILE_CONT("${column}", ${quantile}) AS "${column}" FROM ${simpleWebTable.name}`,
    mergeOptions(simpleWebTable, {
      table: simpleWebTable.name,
      returnDataFrom: "query",
      method: "getQuantile()",
      parameters: { column, quantile, options },
    }),
  );

  if (!queryResult) {
    throw new Error("No queryResults");
  }

  const result = queryResult[0][column];
  simpleWebTable.debug && console.log("quantile:", result);
  return result as number;
}
