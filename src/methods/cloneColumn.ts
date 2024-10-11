export default function cloneColumnQuery(
  table: string,
  originalColumn: string,
  newColumn: string,
  types: { [key: string]: string },
) {
  let query = "";

  const originalColumnType = types[originalColumn];

  if (originalColumnType) {
    query +=
      `ALTER TABLE ${table} ADD COLUMN ${newColumn} ${originalColumnType};
        UPDATE ${table} SET ${newColumn} = ${originalColumn}`;
  } else {
    throw new Error(`Can't find type of ${originalColumn}`);
  }

  return query;
}
