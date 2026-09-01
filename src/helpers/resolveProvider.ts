type ProviderEnvironment = Record<string, string | undefined>;

export type Provider = "gemini" | "ollama";

/** Resolves a provider variable with validation. */
export default function resolveProvider(
  variable: "AI_PROVIDER" | "AI_EMBEDDINGS_PROVIDER",
  environment: ProviderEnvironment,
): Provider {
  const configuredProvider = environment[variable];
  if (configuredProvider) {
    if (configuredProvider !== "gemini" && configuredProvider !== "ollama") {
      throw new Error(`${variable} must be either "gemini" or "ollama".`);
    }
    return configuredProvider;
  }

  return "gemini";
}
