export default function truncateQuery(
  table: string,
  column: string,
  length: number,
) {
  return `UPDATE "${table}" SET "${column}" = LEFT("${column}", ${length});`;
}
