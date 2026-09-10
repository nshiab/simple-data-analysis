import type SimpleTable from "../class/SimpleTable.ts";
import getRRFRanking from "../helpers/getRRFRanking.ts";
import {
  parseValue,
  queueAsyncBarrier,
  quoteIdentifier,
} from "@nshiab/simple-data-analysis-core/helpers";
import {
  type EmbeddingOptions,
  snapshotAIOptions,
} from "../helpers/aiOptions.ts";
import ensureEmbeddingColumn from "../helpers/ensureEmbeddingColumn.ts";
import { generateEmbeddingColumn } from "./aiEmbeddings.ts";
import { runAIVectorSimilarity } from "./aiVectorSimilarity.ts";

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
 *   embeddings: { provider: "ollama" },
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
  /** Creates an HNSW index when vector search is enabled. BM25 manages its FTS index automatically. */
  createIndex?: boolean;
  /** Maximum number of stored-row embedding requests processed concurrently. */
  embeddingsConcurrency?: number;
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

export default function hybridSearch(
  table: SimpleTable,
  query: string,
  idColumn: string,
  textColumn: string,
  nbResults: number,
  options: HybridSearchOptions = {},
): SimpleTable {
  options = snapshotAIOptions(options);
  const outputTable = options.outputTable === undefined
    ? table
    : table.sdb.newTable(options.outputTable);
  queueAsyncBarrier(outputTable, {
    method: "hybridSearch()",
    parameters: {
      query,
      idColumn,
      textColumn,
      nbResults,
      outputTable: options.outputTable,
    },
    execute: () =>
      runHybridSearch(
        table,
        query,
        idColumn,
        textColumn,
        nbResults,
        options,
        outputTable,
      ),
  });
  return outputTable;
}

async function runHybridSearch(
  table: SimpleTable,
  query: string,
  idColumn: string,
  textColumn: string,
  nbResults: number,
  options: HybridSearchOptions,
  outputTableInstance: SimpleTable,
): Promise<void> {
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

  const embeddingColumn = `${textColumn}_embeddings`;

  // Only generate embeddings if vector search is enabled
  if (enableVectorSearch) {
    const { getEmbeddingIdentity } = await import("@nshiab/journalism-ai");
    if (options.verbose) {
      times.embeddingStart = Date.now();
    }

    const previousCacheVerbose = table.sdb.cacheVerbose;
    try {
      if (options.verbose) {
        table.sdb.cacheVerbose = true;
      }

      const embeddingOptions = {
        verbose: options.verbose,
        embeddings: options.embeddings,
        concurrency: options.embeddingsConcurrency,
      };
      const computeEmbeddings = async () => {
        await generateEmbeddingColumn(
          table,
          textColumn,
          embeddingColumn,
          embeddingOptions,
        );
      };
      const identity = getEmbeddingIdentity(options.embeddings);
      const embeddingStatus = await ensureEmbeddingColumn(
        table,
        textColumn,
        embeddingColumn,
        identity,
        async () => {
          if (options.embeddings?.cache === false) {
            await computeEmbeddings();
            return;
          }

          const computeSource = Function.prototype.toString.call(
            computeEmbeddings,
          );
          const cacheProvenance = {
            identity,
            sourceColumn: textColumn,
            embeddingColumn,
          };
          Object.defineProperty(computeEmbeddings, "toString", {
            value: (): string =>
              `${computeSource}\n${JSON.stringify(cacheProvenance)}`,
          });
          await table.cache(computeEmbeddings);
        },
      );

      if (options.verbose) {
        console.log(
          embeddingStatus === "reused"
            ? `"${embeddingColumn}" in table "${table.name}" has compatible provenance. Reusing embeddings...`
            : `Generated compatible embeddings in "${embeddingColumn}" for table "${table.name}".`,
        );
      }

      if (options.createIndex) {
        table.createVssIndex(embeddingColumn, {
          overwrite: false,
          verbose: options.verbose,
          efConstruction: options.efConstruction,
          efSearch: options.efSearch,
          M: options.M,
        });
        await table.run();
      }
    } finally {
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
    const vectorSearchResult = table.sdb.newTable(
      `${table.name}_vector_search_results`,
    );
    await runAIVectorSimilarity(
      table,
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
      idColumn,
      textColumn,
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
  let vectorSearchRows: {
    [key: string]: unknown;
  }[] = [];
  let bm25SearchRows: {
    [key: string]: unknown;
  }[] = [];

  if (enableVectorSearch && enableBm25) {
    // Both methods enabled: run in parallel and fuse results
    const [vectorSearchResult, bm25SearchResult] = await Promise.all([
      vectorSearch(),
      bm25Search(),
    ]);

    vectorSearchRows = await vectorSearchResult.getData({
      columns: [
        idColumn,
        ...(options.vectorSimilarityColumn
          ? [options.vectorSimilarityColumn]
          : []),
      ],
    });
    const vectorSearchResultsIds = vectorSearchRows.map((row) =>
      row[idColumn]
    ) as string[];
    bm25SearchRows = await bm25SearchResult.getData({
      columns: [
        idColumn,
        ...(options.bm25ScoreColumn ? [options.bm25ScoreColumn] : []),
      ],
    });
    const bm25SearchResultsIds = bm25SearchRows.map((row) =>
      row[idColumn]
    ) as string[];

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
    vectorSearchRows = await vectorSearchResult.getData({
      columns: [
        idColumn,
        ...(options.vectorSimilarityColumn
          ? [options.vectorSimilarityColumn]
          : []),
      ],
    });
    finalIds = vectorSearchRows.map((row) => row[idColumn]) as string[];
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
    bm25SearchRows = await bm25SearchResult.getData({
      columns: [
        idColumn,
        ...(options.bm25ScoreColumn ? [options.bm25ScoreColumn] : []),
      ],
    });
    finalIds = bm25SearchRows.map((row) => row[idColumn]) as string[];
    await bm25SearchResult.removeTable();

    if (options.verbose) {
      console.log(
        `BM25 search results IDs:`,
        finalIds,
      );
    }
  }

  const finalIdsSliced = finalIds.slice(0, nbResults);
  const scoreColumns = [
    { name: options.vectorSimilarityColumn, rows: vectorSearchRows },
    { name: options.bm25ScoreColumn, rows: bm25SearchRows },
  ].filter((
    column,
  ): column is { name: string; rows: Record<string, unknown>[] } =>
    column.name !== undefined
  );
  if (scoreColumns.length > 0) {
    const columns = new Set(
      (await table.getColumns()).map((name) => name.toLowerCase()),
    );
    for (const { name } of scoreColumns) {
      if (columns.has(name.toLowerCase())) {
        throw new Error(`hybridSearch(): Column "${name}" already exists.`);
      }
      columns.add(name.toLowerCase());
    }
  }
  const scores = scoreColumns.map(({ name, rows }) =>
    new Map(rows.map((row) => [row[idColumn], row[name]]))
  );
  const scoreProjection = scoreColumns.map(({ name }, index) =>
    `, round(ranked.score_${index}::DOUBLE, 4) AS ${quoteIdentifier(name)}`
  ).join("");
  const destination = quoteIdentifier(options.outputTable ?? table.name);
  const source = quoteIdentifier(table.name);

  if (finalIdsSliced.length === 0) {
    const emptyScores = scoreColumns.map(({ name }) =>
      `, NULL::DOUBLE AS ${quoteIdentifier(name)}`
    ).join("");
    await table.sdb.customQuery(
      `CREATE OR REPLACE TABLE ${destination} AS SELECT *${emptyScores} FROM ${source} WHERE 1=0`,
    );
  } else {
    // Keep the ranking alongside each ID through the join. Membership alone
    // loses relevance order, and raw search scores cannot recover fused ranks.
    const rankedRows = finalIdsSliced.map((id, ordinal) =>
      `(${
        [
          parseValue(id),
          ordinal,
          ...scores.map((score) => parseValue(score.get(id) ?? null)),
        ].join(", ")
      })`
    ).join(", ");
    const rankedColumns = [
      "id",
      "ordinal",
      ...scoreColumns.map((_, index) => `score_${index}`),
    ].join(", ");
    await table.sdb.customQuery(
      `CREATE OR REPLACE TABLE ${destination} AS
       SELECT source.*${scoreProjection}
       FROM ${source} AS source
       JOIN (VALUES ${rankedRows}) AS ranked(${rankedColumns})
         ON source.${quoteIdentifier(idColumn)} = ranked.id
       ORDER BY ranked.ordinal`,
    );
  }
  if (options.verbose) {
    await outputTableInstance.log("all");
    const { prettyDuration } = await import("@nshiab/journalism-format");

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
}
