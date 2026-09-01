import type SimpleTable from "../class/SimpleTable.ts";
import hybridSearch, { type HybridSearchOptions } from "./hybridSearch.ts";
import type {
  AIRequestMetrics,
  UnstructuredGenerationOptions,
} from "../helpers/aiOptions.ts";

/**
 * Options for retrieval and the final generation request in `aiRAG`.
 *
 * @example
 * ```ts
 * const options: AIRAGOptions = {
 *   generation: { provider: "gemini" },
 *   embeddings: { provider: "ollama" },
 * };
 * ```
 */
export type AIRAGOptions =
  & Omit<
    HybridSearchOptions,
    "outputTable" | "times"
  >
  & {
    /** Generation options excluding `schemaJson`, because `aiRAG` returns text. */
    generation?: UnstructuredGenerationOptions;
    /** Includes model thoughts in verbose logs when the provider returns them. */
    includeThoughts?: boolean;
    /** Mutable aggregate request metrics updated after the final provider response. */
    metrics?: AIRequestMetrics;
  };

export default async function aiRAG(
  table: SimpleTable,
  query: string,
  idColumn: string,
  textColumn: string,
  nbResults: number,
  options: AIRAGOptions = {},
) {
  const { generation, includeThoughts, metrics, ...searchOptions } = options;
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
    idColumn,
    textColumn,
    nbResults,
    {
      ...searchOptions,
      outputTable: `${table.name}_rag_search_results`,
      times,
    },
  );

  searchResultsTable.selectColumns([idColumn, textColumn]);

  // Get the retrieved data
  const retrievedData = await searchResultsTable.getData() as {
    [key: string]: string;
  }[];

  // Clean up the temporary table
  await searchResultsTable.removeTable();

  if (searchOptions.verbose) {
    times.llmStart = Date.now();
  }

  const { default: askAI } = await import("../helpers/askAI.ts");
  const response = await askAI(
    `Answer the following:
- ${query}

Base your answer only on the following data:\n
${
      retrievedData.map((entry) =>
        `${idColumn}: ${entry[idColumn]}\n\n${textColumn}:\n\n${
          entry[textColumn]
        }`
      ).join("\n\n-----\n\n")
    }`,
    {
      generation,
      systemPrompt: generation?.systemPrompt ??
        `You are a focused research assistant. Your goal is to answer the user's question using ONLY the provided data.

Rules of Engagement:
- Directness: Start answers directly (e.g., "The documentation indicates..." or "I found..."). Avoid meta-talk about the process.
- Strict Relevance: Only include information that directly addresses the user's query. If an entry is irrelevant, ignore it entirely.
- Ambiguity & Contradiction: If sources conflict, present both views clearly. If the data is incomplete, state what is known and explicitly identify what is missing.
- Groundedness: If the provided data does not contain the answer, your only response must be: "I do not have data to answer this question." Do not use outside knowledge.`,
      verbose: searchOptions.verbose,
      includeThoughts,
      metrics,
    },
  ) as string;

  if (searchOptions.verbose) {
    times.llmEnd = Date.now();
    const { prettyDuration } = await import("@nshiab/journalism-format");
    const enableVectorSearch = searchOptions.vectorSearch !== false;
    const enableBm25 = searchOptions.bm25 !== false;
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

    logParts.push(
      `- Total: ${prettyDuration(times.start)} (verbose adds overhead)`,
    );

    console.log(logParts.join("\n") + "\n");
  }

  return response;
}
