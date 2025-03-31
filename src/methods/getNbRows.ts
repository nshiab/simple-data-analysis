import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import type SimpleTable from "../class/SimpleTable.ts";

export default async function getNbRows(SimpleTable: SimpleTable) {
  const queryResult = await queryDB(
    SimpleTable,
    `SELECT CAST(COUNT(*) AS INTEGER) FROM ${SimpleTable.name}`,
    mergeOptions(SimpleTable, {
      table: SimpleTable.name,
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
