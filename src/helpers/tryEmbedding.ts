import { getEmbedding } from "@nshiab/journalism-ai";
import process from "node:process";
import resolveEmbeddingProvider from "./resolveEmbeddingProvider.ts";
import type { EmbeddingOptions, GetEmbeddingOptions } from "./aiOptions.ts";
import { withoutProvider } from "./aiOptions.ts";

/** Returns the provider fields that determine a table-level embedding cache. */
export function getEmbeddingCacheIdentity(
  embeddings?: EmbeddingOptions,
): string {
  return JSON.stringify({
    provider: embeddings?.provider ?? resolveEmbeddingProvider(),
    model: embeddings?.model ?? process.env.AI_EMBEDDINGS_MODEL,
    contextWindow: embeddings?.contextWindow,
  });
}

/** Generates an embedding with an explicit provider or environment defaults. */
export function getEmbeddingForProvider(
  text: string,
  embeddings?: EmbeddingOptions,
): Promise<number[]> {
  const provider = embeddings?.provider ?? resolveEmbeddingProvider();
  const providerOptions = embeddings
    ? withoutProvider(embeddings) as GetEmbeddingOptions
    : {};

  if (provider === "ollama") {
    return getEmbedding(text, {
      ...providerOptions,
      ollama: providerOptions.ollama === false
        ? true
        : providerOptions.ollama ?? true,
    });
  }

  const legacyOllama = process.env.OLLAMA;
  try {
    delete process.env.OLLAMA;
    return getEmbedding(text, providerOptions);
  } finally {
    if (legacyOllama === undefined) {
      delete process.env.OLLAMA;
    } else {
      process.env.OLLAMA = legacyOllama;
    }
  }
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
