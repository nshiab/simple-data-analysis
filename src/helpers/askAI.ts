import process from "node:process";
import { fromJSONSchema } from "zod";
import {
  getAIResponseCacheFile,
  readAIResponseCache,
  removeAIResponseCache,
  writeAIResponseCache,
} from "./aiResponseCache.ts";
import resolveAIProvider from "./resolveAIProvider.ts";
import {
  type AIRequestMetrics,
  type AskGeminiOptions,
  type AskOllamaOptions,
  type GenerationOptions,
  withoutProvider,
} from "./aiOptions.ts";
import askGeminiAdapter from "./askGeminiAdapter.ts";
import askOllamaAdapter, { parseOllamaStructuredResponse } from "./askOllamaAdapter.ts";
export {
  normalizeOllamaStructuredText,
  parseOllamaStructuredResponse,
} from "./askOllamaAdapter.ts";

type AskAIOptions<TResponse = unknown> = {
  generation?: GenerationOptions;
  systemPrompt?: string;
  schemaJson?: unknown;
  verbose?: boolean;
  includeThoughts?: boolean;
  metrics?: AIRequestMetrics;
  processResponse?: (response: unknown) => TResponse | Promise<TResponse>;
  beforeRequest?: () => Promise<void>;
};

export default async function askAI<TResponse = unknown>(
  prompt: string,
  options: AskAIOptions<TResponse> = {},
): Promise<TResponse> {
  const provider = options.generation?.provider ?? resolveAIProvider();
  const generationOptions = options.generation ? withoutProvider(options.generation) : {};
  const schemaJson = options.schemaJson ?? generationOptions.schemaJson;
  const systemPrompt = options.systemPrompt ?? generationOptions.systemPrompt;
  const promptWithSchema =
    provider === "ollama" && schemaJson
      ? `${prompt}\n\nReturn JSON matching this schema exactly:\n${JSON.stringify(schemaJson)}`
      : prompt;
  const modelCacheFile =
    generationOptions.cache !== false && options.processResponse
      ? getAIResponseCacheFile({
          provider,
          prompt: promptWithSchema,
          systemPrompt,
          model: generationOptions.model ?? process.env.AI_MODEL,
          generationOptions: {
            ...generationOptions,
            ollama:
              provider === "ollama" &&
              "ollama" in generationOptions &&
              typeof generationOptions.ollama === "object"
                ? "custom"
                : undefined,
          },
          project:
            provider === "gemini" && "project" in generationOptions
              ? (generationOptions.project ?? process.env.AI_PROJECT)
              : undefined,
          location:
            provider === "gemini" && "location" in generationOptions
              ? (generationOptions.location ?? process.env.AI_LOCATION)
              : undefined,
          schemaJson,
        })
      : undefined;
  // SDA owns both callbacks when it owns the cache, so neither output is stored.
  const providerGeneration = options.processResponse
    ? { ...generationOptions, processResponse: undefined }
    : generationOptions;
  const processModelResponse = async (response: unknown): Promise<TResponse> => {
    const generated =
      options.processResponse && generationOptions.processResponse
        ? await generationOptions.processResponse(response)
        : response;
    return options.processResponse
      ? await options.processResponse(generated)
      : (generated as TResponse);
  };
  if (modelCacheFile) {
    const cachedResponse = readAIResponseCache(modelCacheFile);
    if (cachedResponse !== undefined) {
      try {
        return await processModelResponse(cachedResponse);
      } catch (error) {
        removeAIResponseCache(modelCacheFile);
        throw error;
      }
    }
  }

  await options.beforeRequest?.();

  const result =
    provider === "ollama"
      ? await askOllamaAdapter(prompt, {
          generation: providerGeneration as AskOllamaOptions,
          systemPrompt,
          schemaJson,
          disableCache: Boolean(modelCacheFile),
          deferValidation: options.processResponse !== undefined,
        })
      : await askGeminiAdapter(prompt, {
          generation: providerGeneration as AskGeminiOptions,
          systemPrompt,
          schemaJson,
          disableCache: Boolean(modelCacheFile),
        });

  if (options.metrics) {
    options.metrics.totalCost += "estimatedCost" in result ? (result.estimatedCost ?? 0) : 0;
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

  const parsedResponse =
    provider === "ollama" && schemaJson
      ? parseOllamaStructuredResponse(result.response)
      : result.response;
  const validatedResponse =
    schemaJson === undefined || options.processResponse
      ? parsedResponse
      : fromJSONSchema(schemaJson as Parameters<typeof fromJSONSchema>[0]).parse(parsedResponse);

  // Preserve the provider response even when the callback modifies its input.
  const responseForCache = modelCacheFile ? structuredClone(validatedResponse) : undefined;
  const processedResponse = await processModelResponse(validatedResponse);
  if (modelCacheFile) {
    writeAIResponseCache(modelCacheFile, responseForCache);
  }
  return processedResponse;
}
