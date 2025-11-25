import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import type SimpleTable from "../class/SimpleTable.ts";

export default async function splitSpread(
  simpleTable: SimpleTable,
  column: string,
  separator: string,
  newColumns: string[],
) {
  const nbParts = newColumns.length;

  // Check if any row has more parts than expected
  const maxPartsResult = await queryDB(
    simpleTable,
    `SELECT MAX(ARRAY_LENGTH(STRING_SPLIT("${column}", '${separator}'))) as max_parts FROM "${simpleTable.name}"`,
    mergeOptions(simpleTable, {
      table: simpleTable.name,
      method: "splitSpread()",
      parameters: { column, separator, newColumns },
      returnDataFrom: "query",
    }),
  );

  if (maxPartsResult && maxPartsResult.length > 0) {
    const maxParts = maxPartsResult[0].max_parts as number;

    if (maxParts > nbParts) {
      // Get the first 5 rows with more parts than expected
      const problematicRows = await queryDB(
        simpleTable,
        `SELECT "${column}" 
         FROM "${simpleTable.name}" 
         WHERE ARRAY_LENGTH(STRING_SPLIT("${column}", '${separator}')) > ${nbParts}
         LIMIT 5`,
        mergeOptions(simpleTable, {
          table: simpleTable.name,
          method: "splitSpread()",
          parameters: { column, separator, newColumns },
          returnDataFrom: "query",
        }),
      );

      const exampleRows = problematicRows
        ? problematicRows.map((row) => row[column]).join("\n  - ")
        : "";

      throw new Error(
        `Some rows contain more values after splitting (${maxParts}) than the number of new columns specified (${nbParts}).
When splitting by '${separator}', each row must produce at most ${nbParts} value(s) to fit in the columns: ${
          newColumns.join(", ")
        }.

First 5 rows with too many values:\n  - ${exampleRows}`,
      );
    }
  }

  // Check if any row has fewer parts than expected
  const minPartsResult = await queryDB(
    simpleTable,
    `SELECT MIN(ARRAY_LENGTH(STRING_SPLIT("${column}", '${separator}'))) as min_parts FROM "${simpleTable.name}"`,
    mergeOptions(simpleTable, {
      table: simpleTable.name,
      method: "splitSpread()",
      parameters: { column, separator, newColumns },
      returnDataFrom: "query",
    }),
  );

  if (minPartsResult && minPartsResult.length > 0) {
    const minParts = minPartsResult[0].min_parts as number;

    if (minParts < nbParts) {
      console.warn(
        `splitSpread() warning: Some rows contain fewer values after splitting (${minParts}) than the number of new columns (${nbParts}). Empty strings will be used for missing values.`,
      );
    }
  }

  const alterStatements = newColumns
    .map((col) => `ALTER TABLE "${simpleTable.name}" ADD "${col}" VARCHAR;`)
    .join("\n");

  const updateStatements = newColumns
    .map(
      (col, i) =>
        `UPDATE "${simpleTable.name}" SET "${col}" = SPLIT_PART("${column}", '${separator}', ${
          i + 1
        });`,
    )
    .join("\n");

  await queryDB(
    simpleTable,
    `${alterStatements}
    ${updateStatements}`,
    mergeOptions(simpleTable, {
      table: simpleTable.name,
      method: "splitSpread()",
      parameters: { column, separator, newColumns },
    }),
  );
}
