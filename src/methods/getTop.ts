import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import type SimpleTable from "../class/SimpleTable.ts";

export default async function getTop(
  simpleTable: SimpleTable,
  count: number,
  options: {
    conditions?: string;
  } = {},
) {
  const rows = await queryDB(
    simpleTable,
    `SELECT * FROM ${simpleTable.name}${
      options.conditions ? ` WHERE ${options.conditions}` : ""
    } LIMIT ${count}`,
    mergeOptions(simpleTable, {
      table: simpleTable.name,
      returnDataFrom: "query",
      method: "getTop()",
      parameters: { count, options },
    }),
  );

  if (!rows) {
    throw new Error("no rows");
  }

  return rows;
}
