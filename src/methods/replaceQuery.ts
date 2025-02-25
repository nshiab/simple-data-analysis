export default function replaceQuery(
  table: string,
  columns: string[],
  oldTexts: string[],
  newTexts: string[],
  options: { entireString?: boolean; regex?: boolean } = {},
) {
  let query = "";

  oldTexts = oldTexts.map((d) => d.replace(/'/g, "''"));
  newTexts = newTexts.map((d) => d.replace(/'/g, "''"));

  for (const column of columns) {
    for (let i = 0; i < oldTexts.length; i++) {
      if (options.entireString) {
        query += `UPDATE "${table}" SET "${column}" = 
                CASE
                    WHEN "${column}" = '${oldTexts[i]}' THEN '${newTexts[i]}'
                    ELSE "${column}"
                END;\n`;
      } else if (options.regex) {
        query +=
          `UPDATE "${table}" SET "${column}" = REGEXP_REPLACE("${column}", '${
            oldTexts[i]
          }', '${newTexts[i]}', 'g');\n`;
      } else {
        query += `UPDATE "${table}" SET "${column}" = REPLACE("${column}", '${
          oldTexts[i]
        }', '${newTexts[i]}');\n`;
      }
    }
  }

  return query;
}
