import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import stringToArray from "../helpers/stringToArray.ts";
import removeMissingQuery from "./removeMissingQuery.ts";
import type SimpleTable from "../class/SimpleTable.ts";

export default async function removeMissing(
  simpleTable: SimpleTable,
  options: {
    columns?: string | string[];
    missingValues?: (string | number)[];
    invert?: boolean;
  } = {},
) {
  options.missingValues = options.missingValues ?? [
    "undefined",
    "NaN",
    "null",
    "NULL",
    "",
  ];

  const types = await simpleTable.getTypes();
  const allColumns = Object.keys(types);

  options.columns = stringToArray(options.columns ?? []);

  await queryDB(
    simpleTable,
    removeMissingQuery(
      simpleTable.name,
      allColumns,
      types,
      options.columns.length === 0 ? allColumns : options.columns,
      options,
    ),
    mergeOptions(simpleTable, {
      table: simpleTable.name,
      method: "removeMissing()",
      parameters: { options },
    }),
  );
}
