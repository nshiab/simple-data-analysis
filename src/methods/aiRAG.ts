import { askAI } from "@nshiab/journalism-ai";
import type SimpleTable from "../class/SimpleTable.ts";
import { prettyDuration } from "@nshiab/journalism-format";

export default async function aiRAG(
  table: SimpleTable,
  query: string,
  column: string,
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
    embeddingsModel?: string;
    ollamaEmbeddings?: boolean;
    embeddingsConcurrent?: number;
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

  if (await table.hasColumn(embeddingColumn)) {
    if (options.verbose) {
      console.log(
        `"${embeddingColumn}" in table "${table.name}" already exist. Reusing embeddings...`,
      );
    }
  } else {
    if (options.verbose) {
      console.log(
        `"${embeddingColumn}" in table "${table.name}" does not exist. Generating embeddings...`,
      );
    }
    options.cache
      ? await table.cache(async () => {
        await table.aiEmbeddings(column, embeddingColumn, {
          createIndex: options.createIndex ?? false,
          cache: true,
          verbose: options.verbose,
          ollama: options.ollamaEmbeddings,
          model: options.embeddingsModel,
          contextWindow: options.embeddingsModelContextWindow,
          concurrent: options.embeddingsConcurrent,
        });
      })
      : await table.aiEmbeddings(column, embeddingColumn, {
        createIndex: options.createIndex ?? false,
        verbose: options.verbose,
        ollama: options.ollamaEmbeddings,
        model: options.embeddingsModel,
        contextWindow: options.embeddingsModelContextWindow,
        concurrent: options.embeddingsConcurrent,
      });
  }

  if (options.verbose) {
    times.embeddingEnd = Date.now();
    times.vectorSearchStart = Date.now();
  }

  const tempTable = await table.aiVectorSimilarity(
    query,
    embeddingColumn,
    nbResults,
    {
      createIndex: options.createIndex ?? false,
      cache: options.cache,
      outputTable: `${table.name}_rag_temp`,
      ollama: options.ollamaEmbeddings,
      model: options.embeddingsModel,
      contextWindow: options.embeddingsModelContextWindow,
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
    `Answer the following:
- ${query}

Base your answer only on the following data:\n
${retrievedData.join("\n\n-----\n\n")}`,
    {
      systemPrompt: options.systemPrompt ??
        `You are a helpful assistant that answers questions strictly using the provided data.
- Do not use phrases like "Based on the data" or "According to the data"; instead, start with "I found," "I noted," or similar.
- Only discuss entries relevant for the user.
- Do not list or mention entries that do not pertain to the user's query.
- If the data is contradictory, explain the contradictions and provide all relevant perspectives.
- If the data partially answers the question, explain what can be concluded and what remains uncertain.
- If the data is entirely unrelated to the question, state only: "I do not have data to answer this question."`,
      cache: options.cache,
      verbose: options.verbose,
      contextWindow: options.modelContextWindow,
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
