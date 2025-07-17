import stringToArray from "../helpers/stringToArray.ts";

export default function normalizeQuery(
  table: string,
  column: string,
  newColumn: string,
  options: {
    categories?: string | string[];
    decimals?: number;
  } = {},
) {
  const categories = options.categories
    ? stringToArray(options.categories)
    : [];
  const partition = categories.length > 0
    ? `PARTITION BY ${categories.map((d) => `"${d}"`).join(", ")}`
    : "";

  const tempQuery = `("${column}" - MIN("${column}") OVER(${partition}))
    /
    (MAX("${column}") OVER(${partition}) - MIN("${column}") OVER(${partition}))`;

  const query = `
    CREATE OR REPLACE TABLE "${table}" AS
    SELECT *, (
        ${
    typeof options.decimals === "number"
      ? `ROUND(${tempQuery}, ${options.decimals})`
      : tempQuery
  }
        ) AS ${newColumn},
    FROM "${table}"
    `;

  return query;
}
