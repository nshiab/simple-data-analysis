import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import type SimpleWebTable from "../class/SimpleWebTable.ts";

export default async function getValues(
  simpleWebTable: SimpleWebTable,
  column: string,
) {
  const queryResult = await queryDB(
    simpleWebTable,
    `SELECT ${column} FROM ${simpleWebTable.name}`,
    mergeOptions(simpleWebTable, {
      table: simpleWebTable.name,
      returnDataFrom: "query",
      method: "getValues()",
      parameters: { column },
    }),
  );
  if (!queryResult) {
    throw new Error("No result");
  }

  const values = queryResult.map((d) => d[column]);

  return values;
}
