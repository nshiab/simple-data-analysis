import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import type SimpleTable from "../class/SimpleTable.ts";

export default async function getMin(
  simpleTable: SimpleTable,
  column: string,
) {
  const queryResult = await queryDB(
    simpleTable,
    `SELECT MIN("${column}") AS "${column}" FROM "${simpleTable.name}"`,
    {
      ...mergeOptions(simpleTable, {
        table: simpleTable.name,
        returnDataFrom: "query",
        method: "getMin()",
        parameters: { column },
      }),
      types: await simpleTable.getTypes(),
    },
  );

  if (!queryResult) {
    throw new Error("No queryResults");
  }
  const result = queryResult[0][column];

  return result;
}
