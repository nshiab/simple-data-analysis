import type SimpleTable from "../class/SimpleTable.ts";
import { prettyDuration } from "@nshiab/journalism-format";
import getRRFRanking from "../helpers/getRRFRanking.ts";
import { parseValue } from "@nshiab/simple-data-analysis-core/helpers";
import type { EmbeddingOptions } from "../helpers/aiOptions.ts";
import { getEmbeddingCacheIdentity } from "../helpers/tryEmbedding.ts";

/**
 * Timing checkpoints populated by `hybridSearch` when verbose logging is enabled.
 *
 * @example
 * ```ts
 * const times: HybridSearchTimes = { start: Date.now() };
 * ```
 */
export type HybridSearchTimes = {
  /** Start of the complete hybrid-search operation. */
  start?: number;
  /** Start of embedding generation or cache loading. */
  embeddingStart?: number;
  /** End of embedding generation or cache loading. */
  embeddingEnd?: number;
  /** Start of vector-similarity search. */
  vectorSearchStart?: number;
  /** End of vector-similarity search. */
  vectorSearchEnd?: number;
  /** Start of BM25 text search. */
  bm25Start?: number;
  /** End of BM25 text search. */
  bm25End?: number;
};

/**
 * Options for combining vector similarity and BM25 text search.
 *
 * @example
 * ```ts
 * const options: HybridSearchOptions = {
 *   embeddings: { provider: "ollama", cache: true },
 *   vectorSearch: true,
 *   bm25: true,
 * };
 * ```
 */
export type HybridSearchOptions = {
  /** Options used for both stored row embeddings and the query embedding. */
  embeddings?: EmbeddingOptions;
  /** Logs search progress, results, and timing information when enabled. */
  verbose?: boolean;
  /** Creates vector and BM25 indexes when enabled. */
  createIndex?: boolean;
  /** Maximum number of stored-row embedding requests processed concurrently. */
  embeddingsConcurrent?: number;
  /** Language stemmer used by the BM25 full-text index. */
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
  /** Stopword table used by the BM25 full-text index. */
  stopwords?: string;
  /** Regular expression describing characters ignored by the BM25 index. */
  ignore?: string;
  /** Removes accents before BM25 indexing when enabled. */
  stripAccents?: boolean;
  /** Lowercases text before BM25 indexing when enabled. */
  lower?: boolean;
  /** BM25 term-frequency saturation parameter. */
  k?: number;
  /** BM25 document-length normalization parameter. */
  b?: number;
  /** Requires every query term to match during BM25 search when enabled. */
  conjunctive?: boolean;
  /** Enables BM25 text search. */
  bm25?: boolean;
  /** Minimum BM25 score required for a row to be returned. */
  bm25MinScore?: number;
  /** Adds BM25 scores under this output column name. */
  bm25ScoreColumn?: string;
  /** Enables vector-similarity search. */
  vectorSearch?: boolean;
  /** Minimum cosine similarity required for a vector result. */
  vectorMinSimilarity?: number;
  /** Adds vector similarity scores under this output column name. */
  vectorSimilarityColumn?: string;
  /** Writes results to a new table instead of replacing the current table. */
  outputTable?: string;
  /** Candidate count used while constructing the vector index. */
  efConstruction?: number;
  /** Candidate count used while searching the vector index. */
  efSearch?: number;
  /** Maximum number of graph neighbors retained by the vector index. */
  M?: number;
  /** Mutable timing checkpoints shared with `aiRAG`. */
  times?: HybridSearchTimes;
};

export default async function hybridSearch(
  table: SimpleTable,
  query: string,
  columnId: string,
  columnText: string,
  nbResults: number,
  options: HybridSearchOptions = {},
): Promise<SimpleTable> {
  const enableVectorSearch = options.vectorSearch !== false;
  const enableBm25 = options.bm25 !== false;

  if (!enableVectorSearch && !enableBm25) {
    throw new Error(
      "At least one search method must be enabled. Set vectorSearch=true or bm25=true.",
    );
  }

  const times = options.times ?? {
    start: Date.now(),
    embeddingStart: 0,
    embeddingEnd: 0,
    vectorSearchStart: 0,
    vectorSearchEnd: 0,
    bm25Start: 0,
    bm25End: 0,
  };

  const embeddingColumn = `${columnText}_embeddings`;

  // Only generate embeddings if vector search is enabled
  if (enableVectorSearch) {
    if (options.verbose) {
      times.embeddingStart = Date.now();
    }

    if (await table.hasColumn(embeddingColumn)) {
      if (options.verbose) {
        console.log(
          `"${embeddingColumn}" in table "${table.name}" already exist. Reusing embeddings...`,
        );
      }
    } else {
      const previousCacheVerbose = table.sdb.cacheVerbose;
      if (options.verbose) {
        console.log(
          `"${embeddingColumn}" in table "${table.name}" does not exist. Generating embeddings...`,
        );
        table.sdb.cacheVerbose = true;
      }

      if (options.embeddings?.cache) {
        const computeEmbeddings = async () => {
          await table.aiEmbeddings(columnText, embeddingColumn, {
            createIndex: options.createIndex ?? false,
            verbose: options.verbose,
            embeddings: options.embeddings,
            concurrent: options.embeddingsConcurrent,
            efConstruction: options.efConstruction,
            efSearch: options.efSearch,
            M: options.M,
          });
        };
        const computeSource: string = Function.prototype.toString.call(
          computeEmbeddings,
        );
        const cacheIdentity = getEmbeddingCacheIdentity(options.embeddings);
        Object.defineProperty(computeEmbeddings, "toString", {
          value: (): string => `${computeSource}\n${cacheIdentity}`,
        });
        await table.cache(computeEmbeddings);
      } else {
        await table.aiEmbeddings(columnText, embeddingColumn, {
          createIndex: options.createIndex ?? false,
          verbose: options.verbose,
          embeddings: options.embeddings,
          concurrent: options.embeddingsConcurrent,
          efConstruction: options.efConstruction,
          efSearch: options.efSearch,
          M: options.M,
        });
      }

      table.sdb.cacheVerbose = previousCacheVerbose;
    }

    if (options.verbose) {
      times.embeddingEnd = Date.now();
    }
  }

  // Run searches based on enabled methods
  async function vectorSearch() {
    if (options.verbose) {
      times.vectorSearchStart = Date.now();
    }
    const vectorSearchResult = await table.aiVectorSimilarity(
      query,
      embeddingColumn,
      nbResults,
      {
        createIndex: options.createIndex ?? false,
        outputTable: `${table.name}_vector_search_results`,
        embeddings: options.embeddings,
        verbose: options.verbose,
        efConstruction: options.efConstruction,
        efSearch: options.efSearch,
        M: options.M,
        minSimilarity: options.vectorMinSimilarity,
        similarityColumn: options.vectorSimilarityColumn,
      },
    );
    if (options.verbose) {
      times.vectorSearchEnd = Date.now();
    }
    return vectorSearchResult;
  }

  async function bm25Search() {
    if (options.verbose) {
      times.bm25Start = Date.now();
    }
    const bm25SearchResult = table.bm25(
      query,
      columnId,
      columnText,
      nbResults,
      {
        stemmer: options.stemmer,
        stopwords: options.stopwords,
        ignore: options.ignore,
        stripAccents: options.stripAccents,
        lower: options.lower,
        k: options.k,
        b: options.b,
        conjunctive: options.conjunctive,
        outputTable: `${table.name}_bm25_search_results`,
        verbose: options.verbose,
        minScore: options.bm25MinScore,
        scoreColumn: options.bm25ScoreColumn,
      },
    );
    await bm25SearchResult.run();
    if (options.verbose) {
      times.bm25End = Date.now();
    }
    return bm25SearchResult;
  }

  let finalIds: string[];
  let vectorSearchSimilarity: {
    [key: string]: unknown;
  }[] = [];
  let bm25SearchScores: {
    [key: string]: unknown;
  }[] = [];

  if (enableVectorSearch && enableBm25) {
    // Both methods enabled: run in parallel and fuse results
    const [vectorSearchResult, bm25SearchResult] = await Promise.all([
      vectorSearch(),
      bm25Search(),
    ]);

    const vectorSearchResultsIds = await vectorSearchResult.getValues(
      columnId,
    ) as string[];
    if (options.vectorSimilarityColumn) {
      vectorSearchSimilarity = await vectorSearchResult.getData({
        columns: [columnId, options.vectorSimilarityColumn],
      });
    }
    const bm25SearchResultsIds = await bm25SearchResult.getValues(
      columnId,
    ) as string[];
    if (options.bm25ScoreColumn) {
      bm25SearchScores = await bm25SearchResult.getData({
        columns: [columnId, options.bm25ScoreColumn],
      });
    }

    await vectorSearchResult.removeTable();
    await bm25SearchResult.removeTable();

    if (options.verbose) {
      console.log(
        `Vector search results IDs:`,
        vectorSearchResultsIds,
      );
      console.log(
        `BM25 search results IDs:`,
        bm25SearchResultsIds,
      );
    }

    finalIds = getRRFRanking(
      [vectorSearchResultsIds, bm25SearchResultsIds],
    );

    if (options.verbose) {
      console.log(
        `Fused results IDs:`,
        finalIds,
      );
    }
  } else if (enableVectorSearch) {
    // Only vector search enabled
    const vectorSearchResult = await vectorSearch();
    finalIds = await vectorSearchResult.getValues(columnId) as string[];
    if (options.vectorSimilarityColumn) {
      vectorSearchSimilarity = await vectorSearchResult.getData({
        columns: [columnId, options.vectorSimilarityColumn],
      });
    }
    await vectorSearchResult.removeTable();

    if (options.verbose) {
      console.log(
        `Vector search results IDs:`,
        finalIds,
      );
    }
  } else {
    // Only BM25 enabled
    const bm25SearchResult = await bm25Search();
    finalIds = await bm25SearchResult.getValues(columnId) as string[];
    if (options.bm25ScoreColumn) {
      bm25SearchScores = await bm25SearchResult.getData({
        columns: [columnId, options.bm25ScoreColumn],
      });
    }
    await bm25SearchResult.removeTable();

    if (options.verbose) {
      console.log(
        `BM25 search results IDs:`,
        finalIds,
      );
    }
  }

  const finalIdsSliced = finalIds.slice(0, nbResults);
  if (finalIdsSliced.length === 0) {
    // If there are no results, create an empty table with the same structure
    await table.sdb.customQuery(
      `CREATE OR REPLACE TABLE "${
        options.outputTable ?? table.name
      }" AS SELECT * FROM "${table.name}" WHERE 1=0`,
    );
  } else {
    await table.sdb.customQuery(
      `CREATE OR REPLACE TABLE "${
        options.outputTable ?? table.name
      }" AS SELECT * FROM "${table.name}" WHERE "${columnId}" IN (${
        finalIdsSliced
          .map((id) => parseValue(id))
          .join(", ")
      })`,
    );
  }

  let outputTableInstance;
  if (typeof options.outputTable === "string") {
    outputTableInstance = table.sdb.newTable(
      options.outputTable,
    );
  } else {
    outputTableInstance = table;
  }

  if (options.vectorSimilarityColumn) {
    if (vectorSearchSimilarity.length === 0) {
      // If there are no similarity scores (e.g. all results were filtered out by minSimilarity), add the column with NULL values
      outputTableInstance.addColumn(
        options.vectorSimilarityColumn,
        "number",
        `NULL`,
      );
    } else {
      outputTableInstance.addColumn(
        options.vectorSimilarityColumn,
        "number",
        `CASE ${
          vectorSearchSimilarity.map((d) =>
            `WHEN "${columnId}" = ${parseValue(d[columnId])} THEN ${
              d[options.vectorSimilarityColumn!]
            }`
          ).join(" ")
        } ELSE NULL END`,
      );
      outputTableInstance.round(options.vectorSimilarityColumn, {
        decimals: 4,
      });
    }
  }
  if (options.bm25ScoreColumn) {
    if (bm25SearchScores.length === 0) {
      // If there are no BM25 scores (e.g. all results were filtered out by minScore), add the column with NULL values
      outputTableInstance.addColumn(
        options.bm25ScoreColumn,
        "number",
        `NULL`,
      );
    } else {
      outputTableInstance.addColumn(
        options.bm25ScoreColumn,
        "number",
        `CASE ${
          bm25SearchScores.map((d) =>
            `WHEN "${columnId}" = ${parseValue(d[columnId])} THEN ${
              d[options.bm25ScoreColumn!]
            }`
          ).join(" ")
        } ELSE NULL END`,
      );
      outputTableInstance.round(options.bm25ScoreColumn, {
        decimals: 4,
      });
    }
  }
  await outputTableInstance.run();
  if (options.verbose) {
    await outputTableInstance.logTable("all");

    const logParts = [`\nHybrid search times:`];

    if (enableVectorSearch) {
      logParts.push(
        `- Embedding: ${
          prettyDuration(times.embeddingStart!, { end: times.embeddingEnd! })
        }`,
      );
    }

    const parallelLabel = enableVectorSearch && enableBm25 ? " (parallel)" : "";

    logParts.push(
      enableVectorSearch
        ? `- Vector Search${parallelLabel}: ${
          prettyDuration(times.vectorSearchStart!, {
            end: times.vectorSearchEnd!,
          })
        }`
        : `- Vector Search: disabled`,
    );

    logParts.push(
      enableBm25
        ? `- BM25 Search${parallelLabel}: ${
          prettyDuration(times.bm25Start!, { end: times.bm25End! })
        }`
        : `- BM25 Search: disabled`,
    );

    logParts.push(
      `- Total: ${prettyDuration(times.start!)} (verbose adds some overhead)`,
    );
    console.log(logParts.join("\n") + "\n");
  }

  return outputTableInstance;
}
