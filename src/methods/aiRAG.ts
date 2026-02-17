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
    systemPrompt?: string;
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
      systemPrompt: options.systemPrompt ??
        `You are a helpful assistant that answers questions strictly using the provided data.
- Don't use phrases like "Based on the data" or "According to the data", but start with "I found", "I think", or similar.
- Only discuss entries that directly satisfy the user's criteria.
- Do not mention, list, or explain why you excluded irrelevant data.
- If the data is insufficient, state only: "I do not have data to answer this question."`,
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
