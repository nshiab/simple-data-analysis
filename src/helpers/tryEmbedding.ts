import { getEmbedding } from "@nshiab/journalism-ai";
import type { EmbeddingOptions } from "./aiOptions.ts";

/** Generates an embedding with an explicit provider or environment defaults. */
export function getEmbeddingForProvider(
  text: string,
  embeddings?: EmbeddingOptions,
): Promise<number[]> {
  return getEmbedding(text, embeddings);
}

export default async function tryEmbedding(
  i: number,
  rows: {
    [key: string]: unknown;
  }[],
  text: string,
  newColumn: string,
  options: {
    embeddings?: EmbeddingOptions;
  } = {},
) {
  // Should be improved...
  return rows[i][newColumn] = await getEmbeddingForProvider(
    text,
    options.embeddings,
  );
}
