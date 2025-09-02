export default function cloneQuery(
  table: string,
  newTable: string,
  columns: string[],
  options: {
    conditions?: string;
  } = {},
) {
  const selectClause = columns.length > 0
    ? columns.map((col) => `"${col}"`).join(", ")
    : "*";

  return `CREATE OR REPLACE TABLE "${newTable}" AS SELECT ${selectClause} FROM "${table}"${
    options.conditions ? ` WHERE ${options.conditions}` : ""
  }`;
}
