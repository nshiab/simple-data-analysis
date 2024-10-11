import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import type SimpleWebTable from "../class/SimpleWebTable.ts";

export default async function getMean(
  simpleWebDB: SimpleWebTable,
  column: string,
  options: {
    decimals?: number;
  } = {},
) {
  const queryResult = await queryDB(
    simpleWebDB,
    typeof options.decimals === "number"
      ? `SELECT ROUND(AVG(${column}), ${options.decimals}) AS valueForGetMean FROM ${simpleWebDB.name}`
      : `SELECT AVG(${column}) AS valueForGetMean FROM ${simpleWebDB.name}`,
    mergeOptions(simpleWebDB, {
      table: simpleWebDB.name,
      returnDataFrom: "query",
      method: "getMean()",
      parameters: { column, options },
    }),
  );

  if (!queryResult) {
    throw new Error("No queryResults");
  }

  const result = queryResult[0].valueForGetMean;

  simpleWebDB.debug && console.log("mean:", result);

  return result as number;
}
