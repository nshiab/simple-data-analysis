export default function extractTypes(
  types: {
    [key: string]: string | number | boolean | Date | null;
  }[] | null,
) {
  const typesObj: { [key: string]: string } = {};

  if (types) {
    for (const t of types as { [key: string]: string }[]) {
      if (t.column_name) {
        typesObj[t.column_name] = t.column_type;
      }
    }
  }

  return typesObj;
}
