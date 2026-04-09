import type SimpleTable from "../class/SimpleTable.ts";
import queryDB from "../helpers/queryDB.ts";
import mergeOptions from "../helpers/mergeOptions.ts";

/**
 * Normalizes string values in a column by:
 * 1. Decomposing Unicode accents (NFD) and removing combining marks
 * 2. Optionally stripping punctuation (default: true)
 * 3. Converting to lowercase
 * 4. Normalizing whitespace (multiple spaces/tabs/newlines → single space)
 * 5. Trimming leading/trailing whitespace
 *
 * Produces nearly identical output to `journalism-format`'s `normalizeString()` function for all common cases including accented Latin characters (ÉÑÜéñü). Edge cases with decorative punctuation like ¡¿ may differ.
 *
 * @param simpleTable The SimpleTable instance
 * @param sourceColumn The column containing the text to normalize
 * @param targetColumn The column to store the normalized results
 * @param options Configuration options
 * @param options.stripPunctuation Strip punctuation and underscores (default: true)
 *
 * @returns The same SimpleTable instance for chaining
 *
 * @example
 * ```ts
 * // Normalize text column and store in new column
 * await table.normalizeString("Recipe", "recipe_normalized");
 * // "Épicerie Parisienne!" → "epicerie parisienne"
 * ```
 *
 * @example
 * ```ts
 * // Keep punctuation (useful for emails, URLs)
 * await table.normalizeString("text", "text_normalized", { stripPunctuation: false });
 * // "Hello, World!" → "hello, world!"
 * ```
 *
 * @example
 * ```ts
 * // Produces same results as journalism-format's normalizeString for core cases
 * await table.normalizeString("Name", "name_normalized");
 * // "Évènement!" → "evenement" (same as journalism-format)
 * // "Café?" → "cafe" (same as journalism-format)
 * ```
 *
 * @category Text Processing
 *
 * @recommendation Consider using `normalizeString()` to preprocess text columns before search/AI methods for better matching.
 */
export default async function normalizeString(
  simpleTable: SimpleTable,
  sourceColumn: string,
  targetColumn: string,
  options: { stripPunctuation?: boolean } = {},
): Promise<SimpleTable> {
  const { stripPunctuation = true } = options;

  // Step 1: Remove accents using DuckDB's native strip_accents() function
  const accentRemoved = `strip_accents("${sourceColumn}")`;

  // Step 2: Convert to lowercase for consistent comparison
  const lowercased = `lower(${accentRemoved})`;

  // Step 3: Conditionally remove punctuation using POSIX character class
  const punctuationRemoved = stripPunctuation
    ? `regexp_replace(${lowercased}, '[[:punct:]]', '', 'g')`
    : lowercased;

  // Step 4: Normalize whitespace - trim edges and collapse multiple spaces
  const normalizedClause =
    `trim(regexp_replace(${punctuationRemoved}, '\\s+', ' ', 'g'))`;

  await queryDB(
    simpleTable,
    `CREATE OR REPLACE TABLE "${simpleTable.name}" AS 
    SELECT *,
      CASE 
        WHEN "${sourceColumn}" IS NULL THEN NULL
        ELSE ${normalizedClause}
      END AS "${targetColumn}"
    FROM "${simpleTable.name}"`,
    mergeOptions(simpleTable, {
      table: simpleTable.name,
      method: "normalizeString()",
      parameters: {
        sourceColumn,
        targetColumn,
        stripPunctuation,
      },
    }),
  );

  return simpleTable;
}
