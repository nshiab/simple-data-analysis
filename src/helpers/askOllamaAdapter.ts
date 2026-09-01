import { askOllama } from "@nshiab/journalism-ai";
import { type ChatRequest, type ChatResponse, Ollama } from "ollama";
import type { AskOllamaOptions } from "./aiOptions.ts";

type OllamaAdapterOptions = {
  generation: AskOllamaOptions;
  systemPrompt?: string;
  schemaJson?: unknown;
  disableCache?: boolean;
};

/** Normalizes structured Ollama output by removing common JSON labels and fences. */
export function normalizeOllamaStructuredText(response: string): string {
  let json = response.trim();
  for (let i = 0; i < 2; i++) {
    json = json
      .replace(/^json\s*/i, "")
      .replace(/^[{[]?\s*```(?:json)?\s*/i, "")
      .trim();
  }
  json = json.replace(/\s*```$/, "").trim();

  const openingBraces = json.match(/{/g)?.length ?? 0;
  const closingBraces = json.match(/}/g)?.length ?? 0;
  if (/^\{\s*\{/.test(json) && openingBraces === closingBraces + 1) {
    json = json.slice(1);
  }

  const openingBrackets = json.match(/\[/g)?.length ?? 0;
  const closingBrackets = json.match(/]/g)?.length ?? 0;
  if (/^\[\s*\[/.test(json) && openingBrackets === closingBrackets + 1) {
    json = json.slice(1);
  }

  return json.trim();
}

/** Parses structured Ollama output while tolerating common JSON labels and fences. */
export function parseOllamaStructuredResponse(response: unknown): unknown {
  if (typeof response !== "string") {
    return response;
  }

  const normalized = normalizeOllamaStructuredText(response);
  try {
    return JSON.parse(normalized);
  } catch (error) {
    const candidates = [
      [normalized.indexOf("{"), normalized.lastIndexOf("}")],
      [normalized.indexOf("["), normalized.lastIndexOf("]")],
    ] as const;
    for (const [start, end] of candidates) {
      if (start >= 0 && end > start) {
        try {
          return JSON.parse(normalized.slice(start, end + 1));
        } catch {
          // Try the next complete JSON container before reporting the error.
        }
      }
    }
    throw new Error(
      `Failed to parse Ollama response as JSON: ${error}. Response: ${response}`,
    );
  }
}

function createStructuredOllamaClient(client: Ollama): Ollama {
  return new Proxy(client, {
    get(target, property) {
      if (property === "chat") {
        return async (
          request: ChatRequest & { stream?: false },
        ): Promise<ChatResponse> => {
          const result = await target.chat(request);
          result.message.content = JSON.stringify(
            parseOllamaStructuredResponse(result.message.content),
          );
          return result;
        };
      }

      const value = Reflect.get(target, property, target);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}

/** Calls `askOllama` with SDA-owned structured-output and cache overrides. */
export default function askOllamaAdapter(
  prompt: string,
  options: OllamaAdapterOptions,
): ReturnType<typeof askOllama> {
  const customOllama = options.generation.ollama instanceof Ollama
    ? options.generation.ollama
    : undefined;

  return askOllama(prompt, {
    ...options.generation,
    systemPrompt: options.systemPrompt,
    ollama: options.schemaJson
      ? createStructuredOllamaClient(customOllama ?? new Ollama())
      : customOllama,
    schemaJson: options.schemaJson,
    cache: options.disableCache ? false : options.generation.cache,
  });
}
