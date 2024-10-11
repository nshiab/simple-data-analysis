import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import stringToArray from "../helpers/stringToArray.ts";
import removeMissingQuery from "./removeMissingQuery.ts";
import type SimpleWebTable from "../class/SimpleWebTable.ts";

export default async function removeMissing(
  simpleWebTable: SimpleWebTable,
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

  const types = await simpleWebTable.getTypes();
  const allColumns = Object.keys(types);

  options.columns = stringToArray(options.columns ?? []);

  await queryDB(
    simpleWebTable,
    removeMissingQuery(
      simpleWebTable.name,
      allColumns,
      types,
      options.columns.length === 0 ? allColumns : options.columns,
      options,
    ),
    mergeOptions(simpleWebTable, {
      table: simpleWebTable.name,
      method: "removeMissing()",
      parameters: { options },
    }),
  );
}
