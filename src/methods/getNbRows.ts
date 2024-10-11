import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import type SimpleWebTable from "../class/SimpleWebTable.ts";

export default async function getNbRows(simpleWebTable: SimpleWebTable) {
  const queryResult = await queryDB(
    simpleWebTable,
    `SELECT COUNT(*) FROM ${simpleWebTable.name}`,
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
  const length = queryResult[0]["count_star()"] as number;

  simpleWebTable.debug && console.log("length:", length);

  return length;
}
