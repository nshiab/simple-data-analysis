import { SimpleTable as SimpleTableCore } from "@nshiab/simple-data-analysis-core";
import type SimpleDB from "./SimpleDB.ts";
import {
  getDataDW,
  logBarChart,
  logDotChart,
  logLineChart,
  publishChartDW,
  saveChart,
  updateDataDW,
  updateNotesDW,
} from "@nshiab/journalism-dataviz";
import cleanDatavizGlobals from "../helpers/cleanDatavizGlobals.ts";
import { getSheetData, pushToSheet } from "@nshiab/journalism-google";
import type { Data } from "@observablehq/plot";
import { createDirectory } from "@nshiab/simple-data-analysis-core/helpers";
import logHistogram from "../methods/logHistogram.ts";
import aiRowByRow from "../methods/aiRowByRow.ts";
import aiRowByRowPool from "../methods/aiRowByRowPool.ts";
import aiEmbeddings from "../methods/aiEmbeddings.ts";
import aiVectorSimilarity from "../methods/aiVectorSimilarity.ts";
import hybridSearch from "../methods/hybridSearch.ts";
import aiRAG from "../methods/aiRAG.ts";
import aiQuery from "../methods/aiQuery.ts";
import loadGeoDataFromScratchFile from "../helpers/loadGeoDataFromScratchFile.ts";

/**
 * Represents a table within a SimpleDB database, capable of handling tabular, geospatial, and vector data.
 * Extends the core [`SimpleTable`](https://github.com/nshiab/simple-data-analysis-core) class
 * from [`simple-data-analysis-core`](https://github.com/nshiab/simple-data-analysis-core) to include
 * additional AI, Google Sheets, and charting methods.
 *
 * @category Main
 * @example
 * ```ts
 * // Create a SimpleDB instance (in-memory by default)
 * const sdb = new SimpleDB();
 *
 * // Create a new table named "employees" within the database
 * const employees = sdb.newTable("employees");
 *
 * // Load data from a CSV file into the "employees" table
 * employees.loadData("./employees.csv");
 *
 * // Log the first few rows of the "employees" table to the console
 * await employees.log();
 *
 * // Close the database connection and free up resources
 * await sdb.close();
 * ```
 *
 * @example
 * ```ts
 * // Handling geospatial data
 * // Create a SimpleDB instance
 * const sdb = new SimpleDB();
 *
 * // Create a new table for geospatial data
 * const boundaries = sdb.newTable("boundaries");
 *
 * // Load geospatial data from a GeoJSON file
 * boundaries.loadGeoData("./boundaries.geojson");
 *
 * // Close the database connection
 * await sdb.close();
 * ```
 */
export default class SimpleTable extends SimpleTableCore {
  /**
   * The SimpleDB instance this table belongs to.
   * @internal
   */
  declare sdb: SimpleDB;

  // ===================== AI METHODS =====================

  /**
   * Applies a prompt to the value of each row in a specified column, storing the AI's response in a new column. This method can send requests concurrently and in batches, but is not using a pool, so it may not be the most efficient method for processing very large tables. Check `aiRowByRowPool` for a different approach, especially regarding error handling.
   *
   * This method automatically appends instructions to your prompt; set `verbose` to `true` to see the full prompt.
   *
   * This method supports Gemini, Vertex AI, and Ollama. Set `generation.provider` explicitly, or omit it to use `AI_PROVIDER`. All other `generation` fields match the selected `askGemini` or `askOllama` function from journalism-ai. Model and credentials can also come from environment variables.
   *
   * For Ollama, set `AI_PROVIDER=ollama`, ensure Ollama is running, and set `AI_MODEL`, or pass `{ provider: "ollama", ... }` through `generation`.
   *
   * To manage rate limits, use `batchSize` to process multiple rows per request and `rateLimitPerMinute` to introduce delays between requests. For higher rate limits (business/professional accounts), `concurrent` allows parallel requests.
   *
   * The `generation.cache` option enables local caching of results in `.journalism-cache`. Remember to add `.journalism-cache` to your `.gitignore`.
   *
   * If the AI returns fewer items than expected in a batch, or if a custom `test` function fails, the `retry` option (a number greater than 0) will reattempt the request.
   *
   * This method does not support tables containing geometries.
   *
   * @param column - The name of the column to be used as input for the AI prompt.
   * @param newColumn - The name of the new column (or an array of column names) where the AI's response will be stored.
   * @param prompt - The input string to guide the AI's response.
   * @param options - Configuration options for the AI request.
   * @param options.batchSize - The number of rows to process in each batch. Defaults to `1`.
   * @param options.concurrent - The number of concurrent requests to send. Defaults to `1`.
   * @param options.generation - Gemini or Ollama generation configuration. Set `provider` explicitly or omit it to use environment selection; all other fields match the selected journalism-ai function.
   * @param options.test - A function to validate the returned data. If it throws an error, the request will be retried (if `retry` is set). Defaults to `undefined`.
   * @param options.retry - The number of times to retry the request in case of failure. Defaults to `0`.
   * @param options.rateLimitPerMinute - The rate limit for AI requests in requests per minute. The method will wait between requests if necessary. Defaults to `undefined` (no limit).
   * @param options.verbose - If `true`, logs additional debugging information, including the full prompt sent to the AI. Defaults to `false`.
   * @param options.clean - A function to transform the parsed response before validation and caching. Defaults to `undefined`.
   * @param options.extraInstructions - Additional instructions to append to the prompt, providing more context or guidance for the AI.
   * @param options.metrics - An object to track cumulative metrics across multiple AI requests. Pass an object with totalCost, totalInputTokens, totalOutputTokens, and totalRequests properties (all initialized to 0). The function will update these values after each request. Note: totalCost is only calculated for Google GenAI models, not for Ollama.
   * @returns A promise that resolves when the AI processing is complete.
   * @category AI
   *
   * @example
   * ```ts
   * // New table with a "name" column.
   * table.loadArray([
   *   { name: "Marie" },
   *   { name: "John" },
   *   { name: "Alex" },
   * ]);
   *
   * // Ask the AI to categorize names into a new "gender" column.
   * await table.aiRowByRow(
   *   "name",
   *   "gender",
   *   `Guess whether it's a "Man" or a "Woman". If it could be both, return "Neutral".`,
   *   {
   *     generation: {
   *       provider: "gemini",
   *       cache: true, // Cache results locally
   *       model: "gemini-3-flash-preview",
   *     },
   *     batchSize: 10, // Process 10 rows at once
   *     test: (data: { [key: string]: unknown }) => { // Validate AI's response
   *       if (
   *         typeof data.gender !== "string" ||
   *         !["Man", "Woman", "Neutral"].includes(data.gender)
   *       ) {
   *         throw new Error(`Invalid response: ${data.gender}`);
   *       }
   *     },
   *     retry: 3, // Retry up to 3 times on failure
   *     rateLimitPerMinute: 15, // Limit requests to 15 per minute
   *     verbose: true, // Log detailed information
   *   },
   * );
   *
   * // Example results:
   * // [
   * //   { name: "Marie", gender: "Woman" },
   * //   { name: "John", gender: "Man" },
   * //   { name: "Alex", gender: "Neutral" },
   * // ]
   * ```
   *
   * @example
   * ```ts
   * table.loadArray([
   *   { city: "Marrakech" },
   *   { city: "Kyoto" },
   *   { city: "Auckland" },
   * ]);
   *
   * await table.aiRowByRow(
   *   "city",
   *   ["country", "continent"], // Multiple new columns
   *   `Give me the country and continent of the city.`,
   *   { verbose: true },
   * );
   *
   * // Example results:
   * // [
   * //   { city: "Marrakech", country: "Morocco", continent: "Africa" },
   * //   { city: "Kyoto", country: "Japan", continent: "Asia" },
   * //   { city: "Auckland", country: "New Zealand", continent: "Oceania" },
   * // ]
   * ```
   *
   * @example
   * ```ts
   * // Process rows with a local Ollama model.
   * await table.aiRowByRow("name", "description", "Describe this name.", {
   *   generation: { provider: "ollama", model: "gemma3:4b" },
   * });
   * ```
   */
  async aiRowByRow(
    column: string,
    newColumn: string | string[],
    prompt: string,
    options: {
      generation?:
        & {
          systemPrompt?: string;
          model?: string;
          schemaJson?: unknown;
          cache?: boolean;
          processResponse?: (
            response: unknown,
          ) => unknown | Promise<unknown>;
          temperature?: number;
        }
        & (
          | {
            provider: "gemini";
            apiKey?: string;
            vertex?: boolean;
            project?: string;
            location?: string;
            webSearch?: boolean;
            files?: {
              path: string;
              type: "image" | "video" | "audio" | "pdf" | "text";
            }[];
            thinkingBudget?: number;
            thinkingLevel?: "minimal" | "low" | "medium" | "high";
            safetyEnabled?: boolean;
            geminiParameters?: unknown;
            ollama?: never;
            contextWindow?: never;
            ollamaParameters?: never;
          }
          | {
            provider: "ollama";
            ollama?: unknown;
            files?: { path: string; type: "image" | "text" }[];
            contextWindow?: number;
            thinkingLevel?: boolean | "low" | "medium" | "high";
            ollamaParameters?: unknown;
            apiKey?: never;
            vertex?: never;
            project?: never;
            location?: never;
            webSearch?: never;
            thinkingBudget?: never;
            safetyEnabled?: never;
            geminiParameters?: never;
          }
          | {
            provider?: undefined;
            apiKey?: string;
            vertex?: boolean;
            project?: string;
            location?: string;
            webSearch?: boolean;
            files?: {
              path: string;
              type: "image" | "video" | "audio" | "pdf" | "text";
            }[];
            thinkingBudget?: number;
            thinkingLevel?: "minimal" | "low" | "medium" | "high";
            safetyEnabled?: boolean;
            geminiParameters?: unknown;
            ollama?: never;
            contextWindow?: never;
            ollamaParameters?: never;
          }
          | {
            provider?: undefined;
            ollama?: unknown;
            files?: { path: string; type: "image" | "text" }[];
            contextWindow?: number;
            thinkingLevel?: boolean | "low" | "medium" | "high";
            ollamaParameters?: unknown;
            apiKey?: never;
            vertex?: never;
            project?: never;
            location?: never;
            webSearch?: never;
            thinkingBudget?: never;
            safetyEnabled?: never;
            geminiParameters?: never;
          }
        );
      batchSize?: number;
      concurrent?: number;
      test?: (result: { [key: string]: unknown }) => void;
      retry?: number;
      verbose?: boolean;
      rateLimitPerMinute?: number;
      clean?: (response: unknown) => unknown;
      extraInstructions?: string;
      metrics?: {
        totalCost: number;
        totalInputTokens: number;
        totalOutputTokens: number;
        totalRequests: number;
      };
    } = {},
  ): Promise<void> {
    await aiRowByRow(this, column, newColumn, prompt, options);
  }

  /**
   * Applies a prompt to the value of each row in a specified column using a pool-based approach, storing the AI's response in new columns and any errors in a designated error column. Unlike `aiRowByRow`, this method uses a worker pool for better control over concurrent requests and stores errors instead of throwing them, making it ideal for processing large tables where some rows may fail.
   *
   * This method automatically appends instructions to your prompt; set `verbose` to `true` to see the full prompt.
   *
   * This method supports Gemini, Vertex AI, and Ollama. Set `generation.provider` explicitly or omit it to use environment selection; all other fields match `askGemini` or `askOllama` from journalism-ai.
   *
   * The pool size controls how many concurrent AI requests can run simultaneously. The `batchSize` option processes multiple rows per request. For example, with `poolSize: 5` and `batchSize: 10`, up to 5 requests can run concurrently, each processing 10 rows.
   *
   * The `generation.cache` option enables local caching of results in `.journalism-cache`. Remember to add `.journalism-cache` to your `.gitignore`.
   *
   * If the AI returns fewer items than expected in a batch, or if a custom `test` function fails, the `retry` option (a number greater than 0) will reattempt the request. The `retryCheck` function allows conditional retries based on error inspection.
   *
   * The `minRequestDurationMs` option sets a minimum duration for each request, useful for respecting rate limits when you know the allowed requests per time period.
   *
   * This method does not support tables containing geometries.
   *
   * @param column - The name of the column to be used as input for the AI prompt.
   * @param newColumn - The name of the new column (or an array of column names) where the AI's response will be stored. If an error occurs for a row, the new column(s) for that row will be set to `NULL`.
   * @param errorColumn - The name of the column where error messages will be stored. Successful requests will have `NULL` in this column.
   * @param prompt - The input string to guide the AI's response.
   * @param poolSize - The number of concurrent AI requests to run simultaneously in the pool.
   * @param options - Configuration options for the AI request.
   * @param options.generation - Gemini or Ollama generation configuration. Set `provider` explicitly or omit it to use environment selection; all other fields match the selected journalism-ai function.
   * @param options.batchSize - The number of rows to process in each batch. Defaults to `1`.
   * @param options.logProgress - If `true`, logs progress information during processing. Defaults to `false`.
   * @param options.verbose - If `true`, logs additional debugging information, including the full prompt sent to the AI. Defaults to `false`.
   * @param options.test - A function to validate the returned data. If it throws an error, the request will be retried (if `retry` is set). Defaults to `undefined`.
   * @param options.retry - The number of times to retry the request in case of failure. Defaults to `0`.
   * @param options.retryCheck - A function that receives an error and returns a boolean indicating whether to retry. Useful for conditional retries based on error type. Defaults to `undefined`.
   * @param options.extraInstructions - Additional instructions to append to the prompt, providing more context or guidance for the AI.
   * @param options.minRequestDurationMs - The minimum duration in milliseconds for each request. Useful for respecting rate limits. Defaults to `undefined` (no minimum).
   * @param options.clean - A function to transform the parsed response before validation and caching. Defaults to `undefined`.
   * @param options.metrics - An object to track cumulative metrics across multiple AI requests. Pass an object with totalCost, totalInputTokens, totalOutputTokens, and totalRequests properties (all initialized to 0). The function will update these values after each request. Note: totalCost is only calculated for Google GenAI models, not for Ollama.
   * @returns A promise that resolves when the AI processing is complete.
   * @category AI
   *
   * @example
   * ```ts
   * // New table with a "review" column.
   * table.loadArray([
   *   { review: "Great product!" },
   *   { review: "Terrible quality." },
   *   { review: "Not bad, could be better." },
   *   { review: "Excellent service!" },
   * ]);
   *
   * // Analyze sentiment using a pool with 2 concurrent workers, batch size of 2
   * await table.aiRowByRowPool(
   *   "review",
   *   "sentiment",
   *   "error",
   *   `Classify the sentiment as "Positive", "Negative", or "Neutral".`,
   *   2, // poolSize: 2 concurrent requests
   *   {
   *     generation: {
   *       provider: "gemini",
   *       cache: true,
   *       model: "gemini-3-flash-preview",
   *     },
   *     batchSize: 2, // Process 2 rows per request
   *     logProgress: true,
   *     test: (data: { [key: string]: unknown }) => {
   *       if (
   *         typeof data.sentiment !== "string" ||
   *         !["Positive", "Negative", "Neutral"].includes(data.sentiment)
   *       ) {
   *         throw new Error(`Invalid sentiment: ${data.sentiment}`);
   *       }
   *     },
   *     retry: 2,
   *     minRequestDurationMs: 1000, // Respect rate limits: at least 1 second per request
   *   },
   * );
   *
   * // Example results:
   * // [
   * //   { review: "Great product!", sentiment: "Positive", error: null },
   * //   { review: "Terrible quality.", sentiment: "Negative", error: null },
   * //   { review: "Not bad, could be better.", sentiment: "Neutral", error: null },
   * //   { review: "Excellent service!", sentiment: "Positive", error: null },
   * // ]
   * ```
   *
   * @example
   * ```ts
   * table.loadArray([
   *   { product: "Laptop" },
   *   { product: "Smartphone" },
   *   { product: "Tablet" },
   * ]);
   *
   * // Extract multiple properties using pool-based processing
   * await table.aiRowByRowPool(
   *   "product",
   *   ["category", "typical_price_range"],
   *   "error",
   *   `For the given product, provide the category and typical price range.`,
   *   3, // Process up to 3 products concurrently
   *   {
   *     logProgress: true,
   *     retryCheck: (error) => {
   *       // Retry only for specific error types
   *       return error instanceof Error && error.message.includes("rate limit");
   *     },
   *   },
   * );
   *
   * // Example results:
   * // [
   * //   { product: "Laptop", category: "Electronics", typical_price_range: "$500-$2000", error: null },
   * //   { product: "Smartphone", category: "Electronics", typical_price_range: "$200-$1200", error: null },
   * //   { product: "Tablet", category: "Electronics", typical_price_range: "$200-$800", error: null },
   * // ]
   * ```
   *
   * @example
   * ```ts
   * // Process rows concurrently with a local Ollama model.
   * await table.aiRowByRowPool(
   *   "product",
   *   "category",
   *   "error",
   *   "Categorize this product.",
   *   3,
   *   { generation: { provider: "ollama", model: "gemma3:4b" } },
   * );
   * ```
   */
  async aiRowByRowPool(
    column: string,
    newColumn: string | string[],
    errorColumn: string,
    prompt: string,
    poolSize: number,
    options: {
      generation?:
        & {
          systemPrompt?: string;
          model?: string;
          schemaJson?: unknown;
          cache?: boolean;
          processResponse?: (
            response: unknown,
          ) => unknown | Promise<unknown>;
          temperature?: number;
        }
        & (
          | {
            provider: "gemini";
            apiKey?: string;
            vertex?: boolean;
            project?: string;
            location?: string;
            webSearch?: boolean;
            files?: {
              path: string;
              type: "image" | "video" | "audio" | "pdf" | "text";
            }[];
            thinkingBudget?: number;
            thinkingLevel?: "minimal" | "low" | "medium" | "high";
            safetyEnabled?: boolean;
            geminiParameters?: unknown;
            ollama?: never;
            contextWindow?: never;
            ollamaParameters?: never;
          }
          | {
            provider: "ollama";
            ollama?: unknown;
            files?: { path: string; type: "image" | "text" }[];
            contextWindow?: number;
            thinkingLevel?: boolean | "low" | "medium" | "high";
            ollamaParameters?: unknown;
            apiKey?: never;
            vertex?: never;
            project?: never;
            location?: never;
            webSearch?: never;
            thinkingBudget?: never;
            safetyEnabled?: never;
            geminiParameters?: never;
          }
          | {
            provider?: undefined;
            apiKey?: string;
            vertex?: boolean;
            project?: string;
            location?: string;
            webSearch?: boolean;
            files?: {
              path: string;
              type: "image" | "video" | "audio" | "pdf" | "text";
            }[];
            thinkingBudget?: number;
            thinkingLevel?: "minimal" | "low" | "medium" | "high";
            safetyEnabled?: boolean;
            geminiParameters?: unknown;
            ollama?: never;
            contextWindow?: never;
            ollamaParameters?: never;
          }
          | {
            provider?: undefined;
            ollama?: unknown;
            files?: { path: string; type: "image" | "text" }[];
            contextWindow?: number;
            thinkingLevel?: boolean | "low" | "medium" | "high";
            ollamaParameters?: unknown;
            apiKey?: never;
            vertex?: never;
            project?: never;
            location?: never;
            webSearch?: never;
            thinkingBudget?: never;
            safetyEnabled?: never;
            geminiParameters?: never;
          }
        );
      batchSize?: number;
      logProgress?: boolean;
      verbose?: boolean;
      test?: (result: { [key: string]: unknown }) => void;
      retry?: number;
      retryCheck?: (error: unknown) => Promise<boolean> | boolean;
      extraInstructions?: string;
      minRequestDurationMs?: number;
      clean?: (response: unknown) => unknown;
      metrics?: {
        totalCost: number;
        totalInputTokens: number;
        totalOutputTokens: number;
        totalRequests: number;
      };
    } = {},
  ) {
    await aiRowByRowPool(
      this,
      column,
      newColumn,
      errorColumn,
      prompt,
      poolSize,
      options,
    );
  }

  /**
   * Generates embeddings for a specified text column and stores the results in a new column.
   *
   * This method supports Gemini, Vertex AI, and Ollama embeddings. Set `embeddings.provider` explicitly or omit it to use `AI_EMBEDDINGS_PROVIDER`; all other fields match `getEmbedding` from journalism-ai. Model and credentials can also come from environment variables.
   *
   * For Ollama, set `AI_EMBEDDINGS_PROVIDER=ollama`, ensure Ollama is running, and set `AI_EMBEDDINGS_MODEL`, or pass `{ provider: "ollama", ... }` through `embeddings`.
   *
   * To manage rate limits, use `rateLimitPerMinute` to introduce delays between requests. For higher rate limits (business/professional accounts), `concurrent` allows parallel requests.
   *
   * The `embeddings.cache` option enables local caching of results in `.journalism-cache`. Remember to add `.journalism-cache` to your `.gitignore`.
   *
   * SDA records the canonical provider, backend, model, semantic options, source column, and vector dimensions for columns generated by this method. A compatible existing column is reused; changing its embedding identity or source mapping regenerates the vectors and invalidates a stale VSS index. Existing columns without provenance are treated as legacy and regenerated safely.
   *
   * If `createIndex` is `true`, an index will be created on the new column using the [duckdb-vss extension](https://github.com/duckdb/duckdb-vss). This is useful for speeding up the `aiVectorSimilarity` method. If the index already exists, it will not be recreated unless `overwriteIndex` is `true`.
   *
   * This method does not support tables containing geometries.
   *
   * @param column - The name of the column to be used as input for generating embeddings.
   * @param newColumn - The name of the new column where the generated embeddings will be stored.
   * @param options - Configuration options for the AI request.
   * @param options.createIndex - If `true`, an index will be created on the new column. Useful for speeding up the `aiVectorSimilarity` method. Defaults to `false`.
   * @param options.overwriteIndex - If `true` and `createIndex` is `true`, drops and recreates the VSS index even if it already exists. Defaults to `false`.
   * @param options.efConstruction - The number of candidate vertices to consider during index construction. Higher values result in more accurate indexes but increase build time. Defaults to 128.
   * @param options.efSearch - The number of candidate vertices to consider during search. Higher values result in more accurate searches but increase search time. Defaults to 64.
   * @param options.M - The maximum number of neighbors to keep for each vertex in the graph. Higher values result in more accurate indexes but increase build time and memory usage. Defaults to 16.
   * @param options.concurrent - The number of concurrent requests to send. Defaults to `1`.
   * @param options.embeddings - Gemini or Ollama embedding configuration. Set `provider` explicitly or omit it to use environment selection; all other fields match `getEmbedding` from journalism-ai.
   * @param options.rateLimitPerMinute - The rate limit for AI requests in requests per minute. The method will wait between requests if necessary. Defaults to `undefined` (no limit).
   * @param options.verbose - If `true`, logs additional debugging information. Defaults to `false`.
   * @returns A promise that resolves when the embeddings have been generated and stored.
   * @category AI
   *
   * @example
   * ```ts
   * // New table with a "food" column.
   * table.loadArray([
   *   { food: "pizza" },
   *   { food: "sushi" },
   *   { food: "burger" },
   *   { food: "pasta" },
   *   { food: "salad" },
   *   { food: "tacos" }
   * ]);
   *
   * // Generate embeddings for the "food" column and store them in a new "embeddings" column.
   * await table.aiEmbeddings("food", "embeddings", {
   *   embeddings: {
   *     provider: "gemini",
   *     cache: true, // Cache results locally
   *     model: "gemini-embedding-001",
   *   },
   *   rateLimitPerMinute: 15, // Limit requests to 15 per minute
   *   createIndex: true, // Create an index on the new column for faster similarity searches
   *   verbose: true, // Log detailed information
   * });
   * ```
   *
   * @example
   * ```ts
   * // Generate embeddings with a local Ollama model.
   * await table.aiEmbeddings("food", "embeddings", {
   *   embeddings: { provider: "ollama", model: "nomic-embed-text" },
   * });
   * ```
   */
  async aiEmbeddings(
    column: string,
    newColumn: string,
    options: {
      embeddings?:
        | {
          provider?: never;
          model?: string;
          cache?: boolean;
          verbose?: boolean;
          apiKey?: never;
          vertex?: never;
          project?: never;
          location?: never;
          ollama?: never;
          contextWindow?: never;
        }
        | {
          provider: "gemini";
          model?: string;
          cache?: boolean;
          verbose?: boolean;
          vertex?: false;
          apiKey?: string;
          project?: never;
          location?: never;
          ollama?: never;
          contextWindow?: never;
        }
        | {
          provider: "gemini";
          model?: string;
          cache?: boolean;
          verbose?: boolean;
          vertex: true;
          apiKey?: string;
          project?: string;
          location?: string;
          ollama?: never;
          contextWindow?: never;
        }
        | {
          provider: "ollama";
          model?: string;
          cache?: boolean;
          verbose?: boolean;
          ollama?: {
            embeddingEndpoint?: string;
            embed(request: {
              model: string;
              input: string;
              options?: { num_ctx?: number };
            }): Promise<{ embeddings: number[][] }>;
          };
          contextWindow?: number;
          apiKey?: never;
          vertex?: never;
          project?: never;
          location?: never;
        };
      createIndex?: boolean;
      overwriteIndex?: boolean;
      concurrent?: number;
      verbose?: boolean;
      rateLimitPerMinute?: number;
      efConstruction?: number;
      efSearch?: number;
      M?: number;
    } = {},
  ): Promise<void> {
    await aiEmbeddings(this, column, newColumn, options);
  }

  /**
   * Creates an embedding from a specified text and returns the most similar text content based on their embeddings.
   * This method is useful for semantic search and text similarity tasks, computing cosine distance and sorting results by similarity.
   *
   * To create the query embedding, omit `embeddings` to use environment variables or pass provider-specific options matching `getEmbedding` from journalism-ai.
   *
   * Gemini, Vertex AI, and Ollama are supported. The selected provider and model must match those used to create the stored embedding column so the vectors share the same dimensions and embedding space.
   *
   * The `embeddings.cache` option enables local caching of the query embedding in `.journalism-cache`. Remember to add `.journalism-cache` to your `.gitignore`.
   *
   * If `createIndex` is `true`, an index will be created on the embeddings column using the [duckdb-vss extension](https://github.com/duckdb/duckdb-vss) to speed up processing. If the index already exists, it will not be recreated unless `overwriteIndex` is `true`.
   *
   * @param text - The text for which to generate an embedding and find similar content.
   * @param column - The name of the column containing the embeddings to be used for the similarity search.
   * @param nbResults - The maximum number of most similar results to return.
   * @param options - An optional object with configuration options:
   * @param options.minSimilarity - A threshold between 0.0 and 1.0 to filter out results that are not similar enough. For example, 0.7 ensures only results with a 70% similarity or higher are returned. Defaults to `undefined` (no threshold).
   * @param options.similarityColumn - If provided, a new column with this name will be added to the output table containing the calculated similarity score (from 0.0 to 1.0) for each row. Defaults to `undefined`.
   * @param options.createIndex - If `true`, an index will be created on the embeddings column. Defaults to `false`.
   * @param options.overwriteIndex - If `true` and `createIndex` is `true`, drops and recreates the VSS index even if it already exists. Defaults to `false`.
   * @param options.efConstruction - The number of candidate vertices to consider during index construction. Higher values result in more accurate indexes but increase build time. Defaults to 128.
   * @param options.efSearch - The number of candidate vertices to consider during search. Higher values result in more accurate searches but increase search time. Defaults to 64.
   * @param options.M - The maximum number of neighbors to keep for each vertex in the graph. Higher values result in more accurate indexes but increase build time and memory usage. Defaults to 16.
   * @param options.outputTable - The name of the output table where the results will be stored. If not provided, the current table will be modified. Defaults to `undefined`.
   * @param options.embeddings - Gemini or Ollama embedding configuration. Set `provider` explicitly or omit it to use environment selection; all other fields match `getEmbedding` from journalism-ai.
   * @param options.verbose - If `true`, logs additional debugging information. Defaults to `false`.
   * @returns A promise that resolves to the SimpleTable instance containing the similarity search results.
   * @category AI
   *
   * @example
   * ```ts
   * // New table with a "food" column.
   * table.loadArray([
   *   { food: "pizza" },
   *   { food: "sushi" },
   *   { food: "burger" },
   *   { food: "pasta" },
   *   { food: "salad" },
   *   { food: "tacos" }
   * ]);
   *
   * // Generate embeddings for the "food" column.
   * await table.aiEmbeddings("food", "embeddings", {
   *   embeddings: {
   *     provider: "gemini",
   *     model: "gemini-embedding-001",
   *     cache: true,
   *   },
   * });
   *
   * // Find the 3 most similar foods to "italian food" based on embeddings.
   * // We only want results with at least 60% similarity and we want to see the score.
   * const similarFoods = await table.aiVectorSimilarity(
   *   "italian food",
   *   "embeddings",
   *   3,
   *   {
   *     createIndex: true, // Create an index on the embeddings column for faster searches
   *     embeddings: {
   *       provider: "gemini",
   *       model: "gemini-embedding-001",
   *       cache: true, // Cache the embedding of "italian food"
   *     },
   *     minSimilarity: 0.6, // Filter out anything below 0.6 similarity
   *     similarityColumn: "score" // Add a new column named "score" with the similarity math
   *   }
   * );
   *
   * // Log the results
   * await similarFoods.log();
   * ```
   *
   * @example
   * ```ts
   * // Query an embedding column created with the same Ollama model.
   * const results = await table.aiVectorSimilarity(
   *   "italian food",
   *   "embeddings",
   *   3,
   *   {
   *     embeddings: { provider: "ollama", model: "nomic-embed-text" },
   *   },
   * );
   * ```
   */
  async aiVectorSimilarity(
    text: string,
    column: string,
    nbResults: number,
    options: {
      embeddings?:
        | {
          provider?: never;
          model?: string;
          cache?: boolean;
          verbose?: boolean;
          apiKey?: never;
          vertex?: never;
          project?: never;
          location?: never;
          ollama?: never;
          contextWindow?: never;
        }
        | {
          provider: "gemini";
          model?: string;
          cache?: boolean;
          verbose?: boolean;
          vertex?: false;
          apiKey?: string;
          project?: never;
          location?: never;
          ollama?: never;
          contextWindow?: never;
        }
        | {
          provider: "gemini";
          model?: string;
          cache?: boolean;
          verbose?: boolean;
          vertex: true;
          apiKey?: string;
          project?: string;
          location?: string;
          ollama?: never;
          contextWindow?: never;
        }
        | {
          provider: "ollama";
          model?: string;
          cache?: boolean;
          verbose?: boolean;
          ollama?: {
            embeddingEndpoint?: string;
            embed(request: {
              model: string;
              input: string;
              options?: { num_ctx?: number };
            }): Promise<{ embeddings: number[][] }>;
          };
          contextWindow?: number;
          apiKey?: never;
          vertex?: never;
          project?: never;
          location?: never;
        };
      createIndex?: boolean;
      overwriteIndex?: boolean;
      outputTable?: string;
      verbose?: boolean;
      efConstruction?: number;
      efSearch?: number;
      M?: number;
      minSimilarity?: number;
      similarityColumn?: string;
    } = {},
  ): Promise<SimpleTable> {
    const result = await aiVectorSimilarity(
      this,
      text,
      column,
      nbResults,
      options,
    );
    return result;
  }

  /**
   * Performs hybrid text search combining vector similarity and BM25 text search using Reciprocal Rank Fusion (RRF).
   *
   * This method:
   * 1. Ensures compatible embeddings exist for the text column
   * 2. Runs vector similarity search and BM25 text search in parallel
   * 3. Fuses the results using Reciprocal Rank Fusion to get the best matches
   * 4. Returns a new table with the top results ordered by relevance
   *
   * The embeddings are cached at two levels:
   * * At the table level, so renaming the table will invalidate the cache and regenerate embeddings. For often updated tables, you can pass a timestamp to the table name (e.g., `mytable_20240901`) to keep the cache valid until the next update.
   * * At the row level, so if the text content is different or not cached, the embedding will be generated and cached for that specific text. If the text content has been previously cached, the existing embedding will be reused, even if the table has been renamed (as long as the text content is unchanged).
   *
   * Also, the method creates the column `{columnText}_embeddings` to store the generated embeddings and persists its canonical embedding provenance inside DuckDB. A stored column is reused only when its provider/backend/model identity, semantic options, source mapping, and dimensions remain compatible. Legacy or incompatible columns are regenerated, and stale vector indexes are invalidated before replacement. This provenance survives reopening a DuckDB database.
   *
   * To delete the cache, remove the `.journalism-cache` and/or `.sda-cache` directories or set `embeddings.cache` to `false`.
   *
   * This method supports Gemini, Vertex AI, and Ollama embeddings. Set `embeddings.provider` explicitly or omit it to use environment selection; all other fields match `getEmbedding` from journalism-ai.
   *
   * The selected embedding provider is used for both stored row embeddings and the query embedding.
   *
   * If `createIndex` is `true`, both a vector index (using the [duckdb-vss extension](https://github.com/duckdb/duckdb-vss)) and a BM25 full-text search index (using the [fts extension](https://duckdb.org/docs/stable/core_extensions/full_text_search)) will be created for faster retrieval.
   *
   * This method does not support tables containing geometries.
   *
   * @param query - The search query text.
   * @param columnId - The name of the column containing unique identifiers for each row.
   * @param columnText - The name of the column containing the text content to search through.
   * @param nbResults - The number of most similar rows to retrieve.
   * @param options - Configuration options for the hybrid search.
   * @param options.embeddings - Gemini or Ollama embedding configuration. Set `provider` explicitly or omit it to use environment selection; all other fields match `getEmbedding` from journalism-ai.
   * @param options.verbose - If `true`, logs additional debugging information. Defaults to `false`.
   * @param options.createIndex - If `true`, both vector and BM25 indexes will be created for faster retrieval. Defaults to `false`.
   * @param options.efConstruction - The number of candidate vertices to consider during index construction. Higher values result in more accurate indexes but increase build time. Defaults to 128.
   * @param options.efSearch - The number of candidate vertices to consider during search. Higher values result in more accurate searches but increase search time. Defaults to 64.
   * @param options.M - The maximum number of neighbors to keep for each vertex in the graph. Higher values result in more accurate indexes but increase build time and memory usage. Defaults to 16.
   * @param options.embeddingsConcurrent - The number of concurrent requests to send to the embeddings service. Defaults to `1`.
   * @param options.stemmer - The language stemmer to apply for BM25 word normalization. Supports multiple languages or "none" to disable stemming. Defaults to `'porter'`.
   * @param options.stopwords - The table containing the stopwords to use for the BM25 FTS index. Supports multiple languages or "none" to disable stopwords. Defaults to "english".
   * @param options.ignore - The regular expression of patterns to be ignored for the BM25 FTS index. Defaults to "(\\.|[^a-z])+".
   * @param options.stripAccents - A boolean indicating whether to remove accents for the BM25 FTS index. Defaults to true.
   * @param options.lower - A boolean indicating whether to convert all text to lowercase for the BM25 FTS index. Defaults to true.
   * @param options.k - The BM25 k parameter controlling term frequency saturation. Defaults to `1.2`.
   * @param options.b - The BM25 b parameter controlling document length normalization (0-1 range). Defaults to `0.75`.
   * @param options.conjunctive - If `true`, all terms in the query string must be present in order for a document to be retrieved during the BM25 search. Defaults to `false`.
   * @param options.bm25 - If `true`, includes BM25 text search in the hybrid search. Defaults to `true`.
   * @param options.bm25MinScore - A threshold to filter BM25 results. Only rows with a BM25 score above this value will be included in the final results. Defaults to `undefined` (no threshold).
   * @param options.bm25ScoreColumn - If provided, a new column with this name will be added to the output table containing the BM25 score for each row.
   * @param options.vectorSearch - If `true`, includes vector similarity search in the hybrid search. Defaults to `true`.
   * @param options.vectorMinSimilarity - A threshold between 0.0 and 1.0 to filter out vector search results that are not similar enough. For example, 0.7 ensures only results with a 70% similarity or higher are included in the final results. Defaults to `undefined` (no threshold).
   * @param options.vectorSimilarityColumn - If provided, a new column with this name will be added to the output table containing the vector similarity score (from 0.0 to 1.0) for each row.
   * @param options.outputTable - The name of a new table where the results will be stored. If not provided, the current table will be replaced with the search results.
   * @param options.times - An optional object to track timing information. If provided, it will be updated with detailed timing breakdowns (embeddingStart, embeddingEnd, vectorSearchStart, vectorSearchEnd, bm25Start, bm25End). Useful when calling from aiRAG to get combined timing information.
   * @returns A promise that resolves to a SimpleTable instance containing the search results, ordered by relevance (best matches first).
   * @category AI
   *
   * @example
   * ```ts
   * // Load a dataset of recipes
   * const sdb = new SimpleDB();
   * const table = sdb.newTable("recipes");
   * table.loadData("recipes.parquet");
   *
   * // Perform hybrid search - replaces the current table with top 10 results
   * await table.hybridSearch(
   *   "buttery pastry for breakfast",
   *   "Dish", // Column with unique IDs
   *   "Recipe", // Column with text to search
   *   10, // Return top 10 results
   *   {
   *     embeddings: {
   *       provider: "gemini",
   *       model: "gemini-embedding-001",
   *       cache: true, // Cache embeddings
   *     },
   *     verbose: true, // Log debugging information
   *   }
   * );
   *
   * // Table now contains only the most relevant recipes
   * await table.log();
   * ```
   *
   * @example
   * ```ts
   * // Run hybrid search with local Ollama embeddings.
   * await table.hybridSearch("buttery pastry", "Dish", "Recipe", 10, {
   *   embeddings: { provider: "ollama", model: "nomic-embed-text" },
   * });
   * ```
   */
  async hybridSearch(
    query: string,
    columnId: string,
    columnText: string,
    nbResults: number,
    options: {
      embeddings?:
        | {
          provider?: never;
          model?: string;
          cache?: boolean;
          verbose?: boolean;
          apiKey?: never;
          vertex?: never;
          project?: never;
          location?: never;
          ollama?: never;
          contextWindow?: never;
        }
        | {
          provider: "gemini";
          model?: string;
          cache?: boolean;
          verbose?: boolean;
          vertex?: false;
          apiKey?: string;
          project?: never;
          location?: never;
          ollama?: never;
          contextWindow?: never;
        }
        | {
          provider: "gemini";
          model?: string;
          cache?: boolean;
          verbose?: boolean;
          vertex: true;
          apiKey?: string;
          project?: string;
          location?: string;
          ollama?: never;
          contextWindow?: never;
        }
        | {
          provider: "ollama";
          model?: string;
          cache?: boolean;
          verbose?: boolean;
          ollama?: {
            embeddingEndpoint?: string;
            embed(request: {
              model: string;
              input: string;
              options?: { num_ctx?: number };
            }): Promise<{ embeddings: number[][] }>;
          };
          contextWindow?: number;
          apiKey?: never;
          vertex?: never;
          project?: never;
          location?: never;
        };
      verbose?: boolean;
      createIndex?: boolean;
      embeddingsConcurrent?: number;
      stemmer?:
        | "arabic"
        | "basque"
        | "catalan"
        | "danish"
        | "dutch"
        | "english"
        | "finnish"
        | "french"
        | "german"
        | "greek"
        | "hindi"
        | "hungarian"
        | "indonesian"
        | "irish"
        | "italian"
        | "lithuanian"
        | "nepali"
        | "norwegian"
        | "porter"
        | "portuguese"
        | "romanian"
        | "russian"
        | "serbian"
        | "spanish"
        | "swedish"
        | "tamil"
        | "turkish"
        | "none";
      stopwords?: string;
      ignore?: string;
      stripAccents?: boolean;
      lower?: boolean;
      k?: number;
      b?: number;
      conjunctive?: boolean;
      bm25?: boolean;
      bm25MinScore?: number;
      bm25ScoreColumn?: string;
      vectorSearch?: boolean;
      vectorMinSimilarity?: number;
      vectorSimilarityColumn?: string;
      outputTable?: string;
      efConstruction?: number;
      efSearch?: number;
      M?: number;
      times?: {
        start?: number;
        embeddingStart?: number;
        embeddingEnd?: number;
        vectorSearchStart?: number;
        vectorSearchEnd?: number;
        bm25Start?: number;
        bm25End?: number;
      };
    } = {},
  ): Promise<SimpleTable> {
    const result = await hybridSearch(
      this,
      query,
      columnId,
      columnText,
      nbResults,
      options,
    );
    return result;
  }

  /**
   * Performs Retrieval-Augmented Generation (RAG) by combining semantic vector search and BM25 full-text search to retrieve the most relevant context, then passing it to an LLM for answering queries. This hybrid approach uses both `aiVectorSimilarity` (embeddings-based) and `bm25` (keyword-based) methods in parallel, fusing their results using Reciprocal Rank Fusion (RRF) before calling the `askAI` function from the journalism library.
   *
   * Internally, this method uses the `hybridSearch` method to retrieve relevant rows. If you want to perform hybrid search without the LLM step (i.e., to get the table of results directly), use `hybridSearch` instead.
   *
   * The embeddings are cached at two levels:
   * * At the table level, so renaming the table will invalidate the cache and regenerate embeddings. For often updated tables, you can pass a timestamp to the table name (e.g., `mytable_20240901`) to keep the cache valid until the next update.
   * * At the row level, so if the text content is different or not cached, the embedding will be generated and cached for that specific text. If the text content has been previously cached, the existing embedding will be reused, even if the table has been renamed (as long as the text content is unchanged).
   *
   * Also, the method creates the column `{columnText}_embeddings` to store the generated embeddings and persists its canonical embedding provenance inside DuckDB. A stored column is reused only when its provider/backend/model identity, semantic options, source mapping, and dimensions remain compatible. Legacy or incompatible columns are regenerated, and stale vector indexes are invalidated before replacement. This provenance survives reopening a DuckDB database.
   *
   * To delete the cache, remove the `.journalism-cache` and/or `.sda-cache` directories, or disable caching independently in `generation` and `embeddings`.
   *
   * Generation and embeddings are independently configurable. Set either nested `provider` explicitly or omit it to use that provider's environment selection; all remaining fields match journalism-ai.
   *
   * For example, `generation.provider` can be `"gemini"` while `embeddings.provider` is `"ollama"`. Environment-only mixed providers use `AI_PROVIDER` and `AI_EMBEDDINGS_PROVIDER`.
   *
   * Ollama temperature defaults to 0. Gemini uses the provider's default temperature.
   *
   * If `createIndex` is `true`, both a vector index (using the [duckdb-vss extension](https://github.com/duckdb/duckdb-vss)) and a BM25 full-text search index (using the [fts extension](https://duckdb.org/docs/stable/core_extensions/full_text_search)) will be created for faster retrieval.
   *
   * This method does not support tables containing geometries.
   *
   * @param query - The question or query to answer using the retrieved context.
   * @param columnId - The name of the column containing unique identifiers for each row.
   * @param columnText - The name of the column containing the text content to search through and use as context.
   * @param nbResults - The number of most similar rows to retrieve and use as context for the AI.
   * @param options - Configuration options for the RAG process.
   * @param options.generation - Gemini or Ollama generation configuration. Set `provider` explicitly or omit it to use environment selection; all other relevant fields match the selected journalism-ai function.
   * @param options.embeddings - Gemini or Ollama embedding configuration. Set `provider` explicitly or omit it to use environment selection; all other fields match `getEmbedding` from journalism-ai.
   * @param options.verbose - If `true`, logs additional debugging information. Defaults to `false`.
   * @param options.includeThoughts - If `true`, includes the AI model's reasoning process in the logged output when using models that support extended thinking. Only relevant when used with thinking-capable models. Defaults to `false`.
   * @param options.metrics - An object to track cumulative metrics across multiple AI requests. Pass an object with totalCost, totalInputTokens, totalOutputTokens, and totalRequests properties (all initialized to 0). The function will update these values after each request. Note: totalCost is only calculated for Google GenAI models, not for Ollama.
   * @param options.embeddingsConcurrent - The number of concurrent requests to send to the embeddings service. Defaults to `1`.
   * @param options.createIndex - If `true`, both vector and BM25 indexes will be created for faster retrieval. Defaults to `false`.
   * @param options.efConstruction - The number of candidate vertices to consider during index construction. Higher values result in more accurate indexes but increase build time. Defaults to 128.
   * @param options.efSearch - The number of candidate vertices to consider during search. Higher values result in more accurate searches but increase search time. Defaults to 64.
   * @param options.M - The maximum number of neighbors to keep for each vertex in the graph. Higher values result in more accurate indexes but increase build time and memory usage. Defaults to 16.
   * @param options.stemmer - The language stemmer to apply for BM25 word normalization. Supports multiple languages or "none" to disable stemming. Defaults to `'porter'`.
   * @param options.stopwords - The table containing the stopwords to use for the BM25 FTS index. Supports multiple languages or "none" to disable stopwords. Defaults to "english".
   * @param options.ignore - The regular expression of patterns to be ignored for the BM25 FTS index. Defaults to "(\\.|[^a-z])+".
   * @param options.stripAccents - A boolean indicating whether to remove accents for the BM25 FTS index. Defaults to true.
   * @param options.lower - A boolean indicating whether to convert all text to lowercase for the BM25 FTS index. Defaults to true.
   * @param options.k - The BM25 k parameter controlling term frequency saturation. Defaults to `1.2`.
   * @param options.b - The BM25 b parameter controlling document length normalization (0-1 range). Defaults to `0.75`.
   * @param options.conjunctive - If `true`, all terms in the query string must be present in order for a document to be retrieved during the BM25 search. Defaults to `false`.
   * @param options.bm25 - If `true`, includes BM25 text search in the hybrid search. Defaults to `true`.
   * @param options.bm25MinScore - A threshold to filter BM25 results. Only rows with a BM25 score above this value will be included in the final results. Defaults to `undefined` (no threshold).
   * @param options.bm25ScoreColumn - If provided, a new column with this name will be added to the output table containing the BM25 score for each row.
   * @param options.vectorSearch - If `true`, includes vector similarity search in the hybrid search. Defaults to `true`.
   * @param options.vectorMinSimilarity - A threshold between 0.0 and 1.0 to filter out vector search results that are not similar enough. For example, 0.7 ensures only results with a 70% similarity or higher are included in the final results. Defaults to `undefined` (no threshold).
   * @param options.vectorSimilarityColumn - If provided, a new column with this name will be added to the output table containing the vector similarity score (from 0.0 to 1.0) for each row.
   * @returns A promise that resolves to the AI's answer to the query based on the retrieved context.
   * @category AI
   *
   * @example
   * ```ts
   * // Load a dataset of recipes
   * const sdb = new SimpleDB();
   * const table = sdb.newTable("recipes");
   * table.loadData("recipes.parquet");
   *
   * // Ask a question using hybrid RAG (vector + BM25 search)
   * const answer = await table.aiRAG(
   *   "I want a buttery pastry for breakfast.",
   *   "Dish", // Column with unique IDs
   *   "Recipe", // Column with text to search
   *   10, // The 10 most relevant recipes passed to the LLM
   *   {
   *     generation: {
   *       provider: "gemini",
   *       model: "gemini-3-flash-preview",
   *       cache: true,
   *     },
   *     embeddings: {
   *       provider: "ollama",
   *       model: "nomic-embed-text",
   *       cache: true,
   *     },
   *     verbose: true, // Log debugging information and timings
   *   }
   * );
   *
   * console.log(answer);
   * // Example output: "I recommend croissants.
   * // They are a classic buttery pastry perfect for breakfast..."
   * ```
   *
   * @example
   * ```ts
   * // Use Ollama for both retrieval embeddings and answer generation.
   * const answer = await table.aiRAG(
   *   "I want a buttery pastry for breakfast.",
   *   "Dish",
   *   "Recipe",
   *   10,
   *   {
   *     generation: { provider: "ollama", model: "gemma3:4b" },
   *     embeddings: { provider: "ollama", model: "nomic-embed-text" },
   *   },
   * );
   * ```
   */
  async aiRAG(
    query: string,
    columnId: string,
    columnText: string,
    nbResults: number,
    options: {
      embeddings?:
        | {
          provider?: never;
          model?: string;
          cache?: boolean;
          verbose?: boolean;
          apiKey?: never;
          vertex?: never;
          project?: never;
          location?: never;
          ollama?: never;
          contextWindow?: never;
        }
        | {
          provider: "gemini";
          model?: string;
          cache?: boolean;
          verbose?: boolean;
          vertex?: false;
          apiKey?: string;
          project?: never;
          location?: never;
          ollama?: never;
          contextWindow?: never;
        }
        | {
          provider: "gemini";
          model?: string;
          cache?: boolean;
          verbose?: boolean;
          vertex: true;
          apiKey?: string;
          project?: string;
          location?: string;
          ollama?: never;
          contextWindow?: never;
        }
        | {
          provider: "ollama";
          model?: string;
          cache?: boolean;
          verbose?: boolean;
          ollama?: {
            embeddingEndpoint?: string;
            embed(request: {
              model: string;
              input: string;
              options?: { num_ctx?: number };
            }): Promise<{ embeddings: number[][] }>;
          };
          contextWindow?: number;
          apiKey?: never;
          vertex?: never;
          project?: never;
          location?: never;
        };
      verbose?: boolean;
      createIndex?: boolean;
      embeddingsConcurrent?: number;
      stemmer?:
        | "arabic"
        | "basque"
        | "catalan"
        | "danish"
        | "dutch"
        | "english"
        | "finnish"
        | "french"
        | "german"
        | "greek"
        | "hindi"
        | "hungarian"
        | "indonesian"
        | "irish"
        | "italian"
        | "lithuanian"
        | "nepali"
        | "norwegian"
        | "porter"
        | "portuguese"
        | "romanian"
        | "russian"
        | "serbian"
        | "spanish"
        | "swedish"
        | "tamil"
        | "turkish"
        | "none";
      stopwords?: string;
      ignore?: string;
      stripAccents?: boolean;
      lower?: boolean;
      k?: number;
      b?: number;
      conjunctive?: boolean;
      bm25?: boolean;
      bm25MinScore?: number;
      bm25ScoreColumn?: string;
      vectorSearch?: boolean;
      vectorMinSimilarity?: number;
      vectorSimilarityColumn?: string;
      efConstruction?: number;
      efSearch?: number;
      M?: number;
      generation?:
        & {
          systemPrompt?: string;
          model?: string;
          cache?: boolean;
          processResponse?: (
            response: unknown,
          ) => unknown | Promise<unknown>;
          temperature?: number;
        }
        & (
          | {
            provider: "gemini";
            apiKey?: string;
            vertex?: boolean;
            project?: string;
            location?: string;
            webSearch?: boolean;
            files?: {
              path: string;
              type: "image" | "video" | "audio" | "pdf" | "text";
            }[];
            thinkingBudget?: number;
            thinkingLevel?: "minimal" | "low" | "medium" | "high";
            safetyEnabled?: boolean;
            geminiParameters?: unknown;
            ollama?: never;
            contextWindow?: never;
            ollamaParameters?: never;
          }
          | {
            provider: "ollama";
            ollama?: unknown;
            files?: { path: string; type: "image" | "text" }[];
            contextWindow?: number;
            thinkingLevel?: boolean | "low" | "medium" | "high";
            ollamaParameters?: unknown;
            apiKey?: never;
            vertex?: never;
            project?: never;
            location?: never;
            webSearch?: never;
            thinkingBudget?: never;
            safetyEnabled?: never;
            geminiParameters?: never;
          }
          | {
            provider?: undefined;
            apiKey?: string;
            vertex?: boolean;
            project?: string;
            location?: string;
            webSearch?: boolean;
            files?: {
              path: string;
              type: "image" | "video" | "audio" | "pdf" | "text";
            }[];
            thinkingBudget?: number;
            thinkingLevel?: "minimal" | "low" | "medium" | "high";
            safetyEnabled?: boolean;
            geminiParameters?: unknown;
            ollama?: never;
            contextWindow?: never;
            ollamaParameters?: never;
          }
          | {
            provider?: undefined;
            ollama?: unknown;
            files?: { path: string; type: "image" | "text" }[];
            contextWindow?: number;
            thinkingLevel?: boolean | "low" | "medium" | "high";
            ollamaParameters?: unknown;
            apiKey?: never;
            vertex?: never;
            project?: never;
            location?: never;
            webSearch?: never;
            thinkingBudget?: never;
            safetyEnabled?: never;
            geminiParameters?: never;
          }
        );
      includeThoughts?: boolean;
      metrics?: {
        totalCost: number;
        totalInputTokens: number;
        totalOutputTokens: number;
        totalRequests: number;
      };
    } = {},
  ): Promise<string> {
    return await aiRAG(this, query, columnId, columnText, nbResults, options);
  }

  /**
   * Generates and executes a SQL query based on a prompt.
   * Additional instructions, such as column types, are automatically added to your prompt. Set `verbose` to `true` to see the full prompt.
   *
   * This method supports Gemini, Vertex AI, and Ollama. Set `generation.provider` explicitly or omit it to use environment selection; all other relevant fields match `askGemini` or `askOllama` from journalism-ai.
   *
   * For Ollama, set `AI_PROVIDER=ollama`, ensure Ollama is running, and set `AI_MODEL`, or pass `{ provider: "ollama", ... }` through `generation`.
   *
   * Ollama temperature defaults to 0, while Gemini uses the provider's default. Provider-specific controls live under `generation`.
   *
   * When `generation.cache` is `true`, the generated query is cached locally in `.journalism-cache`. Remember to add `.journalism-cache` to your `.gitignore`.
   *
   * @param prompt - The input string to guide the AI in generating the SQL query.
   * @param options - Configuration options for the AI request.
   * @param options.extraInstructions - Additional instructions to append to the prompt, providing more context or guidance for the AI.
   * @param options.generation - Gemini or Ollama generation configuration. Set `provider` explicitly or omit it to use environment selection; all other relevant fields match the selected journalism-ai function.
   * @param options.outputTable - The name of a new table where the results will be stored. If not provided, the current table will be replaced with the query results.
   * @param options.verbose - If `true`, logs additional debugging information, including the full prompt sent to the AI. Defaults to `false`.
   * @param options.includeThoughts - If `true`, includes the AI model's reasoning process in the logged output when using models that support extended thinking. Only relevant when used with thinking-capable models. Defaults to `false`.
   * @returns A promise that resolves to the SimpleTable instance containing the query results (either the modified current table or a new table).
   * @category AI
   *
   * @example
   * ```ts
   * // The AI will generate a query that will be executed, and
   * // the result will replace the existing table.
   * // If run again, it will use the previous query from the cache.
   * // Don't forget to add .journalism-cache to your .gitignore file!
   * await table.aiQuery(
   *    "Give me the average salary by department",
   *     {
   *       generation: {
   *         provider: "gemini",
   *         model: "gemini-3-flash-preview",
   *         cache: true,
   *       },
   *       verbose: true,
   *     }
   * );
   * ```
   *
   * @example
   * ```ts
   * // Save results to a new table without modifying the original
   * const results = await table.aiQuery(
   *    "Give me the top 10 employees by salary",
   *     { outputTable: "top_employees" }
   * );
   *
   * // Original table remains unchanged
   * const allEmployees = await table.getRowCount();
   * console.log(allEmployees); // All employees
   *
   * // New table contains only query results
   * const topEmployees = await results.getRowCount();
   * console.log(topEmployees); // 10
   * ```
   *
   * @example
   * ```ts
   * // Generate and execute the query with a local Ollama model.
   * await table.aiQuery("Give me the average salary by department", {
   *   generation: { provider: "ollama", model: "gemma3:4b" },
   * });
   * ```
   */
  async aiQuery(
    prompt: string,
    options: {
      extraInstructions?: string;
      generation?:
        & {
          systemPrompt?: string;
          model?: string;
          cache?: boolean;
          processResponse?: (
            response: unknown,
          ) => unknown | Promise<unknown>;
          temperature?: number;
        }
        & (
          | {
            provider: "gemini";
            apiKey?: string;
            vertex?: boolean;
            project?: string;
            location?: string;
            webSearch?: boolean;
            files?: {
              path: string;
              type: "image" | "video" | "audio" | "pdf" | "text";
            }[];
            thinkingBudget?: number;
            thinkingLevel?: "minimal" | "low" | "medium" | "high";
            safetyEnabled?: boolean;
            geminiParameters?: unknown;
            ollama?: never;
            contextWindow?: never;
            ollamaParameters?: never;
          }
          | {
            provider: "ollama";
            ollama?: unknown;
            files?: { path: string; type: "image" | "text" }[];
            contextWindow?: number;
            thinkingLevel?: boolean | "low" | "medium" | "high";
            ollamaParameters?: unknown;
            apiKey?: never;
            vertex?: never;
            project?: never;
            location?: never;
            webSearch?: never;
            thinkingBudget?: never;
            safetyEnabled?: never;
            geminiParameters?: never;
          }
          | {
            provider?: undefined;
            apiKey?: string;
            vertex?: boolean;
            project?: string;
            location?: string;
            webSearch?: boolean;
            files?: {
              path: string;
              type: "image" | "video" | "audio" | "pdf" | "text";
            }[];
            thinkingBudget?: number;
            thinkingLevel?: "minimal" | "low" | "medium" | "high";
            safetyEnabled?: boolean;
            geminiParameters?: unknown;
            ollama?: never;
            contextWindow?: never;
            ollamaParameters?: never;
          }
          | {
            provider?: undefined;
            ollama?: unknown;
            files?: { path: string; type: "image" | "text" }[];
            contextWindow?: number;
            thinkingLevel?: boolean | "low" | "medium" | "high";
            ollamaParameters?: unknown;
            apiKey?: never;
            vertex?: never;
            project?: never;
            location?: never;
            webSearch?: never;
            thinkingBudget?: never;
            safetyEnabled?: never;
            geminiParameters?: never;
          }
        );
      includeThoughts?: boolean;
      outputTable?: string;
      verbose?: boolean;
    } = {},
  ): Promise<SimpleTable> {
    await aiQuery(this, prompt, options);

    if (typeof options.outputTable === "string") {
      return this.sdb.newTable(
        options.outputTable,
      );
    } else {
      return this;
    }
  }

  // ===================== GOOGLE SHEETS METHODS =====================

  /**
   * Writes the table data to a Google Sheet.
   * This method uses the `pushToSheet` function from the [journalism-google library](https://jsr.io/@nshiab/journalism-google). Refer to its documentation for more details.
   *
   * By default, the selected tab is overwritten and values are written without Google Sheets interpretation. Authentication is handled via environment variables (GOOGLE_PRIVATE_KEY and GOOGLE_SERVICE_ACCOUNT_EMAIL). Alternatively, you can use GOOGLE_APPLICATION_CREDENTIALS pointing to a service account JSON file. For detailed setup instructions, refer to the node-google-spreadsheet authentication guide: https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication.
   *
   * @param sheetUrl - A Google Sheets URL. It can point to a spreadsheet or a specific tab.
   * @param options - An optional object with configuration options:
   * @param options.mode - Whether to overwrite the tab or append rows. Defaults to `"overwrite"`.
   * @param options.tabTitle - Selects a tab by title instead of using the URL's `gid`.
   * @param options.create - If `true`, creates a missing tab selected by `tabTitle`. Defaults to `false`.
   * @param options.prepend - Text to add above the header row in overwrite mode.
   * @param options.lastUpdate - If `true`, adds a UTC timestamp. Pass a Canadian time zone to use it for the timestamp. Available only in overwrite mode.
   * @param options.raw - If `true`, writes values without Google Sheets interpretation. Defaults to `true`.
   * @param options.credentials - Explicit Google service-account credentials. These override credentials provided through environment variables or GOOGLE_APPLICATION_CREDENTIALS.
   * @param options.credentials.email - The Google service-account email.
   * @param options.credentials.privateKey - The Google service-account private key.
   * @returns A promise that resolves when the data has been written to the sheet.
   * @category Exporting Data
   *
   * @example
   * ```ts
   * // Write the table data to a Google Sheet
   * await table.toSheet("https://docs.google.com/spreadsheets/d/.../edit#gid=0");
   * ```
   *
   * @example
   * ```ts
   * // Append rows to a tab selected by title
   * await table.toSheet("https://docs.google.com/spreadsheets/d/.../edit", {
   *   mode: "append",
   *   tabTitle: "Election results",
   * });
   * ```
   *
   * @example
   * ```ts
   * // Create a missing tab and add context above the data
   * await table.toSheet("https://docs.google.com/spreadsheets/d/.../edit", {
   *   tabTitle: "Election results",
   *   create: true,
   *   prepend: "Preliminary results",
   *   lastUpdate: "Canada/Eastern",
   * });
   * ```
   *
   * @example
   * ```ts
   * // Let Google Sheets interpret values, such as formulas and dates
   * await table.toSheet(
   *   "https://docs.google.com/spreadsheets/d/.../edit#gid=0",
   *   { raw: false },
   * );
   * ```
   *
   * @example
   * ```ts
   * // Pass service-account credentials explicitly
   * await table.toSheet(
   *   "https://docs.google.com/spreadsheets/d/.../edit#gid=0",
   *   {
   *     credentials: {
   *       email: "service-account@example.iam.gserviceaccount.com",
   *       privateKey: "-----BEGIN PRIVATE KEY-----\\n...",
   *     },
   *   },
   * );
   * ```
   */
  async toSheet(sheetUrl: string, options: {
    mode?: "overwrite" | "append";
    tabTitle?: string;
    create?: boolean;
    prepend?: string;
    lastUpdate?:
      | boolean
      | "Canada/Atlantic"
      | "Canada/Central"
      | "Canada/Eastern"
      | "Canada/Mountain"
      | "Canada/Newfoundland"
      | "Canada/Pacific"
      | "Canada/Saskatchewan"
      | "Canada/Yukon";
    raw?: boolean;
    credentials?: {
      email: string;
      privateKey: string;
    };
  } = {}): Promise<void> {
    const data = await this.getData() as Parameters<
      typeof pushToSheet
    >[0];
    await pushToSheet(data, sheetUrl, options);
  }

  /**
   * Loads data from a Google Sheet into the table.
   * This method uses the `getSheetData` function from the [journalism library](https://jsr.io/@nshiab/journalism). Refer to its documentation for more details.
   *
   * By default, authentication is handled via environment variables (GOOGLE_PRIVATE_KEY and GOOGLE_SERVICE_ACCOUNT_EMAIL). Alternatively, you can use GOOGLE_APPLICATION_CREDENTIALS pointing to a service account JSON file. For detailed setup instructions, refer to the node-google-spreadsheet authentication guide: https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication.
   *
   * @param sheetUrl - The URL pointing to a specific Google Sheet (e.g., `"https://docs.google.com/spreadsheets/d/.../edit#gid=0"`).
   * @param options - An optional object with configuration options:
   * @param options.skip - The number of rows to skip from the top of the sheet before reading data. Useful when the sheet contains metadata or headers that should not be included in the data.
   * @param options.apiEmail - If your API email is stored under a different environment variable name, use this option to specify it.
   * @param options.apiKey - If your API key is stored under a different environment variable name, use this option to specify it.
   * @returns A promise that resolves when the data has been loaded into the table.
   * @category Loading Data
   *
   * @example
   * ```ts
   * // Load data from a Google Sheet
   * await table.loadSheet("https://docs.google.com/spreadsheets/d/.../edit#gid=0");
   * ```
   *
   * @example
   * ```ts
   * // Load data from a Google Sheet, skipping the first 2 rows (e.g., to skip a prepended message and timestamp)
   * await table.loadSheet("https://docs.google.com/spreadsheets/d/.../edit#gid=0", {
   *   skip: 2,
   * });
   * ```
   */
  async loadSheet(sheetUrl: string, options: {
    skip?: number;
    apiEmail?: string;
    apiKey?: string;
  } = {}): Promise<void> {
    this.loadArray(await getSheetData(sheetUrl, options));
    await this.run();
  }

  // ===================== DATAWRAPPER METHODS =====================

  /**
   * Writes the table data as CSV to a Datawrapper chart or table.
   *
   * Authentication is handled via an API key stored in the environment variable `DATAWRAPPER_KEY`, or a custom variable name via `options.apiKey`.
   *
   * @param chartId - The unique ID of the Datawrapper chart or table to update. This ID can be found in the Datawrapper URL or dashboard.
   * @param options - An optional object with configuration options:
   * @param options.apiKey - The name of the environment variable that stores your Datawrapper API key (e.g., `"DATAWRAPPER_KEY"`). Defaults to `"DATAWRAPPER_KEY"`.
   * @param options.note - A string to update the chart's notes field with (e.g., a last-updated timestamp).
   * @param options.republish - If `true`, republishes the chart after updating the data. Defaults to `false`.
   * @returns A promise that resolves when the data has been sent to Datawrapper.
   * @category Exporting Data
   *
   * @example
   * ```ts
   * // Update a Datawrapper chart with the table data
   * await table.toDW("myChartId");
   * ```
   *
   * @example
   * ```ts
   * // Update data, add a note, and republish
   * await table.toDW("myChartId", {
   *   note: `Last updated: ${new Date().toLocaleString()}`,
   *   republish: true,
   * });
   * ```
   */
  async toDW(
    chartId: string,
    options: {
      apiKey?: string;
      note?: string;
      republish?: boolean;
    } = {},
  ): Promise<void> {
    await updateDataDW(chartId, await this.getDataAsCSV(), {
      apiKey: options.apiKey,
    });
    if (typeof options.note === "string") {
      await updateNotesDW(chartId, options.note, { apiKey: options.apiKey });
    }
    if (options.republish === true) {
      await publishChartDW(chartId, { apiKey: options.apiKey });
    }
  }

  /**
   * Loads data from a Datawrapper chart or table into the table.
   *
   * Authentication is handled via an API key stored in the environment variable `DATAWRAPPER_KEY`, or a custom variable name via `options.apiKey`.
   *
   * @param chartId - The unique ID of the Datawrapper chart or table. This ID can be found in the Datawrapper URL or dashboard.
   * @param options - An optional object with configuration options:
   * @param options.apiKey - The name of the environment variable that stores your Datawrapper API key (e.g., `"DATAWRAPPER_KEY"`). Defaults to `"DATAWRAPPER_KEY"`.
   * @returns A promise that resolves when the data has been loaded into the table.
   * @category Loading Data
   *
   * @example
   * ```ts
   * // Load data from a Datawrapper chart
   * await table.loadDW("myChartId");
   * ```
   */
  async loadDW(
    chartId: string,
    options: {
      apiKey?: string;
    } = {},
  ): Promise<void> {
    const data = await getDataDW(chartId, {
      parse: true,
      apiKey: options.apiKey,
    });
    this.loadArray(data as Record<string, string>[]);
    await this.run();
  }

  /**
   * Writes the table's geospatial data as GeoJSON to a Datawrapper map.
   *
   * Authentication is handled via an API key stored in the environment variable `DATAWRAPPER_KEY`, or a custom variable name via `options.apiKey`.
   *
   * @param chartId - The unique ID of the Datawrapper map to update. This ID can be found in the Datawrapper URL or dashboard.
   * @param options - An optional object with configuration options:
   * @param options.apiKey - The name of the environment variable that stores your Datawrapper API key (e.g., `"DATAWRAPPER_KEY"`). Defaults to `"DATAWRAPPER_KEY"`.
   * @param options.column - The name of the geometry column to use. If omitted, the method will automatically attempt to find a geometry column.
   * @param options.note - A string to update the map's notes field with.
   * @param options.republish - If `true`, republishes the map after updating the data. Defaults to `false`.
   * @returns A promise that resolves when the data has been sent to Datawrapper.
   * @category Exporting Data
   *
   * @example
   * ```ts
   * // Update a Datawrapper map with the table's geo data
   * await table.toGeoDW("myMapId");
   * ```
   *
   * @example
   * ```ts
   * // Update data, add a note, and republish
   * await table.toGeoDW("myMapId", {
   *   note: `Last updated: ${new Date().toLocaleString()}`,
   *   republish: true,
   * });
   * ```
   */
  async toGeoDW(
    chartId: string,
    options: {
      apiKey?: string;
      column?: string;
      note?: string;
      republish?: boolean;
    } = {},
  ): Promise<void> {
    const geoData = await this.getGeoData(options.column);
    await updateDataDW(chartId, JSON.stringify(geoData), {
      apiKey: options.apiKey,
    });
    if (typeof options.note === "string") {
      await updateNotesDW(chartId, options.note, { apiKey: options.apiKey });
    }
    if (options.republish === true) {
      await publishChartDW(chartId, { apiKey: options.apiKey });
    }
  }

  /**
   * Loads geospatial data from a Datawrapper map into the table.
   *
   * Authentication is handled via an API key stored in the environment variable `DATAWRAPPER_KEY`, or a custom variable name via `options.apiKey`.
   *
   * The data is temporarily written to `.sda-cache/tmp/dataviz/<uuid>.geojson` and removed after loading. Remember to add `.sda-cache` to your `.gitignore`.
   *
   * @param chartId - The unique ID of the Datawrapper map. This ID can be found in the Datawrapper URL or dashboard.
   * @param options - An optional object with configuration options:
   * @param options.apiKey - The name of the environment variable that stores your Datawrapper API key (e.g., `"DATAWRAPPER_KEY"`). Defaults to `"DATAWRAPPER_KEY"`.
   * @returns A promise that resolves when the data has been loaded into the table.
   * @category Loading Data
   *
   * @example
   * ```ts
   * // Load geo data from a Datawrapper map
   * await table.loadGeoDW("myMapId");
   * ```
   */
  async loadGeoDW(
    chartId: string,
    options: {
      apiKey?: string;
    } = {},
  ): Promise<void> {
    const jsonString = await getDataDW(chartId, {
      apiKey: options.apiKey,
    }) as string;
    await loadGeoDataFromScratchFile(this, jsonString);
  }

  // ===================== CHARTING METHODS =====================

  /**
   * Creates an [Observable Plot](https://github.com/observablehq/plot) chart as an image file (.png or .svg) from the table data.
   * To create maps, use the `writeMap` method.
   *
   * @param chart - A function that takes data (as an array of objects) and returns an Observable Plot chart (an `SVGSVGElement` or `HTMLElement`).
   * @param path - The absolute path where the chart image will be saved (e.g., `"./output/chart.png"`).
   * @param options - Optional object containing additional settings:
   * @param options.style - A CSS string to customize the chart's appearance. This is applied to a `<div>` element wrapping the Plot chart (which has the id `chart`). Use this if the Plot `style` option is insufficient.
   * @param options.dark - If `true`, switches the chart to dark mode. Defaults to `false`.
   * @returns A promise that resolves when the chart image has been saved.
   * @category Dataviz
   *
   * @example
   * ```ts
   * import { dot, plot } from "@observablehq/plot";
   *
   * const sdb = new SimpleDB();
   * const table = sdb.newTable();
   * const data = [{ year: 2024, value: 10 }, { year: 2025, value: 15 }];
   * table.loadArray(data);
   *
   * const chartFunction = (plotData: unknown[]) =>
   *   plot({
   *     marks: [
   *       dot(plotData, { x: "year", y: "value" }),
   *     ],
   *   });
   *
   * const outputPath = "output/chart.png";
   *
   * await table.writeChart(chartFunction, outputPath);
   * ```
   */
  async writeChart(
    chart: (data: unknown[]) => SVGSVGElement | HTMLElement,
    path: string,
    options: { style?: string; dark?: boolean } = {},
  ): Promise<void> {
    try {
      createDirectory(path);
      const data = await this.getData();
      await saveChart(
        data,
        chart as (data: Data) => SVGSVGElement | HTMLElement,
        path,
        options,
      );
    } catch (error) {
      console.error(error);
    } finally {
      cleanDatavizGlobals();
    }
  }

  /**
   * Creates an [Observable Plot](https://github.com/observablehq/plot) map as an image file (.png or .svg) from the table's geospatial data.
   * To create charts from non-geospatial data, use the `writeChart` method.
   *
   * @param map - A function that takes geospatial data (in GeoJSON format) and returns an Observable Plot map (an `SVGSVGElement` or `HTMLElement`).
   * @param path - The absolute path where the map image will be saved (e.g., `"./output/map.png"`).
   * @param options - An optional object with configuration options:
   * @param options.column - The name of the column storing geometries. If there is only one geometry column, it will be used by default.
   * @param options.rewind - If `true`, rewinds the coordinates of polygons to follow the spherical winding order (important for D3.js). Defaults to `true`.
   * @param options.style - A CSS string to customize the map's appearance. This is applied to a `<div>` element wrapping the Plot map (which has the ID `chart`). Use this if the Plot `style` option is insufficient.
   * @param options.dark - If `true`, switches the map to dark mode. Defaults to `false`.
   * @returns A promise that resolves when the map image has been saved.
   * @category Dataviz
   *
   * @example
   * ```ts
   * import { geo, plot } from "@observablehq/plot";
   *
   * const sdb = new SimpleDB();
   * const table = sdb.newTable();
   * table.loadGeoData("./CanadianProvincesAndTerritories.geojson");
   *
   * const mapFunction = (geoJsonData: { features: unknown[] }) =>
   *   plot({
   *     projection: {
   *       type: "conic-conformal",
   *       rotate: [100, -60],
   *       domain: geoJsonData,
   *     },
   *     marks: [
   *       geo(geoJsonData, { stroke: "black", fill: "lightblue" }),
   *     ],
   *   });
   *
   * const outputPath = "./output/map.png";
   *
   * await table.writeMap(mapFunction, outputPath);
   * ```
   */
  async writeMap(
    map: (geoData: {
      features: {
        properties: { [key: string]: unknown };
      }[];
    }) => SVGSVGElement | HTMLElement,
    path: string,
    options: {
      column?: string;
      rewind?: boolean;
      style?: string;
      dark?: boolean;
    } = {},
  ): Promise<void> {
    try {
      createDirectory(path);
      options.rewind = options.rewind ?? true;
      const geoData = await this.getGeoData(options.column, {
        rewind: options.rewind,
      });
      await saveChart(
        geoData as unknown as Data,
        map as unknown as (data: Data) => SVGSVGElement | HTMLElement,
        path,
        options,
      );
    } catch (error) {
      console.error(error);
    } finally {
      cleanDatavizGlobals();
    }
  }

  /**
   * Generates and logs a line chart to the console. The data should be sorted by the x-axis values for accurate representation.
   *
   * **Data Type Requirements:**
   * - **X-axis values**: Must be `number` or `Date` objects.
   * - **Y-axis values**: Must be `number` values.
   * - All values must be non-null and defined.
   *
   * @param x - The name of the column to be used for the x-axis. Values must be numbers or Date objects.
   * @param y - The name of the column to be used for the y-axis. Values must be numbers.
   * @param options - An optional object with configuration options:
   * @param options.formatX - A function to format the x-axis values for display. It receives the raw x-value as input and should return a string. If the first data point's x value is a Date, it defaults to formatting the date as "YYYY-MM-DD".
   * @param options.formatY - A function to format the y-axis values for display. It receives the raw y-value as input and should return a string.
   * @param options.smallMultiples - The name of a column to create small multiples (also known as facets or trellis charts). Each unique value in this column will generate a separate chart.
   * @param options.fixedScales - If `true`, all small multiples will share the same y-axis scale. Defaults to `false`.
   * @param options.smallMultiplesPerRow - The number of small multiples to display per row.
   * @param options.width - The width of the chart in characters.
   * @param options.height - The height of the chart in characters.
   * @returns A promise that resolves when the chart has been logged to the console.
   * @category Dataviz
   *
   * @example
   * // Basic line chart
   * ```typescript
   * const data = [
   *     { date: new Date("2023-01-01"), value: 10 },
   *     { date: new Date("2023-02-01"), value: 20 },
   *     { date: new Date("2023-03-01"), value: 30 },
   *     { date: new Date("2023-04-01"), value: 40 },
   * ]
   * table.loadArray(data)
   * table.convert({ date: "string" }, { datetimeFormat: "%x" })
   * await table.logLineChart("date", "value")
   * ```
   *
   * @example
   * // Line chart with small multiples
   * ```typescript
   * const data = [
   *     { date: new Date("2023-01-01"), value: 10, category: "A" },
   *     { date: new Date("2023-02-01"), value: 20, category: "A" },
   *     { date: new Date("2023-03-01"), value: 30, category: "A" },
   *     { date: new Date("2023-04-01"), value: 40, category: "A" },
   *     { date: new Date("2023-01-01"), value: 15, category: "B" },
   *     { date: new Date("2023-02-01"), value: 25, category: "B" },
   *     { date: new Date("2023-03-01"), value: 35, category: "B" },
   *     { date: new Date("2023-04-01"), value: 45, category: "B" },
   * ]
   * table.loadArray(data)
   * table.convert({ date: "string" }, { datetimeFormat: "%x" })
   * await table.logLineChart("date", "value", {
   *     smallMultiples: "category",
   * })
   * ```
   */
  async logLineChart(
    x: string,
    y: string,
    options: {
      formatX?: (d: unknown) => string;
      formatY?: (d: number) => string;
      smallMultiples?: string;
      fixedScales?: boolean;
      smallMultiplesPerRow?: number;
      width?: number;
      height?: number;
    } = {},
  ): Promise<void> {
    const data = await this.getData({
      columns: Array.from(
        new Set([
          x,
          y,
          ...(typeof options.smallMultiples === "string"
            ? [options.smallMultiples]
            : []),
        ]),
      ),
    });
    logLineChart(data, x, y, options);
  }

  /**
   * Generates and logs a dot chart to the console. The data should be sorted by the x-axis values for accurate representation.
   *
   * **Data Type Requirements:**
   * - **X-axis values**: Must be `number` or `Date` objects.
   * - **Y-axis values**: Must be `number` values.
   * - All values must be non-null and defined.
   *
   * @param x - The name of the column to be used for the x-axis. Values must be numbers or Date objects.
   * @param y - The name of the column to be used for the y-axis. Values must be numbers.
   * @param options - An optional object with configuration options:
   * @param options.formatX - A function to format the x-axis values for display. It receives the raw x-value as input and should return a string. If the first data point's x value is a Date, it defaults to formatting the date as "YYYY-MM-DD".
   * @param options.formatY - A function to format the y-axis values for display. It receives the raw y-value as input and should return a string.
   * @param options.smallMultiples - The name of a column to create small multiples (also known as facets). Each unique value in this column will generate a separate chart.
   * @param options.fixedScales - If `true`, all small multiples will share the same y-axis scale. Defaults to `false`.
   * @param options.smallMultiplesPerRow - The number of small multiples to display per row.
   * @param options.width - The width of the chart in characters.
   * @param options.height - The height of the chart in characters.
   * @returns A promise that resolves when the chart has been logged to the console.
   * @category Dataviz
   *
   * @example
   * // Basic dot chart
   * ```typescript
   * const data = [
   *     { date: new Date("2023-01-01"), value: 10 },
   *     { date: new Date("2023-02-01"), value: 20 },
   *     { date: new Date("2023-03-01"), value: 30 },
   *     { date: new Date("2023-04-01"), value: 40 },
   * ]
   * table.loadArray(data)
   * table.convert({ date: "string" }, { datetimeFormat: "%x" })
   * await table.logDotChart("date", "value")
   * ```
   *
   * @example
   * // Dot chart with small multiples
   * ```typescript
   * const data = [
   *     { date: new Date("2023-01-01"), value: 10, category: "A" },
   *     { date: new Date("2023-02-01"), value: 20, category: "A" },
   *     { date: new Date("2023-03-01"), value: 30, category: "A" },
   *     { date: new Date("2023-04-01"), value: 40, category: "A" },
   *     { date: new Date("2023-01-01"), value: 15, category: "B" },
   *     { date: new Date("2023-02-01"), value: 25, category: "B" },
   *     { date: new Date("2023-03-01"), value: 35, category: "B" },
   *     { date: new Date("2023-04-01"), value: 45, category: "B" },
   * ]
   * table.loadArray(data)
   * table.convert({ date: "string" }, { datetimeFormat: "%x" })
   * await table.logDotChart("date", "value", {
   *     smallMultiples: "category",
   * })
   * ```
   */
  async logDotChart(
    x: string,
    y: string,
    options: {
      formatX?: (d: unknown) => string;
      formatY?: (d: number) => string;
      smallMultiples?: string;
      fixedScales?: boolean;
      smallMultiplesPerRow?: number;
      width?: number;
      height?: number;
    } = {},
  ): Promise<void> {
    const data = await this.getData({
      columns: Array.from(
        new Set([
          x,
          y,
          ...(typeof options.smallMultiples === "string"
            ? [options.smallMultiples]
            : []),
        ]),
      ),
    });
    logDotChart(data, x, y, options);
  }

  /**
   * Generates and logs a bar chart to the console.
   *
   * @param labels - The name of the column to be used for the labels (categories).
   * @param values - The name of the column to be used for the values.
   * @param options - An optional object with configuration options:
   * @param options.formatLabels - A function to format the labels. Defaults to converting the label to a string.
   * @param options.formatValues - A function to format the values. Defaults to converting the value to a string.
   * @param options.showPercentages - If `true`, displays the percentage each bar represents relative to the total. Defaults to `false`.
   * @param options.showTotal - If `true`, calculates and displays a total summary row. Defaults to `false`.
   * @param options.totalLabel - Allows customizing the label used for the total row. Defaults to "Total".
   * @param options.compact - Reduces vertical space in the logged output. Defaults to `false`.
   * @param options.width - The width of the chart in characters. Defaults to 40.
   * @returns A promise that resolves when the chart has been logged to the console.
   * @category Dataviz
   *
   * @example
   * ```typescript
   * const data = [
   *     { category: "A", value: 10 },
   *     { category: "B", value: 20 },
   * ]
   * table.loadArray(data)
   * await table.logBarChart("category", "value")
   * ```
   */
  async logBarChart(
    labels: string,
    values: string,
    options: {
      formatLabels?: (d: unknown) => string;
      formatValues?: (d: number) => string;
      showPercentages?: boolean;
      showTotal?: boolean;
      totalLabel?: string;
      compact?: boolean;
      width?: number;
    } = {},
  ): Promise<void> {
    const data = await this.getData({
      columns: Array.from(new Set([labels, values])),
    });
    logBarChart(data, labels, values, options);
  }

  /**
   * Generates and logs a histogram of a numeric column to the console.
   *
   * @param values - The name of the numeric column for which to generate the histogram.
   * @param options - An optional object with configuration options:
   * @param options.bins - The number of bins (intervals) to use for the histogram. Defaults to 10.
   * @param options.formatLabels - A function to format the labels for the histogram bins. It receives the lower and upper bounds of each bin as arguments.
   * @param options.compact - If `true`, the histogram will be displayed in a more compact format. Defaults to `false`.
   * @param options.width - The maximum width of the histogram bars in characters.
   * @returns A promise that resolves when the histogram has been logged to the console.
   * @category Dataviz
   *
   * @example
   * // Basic histogram of the 'temperature' column
   * ```typescript
   * await table.logHistogram("temperature")
   * ```
   *
   * @example
   * // Histogram with 20 bins and custom label formatting
   * ```typescript
   * await table.logHistogram("age", {
   *   bins: 20,
   *   formatLabels: (min, max) => `${min}-${max} years`,
   * });
   * ```
   */
  async logHistogram(
    values: string,
    options: {
      bins?: number;
      formatLabels?: (min: number, max: number) => string;
      compact?: boolean;
      width?: number;
    } = {},
  ): Promise<void> {
    await logHistogram(this, values, options);
  }
}
