import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import type SimpleTable from "../class/SimpleTable.ts";

export default async function getBottom(
  simpleTable: SimpleTable,
  count: number,
  options: {
    originalOrder?: boolean;
    conditions?: string;
  } = {},
) {
  const queryResult = await queryDB(
    simpleTable,
    `WITH numberedRowsForGetBottom AS (
                SELECT *, row_number() OVER () as rowNumberForGetBottom FROM ${simpleTable.name}${
      options.conditions ? ` WHERE ${options.conditions}` : ""
    }
            )
            SELECT * FROM numberedRowsForGetBottom ORDER BY rowNumberForGetBottom DESC LIMIT ${count};`,
    mergeOptions(simpleTable, {
      table: simpleTable.name,
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

  return rows;
}
