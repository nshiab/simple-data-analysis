import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import type SimpleWebTable from "../class/SimpleWebTable.ts";

export default async function getMax(
  simpleWebTable: SimpleWebTable,
  column: string,
) {
  const queryResult = await queryDB(
    simpleWebTable,
    `SELECT MAX("${column}") AS "${column}" FROM ${simpleWebTable.name}`,
    {
      ...mergeOptions(simpleWebTable, {
        table: simpleWebTable.name,
        returnDataFrom: "query",
        method: "getMax()",
        parameters: { column },
      }),
      types: await simpleWebTable.getTypes(),
    },
  );

  if (!queryResult) {
    throw new Error("No queryResults");
  }

  const result = queryResult[0][column];

  return result;
}
