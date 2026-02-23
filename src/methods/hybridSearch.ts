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
  const times = options.times ?? {
    start: Date.now(),
    embeddingStart: 0,
    embeddingEnd: 0,
    vectorSearchStart: 0,
    vectorSearchEnd: 0,
    bm25Start: 0,
    bm25End: 0,
  };

  if (options.verbose) {
    times.embeddingStart = Date.now();
  }

  const embeddingColumn = `${columnText}_embeddings`;

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
    times.vectorSearchStart = Date.now();
    times.bm25Start = Date.now();
  }

  // Run vector search and BM25 search in parallel
  async function vectorSearch() {
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
    times.vectorSearchEnd = Date.now();
    return vectorSearchResult;
  }

  async function bm25Search() {
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
    times.bm25End = Date.now();
    return bm25SearchResult;
  }

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

  const fusedIds = getRRFRanking(
    [vectorSearchResultsIds, bm25SearchResultsIds],
  );

  if (options.verbose) {
    console.log(
      `Fused results IDs:`,
      fusedIds,
    );
  }

  await table.sdb.customQuery(
    `CREATE OR REPLACE TABLE "${
      options.outputTable ?? table.name
    }" AS SELECT * FROM "${table.name}" WHERE "${columnId}" IN (${
      fusedIds
        .slice(0, nbResults)
        .map((id) => `'${id}'`)
        .join(", ")
    })`,
  );

  if (options.verbose) {
    times.bm25End = Date.now();
    console.log(
      `\nHybrid search times:\n- Embedding: ${
        prettyDuration(times.embeddingStart!, { end: times.embeddingEnd! })
      }\n- Vector Search (parallel): ${
        prettyDuration(times.vectorSearchStart!, {
          end: times.vectorSearchEnd!,
        })
      }\n- BM25 Search (parallel): ${
        prettyDuration(times.bm25Start!, { end: times.bm25End! })
      }\n- Total: ${prettyDuration(times.start!)}\n`,
    );
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
