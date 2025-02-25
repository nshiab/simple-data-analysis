export default function capitalizeQuery(table: string, columns: string[]) {
  let query = "";

  for (const column of columns) {
    query +=
      `\nUPDATE "${table}" SET "${column}" = CONCAT(UPPER(LEFT("${column}", 1)), LOWER(RIGHT("${column}", LENGTH("${column}")-1)));`;
  }

  return query;
}
