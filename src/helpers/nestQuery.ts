import stringToArray from "./stringToArray.ts";

export default function nestQuery(
  table: string,
  column: string,
  separator: string,
  categories: string | string[],
) {
  const cats = stringToArray(categories);
  const groupBy = cats.map((d) => `"${d}"`).join(", ");
  const selectColumns = `${groupBy}, `;
  const orderBy = `\nORDER BY ${cats.map((d) => `"${d}" ASC`).join(", ")}`;

  const query = `CREATE OR REPLACE TABLE "${table}" AS
SELECT
  ${selectColumns}STRING_AGG("${column}", '${separator}') AS "${column}"
FROM "${table}"
GROUP BY ${groupBy}${orderBy};`;

  return query;
}
