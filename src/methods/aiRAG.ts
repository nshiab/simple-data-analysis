import { askAI } from "@nshiab/journalism-ai";
import type SimpleTable from "../class/SimpleTable.ts";
import { prettyDuration } from "@nshiab/journalism-format";
import hybridSearch from "./hybridSearch.ts";

export default async function aiRAG(
  table: SimpleTable,
  query: string,
  columnId: string,
  columnText: string,
  nbResults: number,
  options: {
    cache?: boolean;
    verbose?: boolean;
    includeThoughts?: boolean;
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
    bm25?: boolean;
    vectorSearch?: boolean;
    efConstruction?: number;
    efSearch?: number;
    M?: number;
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

  // Perform hybrid search (vector similarity + BM25 with RRF fusion)
  const searchResultsTable = await hybridSearch(
    table,
    query,
    columnId,
    columnText,
    nbResults,
    {
      cache: options.cache,
      verbose: options.verbose,
      embeddingsModelContextWindow: options.embeddingsModelContextWindow,
      createIndex: options.createIndex,
      embeddingsModel: options.embeddingsModel,
      ollamaEmbeddings: options.ollamaEmbeddings,
      embeddingsConcurrent: options.embeddingsConcurrent,
      stemmer: options.stemmer,
      k: options.k,
      b: options.b,
      bm25: options.bm25,
      vectorSearch: options.vectorSearch,
      outputTable: `${table.name}_rag_search_results`,
      efConstruction: options.efConstruction,
      efSearch: options.efSearch,
      M: options.M,
      times: times,
    },
  );

  await searchResultsTable.selectColumns([columnId, columnText]);

  // Get the retrieved data
  const retrievedData = await searchResultsTable.getData() as {
    [key: string]: string;
  }[];

  // Clean up the temporary table
  await searchResultsTable.removeTable();

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
      includeThoughts: options.includeThoughts,
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
    const enableVectorSearch = options.vectorSearch !== false;
    const enableBm25 = options.bm25 !== false;
    const parallelLabel = enableVectorSearch && enableBm25 ? " (parallel)" : "";

    const logParts = [`\nRAG process times:`];

    if (enableVectorSearch) {
      logParts.push(
        `- Embedding: ${
          prettyDuration(times.embeddingStart, { end: times.embeddingEnd })
        }`,
      );
    }

    logParts.push(
      enableVectorSearch
        ? `- Vector Search${parallelLabel}: ${
          prettyDuration(times.vectorSearchStart, {
            end: times.vectorSearchEnd,
          })
        }`
        : `- Vector Search: disabled`,
    );

    logParts.push(
      enableBm25
        ? `- BM25 Search${parallelLabel}: ${
          prettyDuration(times.bm25Start, { end: times.bm25End })
        }`
        : `- BM25 Search: disabled`,
    );

    logParts.push(
      `- LLM: ${prettyDuration(times.llmStart, { end: times.llmEnd })}`,
    );

    logParts.push(`- Total: ${prettyDuration(times.start)}`);

    console.log(logParts.join("\n") + "\n");
  }

  return response;
}
