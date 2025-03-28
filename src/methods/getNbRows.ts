import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import type SimpleWebTable from "../class/SimpleWebTable.ts";

export default async function getNbRows(simpleWebTable: SimpleWebTable) {
  const queryResult = await queryDB(
    simpleWebTable,
    `SELECT CAST(COUNT(*) AS INTEGER) FROM ${simpleWebTable.name}`,
    mergeOptions(simpleWebTable, {
      table: simpleWebTable.name,
      returnDataFrom: "query",
      method: "getLength()",
      parameters: {},
    }),
  );

  if (!queryResult) {
    throw new Error("No result");
  }
  const length = queryResult[0]["CAST(count_star() AS INTEGER)"] as number;

  return length;
}
