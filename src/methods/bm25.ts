import { camelCase } from "@nshiab/journalism-format";
import type SimpleTable from "../class/SimpleTable.ts";
import queryDB from "../helpers/queryDB.ts";
import mergeOptions from "../helpers/mergeOptions.ts";

/**
 * Performs BM25 full-text search on a text column to find the most relevant results. BM25 (Best Matching 25) is a ranking function used in information retrieval that calculates relevance scores based on term frequency and document length normalization.
 *
 * This method creates a full-text search index on the specified text column using DuckDB's [FTS extension](https://duckdb.org/docs/stable/core_extensions/full_text_search). If the index already exists, it will be reused unless the `overwriteIndex` option is set to `true`.
 *
 * @param simpleTable - The SimpleTable instance.
 * @param text - The search query.
 * @param columnId - The column containing the document identifiers.
 * @param columnText - The column containing the text to search.
 * @param nbResults - The number of results to return.
 * @param options - An optional object with configuration options:
 * @param options.stemmer - The stemmer to use for the FTS index. Defaults to "porter".
 * @param options.stopwords - The table containing the stopwords to use for the FTS index. Defaults to "english".
 * @param options.ignore - The regular expression of patterns to be ignored. Defaults to "(\\.|[^a-z])+".
 * @param options.stripAccents - A boolean indicating whether to remove accents. Defaults to true.
 * @param options.lower - A boolean indicating whether to convert all text to lowercase. Defaults to true.
 * @param options.k - Parameter k1 in the Okapi BM25 retrieval model. Defaults to 1.2.
 * @param options.b - Parameter b in the Okapi BM25 retrieval model. Defaults to 0.75.
 * @param options.minScore - The minimum score for a result to be included.
 * @param options.scoreColumn - The name of the column that will contain the BM25 score. Defaults to "score".
 * @param options.overwriteIndex - A boolean indicating whether to overwrite the existing FTS index. Defaults to false.
 * @param options.conjunctive - A boolean indicating whether to perform a conjunctive search (all terms must be present). Defaults to false.
 * @param options.outputTable - The name of the table that will contain the results. If not provided, the original table will be overwritten.
 * @param options.verbose - A boolean indicating whether to log additional information. Defaults to false.
 *
 * @example
 * ```ts
 * // Search for "apple" in the "description" column and return the top 10 results.
 * await table.bm25("apple", "id", "description", 10);
 * ```
 */
export default async function bm25(
  simpleTable: SimpleTable,
  text: string,
  columnId: string,
  columnText: string,
  nbResults: number,
  options: {
    stemmer?:
      | "arabic"
      | "basque"
      | "catalan"
      | "danish"
      | "dutch"
      | "english"
      | "finnish"
      | "french"
      | "german"
      | "greek"
      | "hindi"
      | "hungarian"
      | "indonesian"
      | "irish"
      | "italian"
      | "lithuanian"
      | "nepali"
      | "norwegian"
      | "porter"
      | "portuguese"
      | "romanian"
      | "russian"
      | "serbian"
      | "spanish"
      | "swedish"
      | "tamil"
      | "turkish"
      | "none";
    stopwords?: string;
    ignore?: string;
    stripAccents?: boolean;
    lower?: boolean;
    k?: number;
    b?: number;
    minScore?: number;
    scoreColumn?: string;
    overwriteIndex?: boolean;
    conjunctive?: boolean;
    outputTable?: string;
    verbose?: boolean;
  } = {},
) {
  // This uses the fts extension
  // https://duckdb.org/docs/stable/core_extensions/full_text_search

  await simpleTable.createFtsIndex(columnId, columnText, {
    stemmer: options.stemmer,
    stopwords: options.stopwords,
    ignore: options.ignore,
    stripAccents: options.stripAccents,
    lower: options.lower,
    overwrite: options.overwriteIndex,
    verbose: options.verbose,
  });

  const minScoreCondition = typeof options.minScore === "number"
    ? ` AND score >= ${options.minScore}`
    : "";

  const selectClause = typeof options.scoreColumn === "string"
    ? `* EXCLUDE(score), score AS "${options.scoreColumn}"`
    : `* EXCLUDE(score)`;

  await queryDB(
    simpleTable,
    `CREATE OR REPLACE TABLE "${
      options.outputTable ?? simpleTable.name
    }" AS SELECT ${selectClause} FROM (SELECT *, fts_main_${
      camelCase(simpleTable.name)
    }.match_bm25(${columnId}, '${text.replace(/'/g, "''")}'${
      typeof options.k === "number" ? `, k := ${options.k}` : ""
    }${typeof options.b === "number" ? `, b := ${options.b}` : ""}${
      options.conjunctive === true ? `, conjunctive := 1` : ""
    }) AS score FROM "${simpleTable.name}") sq WHERE score NOT NULL${minScoreCondition} ORDER BY score DESC LIMIT ${nbResults};`,
    mergeOptions(simpleTable, {
      table: simpleTable.name,
      method: "bm25",
      parameters: {
        text,
        columnId,
        columnText,
        nbResults,
        minScore: options.minScore,
        scoreColumn: options.scoreColumn,
        k: options.k,
        b: options.b,
        stemmer: options.stemmer,
        stopwords: options.stopwords,
        ignore: options.ignore,
        stripAccents: options.stripAccents,
        lower: options.lower,
        table: options.outputTable ?? simpleTable.name,
      },
    }),
  );

  if (typeof options.outputTable === "string") {
    return simpleTable.sdb.newTable(
      options.outputTable,
      structuredClone(simpleTable.projections),
    );
  } else {
    return simpleTable;
  }
}
