import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import type SimpleWebTable from "../class/SimpleWebTable.ts";

export default async function getTop(
  simpleWebTable: SimpleWebTable,
  count: number,
  options: {
    conditions?: string;
  } = {},
) {
  const rows = await queryDB(
    simpleWebTable,
    `SELECT * FROM ${simpleWebTable.name}${
      options.conditions ? ` WHERE ${options.conditions}` : ""
    } LIMIT ${count}`,
    mergeOptions(simpleWebTable, {
      table: simpleWebTable.name,
      returnDataFrom: "query",
      method: "getTop()",
      parameters: { count, options },
    }),
  );

  if (!rows) {
    throw new Error("no rows");
  }

  simpleWebTable.debug && console.log("Top rows:");
  simpleWebTable.debug && console.table(rows);

  return rows;
}
