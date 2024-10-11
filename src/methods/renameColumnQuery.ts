export default function renameColumnQuery(
  table: string,
  oldColumns: string[],
  newColumns: string[],
) {
  let query = "";
  for (let i = 0; i < oldColumns.length; i++) {
    query += `ALTER TABLE ${table} RENAME COLUMN "${oldColumns[i]}" TO "${
      newColumns[i]
    }";\n`;
  }
  return query;
}
