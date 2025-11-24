export default function concatenateRowQuery(
  table: string,
  columns: string[],
  newColumn: string,
) {
  const parts = columns.map(
    (col, i) =>
      i === 0
        ? `'${col}:\n' || COALESCE("${col}", 'Unknown')`
        : `'\n\n${col}:\n' || COALESCE("${col}", 'Unknown')`,
  );
  const concatenatedExpression = parts.join(" || ");

  const query = `ALTER TABLE "${table}" ADD "${newColumn}" VARCHAR;
    UPDATE "${table}" SET "${newColumn}" = ${concatenatedExpression}`;

  return query;
}
