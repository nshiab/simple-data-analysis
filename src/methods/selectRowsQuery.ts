export default function selectRowsQuery(
  table: string,
  count: number | string,
  options: { offset?: number; outputTable?: string | boolean } = {},
) {
  return `CREATE OR REPLACE TABLE ${
    options.outputTable ?? table
  } AS SELECT * FROM "${table}" LIMIT ${count}${
    typeof options.offset === "number" ? ` OFFSET ${options.offset}` : ""
  };`;
}
