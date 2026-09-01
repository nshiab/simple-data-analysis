import process from "node:process";
import resolveProvider, { type Provider } from "./resolveProvider.ts";

/** A provider capable of generating AI responses. */
export type AIProvider = Provider;

type AIProviderEnvironment = Record<string, string | undefined>;

export default function resolveAIProvider(
  environment: AIProviderEnvironment = process.env,
): AIProvider {
  return resolveProvider("AI_PROVIDER", environment);
}
