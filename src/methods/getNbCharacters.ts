import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import type SimpleTable from "../class/SimpleTable.ts";

export default async function getNbCharacters(
  SimpleTable: SimpleTable,
  column: string,
) {
  const queryResult = await queryDB(
    SimpleTable,
    `SELECT CAST(SUM(LENGTH("${column}")) AS BIGINT) AS total_chars FROM "${SimpleTable.name}"`,
    mergeOptions(SimpleTable, {
      table: SimpleTable.name,
      returnDataFrom: "query",
      method: "getNbCharacters()",
      parameters: { column },
    }),
  );

  if (!queryResult) {
    throw new Error("No queryResults");
  }

  const result = Number(queryResult[0].total_chars);

  return result;
}
