import type {
  askGemini,
  askOllama,
  GetEmbeddingOptions,
} from "@nshiab/journalism-ai";

export type {
  EmbeddingBackend,
  EmbeddingCommonOptions,
  EmbeddingEnvironment,
  EmbeddingIdentity,
  EmbeddingIdentityBase,
  EmbeddingProvider,
  EnvironmentEmbeddingOptions,
  GeminiEmbeddingIdentity,
  GeminiEmbeddingOptions,
  GetEmbeddingOptions,
  OllamaEmbeddingClient,
  OllamaEmbeddingIdentity,
  OllamaEmbeddingOptions,
  VertexEmbeddingIdentity,
  VertexEmbeddingOptions,
} from "@nshiab/journalism-ai";

/**
 * Options accepted directly by `askGemini` from journalism-ai.
 *
 * @example
 * ```ts
 * const options: AskGeminiOptions = { thinkingLevel: "low" };
 * ```
 */
export type AskGeminiOptions = NonNullable<
  Parameters<typeof askGemini>[1]
>;

/**
 * Options accepted directly by `askOllama` from journalism-ai.
 *
 * @example
 * ```ts
 * const options: AskOllamaOptions = { thinkingLevel: true };
 * ```
 */
export type AskOllamaOptions = NonNullable<
  Parameters<typeof askOllama>[1]
>;

/**
 * Selects Gemini generation and exposes the exact `askGemini` options.
 *
 * @example
 * ```ts
 * const generation: GeminiGenerationOptions = {
 *   provider: "gemini",
 *   model: "gemini-3-flash-preview",
 *   thinkingLevel: "low",
 * };
 * ```
 */
export type GeminiGenerationOptions = AskGeminiOptions & {
  /** Selects Gemini or Vertex AI for generation. */
  provider: "gemini";
};

/**
 * Selects Ollama generation and exposes the exact `askOllama` options.
 *
 * @example
 * ```ts
 * const generation: OllamaGenerationOptions = {
 *   provider: "ollama",
 *   model: "gemma4:12b-mlx",
 *   thinkingLevel: true,
 * };
 * ```
 */
export type OllamaGenerationOptions = AskOllamaOptions & {
  /** Selects Ollama for generation. */
  provider: "ollama";
};

/**
 * Uses environment variables to select the generation provider while still
 * passing options to the selected journalism-ai function.
 *
 * @example
 * ```ts
 * const generation: EnvironmentGenerationOptions = { cache: false };
 * ```
 */
export type EnvironmentGenerationOptions =
  & (AskGeminiOptions | AskOllamaOptions)
  & {
    /** Uses `AI_PROVIDER` to select the generation provider. */
    provider?: undefined;
  };

/**
 * Provider-specific or environment-selected generation options.
 *
 * @example
 * ```ts
 * const generation: GenerationOptions = {
 *   provider: "ollama",
 *   model: "gemma4:12b-mlx",
 * };
 * ```
 */
export type GenerationOptions =
  | GeminiGenerationOptions
  | OllamaGenerationOptions
  | EnvironmentGenerationOptions;

type WithoutSchemaJson<T> = T extends GenerationOptions ? Omit<T, "schemaJson">
  : never;

/**
 * Generation options for methods whose output shape is owned by SDA.
 *
 * @example
 * ```ts
 * const generation: UnstructuredGenerationOptions = {
 *   provider: "gemini",
 *   model: "gemini-3-flash-preview",
 * };
 * ```
 */
export type UnstructuredGenerationOptions = WithoutSchemaJson<
  GenerationOptions
>;

/**
 * Provider-specific or environment-selected embedding options.
 *
 * @example
 * ```ts
 * const embeddings: EmbeddingOptions = {
 *   provider: "ollama",
 *   model: "nomic-embed-text",
 * };
 * ```
 */
export type EmbeddingOptions = GetEmbeddingOptions;

/**
 * Mutable aggregate metrics populated by SDA generation methods.
 *
 * @example
 * ```ts
 * const metrics: AIRequestMetrics = {
 *   totalCost: 0,
 *   totalInputTokens: 0,
 *   totalOutputTokens: 0,
 *   totalRequests: 0,
 * };
 * ```
 */
export type AIRequestMetrics = {
  /** Estimated cumulative cost in US dollars when supplied by the provider. */
  totalCost: number;
  /** Cumulative number of input tokens. */
  totalInputTokens: number;
  /** Cumulative number of output tokens. */
  totalOutputTokens: number;
  /** Cumulative number of provider requests. */
  totalRequests: number;
};

const preservedOptionReferences = new Set(["metrics", "ollama", "times"]);

function cloneAIOptionValue(
  value: unknown,
  key: string | undefined,
  seen: WeakMap<object, unknown>,
): unknown {
  if (key !== undefined && preservedOptionReferences.has(key)) {
    return value;
  }
  if (Array.isArray(value)) {
    const existing = seen.get(value);
    if (existing !== undefined) {
      return existing;
    }
    const clone: unknown[] = [];
    seen.set(value, clone);
    for (const item of value) {
      clone.push(cloneAIOptionValue(item, undefined, seen));
    }
    return clone;
  }
  if (value === null || typeof value !== "object") {
    return value;
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    return value;
  }
  const existing = seen.get(value);
  if (existing !== undefined) {
    return existing;
  }
  const clone: { [key: string]: unknown } = {};
  seen.set(value, clone);
  for (const [childKey, childValue] of Object.entries(value)) {
    clone[childKey] = cloneAIOptionValue(childValue, childKey, seen);
  }
  return clone;
}

/**
 * Captures mutable AI configuration for deferred execution.
 * Plain objects and arrays are copied recursively. Provider clients and the
 * documented `metrics` and `times` accumulator objects retain their identity.
 *
 * @param options AI method options to capture.
 * @returns A snapshot safe to close over from a queued operation.
 * @internal
 */
export function snapshotAIOptions<T extends object>(options: T): T {
  return cloneAIOptionValue(options, undefined, new WeakMap()) as T;
}

/** Removes SDA's provider discriminator before calling journalism-ai. */
export function withoutProvider<T extends { provider?: string }>(
  options: T,
): Omit<T, "provider"> {
  const { provider: _provider, ...providerOptions } = options;
  return providerOptions;
}
