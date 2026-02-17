import { askAI } from "@nshiab/journalism-ai";
import type SimpleTable from "../class/SimpleTable.ts";
import { prettyDuration } from "@nshiab/journalism-format";

export async function aiRAG(
  table: SimpleTable,
  query: string,
  column: string,
  nbResults: number,
  options: {
    cache?: boolean;
    verbose?: boolean;
    systemPrompt?: string;
    contextWindow?: number;
    thinkingBudget?: number;
    thinkingLevel?: "minimal" | "low" | "medium" | "high";
    webSearch?: boolean;
    model?: string;
    embeddingsModel?: string;
    ollamaEmbeddings?: boolean;
  } = {},
) {
  const times = {
    embeddingStart: 0,
    embeddingEnd: 0,
    vectorSearchStart: 0,
    vectorSearchEnd: 0,
    llmStart: 0,
    llmEnd: 0,
  };

  if (options.verbose) {
    times.embeddingStart = Date.now();
  }

  const embeddingColumn = `${column}_embeddings`;

  options.cache
    ? await table.cache(async () => {
      await table.aiEmbeddings(column, embeddingColumn, {
        createIndex: true,
        cache: true,
        verbose: options.verbose,
        ollama: options.ollamaEmbeddings,
        model: options.embeddingsModel,
      });
    })
    : await table.aiEmbeddings(column, embeddingColumn, {
      createIndex: true,
      verbose: options.verbose,
      ollama: options.ollamaEmbeddings,
      model: options.embeddingsModel,
    });

  if (options.verbose) {
    times.embeddingEnd = Date.now();
    times.vectorSearchStart = Date.now();
  }

  const tempTable = await table.aiVectorSimilarity(
    query,
    embeddingColumn,
    nbResults,
    {
      cache: options.cache,
      outputTable: `${table.name}_rag_temp`,
      verbose: options.verbose,
    },
  );

  if (options.verbose) {
    times.vectorSearchEnd = Date.now();
    await tempTable.logTable();
  }

  const retrievedData = await tempTable.getValues(column);

  await tempTable.removeTable();

  if (options.verbose) {
    times.llmStart = Date.now();
  }

  const response = await askAI(
    `Answer the following question:
- ${query}.

Base your answer only on the following data:\n\n
${retrievedData.join("\n\n---\n\n")}`,
    {
      systemPrompt: options.systemPrompt ??
        `You are a helpful assistant that answers questions strictly using the provided data.
- Do not use phrases like "Based on the data" or "According to the data"; instead, start with "I found," "I noted," or similar.
- Only discuss entries relevant for the user.
- If the data is contradictory, explain the contradictions and provide all relevant perspectives.
- If the data partially answers the question, explain what can be concluded and what remains uncertain.
- If the data is entirely unrelated to the question, state only: "I do not have data to answer this question."`,
      cache: options.cache,
      verbose: options.verbose,
      contextWindow: options.contextWindow,
      thinkingBudget: options.thinkingBudget,
      thinkingLevel: options.thinkingLevel,
      webSearch: options.webSearch,
      model: options.model,
    },
  ) as Promise<string>;

  if (options.verbose) {
    times.llmEnd = Date.now();
    console.log(
      `\nRAG process times:\n- Embedding: ${
        prettyDuration(times.embeddingStart, { end: times.embeddingEnd })
      }\n- Vector Search: ${
        prettyDuration(times.vectorSearchStart, { end: times.vectorSearchEnd })
      }\n- LLM: ${prettyDuration(times.llmStart, { end: times.llmEnd })}\n`,
    );
  }

  return response;
}
