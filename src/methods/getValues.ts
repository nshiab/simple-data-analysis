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

  simpleWebTable.debug &&
    console.log(
      "values:",
      values.length > 5
        ? JSON.stringify(values.slice(0, 5)) +
          " (showing first 5 values)"
        : values,
    );

  return values;
}
