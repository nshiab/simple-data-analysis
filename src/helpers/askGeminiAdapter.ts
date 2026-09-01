import { askGemini } from "@nshiab/journalism-ai";
import type { AskGeminiOptions } from "./aiOptions.ts";

type GeminiAdapterOptions = {
  generation: AskGeminiOptions;
  systemPrompt?: string;
  schemaJson?: unknown;
  disableCache?: boolean;
};

/** Calls `askGemini` with SDA-owned prompt and cache overrides. */
export default function askGeminiAdapter(
  prompt: string,
  options: GeminiAdapterOptions,
): ReturnType<typeof askGemini> {
  return askGemini(prompt, {
    ...options.generation,
    systemPrompt: options.systemPrompt,
    schemaJson: options.schemaJson,
    cache: options.disableCache ? false : options.generation.cache,
  });
}
