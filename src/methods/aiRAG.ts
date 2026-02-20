import { askAI } from "@nshiab/journalism-ai";
import type SimpleTable from "../class/SimpleTable.ts";
import { prettyDuration } from "@nshiab/journalism-format";
import getRRFRanking from "../helpers/getRRFRanking.ts";

export default async function aiRAG(
  table: SimpleTable,
  query: string,
  columnId: string,
  columnText: string,
  nbResults: number,
  options: {
    cache?: boolean;
    verbose?: boolean;
    systemPrompt?: string;
    modelContextWindow?: number;
    embeddingsModelContextWindow?: number;
    createIndex?: boolean;
    thinkingBudget?: number;
    thinkingLevel?: "minimal" | "low" | "medium" | "high";
    webSearch?: boolean;
    model?: string;
    temperature?: number;
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
  } = {},
) {
  const times = {
    start: Date.now(),
    embeddingStart: 0,
    embeddingEnd: 0,
    vectorSearchStart: 0,
    vectorSearchEnd: 0,
    bm25Start: 0,
    bm25End: 0,
    llmStart: 0,
    llmEnd: 0,
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

  // Because we want to run the vector search and the BM25 search in parallel
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

  const retrievedData = await table.sdb.customQuery(
    `SELECT "${columnId}", "${columnText}" FROM "${table.name}" WHERE "${columnId}" IN (${
      fusedIds
        .slice(0, nbResults)
        .map((id) => `'${id}'`)
        .join(", ")
    })`,
    {
      returnDataFrom: "query",
    },
  ) as { [key: string]: string }[];

  if (options.verbose) {
    times.llmStart = Date.now();
  }

  const response = await askAI(
    `Answer the following:
  - ${query}

  Base your answer only on the following data:\n
  ${
      retrievedData.map((entry) =>
        `${columnId}: ${entry[columnId]}\n\n${columnText}:\n\n${
          entry[columnText]
        }`
      ).join("\n\n-----\n\n")
    }`,
    {
      systemPrompt: options.systemPrompt ??
        `You are a focused research assistant. Your goal is to answer the user's question using ONLY the provided data.

Rules of Engagement:
- Directness: Start answers directly (e.g., "The documentation indicates..." or "I found..."). Avoid meta-talk about the process.
- Strict Relevance: Only include information that directly addresses the user's query. If an entry is irrelevant, ignore it entirely.
- Ambiguity & Contradiction: If sources conflict, present both views clearly. If the data is incomplete, state what is known and explicitly identify what is missing.
- Groundedness: If the provided data does not contain the answer, your only response must be: "I do not have data to answer this question." Do not use outside knowledge.`,
      cache: options.cache,
      verbose: options.verbose,
      contextWindow: options.modelContextWindow,
      thinkingBudget: options.thinkingBudget,
      thinkingLevel: options.thinkingLevel,
      webSearch: options.webSearch,
      model: options.model,
      temperature: options.temperature,
    },
  ) as Promise<string>;

  if (options.verbose) {
    times.llmEnd = Date.now();
    console.log(
      `\nRAG process times:\n- Embedding: ${
        prettyDuration(times.embeddingStart, { end: times.embeddingEnd })
      }\n- Vector Search (parallel): ${
        prettyDuration(times.vectorSearchStart, { end: times.vectorSearchEnd })
      }\n- BM25 Search (parallel): ${
        prettyDuration(times.bm25Start, { end: times.bm25End })
      }\n- LLM: ${
        prettyDuration(times.llmStart, { end: times.llmEnd })
      }\n- Total: ${prettyDuration(times.start)}\n`,
    );
  }

  return response;
}
