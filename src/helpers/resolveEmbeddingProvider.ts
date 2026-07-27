import process from "node:process";
import resolveProvider, { type Provider } from "./resolveProvider.ts";

/** A provider capable of generating text embeddings. */
export type EmbeddingProvider = Provider;

type EmbeddingProviderEnvironment = Record<string, string | undefined>;

/** Resolves the embeddings provider from call options and environment variables. */
export default function resolveEmbeddingProvider(
  environment: EmbeddingProviderEnvironment = process.env,
): EmbeddingProvider {
  return resolveProvider("AI_EMBEDDINGS_PROVIDER", environment);
}
