import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import stringToArray from "../helpers/stringToArray.ts";
import type SimpleTable from "../class/SimpleTable.ts";

export default async function fill(
  simpleTable: SimpleTable,
  columns: string | string[],
  options: {
    categories?: string | string[];
    interpolate?: boolean;
    interpolateBy?: string;
  } = {},
) {
  const categories = options.categories
    ? stringToArray(options.categories)
    : [];
  const tempRowCol = `rowNumberForFill`;

  if (options.interpolateBy && options.interpolate === false) {
    throw new Error(
      `interpolate cannot be false when interpolateBy is set.`,
    );
  }

  if (options.interpolate || options.interpolateBy) {
    const cols = stringToArray(columns);
    let orderCol: string;
    let excludeList: string;
    if (options.interpolateBy) {
      orderCol = options.interpolateBy;
      excludeList = cols.join(", ");
    } else {
      await simpleTable.addRowNumber(tempRowCol);
      orderCol = tempRowCol;
      excludeList = [`"${tempRowCol}"`, ...cols].join(", ");
    }
    const overClause = categories.length > 0
      ? `(PARTITION BY ${categories.map((d) => `"${d}"`).join(", ")})`
      : `()`;
    const selectList = cols
      .map(
        (col) =>
          `fill(${col} ORDER BY "${orderCol}") OVER ${overClause} as ${col}`,
      )
      .join(", ");
    await queryDB(
      simpleTable,
      `CREATE OR REPLACE TABLE "${simpleTable.name}" AS SELECT * EXCLUDE(${excludeList}), ${selectList} FROM "${simpleTable.name}" ORDER BY "${orderCol}";`,
      mergeOptions(simpleTable, {
        table: simpleTable.name,
        method: "fill()",
        parameters: { columns, ...options },
      }),
    );
  } else if (categories.length > 0) {
    const partition = `PARTITION BY ${
      categories.map((d) => `"${d}"`).join(", ")
    }`;
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
