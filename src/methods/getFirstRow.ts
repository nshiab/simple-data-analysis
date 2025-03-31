import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import type SimpleTable from "../class/SimpleTable.ts";

export default async function getFirstRow(
  simpleTable: SimpleTable,
  options: {
    conditions?: string;
  } = {},
) {
  const queryResult = await queryDB(
    simpleTable,
    `SELECT * FROM ${simpleTable.name}${
      options.conditions ? ` WHERE ${options.conditions}` : ""
    } LIMIT 1`,
    mergeOptions(simpleTable, {
      table: simpleTable.name,
      returnDataFrom: "query",
      method: "getFirstRow()",
      parameters: { options },
    }),
  );
  if (!queryResult) {
    throw new Error("No queryResult");
  }

  const result = queryResult[0];

  return result;
}
