export default function cloneQuery(
  table: string,
  newTable: string,
  options: {
    conditions?: string;
  } = {},
) {
  return `CREATE OR REPLACE TABLE "${newTable}" AS SELECT * FROM "${table}"${
    options.conditions ? ` WHERE ${options.conditions}` : ""
  }`;
}
