export default function padQuery(
  table: string,
  columns: string[],
  options: {
    length: number;
    character?: string;
    method?: "leftPad" | "rightPad" | "both";
  },
) {
  let query = ``;

  const method = options.method ?? "leftPad";

  const padChar = typeof options.character === "string"
    ? `'${options.character}'`
    : `' '`;

  for (const column of columns) {
    if (method === "leftPad") {
      query +=
        `\nUPDATE "${table}" SET "${column}" = LPAD("${column}", ${options.length}, ${padChar});`;
    } else if (method === "rightPad") {
      query +=
        `\nUPDATE "${table}" SET "${column}" = RPAD("${column}", ${options.length}, ${padChar});`;
    } else if (method === "both") {
      // For center padding: first left-pad to center the string, then right-pad to target length
      // Left pad target = ceil(length/2) + floor(length/2) - floor(length/2) + original_length
      // Simplified: LPAD to ((target_length + original_length) / 2), then RPAD to target_length
      const targetLength = options.length;
      query += `\nUPDATE "${table}" SET "${column}" = RPAD(
  LPAD("${column}", CAST((${targetLength} + LENGTH("${column}")) / 2 AS INTEGER), ${padChar}),
  ${targetLength},
  ${padChar}
);`;
    } else {
      throw new Error(`Unknown method ${options.method}`);
    }
  }

  return query;
}
