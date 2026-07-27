import { askGemini, askOllama } from "@nshiab/journalism-ai";
import { type ChatRequest, type ChatResponse, Ollama } from "ollama";
import process from "node:process";
import { fromJSONSchema } from "zod";
import {
  getAIResponseCacheFile,
  readAIResponseCache,
  removeAIResponseCache,
  writeAIResponseCache,
} from "./aiResponseCache.ts";
import resolveAIProvider, { type AIProvider } from "./resolveAIProvider.ts";

type AIRequestMetrics = {
  totalCost: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalRequests: number;
};

type AskAIOptions<TResponse = unknown> = {
  provider?: AIProvider;
  systemPrompt?: string;
  model?: string;
  apiKey?: string;
  vertex?: boolean;
  project?: string;
  location?: string;
  webSearch?: boolean;
  schemaJson?: unknown;
  cache?: boolean;
  thinkingBudget?: number;
  thinkingLevel?: "minimal" | "low" | "medium" | "high";
  safetyEnabled?: boolean;
  contextWindow?: number;
  temperature?: number;
  ollama?: boolean | Ollama;
  verbose?: boolean;
  includeThoughts?: boolean;
  metrics?: AIRequestMetrics;
  processResponse?: (response: unknown) => TResponse | Promise<TResponse>;
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

  try {
    return JSON.parse(normalizeOllamaStructuredText(response));
  } catch (error) {
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

export default async function askAI<TResponse = unknown>(
  prompt: string,
  options: AskAIOptions<TResponse> = {},
): Promise<TResponse> {
  const provider = resolveAIProvider(options);
  const thinkingLevel = options.thinkingLevel;
  const promptWithSchema = provider === "ollama" && options.schemaJson
    ? `${prompt}\n\nReturn JSON matching this schema exactly:\n${
      JSON.stringify(options.schemaJson)
    }`
    : prompt;
  const processedCacheFile = options.cache && options.processResponse
    ? getAIResponseCacheFile({
      provider,
      prompt: promptWithSchema,
      systemPrompt: options.systemPrompt,
      model: options.model ?? process.env.AI_MODEL,
      vertex: options.vertex,
      project: options.project ?? process.env.AI_PROJECT,
      location: options.location ?? process.env.AI_LOCATION,
      webSearch: options.webSearch,
      schemaJson: options.schemaJson,
      thinkingBudget: options.thinkingBudget,
      thinkingLevel: options.thinkingLevel,
      safetyEnabled: options.safetyEnabled,
      contextWindow: options.contextWindow,
      temperature: options.temperature,
      customOllama: typeof options.ollama === "object",
    })
    : undefined;
  if (processedCacheFile) {
    const cachedResponse = readAIResponseCache(processedCacheFile);
    if (cachedResponse !== undefined) {
      try {
        return await options.processResponse!(cachedResponse);
      } catch (error) {
        removeAIResponseCache(processedCacheFile);
        throw error;
      }
    }
  }

  const result = provider === "ollama"
    ? await askOllama(promptWithSchema, {
      systemPrompt: options.systemPrompt,
      model: options.model,
      ollama: options.schemaJson
        ? createStructuredOllamaClient(
          typeof options.ollama === "object" ? options.ollama : new Ollama(),
        )
        : typeof options.ollama === "object"
        ? options.ollama
        : undefined,
      schemaJson: options.schemaJson,
      cache: processedCacheFile ? false : options.cache,
      contextWindow: options.contextWindow,
      thinkingLevel: thinkingLevel === "minimal" ? true : thinkingLevel ??
        (options.thinkingBudget && options.thinkingBudget !== 0
          ? true
          : undefined),
      temperature: options.temperature,
    })
    : await askGemini(prompt, {
      systemPrompt: options.systemPrompt,
      model: options.model,
      apiKey: options.apiKey,
      vertex: options.vertex,
      project: options.project,
      location: options.location,
      webSearch: options.webSearch,
      schemaJson: options.schemaJson,
      cache: processedCacheFile ? false : options.cache,
      thinkingLevel: thinkingLevel ??
        (options.thinkingBudget && options.thinkingBudget !== 0
          ? "low"
          : undefined),
      safetyEnabled: options.safetyEnabled,
    });

  if (options.metrics) {
    options.metrics.totalCost += "estimatedCost" in result
      ? result.estimatedCost ?? 0
      : 0;
    options.metrics.totalInputTokens += result.promptTokenCount;
    options.metrics.totalOutputTokens += result.outputTokenCount;
    options.metrics.totalRequests++;
  }

  if (options.verbose) {
    if (options.includeThoughts) {
      console.log(result);
    } else {
      const { thoughts: _thoughts, ...resultWithoutThoughts } = result;
      console.log(resultWithoutThoughts);
    }
  }

  const parsedResponse = provider === "ollama" && options.schemaJson
    ? parseOllamaStructuredResponse(result.response)
    : result.response;
  const validatedResponse = options.schemaJson === undefined ||
      options.processResponse
    ? parsedResponse
    : fromJSONSchema(
      options.schemaJson as Parameters<typeof fromJSONSchema>[0],
    ).parse(parsedResponse);

  const processedResponse = options.processResponse
    ? await options.processResponse(validatedResponse)
    : validatedResponse as TResponse;
  if (processedCacheFile) {
    writeAIResponseCache(processedCacheFile, validatedResponse);
  }
  return processedResponse;
}
