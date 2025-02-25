export default function cloneQuery(
  table: string,
  newTable: string,
  options: {
    condition?: string;
  } = {},
) {
  return `CREATE OR REPLACE TABLE "${newTable}" AS SELECT * FROM "${table}"${
    options.condition ? ` WHERE ${options.condition}` : ""
  }`;
}
