import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import type SimpleWebTable from "../class/SimpleWebTable.ts";

export default async function getSum(
  simpleWebTable: SimpleWebTable,
  column: string,
) {
  const queryResult = await queryDB(
    simpleWebTable,
    `SELECT SUM(${column}) AS "${column}" FROM ${simpleWebTable.name}`,
    mergeOptions(simpleWebTable, {
      table: simpleWebTable.name,
      returnDataFrom: "query",
      method: "getSum()",
      parameters: { column },
    }),
  );

  if (!queryResult) {
    throw new Error("No queryResults");
  }

  const result = queryResult[0][column];

  simpleWebTable.debug && console.log("sum:", result);

  return result as number;
}
