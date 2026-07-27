import process from "node:process";
import { Ollama } from "ollama";

/** A provider capable of generating text embeddings. */
export type EmbeddingProvider = "gemini" | "ollama";

type EmbeddingProviderOptions = {
  provider?: EmbeddingProvider;
  ollama?: boolean | Ollama;
};

type EmbeddingProviderEnvironment = Record<string, string | undefined>;

/** Resolves the embeddings provider from call options and environment variables. */
export default function resolveEmbeddingProvider(
  options: EmbeddingProviderOptions = {},
  environment: EmbeddingProviderEnvironment = process.env,
): EmbeddingProvider {
  if (options.provider) {
    return options.provider;
  }

  if (options.ollama === true || options.ollama instanceof Ollama) {
    return "ollama";
  }

  if (options.ollama === false) {
    return "gemini";
  }

  if (environment.AI_EMBEDDINGS_PROVIDER) {
    if (
      environment.AI_EMBEDDINGS_PROVIDER !== "gemini" &&
      environment.AI_EMBEDDINGS_PROVIDER !== "ollama"
    ) {
      throw new Error(
        'AI_EMBEDDINGS_PROVIDER must be either "gemini" or "ollama".',
      );
    }
    return environment.AI_EMBEDDINGS_PROVIDER;
  }

  return environment.OLLAMA ? "ollama" : "gemini";
}
