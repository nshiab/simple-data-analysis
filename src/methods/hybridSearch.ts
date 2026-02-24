import type SimpleTable from "../class/SimpleTable.ts";
import { prettyDuration } from "@nshiab/journalism-format";
import getRRFRanking from "../helpers/getRRFRanking.ts";

export default async function hybridSearch(
  table: SimpleTable,
  query: string,
  columnId: string,
  columnText: string,
  nbResults: number,
  options: {
    cache?: boolean;
    verbose?: boolean;
    embeddingsModelContextWindow?: number;
    createIndex?: boolean;
    embeddingsModel?: string;
    ollamaEmbeddings?: boolean;
    embeddingsConcurrent?: number;
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
    k?: number;
    b?: number;
    bm25?: boolean;
    vectorSearch?: boolean;
    outputTable?: string;
    times?: {
      start?: number;
      embeddingStart?: number;
      embeddingEnd?: number;
      vectorSearchStart?: number;
      vectorSearchEnd?: number;
      bm25Start?: number;
      bm25End?: number;
    };
  } = {},
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

      options.cache
        ? await table.cache(async () => {
          await table.aiEmbeddings(columnText, embeddingColumn, {
            createIndex: options.createIndex ?? false,
            cache: true,
            verbose: options.verbose,
            ollama: options.ollamaEmbeddings,
            model: options.embeddingsModel,
            contextWindow: options.embeddingsModelContextWindow,
            concurrent: options.embeddingsConcurrent,
          });
        })
        : await table.aiEmbeddings(columnText, embeddingColumn, {
          createIndex: options.createIndex ?? false,
          verbose: options.verbose,
          ollama: options.ollamaEmbeddings,
          model: options.embeddingsModel,
          contextWindow: options.embeddingsModelContextWindow,
          concurrent: options.embeddingsConcurrent,
        });

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
        cache: options.cache,
        outputTable: `${table.name}_vector_search_results`,
        ollama: options.ollamaEmbeddings,
        model: options.embeddingsModel,
        contextWindow: options.embeddingsModelContextWindow,
        verbose: options.verbose,
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
    const bm25SearchResult = await table.bm25(
      query,
      columnId,
      columnText,
      nbResults,
      {
        stemmer: options.stemmer,
        k: options.k,
        b: options.b,
        outputTable: `${table.name}_bm25_search_results`,
        verbose: options.verbose,
      },
    );
    if (options.verbose) {
      times.bm25End = Date.now();
    }
    return bm25SearchResult;
  }

  let finalIds: string[];

  if (enableVectorSearch && enableBm25) {
    // Both methods enabled: run in parallel and fuse results
    const [vectorSearchResult, bm25SearchResult] = await Promise.all([
      vectorSearch(),
      bm25Search(),
    ]);

    const vectorSearchResultsIds = await vectorSearchResult.getValues(
      columnId,
    ) as string[];
    const bm25SearchResultsIds = await bm25SearchResult.getValues(
      columnId,
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
    finalIds = await vectorSearchResult.getValues(columnId) as string[];
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
    await bm25SearchResult.removeTable();

    if (options.verbose) {
      console.log(
        `BM25 search results IDs:`,
        finalIds,
      );
    }
  }

  await table.sdb.customQuery(
    `CREATE OR REPLACE TABLE "${
      options.outputTable ?? table.name
    }" AS SELECT * FROM "${table.name}" WHERE "${columnId}" IN (${
      finalIds
        .slice(0, nbResults)
        .map((id) => `'${id.replace(/'/g, "''")}'`)
        .join(", ")
    })`,
  );

  if (options.verbose) {
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

    logParts.push(`- Total: ${prettyDuration(times.start!)}`);
    console.log(logParts.join("\n") + "\n");
  }

  if (typeof options.outputTable === "string") {
    return table.sdb.newTable(
      options.outputTable,
      structuredClone(table.projections),
    );
  } else {
    return table;
  }
}
