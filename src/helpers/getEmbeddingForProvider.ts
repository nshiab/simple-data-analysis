import { getEmbedding } from "@nshiab/journalism-ai";
import type { EmbeddingOptions } from "./aiOptions.ts";

/** Generates an embedding, pacing only uncached provider requests. */
export function getEmbeddingForProvider(
  text: string,
  embeddings?: EmbeddingOptions,
  beforeRequest?: () => Promise<void>,
): Promise<number[]> {
  return getEmbedding(text, {
    ...embeddings,
    beforeRequest: beforeRequest === undefined
      ? embeddings?.beforeRequest
      : async () => {
        await embeddings?.beforeRequest?.();
        await beforeRequest();
      },
  });
}
