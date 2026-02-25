/**
 * Generates a SQL query that performs a fuzzy join between two tables using the
 * rapidfuzz DuckDB community extension.
 */
export default function fuzzyJoinQuery(
  leftTable: string,
  leftColumn: string,
  rightTable: string,
  rightColumn: string,
  method:
    | "ratio"
    | "partial_ratio"
    | "token_sort_ratio"
    | "token_set_ratio",
  threshold: number,
  join: "inner" | "left" | "right" | "full",
  outputTable: string,
  similarityColumn: string | undefined,
) {
  const fn =
    `ROUND(rapidfuzz_${method}("${leftTable}"."${leftColumn}", "${rightTable}"."${rightColumn}"), 2)`;

  let query =
    `CREATE OR REPLACE TABLE "${outputTable}" AS SELECT "${leftTable}".*, "${rightTable}".*${
      similarityColumn ? `, ${fn} AS "${similarityColumn}"` : ""
    }`;

  if (join === "inner") {
    query += ` FROM "${leftTable}" JOIN "${rightTable}"`;
  } else if (join === "left") {
    query += ` FROM "${leftTable}" LEFT JOIN "${rightTable}"`;
  } else if (join === "right") {
    query += ` FROM "${leftTable}" RIGHT JOIN "${rightTable}"`;
  } else if (join === "full") {
    query += ` FROM "${leftTable}" FULL JOIN "${rightTable}"`;
  } else {
    throw new Error(`Unknown ${join} join.`);
  }

  query +=
    ` ON ${fn} >= ${threshold} ORDER BY "${leftTable}"."${leftColumn}", "${rightTable}"."${rightColumn}";\n`;

  return query;
}
