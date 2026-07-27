import type { SimpleTable } from "../index.ts";
import {
  mergeOptions,
  queryDB,
} from "@nshiab/simple-data-analysis-core/helpers";
import type { EmbeddingOptions } from "../helpers/aiOptions.ts";
import { getEmbeddingForProvider } from "../helpers/tryEmbedding.ts";

/**
 * Options for embedding a query and finding similar table rows.
 *
 * @example
 * ```ts
 * const options: AIVectorSimilarityOptions = {
 *   embeddings: { provider: "gemini", cache: true },
 *   minSimilarity: 0.7,
 * };
 * ```
 */
export type AIVectorSimilarityOptions = {
  /** Options used to embed the query text. */
  embeddings?: EmbeddingOptions;
  /** Creates a vector-similarity index on the stored embedding column. */
  createIndex?: boolean;
  /** Replaces an existing vector-similarity index when creating one. */
  overwriteIndex?: boolean;
  /** Writes results to a new table instead of replacing the current table. */
  outputTable?: string;
  /** Logs embedding and index activity when enabled. */
  verbose?: boolean;
  /** Candidate count used while constructing the vector index. */
  efConstruction?: number;
  /** Candidate count used while searching the vector index. */
  efSearch?: number;
  /** Maximum number of graph neighbors retained by the vector index. */
  M?: number;
  /** Minimum cosine similarity required for a row to be returned. */
  minSimilarity?: number;
  /** Adds cosine similarity scores under this output column name. */
  similarityColumn?: string;
};

export default async function aiVectorSimilarity(
  simpleTable: SimpleTable,
  text: string,
  column: string,
  nbResults: number,
  options: AIVectorSimilarityOptions = {},
) {
  const textEmbedding = await getEmbeddingForProvider(text, options.embeddings);

  const types = await simpleTable.getTypes();
  if (types[column] !== `FLOAT[${textEmbedding.length}]`) {
    await simpleTable.sdb.customQuery(
      `ALTER TABLE "${simpleTable.name}" ADD COLUMN "${column}_fixed_floatType" FLOAT[${textEmbedding.length}];
      UPDATE "${simpleTable.name}" SET "${column}_fixed_floatType" = "${column}"::FLOAT[${textEmbedding.length}];
      ALTER TABLE "${simpleTable.name}" DROP COLUMN "${column}";
      ALTER TABLE "${simpleTable.name}" RENAME COLUMN "${column}_fixed_floatType" TO "${column}";`,
    );
  }

  if (options.createIndex) {
    simpleTable.createVssIndex(column, {
      overwrite: options.overwriteIndex,
      verbose: options.verbose,
      efConstruction: options.efConstruction,
      efSearch: options.efSearch,
      M: options.M,
    });
  }

  const targetVector = `${
    JSON.stringify(textEmbedding)
  }::FLOAT[${textEmbedding.length}]`;
  const columnVector = `"${column}"::FLOAT[${textEmbedding.length}]`;
  const distanceFunction =
    `array_cosine_distance(${columnVector}, ${targetVector})`;

  const thresholdClause = options.minSimilarity !== undefined
    ? `WHERE ${distanceFunction} <= ${1 - options.minSimilarity}`
    : "";

  // Conditionally build the SELECT statement to include the similarity math
  const selectClause = options.similarityColumn
    ? `*, (1 - ${distanceFunction}) AS "${options.similarityColumn}"`
    : `*`;

  await queryDB(
    simpleTable,
    `INSTALL vss; LOAD vss;
    CREATE OR REPLACE TABLE "${options.outputTable ?? simpleTable.name}" AS 
    SELECT ${selectClause} FROM "${simpleTable.name}" 
    ${thresholdClause}
    ORDER BY ${distanceFunction} ASC
    LIMIT ${nbResults};`,
    mergeOptions(simpleTable, {
      table: simpleTable.name,
      method: "aiVectorSimilarity()",
      parameters: {
        text,
        column,
        nbResults,
        minSimilarity: options.minSimilarity,
        similarityColumn: options.similarityColumn, // Include in merged options log
        table: options.outputTable ?? simpleTable.name,
      },
    }),
  );

  if (typeof options.outputTable === "string") {
    return simpleTable.sdb.newTable(
      options.outputTable,
    );
  } else {
    return simpleTable;
  }
}
