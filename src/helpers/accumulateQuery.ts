import stringToArray from "./stringToArray.ts";

export default function accumulateQuery(
  table: string,
  column: string,
  newColumn: string,
  options: {
    categories?: string | string[];
  } = {},
) {
  const categories = options.categories
    ? stringToArray(options.categories)
    : [];
  const partition = categories.length > 0
    ? `PARTITION BY ${categories.map((d) => `${d}`).join(", ")}`
    : "";

  const query =
    `CREATE OR REPLACE TABLE ${table} AS SELECT *, SUM(${column}) OVER (${partition} ORDER BY idForAccumulate) AS ${newColumn}
    FROM ${table};`;

  return query;
}
