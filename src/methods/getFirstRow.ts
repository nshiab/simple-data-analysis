import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import type SimpleWebTable from "../class/SimpleWebTable.ts";

export default async function getFirstRow(
  simpleWebTable: SimpleWebTable,
  options: {
    condition?: string;
  } = {},
) {
  const queryResult = await queryDB(
    simpleWebTable,
    `SELECT * FROM ${simpleWebTable.name}${
      options.condition ? ` WHERE ${options.condition}` : ""
    } LIMIT 1`,
    mergeOptions(simpleWebTable, {
      table: simpleWebTable.name,
      returnDataFrom: "query",
      method: "getFirstRow()",
      parameters: { options },
    }),
  );
  if (!queryResult) {
    throw new Error("No queryResult");
  }

  const result = queryResult[0];

  simpleWebTable.debug && console.log("first row:", result);

  return result;
}
