export default function roundQuery(
  table: string,
  columns: string[],
  options: { method?: "round" | "ceiling" | "floor"; decimals?: number },
) {
  let query = `UPDATE ${table} SET`;
  const method = options.method?.toUpperCase() ?? "ROUND";
  const decimals = options.decimals ?? 0;

  if (method === "ROUND") {
    for (const column of columns) {
      query += `\n${column} = ${method}(${column}, ${decimals}),`;
    }
  } else {
    for (const column of columns) {
      query += `\n${column} = ${method}(${column}),`;
    }
  }

  return query.slice(0, query.length - 1);
}
