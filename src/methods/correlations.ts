import getCombinations from "../helpers/getCombinations.ts";
import keepNumericalColumns from "../helpers/keepNumericalColumns.ts";
import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import correlationsQuery from "./correlationsQuery.ts";
import type SimpleTable from "../class/SimpleTable.ts";

export default async function correlations(
  SimpleTable: SimpleTable,
  options: {
    x?: string;
    y?: string;
    categories?: string | string[];
    decimals?: number;
    outputTable?: string | boolean;
  } = {},
) {
  const outputTable = typeof options.outputTable === "string"
    ? options.outputTable
    : SimpleTable.name;

  let combinations: [string, string][] = [];
  if (!options.x && !options.y) {
    const types = await SimpleTable.getTypes();
    const columns = keepNumericalColumns(types);
    combinations = getCombinations(columns, 2);
  } else if (options.x && !options.y) {
    const types = await SimpleTable.getTypes();
    const columns = keepNumericalColumns(types);
    combinations = [];
    for (const col of columns) {
      if (col !== options.x) {
        combinations.push([options.x, col]);
      }
    }
  } else if (options.x && options.y) {
    combinations = [[options.x, options.y]];
  } else {
    throw new Error("No combinations of x and y");
  }

  await queryDB(
    SimpleTable,
    correlationsQuery(
      SimpleTable.name,
      outputTable,
      combinations,
      options,
    ),
    mergeOptions(SimpleTable, {
      table: outputTable,
      method: "correlations()",
      parameters: {
        options,
        "combinations (computed)": combinations,
      },
    }),
  );
}
