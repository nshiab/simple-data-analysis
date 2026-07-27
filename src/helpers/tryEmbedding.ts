import { getEmbedding } from "@nshiab/journalism-ai";
import type { Ollama } from "ollama";
import process from "node:process";
import resolveEmbeddingProvider, {
  type EmbeddingProvider,
} from "./resolveEmbeddingProvider.ts";

export default async function tryEmbedding(
  i: number,
  rows: {
    [key: string]: unknown;
  }[],
  text: string,
  newColumn: string,
  options: {
    provider?: EmbeddingProvider;
    cache?: boolean;
    model?: string;
    apiKey?: string;
    vertex?: boolean;
    project?: string;
    location?: string;
    ollama?: boolean | Ollama;
    verbose?: boolean;
    contextWindow?: number;
  } = {},
) {
  const provider = resolveEmbeddingProvider(options);
  const embeddingOptions = {
    cache: options.cache,
    model: options.model,
    apiKey: options.apiKey,
    vertex: options.vertex,
    project: options.project,
    location: options.location,
    ollama: provider === "ollama"
      ? (typeof options.ollama === "object" ? options.ollama : true)
      : false,
    verbose: options.verbose,
    contextWindow: options.contextWindow,
  };

  let embeddingPromise: Promise<number[]>;
  const legacyOllama = process.env.OLLAMA;
  try {
    if (provider === "gemini") {
      delete process.env.OLLAMA;
    }
    embeddingPromise = getEmbedding(text, embeddingOptions);
  } finally {
    if (legacyOllama === undefined) {
      delete process.env.OLLAMA;
    } else {
      process.env.OLLAMA = legacyOllama;
    }
  }

  // Should be improved...
  return rows[i][newColumn] = await embeddingPromise;
}
