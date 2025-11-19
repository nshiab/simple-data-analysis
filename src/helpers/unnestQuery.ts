export default function unnestQuery(
  table: string,
  column: string,
  separator: string,
) {
  const query = `CREATE OR REPLACE TABLE "${table}" AS
SELECT
  * EXCLUDE "${column}",
  TRIM(UNNEST(SPLIT("${column}", '${separator}'))) AS "${column}"
FROM "${table}";`;

  return query;
}
