import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import type SimpleWebTable from "../class/SimpleWebTable.ts";

export default async function getBottom(
  simpleWebTable: SimpleWebTable,
  count: number,
  options: {
    originalOrder?: boolean;
    conditions?: string;
  } = {},
) {
  const queryResult = await queryDB(
    simpleWebTable,
    `WITH numberedRowsForGetBottom AS (
                SELECT *, row_number() OVER () as rowNumberForGetBottom FROM ${simpleWebTable.name}${
      options.conditions ? ` WHERE ${options.conditions}` : ""
    }
            )
            SELECT * FROM numberedRowsForGetBottom ORDER BY rowNumberForGetBottom DESC LIMIT ${count};`,
    mergeOptions(simpleWebTable, {
      table: simpleWebTable.name,
      returnDataFrom: "query",
      method: "getBottom()",
      parameters: { count, options },
    }),
  );

  if (!queryResult) {
    throw new Error("No queryResult");
  }

  const rowsRaw = queryResult.map((d) => {
    delete d.rowNumberForGetBottom;
    return d;
  });
  const rows = options.originalOrder ? rowsRaw.reverse() : rowsRaw;

  simpleWebTable.debug && console.log("Bottom rows:");
  simpleWebTable.debug && console.table(rows);

  return rows;
}
