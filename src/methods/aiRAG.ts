import { askAI } from "@nshiab/journalism-ai";
import type SimpleTable from "../class/SimpleTable.ts";

export async function aiRAG(
  table: SimpleTable,
  query: string,
  column: string,
  nbResults: number,
  options: {
    cache?: boolean;
    verbose?: boolean;
    contextWindow?: number;
    thinkingBudget?: number;
    thinkingLevel?: "minimal" | "low" | "medium" | "high";
    webSearch?: boolean;
    model?: string;
    embedddingsModel?: string;
    ollamaEmbeddingsModel?: boolean;
  } = {},
) {
  const embeddingColumn = `${column}_embeddings`;

  await table.cache(async () => {
    await table.aiEmbeddings(column, embeddingColumn, {
      createIndex: true,
      cache: true,
      verbose: options.verbose,
      ollama: options.ollamaEmbeddingsModel,
      model: options.embedddingsModel,
    });
  });

  const tempTable = await table.aiVectorSimilarity(
    query,
    embeddingColumn,
    nbResults,
    {
      cache: options.cache,
      outputTable: `${table.name}_rag_temp`,
      verbose: options.verbose,
      ollama: options.ollamaEmbeddingsModel,
    },
  );

  const retrievedData = await tempTable.getValues(column);

  await tempTable.removeTable();

  return askAI(
    `Answer the following question:
- ${query}.

Base your answer only on the following data:\n\n
${retrievedData.join("\n\n---\n\n")}`,
    {
      systemPrompt:
        "You are a helpful assistant for answering questions based on the provided data. Use only the provided data to answer the question. The user won't see the provided data, so don't mention it otherwise it won't undestand your answer. If the data is not sufficient to answer the question, say you don't know.",
      cache: options.cache,
      verbose: options.verbose,
      contextWindow: options.contextWindow,
      thinkingBudget: options.thinkingBudget,
      thinkingLevel: options.thinkingLevel,
      webSearch: options.webSearch,
      model: options.model,
    },
  );
}
