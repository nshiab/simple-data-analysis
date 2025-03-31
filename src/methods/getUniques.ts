import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import type SimpleTable from "../class/SimpleTable.ts";

export default async function getUniques(
  simpleTable: SimpleTable,
  column: string,
) {
  const queryResult = await queryDB(
    simpleTable,
    `SELECT DISTINCT "${column}" FROM ${simpleTable.name} ORDER BY "${column}" ASC`,
    mergeOptions(simpleTable, {
      table: simpleTable.name,
      returnDataFrom: "query",
      method: "getUniques()",
      parameters: { column },
    }),
  );

  if (!queryResult) {
    throw new Error("No result.");
  }

  const uniques = queryResult.map((d) => d[column]);

  return uniques;
}
