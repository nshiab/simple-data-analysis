import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import type SimpleWebTable from "../class/SimpleWebTable.ts";

export default async function getVar(
  simpleWebTable: SimpleWebTable,
  column: string,
  options: {
    decimals?: number;
  } = {},
) {
  const queryResult = await queryDB(
    simpleWebTable,
    typeof options.decimals === "number"
      ? `SELECT ROUND(VARIANCE("${column}"), ${options.decimals}) AS "${column}" FROM ${simpleWebTable.name}`
      : `SELECT VARIANCE("${column}") AS "${column}" FROM ${simpleWebTable.name}`,
    mergeOptions(simpleWebTable, {
      table: simpleWebTable.name,
      returnDataFrom: "query",
      method: "getVar()",
      parameters: { column, options },
    }),
  );

  if (!queryResult) {
    throw new Error("No queryResults");
  }

  const result = queryResult[0][column];
  simpleWebTable.debug && console.log("variance:", result);
  return result as number;
}
