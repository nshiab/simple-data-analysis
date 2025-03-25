import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import type SimpleWebTable from "../class/SimpleWebTable.ts";

export default async function getLastRow(
  simpleWebTable: SimpleWebTable,
  options: {
    conditions?: string;
  } = {},
) {
  const queryResult = await queryDB(
    simpleWebTable,
    `WITH numberedRowsForGetLastRow AS (
                SELECT *, row_number() OVER () as rowNumberForGetLastRow FROM ${simpleWebTable.name}${
      options.conditions ? ` WHERE ${options.conditions}` : ""
    }
            )
            SELECT * FROM numberedRowsForGetLastRow ORDER BY rowNumberForGetLastRow DESC LIMIT 1;`,
    mergeOptions(simpleWebTable, {
      table: simpleWebTable.name,
      returnDataFrom: "query",
      method: "getLastRow()",
      parameters: { options },
    }),
  );
  if (!queryResult) {
    throw new Error("No queryResult");
  }
  const result = queryResult[0];
  delete result.rowNumberForGetLastRow;

  simpleWebTable.debug && console.log("last row:", result);

  return result;
}
