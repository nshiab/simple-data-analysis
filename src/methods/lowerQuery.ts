export default function lowerQuery(table: string, columns: string[]) {
  let query = "";

  for (const column of columns) {
    query += `\nUPDATE ${table} SET "${column}" = LOWER("${column}");`;
  }

  return query;
}
