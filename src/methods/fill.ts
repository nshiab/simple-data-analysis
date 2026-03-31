import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import stringToArray from "../helpers/stringToArray.ts";
import type SimpleTable from "../class/SimpleTable.ts";

export default async function fill(
  simpleTable: SimpleTable,
  columns: string | string[],
  options: {
    categories?: string | string[];
  } = {},
) {
  const categories = options.categories
    ? stringToArray(options.categories)
    : [];

  if (categories.length > 0) {
    const partition = `PARTITION BY ${
      categories.map((d) => `"${d}"`).join(", ")
    }`;
    const tempRowCol = `rowNumberForFill`;
    await simpleTable.addRowNumber(tempRowCol);
    const cols = stringToArray(columns);
    const excludeList = [`"${tempRowCol}"`, ...cols].join(", ");
    const selectList = cols
      .map(
        (col) =>
          `COALESCE(${col}, LAG(${col} IGNORE NULLS) OVER(${partition} ORDER BY "${tempRowCol}")) as ${col}`,
      )
      .join(", ");
    await queryDB(
      simpleTable,
      `CREATE OR REPLACE TABLE "${simpleTable.name}" AS SELECT * EXCLUDE(${excludeList}), ${selectList} FROM "${simpleTable.name}" ORDER BY "${tempRowCol}";`,
      mergeOptions(simpleTable, {
        table: simpleTable.name,
        method: "fill()",
        parameters: { columns, ...options },
      }),
    );
  } else {
    await queryDB(
      simpleTable,
      stringToArray(columns)
        .map(
          (col) =>
            `CREATE OR REPLACE TABLE "${simpleTable.name}" AS SELECT * EXCLUDE(${col}), COALESCE(${col}, LAG(${col} IGNORE NULLS) OVER()) as ${col} FROM "${simpleTable.name}";`,
        )
        .join("\n"),
      mergeOptions(simpleTable, {
        table: simpleTable.name,
        method: "fill()",
        parameters: { columns, ...options },
      }),
    );
  }
}
