import { z } from "zod";
import { askOllama } from "@nshiab/journalism-ai";
import { type ChatRequest, type ChatResponse, Ollama } from "ollama";
import type { AskOllamaOptions } from "./aiOptions.ts";

type OllamaAdapterOptions = {
  generation: AskOllamaOptions;
  systemPrompt?: string;
  schemaJson?: unknown;
  disableCache?: boolean;
  deferValidation?: boolean;
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
    const parsed: unknown = JSON.parse(normalized);
    return parsed;
  } catch (error) {
    const candidates = [
      [normalized.indexOf("{"), normalized.lastIndexOf("}")],
      [normalized.indexOf("["), normalized.lastIndexOf("]")],
    ] as const;
    for (const [start, end] of candidates) {
      if (start >= 0 && end > start) {
        try {
          const parsed: unknown = JSON.parse(normalized.slice(start, end + 1));
          return parsed;
        } catch {
          // Try the next complete JSON container before reporting the error.
        }
      }
    }
    throw new Error(
      `Failed to parse Ollama response as JSON: ${String(error)}. Response: ${response}`,
    );
  }
}

function createStructuredOllamaClient(client: Ollama): Ollama {
  return new Proxy(client, {
    get(target, property) {
      if (property === "chat") {
        return async (request: ChatRequest & { stream?: false }): Promise<ChatResponse> => {
          const result = await target.chat(request);
          result.message.content = JSON.stringify(
            parseOllamaStructuredResponse(result.message.content),
          );
          return result;
        };
      }

      const value: unknown = Reflect.get(target, property, target);
      if (typeof value === "function") {
        const bound: unknown = value.bind(target);
        return bound;
      }
      return value;
    },
  });
}

/** Calls `askOllama` with SDA-owned structured-output and cache overrides. */
export default function askOllamaAdapter(
  prompt: string,
  options: OllamaAdapterOptions,
): ReturnType<typeof askOllama> {
  const customOllama =
    options.generation.ollama instanceof Ollama ? options.generation.ollama : undefined;

  const parameters =
    options.generation.ollamaParameters === undefined
      ? undefined
      : z.record(z.string(), z.unknown()).parse(options.generation.ollamaParameters);
  const hasSchema = options.schemaJson !== undefined;
  const deferValidation = hasSchema && options.deferValidation === true;
  const format =
    typeof options.schemaJson === "boolean"
      ? options.schemaJson
        ? {}
        : { not: {} }
      : typeof options.schemaJson === "string"
        ? options.schemaJson
        : hasSchema
          ? z.record(z.string(), z.unknown()).parse(options.schemaJson)
          : undefined;

  // SDA row cleaners must run before validation. Keep the original schema on
  // the request while letting SDA parse and process the response in that path.
  // Other requests use journalism-ai's schema validation and cache handling.
  const requestPrompt = deferValidation
    ? `${prompt}\n\nReturn JSON matching this schema exactly:\n${JSON.stringify(options.schemaJson)}`
    : prompt;
  return askOllama(requestPrompt, {
    ...options.generation,
    ollamaParameters: deferValidation ? { format, ...parameters } : parameters,
    processResponse: deferValidation
      ? async (response: unknown) => {
          const parsed = parseOllamaStructuredResponse(response);
          return options.generation.processResponse
            ? await options.generation.processResponse(parsed)
            : parsed;
        }
      : options.generation.processResponse,
    systemPrompt: options.systemPrompt,
    ollama: hasSchema ? createStructuredOllamaClient(customOllama ?? new Ollama()) : customOllama,
    schemaJson: deferValidation ? undefined : options.schemaJson,
    cache: options.disableCache || deferValidation ? false : options.generation.cache,
  });
}
