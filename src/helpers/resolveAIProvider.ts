import process from "node:process";
import { Ollama } from "ollama";

/** A provider capable of generating AI responses. */
export type AIProvider = "gemini" | "ollama";

type AIProviderOptions = {
  provider?: AIProvider;
  ollama?: boolean | Ollama;
};

type AIProviderEnvironment = Record<string, string | undefined>;

export default function resolveAIProvider(
  options: AIProviderOptions = {},
  environment: AIProviderEnvironment = process.env,
): AIProvider {
  if (options.provider) {
    return options.provider;
  }

  if (options.ollama === true || options.ollama instanceof Ollama) {
    return "ollama";
  }

  if (options.ollama === false) {
    return "gemini";
  }

  if (environment.AI_PROVIDER) {
    if (
      environment.AI_PROVIDER !== "gemini" &&
      environment.AI_PROVIDER !== "ollama"
    ) {
      throw new Error('AI_PROVIDER must be either "gemini" or "ollama".');
    }
    return environment.AI_PROVIDER;
  }

  return environment.OLLAMA ? "ollama" : "gemini";
}
