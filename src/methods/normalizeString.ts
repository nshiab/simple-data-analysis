import type SimpleTable from "../class/SimpleTable.ts";
import queryDB from "../helpers/queryDB.ts";
import mergeOptions from "../helpers/mergeOptions.ts";

export default async function normalizeString(
  simpleTable: SimpleTable,
  column: string,
  newColumn: string,
  options: { stripPunctuation?: boolean } = {},
): Promise<void> {
  const { stripPunctuation = true } = options;

  const accentRemoved = `strip_accents("${column}")`;

  const lowercased = `lower(${accentRemoved})`;

  const punctuationRemoved = stripPunctuation
    ? `regexp_replace(${lowercased}, '[[:punct:]]', '', 'g')`
    : lowercased;

  const normalizedClause =
    `trim(regexp_replace(${punctuationRemoved}, '\\s+', ' ', 'g'))`;

  await queryDB(
    simpleTable,
    `CREATE OR REPLACE TABLE "${simpleTable.name}" AS 
    SELECT *,
      CASE 
        WHEN "${column}" IS NULL THEN NULL
        ELSE ${normalizedClause}
      END AS "${newColumn}"
    FROM "${simpleTable.name}"`,
    mergeOptions(simpleTable, {
      table: simpleTable.name,
      method: "normalizeString()",
      parameters: {
        column,
        newColumn,
        stripPunctuation,
      },
    }),
  );
}
