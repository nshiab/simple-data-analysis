import { SimpleTable as SimpleTableCore } from "@nshiab/simple-data-analysis-core";
import type SimpleDB from "./SimpleDB.ts";
import {
  logBarChart,
  logDotChart,
  logLineChart,
  rewind,
  saveChart,
} from "@nshiab/journalism-dataviz";
import { getSheetData, overwriteSheetData } from "@nshiab/journalism-google";
import type { Ollama } from "ollama";
import type { Data } from "@observablehq/plot";
import createDirectory from "../helpers/createDirectory.ts";
import logHistogram from "../methods/logHistogram.ts";
import aiRowByRow from "../methods/aiRowByRow.ts";
import aiRowByRowPool from "../methods/aiRowByRowPool.ts";
import aiEmbeddings from "../methods/aiEmbeddings.ts";
import aiVectorSimilarity from "../methods/aiVectorSimilarity.ts";
import hybridSearch from "../methods/hybridSearch.ts";
import aiRAG from "../methods/aiRAG.ts";
import aiQuery from "../methods/aiQuery.ts";

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
 * await employees.loadData("./employees.csv");
 *
 * // Log the first few rows of the "employees" table to the console
 * await employees.logTable();
 *
 * // Close the database connection and free up resources
 * await sdb.done();
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
 * await boundaries.loadGeoData("./boundaries.geojson");
 *
 * // Close the database connection
 * await sdb.done();
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
   * This method supports Google Gemini, Vertex AI, and local models running with Ollama. Credentials and model selection are determined by environment variables (`AI_KEY`, `AI_PROJECT`, `AI_LOCATION`, `AI_MODEL`) or directly via `options`, with `options` taking precedence.
   *
   * For Ollama, set the `OLLAMA` environment variable to `true`, ensure Ollama is running, and set `AI_MODEL` to your desired model name. You can also pass your instance of Ollama to the `ollama` option.
   *
   * To manage rate limits, use `batchSize` to process multiple rows per request and `rateLimitPerMinute` to introduce delays between requests. For higher rate limits (business/professional accounts), `concurrent` allows parallel requests.
   *
   * The `cache` option enables local caching of results in `.journalism-cache` (from the `askAI` function in the [journalism library](https://github.com/nshiab/journalism)). Remember to add `.journalism-cache` to your `.gitignore`.
   *
   * If the AI returns fewer items than expected in a batch, or if a custom `test` function fails, the `retry` option (a number greater than 0) will reattempt the request.
   *
   * Temperature is set to 0 for reproducibility, though consistency cannot be guaranteed.
   *
   * This method does not support tables containing geometries.
   *
   * @param column - The name of the column to be used as input for the AI prompt.
   * @param newColumn - The name of the new column (or an array of column names) where the AI's response will be stored.
   * @param prompt - The input string to guide the AI's response.
   * @param options - Configuration options for the AI request.
   * @param options.batchSize - The number of rows to process in each batch. Defaults to `1`.
   * @param options.concurrent - The number of concurrent requests to send. Defaults to `1`.
   * @param options.cache - If `true`, the results will be cached locally. Defaults to `false`.
   * @param options.test - A function to validate the returned data. If it throws an error, the request will be retried (if `retry` is set). Defaults to `undefined`.
   * @param options.retry - The number of times to retry the request in case of failure. Defaults to `0`.
   * @param options.rateLimitPerMinute - The rate limit for AI requests in requests per minute. The method will wait between requests if necessary. Defaults to `undefined` (no limit).
   * @param options.model - The AI model to use. Defaults to the `AI_MODEL` environment variable.
   * @param options.temperature - The temperature setting for the AI model, controlling the randomness of the output. Defaults to `0`.
   * @param options.apiKey - The API key for the AI service. Defaults to the `AI_KEY` environment variable.
   * @param options.vertex - If `true`, uses Vertex AI. Automatically set to `true` if `AI_PROJECT` and `AI_LOCATION` are set in the environment. Defaults to `false`.
   * @param options.project - The Google Cloud project ID for Vertex AI. Defaults to the `AI_PROJECT` environment variable.
   * @param options.location - The Google Cloud location for Vertex AI. Defaults to the `AI_LOCATION` environment variable.
   * @param options.ollama - If `true`, uses Ollama. Defaults to the `OLLAMA` environment variable. If you want your Ollama instance to be used, you can pass it here too.
   * @param options.verbose - If `true`, logs additional debugging information, including the full prompt sent to the AI. Defaults to `false`.
   * @param options.clean - A function to clean the AI's response after JSON parsing, testing, caching, and storing. Defaults to `undefined`.
   * @param options.contextWindow - An option to specify the context window size for Ollama models. By default, Ollama sets this depending on the model, which can be lower than the actual maximum context window size of the model.
   * @param options.thinkingBudget - Sets the reasoning token budget: 0 to disable (default, though some models may reason regardless), -1 for a dynamic budget, or > 0 for a fixed budget. For Ollama models, any non-zero value simply enables reasoning, ignoring the specific budget amount.
   * @param options.thinkingLevel - Sets the thinking level for reasoning: "minimal", "low", "medium", or "high", which some models expect instead of `thinkingBudget`. Takes precedence over `thinkingBudget` if both are provided. For Ollama models, any value enables reasoning.
   * @param options.safetyEnabled - Controls whether safety filters are enabled. If set to `true`, filters are active; if `false`, they are disabled. By default, this is `false` when using Vertex AI and `true` otherwise. This setting can be explicitly overridden for any model.
   * @param options.webSearch - (Gemini only) If `true`, enables web search grounding for the AI's responses. Be careful of extra costs. Defaults to `false`.
   * @param options.schemaJson - A Zod JSON schema object for structured output. This overrides the default schema based on the 'newColumn' names.
   * @param options.extraInstructions - Additional instructions to append to the prompt, providing more context or guidance for the AI.
   * @param options.metrics - An object to track cumulative metrics across multiple AI requests. Pass an object with totalCost, totalInputTokens, totalOutputTokens, and totalRequests properties (all initialized to 0). The function will update these values after each request. Note: totalCost is only calculated for Google GenAI models, not for Ollama.
   * @returns A promise that resolves when the AI processing is complete.
   * @category AI
   *
   * @example
   * ```ts
   * // New table with a "name" column.
   * await table.loadArray([
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
   *     cache: true, // Cache results locally
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
   * await table.loadArray([
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
   */
  async aiRowByRow(
    column: string,
    newColumn: string | string[],
    prompt: string,
    options: {
      batchSize?: number;
      concurrent?: number;
      cache?: boolean;
      test?: (result: { [key: string]: unknown }) => void;
      retry?: number;
      model?: string;
      temperature?: number;
      apiKey?: string;
      vertex?: boolean;
      project?: string;
      location?: string;
      ollama?: boolean | Ollama;
      verbose?: boolean;
      rateLimitPerMinute?: number;
      clean?: (
        response: unknown,
      ) => unknown;
      contextWindow?: number;
      thinkingBudget?: number;
      thinkingLevel?: "minimal" | "low" | "medium" | "high";
      safetyEnabled?: boolean;
      webSearch?: boolean;
      extraInstructions?: string;
      schemaJson?: unknown;
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
   * This method supports Google Gemini, Vertex AI, and local models running with Ollama. Credentials and model selection are determined by environment variables (`AI_KEY`, `AI_PROJECT`, `AI_LOCATION`, `AI_MODEL`).
   *
   * For Ollama, set the `OLLAMA` environment variable to `true`, ensure Ollama is running, and set `AI_MODEL` to your desired model name.
   *
   * The pool size controls how many concurrent AI requests can run simultaneously. The `batchSize` option processes multiple rows per request. For example, with `poolSize: 5` and `batchSize: 10`, up to 5 requests can run concurrently, each processing 10 rows.
   *
   * The `cache` option enables local caching of results in `.journalism-cache` (from the `askAI` function in the [journalism library](https://github.com/nshiab/journalism)). Remember to add `.journalism-cache` to your `.gitignore`.
   *
   * If the AI returns fewer items than expected in a batch, or if a custom `test` function fails, the `retry` option (a number greater than 0) will reattempt the request. The `retryCheck` function allows conditional retries based on error inspection.
   *
   * The `minRequestDurationMs` option sets a minimum duration for each request, useful for respecting rate limits when you know the allowed requests per time period.
   *
   * Temperature is set to 0 for reproducibility, though consistency cannot be guaranteed.
   *
   * This method does not support tables containing geometries.
   *
   * @param column - The name of the column to be used as input for the AI prompt.
   * @param newColumn - The name of the new column (or an array of column names) where the AI's response will be stored. If an error occurs for a row, the new column(s) for that row will be set to `NULL`.
   * @param errorColumn - The name of the column where error messages will be stored. Successful requests will have `NULL` in this column.
   * @param prompt - The input string to guide the AI's response.
   * @param poolSize - The number of concurrent AI requests to run simultaneously in the pool.
   * @param options - Configuration options for the AI request.
   * @param options.cache - If `true`, the results will be cached locally. Defaults to `false`.
   * @param options.batchSize - The number of rows to process in each batch. Defaults to `1`.
   * @param options.logProgress - If `true`, logs progress information during processing. Defaults to `false`.
   * @param options.verbose - If `true`, logs additional debugging information, including the full prompt sent to the AI. Defaults to `false`.
   * @param options.includeThoughts - If `true`, includes the AI model's reasoning process in the logged output when using models that support extended thinking. Only relevant when used with thinking-capable models. Defaults to `false`.
   * @param options.test - A function to validate the returned data. If it throws an error, the request will be retried (if `retry` is set). Defaults to `undefined`.
   * @param options.retry - The number of times to retry the request in case of failure. Defaults to `0`.
   * @param options.retryCheck - A function that receives an error and returns a boolean indicating whether to retry. Useful for conditional retries based on error type. Defaults to `undefined`.
   * @param options.extraInstructions - Additional instructions to append to the prompt, providing more context or guidance for the AI.
   * @param options.minRequestDurationMs - The minimum duration in milliseconds for each request. Useful for respecting rate limits. Defaults to `undefined` (no minimum).
   * @param options.clean - A function to clean the AI's response after JSON parsing, testing, caching, and storing. Defaults to `undefined`.
   * @param options.contextWindow - An option to specify the context window size for Ollama models. By default, Ollama sets this depending on the model, which can be lower than the actual maximum context window size of the model.
   * @param options.thinkingBudget - Sets the reasoning token budget: 0 to disable (default, though some models may reason regardless), -1 for a dynamic budget, or > 0 for a fixed budget. For Ollama models, any non-zero value simply enables reasoning, ignoring the specific budget amount.
   * @param options.thinkingLevel - Sets the thinking level for reasoning: "minimal", "low", "medium", or "high", which some models expect instead of `thinkingBudget`. Takes precedence over `thinkingBudget` if both are provided. For Ollama models, any value enables reasoning.
   * @param options.safetyEnabled - Controls whether safety filters are enabled. If set to `true`, filters are active; if `false`, they are disabled. By default, this is `false` when using Vertex AI and `true` otherwise. This setting can be explicitly overridden for any model.
   * @param options.webSearch - (Gemini only) If `true`, enables web search grounding for the AI's responses. Be careful of extra costs. Defaults to `false`.
   * @param options.schemaJson - A Zod JSON schema object for structured output. This overrides the default schema based on the 'newColumn' names.
   * @param options.model - The AI model to use. Defaults to the `AI_MODEL` environment variable.
   * @param options.temperature - The temperature setting for the AI model, controlling the randomness of the output. Defaults to `0`.
   * @param options.apiKey - The API key for the AI service. Defaults to the `AI_KEY` environment variable.
   * @param options.vertex - If `true`, uses Vertex AI. Automatically set to `true` if `AI_PROJECT` and `AI_LOCATION` are set in the environment. Defaults to `false`.
   * @param options.project - The Google Cloud project ID for Vertex AI. Defaults to the `AI_PROJECT` environment variable.
   * @param options.location - The Google Cloud location for Vertex AI. Defaults to the `AI_LOCATION` environment variable.
   * @param options.ollama - If `true`, uses Ollama. Defaults to the `OLLAMA` environment variable. If you want your Ollama instance to be used, you can pass it here too.
   * @param options.metrics - An object to track cumulative metrics across multiple AI requests. Pass an object with totalCost, totalInputTokens, totalOutputTokens, and totalRequests properties (all initialized to 0). The function will update these values after each request. Note: totalCost is only calculated for Google GenAI models, not for Ollama.
   * @returns A promise that resolves when the AI processing is complete.
   * @category AI
   *
   * @example
   * ```ts
   * // New table with a "review" column.
   * await table.loadArray([
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
   *     cache: true,
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
   * await table.loadArray([
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
   */
  async aiRowByRowPool(
    column: string,
    newColumn: string | string[],
    errorColumn: string,
    prompt: string,
    poolSize: number,
    options: {
      cache?: boolean;
      batchSize?: number;
      logProgress?: boolean;
      verbose?: boolean;
      includeThoughts?: boolean;
      test?: (result: { [key: string]: unknown }) => void;
      retry?: number;
      retryCheck?: (error: unknown) => Promise<boolean> | boolean;
      extraInstructions?: string;
      minRequestDurationMs?: number;
      clean?: (
        response: unknown,
      ) => unknown;
      contextWindow?: number;
      thinkingBudget?: number;
      thinkingLevel?: "minimal" | "low" | "medium" | "high";
      safetyEnabled?: boolean;
      webSearch?: boolean;
      schemaJson?: unknown;
      model?: string;
      temperature?: number;
      apiKey?: string;
      vertex?: boolean;
      project?: string;
      location?: string;
      ollama?: boolean | Ollama;
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
   * This method supports Google Gemini, Vertex AI, and local models running with Ollama. Credentials and model selection are determined by environment variables (`AI_KEY`, `AI_PROJECT`, `AI_LOCATION`, `AI_EMBEDDINGS_MODEL`) or directly via `options`, with `options` taking precedence.
   *
   * For Ollama, set the `OLLAMA` environment variable to `true`, ensure Ollama is running, and set `AI_EMBEDDINGS_MODEL` to your desired model name. You can also pass your instance of Ollama to the `ollama` option.
   *
   * To manage rate limits, use `rateLimitPerMinute` to introduce delays between requests. For higher rate limits (business/professional accounts), `concurrent` allows parallel requests.
   *
   * The `cache` option enables local caching of results in `.journalism-cache` (from the `getEmbedding` function in the [journalism library](https://github.com/nshiab/journalism)). Remember to add `.journalism-cache` to your `.gitignore`.
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
   * @param options.cache - If `true`, the results will be cached locally. Defaults to `false`.
   * @param options.rateLimitPerMinute - The rate limit for AI requests in requests per minute. The method will wait between requests if necessary. Defaults to `undefined` (no limit).
   * @param options.model - The AI model to use. Defaults to the `AI_EMBEDDINGS_MODEL` environment variable.
   * @param options.apiKey - The API key for the AI service. Defaults to the `AI_KEY` environment variable.
   * @param options.vertex - If `true`, uses Vertex AI. Automatically set to `true` if `AI_PROJECT` and `AI_LOCATION` are set in the environment. Defaults to `false`.
   * @param options.project - The Google Cloud project ID for Vertex AI. Defaults to the `AI_PROJECT` environment variable.
   * @param options.location - The Google Cloud location for Vertex AI. Defaults to the `AI_LOCATION` environment variable.
   * @param options.ollama - If `true`, uses Ollama. Defaults to the `OLLAMA` environment variable. If you want your Ollama instance to be used, you can pass it here too.
   * @param options.contextWindow - An option to specify the context window size for Ollama models. By default, Ollama sets this depending on the model, which can be lower than the actual maximum context window size of the model.
   * @param options.verbose - If `true`, logs additional debugging information. Defaults to `false`.
   * @returns A promise that resolves when the embeddings have been generated and stored.
   * @category AI
   *
   * @example
   * ```ts
   * // New table with a "food" column.
   * await table.loadArray([
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
   *   cache: true, // Cache results locally
   *   rateLimitPerMinute: 15, // Limit requests to 15 per minute
   *   createIndex: true, // Create an index on the new column for faster similarity searches
   *   verbose: true, // Log detailed information
   * });
   * ```
   */
  async aiEmbeddings(column: string, newColumn: string, options: {
    createIndex?: boolean;
    overwriteIndex?: boolean;
    concurrent?: number;
    cache?: boolean;
    model?: string;
    apiKey?: string;
    vertex?: boolean;
    project?: string;
    location?: string;
    ollama?: boolean | Ollama;
    verbose?: boolean;
    rateLimitPerMinute?: number;
    contextWindow?: number;
    efConstruction?: number;
    efSearch?: number;
    M?: number;
  } = {}): Promise<void> {
    await aiEmbeddings(this, column, newColumn, options);
  }

  /**
   * Creates an embedding from a specified text and returns the most similar text content based on their embeddings.
   * This method is useful for semantic search and text similarity tasks, computing cosine distance and sorting results by similarity.
   *
   * To create the embedding, this method supports Google Gemini, Vertex AI, and local models running with Ollama. Credentials and model selection are determined by environment variables (`AI_KEY`, `AI_PROJECT`, `AI_LOCATION`, `AI_EMBEDDINGS_MODEL`) or directly via `options`, with `options` taking precedence.
   *
   * For Ollama, set the `OLLAMA` environment variable to `true`, ensure Ollama is running, and set `AI_EMBEDDINGS_MODEL` to your desired model name. You can also pass your instance of Ollama to the `ollama` option.
   *
   * The `cache` option enables local caching of the specified text's embedding in `.journalism-cache` (from the `getEmbedding` function in the [journalism library](https://github.com/nshiab/journalism)). Remember to add `.journalism-cache` to your `.gitignore`.
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
   * @param options.cache - If `true`, the embedding of the input `text` will be cached locally. Defaults to `false`.
   * @param options.model - The AI model to use for generating the embedding. Defaults to the `AI_EMBEDDINGS_MODEL` environment variable.
   * @param options.apiKey - The API key for the AI service. Defaults to the `AI_KEY` environment variable.
   * @param options.vertex - If `true`, uses Vertex AI. Automatically set to `true` if `AI_PROJECT` and `AI_LOCATION` are set in the environment. Defaults to `false`.
   * @param options.project - The Google Cloud project ID for Vertex AI. Defaults to the `AI_PROJECT` environment variable.
   * @param options.location - The Google Cloud location for Vertex AI. Defaults to the `AI_LOCATION` environment variable.
   * @param options.ollama - If `true`, uses Ollama. Defaults to the `OLLAMA` environment variable. If you want your Ollama instance to be used, you can pass it here too.
   * @param options.verbose - If `true`, logs additional debugging information. Defaults to `false`.
   * @param options.contextWindow - An option to specify the context window size for Ollama models. By default, Ollama sets this depending on the model, which can be lower than the actual maximum context window size of the model.
   * @returns A promise that resolves to the SimpleTable instance containing the similarity search results.
   * @category AI
   *
   * @example
   * ```ts
   * // New table with a "food" column.
   * await table.loadArray([
   *   { food: "pizza" },
   *   { food: "sushi" },
   *   { food: "burger" },
   *   { food: "pasta" },
   *   { food: "salad" },
   *   { food: "tacos" }
   * ]);
   *
   * // Generate embeddings for the "food" column.
   * await table.aiEmbeddings("food", "embeddings", { cache: true });
   *
   * // Find the 3 most similar foods to "italian food" based on embeddings.
   * // We only want results with at least 60% similarity and we want to see the score.
   * const similarFoods = await table.aiVectorSimilarity(
   *   "italian food",
   *   "embeddings",
   *   3,
   *   {
   *     createIndex: true, // Create an index on the embeddings column for faster searches
   *     cache: true, // Cache the embedding of "italian food"
   *     minSimilarity: 0.6, // Filter out anything below 0.6 similarity
   *     similarityColumn: "score" // Add a new column named "score" with the similarity math
   *   }
   * );
   *
   * // Log the results
   * await similarFoods.logTable();
   * ```
   */
  async aiVectorSimilarity(
    text: string,
    column: string,
    nbResults: number,
    options: {
      createIndex?: boolean;
      overwriteIndex?: boolean;
      outputTable?: string;
      cache?: boolean;
      model?: string;
      apiKey?: string;
      vertex?: boolean;
      project?: string;
      location?: string;
      ollama?: boolean | Ollama;
      contextWindow?: number;
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
   * 1. Generates embeddings for the text column if they don't already exist
   * 2. Runs vector similarity search and BM25 text search in parallel
   * 3. Fuses the results using Reciprocal Rank Fusion to get the best matches
   * 4. Returns a new table with the top results ordered by relevance
   *
   * The embeddings are cached at two levels:
   * * At the table level, so renaming the table will invalidate the cache and regenerate embeddings. For often updated tables, you can pass a timestamp to the table name (e.g., `mytable_20240901`) to keep the cache valid until the next update.
   * * At the row level, so if the text content is different or not cached, the embedding will be generated and cached for that specific text. If the text content has been previously cached, the existing embedding will be reused, even if the table has been renamed (as long as the text content is unchanged).
   *
   * Also, the method creates the column `{columnText}_embeddings` to store the generated embeddings. If you wrote your DB to a file, and if the column already exists, it will reuse the existing embeddings column directly, before even checking the cache, since the DB file itself serves as a cache. Similarly, the embeddings and BM25 index are reused if they already exist.
   *
   * To delete the cache, simply remove the `.journalism-cache` and/or `.sda-cache` directories in your project or set the cache option to `false`. Remember to add `.journalism-cache` and `.sda-cache` to your `.gitignore`.
   *
   * This method supports Google Gemini, Vertex AI, and local models running with Ollama. Credentials and model selection are determined by environment variables (`AI_KEY`, `AI_PROJECT`, `AI_LOCATION`, `AI_EMBEDDINGS_MODEL`) or directly via `options`, with `options` taking precedence.
   *
   * For Ollama, set the `OLLAMA` environment variable to `true`, ensure Ollama is running, and set `AI_EMBEDDINGS_MODEL` to your desired model name. You can also pass your instance of Ollama.
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
   * @param options.cache - If `true`, embeddings will be cached locally. Defaults to `false`.
   * @param options.verbose - If `true`, logs additional debugging information. Defaults to `false`.
   * @param options.embeddingsModelContextWindow - An option to specify the context window size for the embeddings model when using Ollama. By default, Ollama sets this depending on the model, which can be lower than the actual maximum context window size of the model.
   * @param options.createIndex - If `true`, both vector and BM25 indexes will be created for faster retrieval. Defaults to `false`.
   * @param options.efConstruction - The number of candidate vertices to consider during index construction. Higher values result in more accurate indexes but increase build time. Defaults to 128.
   * @param options.efSearch - The number of candidate vertices to consider during search. Higher values result in more accurate searches but increase search time. Defaults to 64.
   * @param options.M - The maximum number of neighbors to keep for each vertex in the graph. Higher values result in more accurate indexes but increase build time and memory usage. Defaults to 16.
   * @param options.embeddingsModel - The model to use for generating embeddings. Defaults to the `AI_EMBEDDINGS_MODEL` environment variable.
   * @param options.ollamaEmbeddings - If `true`, forces the use of Ollama for embeddings generation. Defaults to `false`.
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
   * await table.loadData("recipes.parquet");
   *
   * // Perform hybrid search - replaces the current table with top 10 results
   * await table.hybridSearch(
   *   "buttery pastry for breakfast",
   *   "Dish", // Column with unique IDs
   *   "Recipe", // Column with text to search
   *   10, // Return top 10 results
   *   {
   *     cache: true, // Cache embeddings
   *     verbose: true, // Log debugging information
   *   }
   * );
   *
   * // Table now contains only the most relevant recipes
   * await table.logTable();
   * ```
   */
  async hybridSearch(
    query: string,
    columnId: string,
    columnText: string,
    nbResults: number,
    options: {
      cache?: boolean;
      verbose?: boolean;
      embeddingsModelContextWindow?: number;
      createIndex?: boolean;
      embeddingsModel?: string;
      ollamaEmbeddings?: boolean;
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
   * Also, the method creates the column `{columnText}_embeddings` to store the generated embeddings. If you wrote your DB to a file, and if the column already exists, it will reuse the existing embeddings column directly, before even checking the cache, since the DB file itself serves as a cache. Similarly, the embeddings and BM25 index are reused if they already exist.
   *
   * To delete the cache, simply remove the `.journalism-cache` and/or `.sda-cache` directories in your project or set the cache option to `false`. Remember to add `.journalism-cache` and `.sda-cache` to your `.gitignore`.
   *
   * This method supports Google Gemini, Vertex AI, and local models running with Ollama. Credentials and model selection are determined by environment variables (`AI_KEY`, `AI_PROJECT`, `AI_LOCATION`, `AI_MODEL`, `AI_EMBEDDINGS_MODEL`) or directly via `options`, with `options` taking precedence.
   *
   * For Ollama, set the `OLLAMA` environment variable to `true`, ensure Ollama is running, and set `AI_MODEL` and `AI_EMBEDDINGS_MODEL` to your desired model names. If you are using Google Gemini or Vertex AI for the LLM, you can still use Ollama embeddings via the `ollamaEmbeddings` option.
   *
   * The LLM temperature is set to 0 for reproducibility, though consistency cannot be guaranteed.
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
   * @param options.cache - If `true`, embeddings and LLM responses will be cached locally. Defaults to `false`.
   * @param options.verbose - If `true`, logs additional debugging information. Defaults to `false`.
   * @param options.includeThoughts - If `true`, includes the AI model's reasoning process in the logged output when using models that support extended thinking. Only relevant when used with thinking-capable models. Defaults to `false`.
   * @param options.systemPrompt - An option to overwrite the LLM system prompt.
   * @param options.modelContextWindow - An option to specify the context window size for the LLM model when using Ollama. By default, Ollama sets this depending on the model, which can be lower than the actual maximum context window size of the model.
   * @param options.embeddingsModelContextWindow - An option to specify the context window size for the embeddings model when using Ollama. By default, Ollama sets this depending on the model, which can be lower than the actual maximum context window size of the model.
   * @param options.thinkingBudget - Sets the reasoning token budget: 0 to disable (default, though some models may reason regardless), -1 for a dynamic budget, or > 0 for a fixed budget. For Ollama models, any non-zero value simply enables reasoning, ignoring the specific budget amount.
   * @param options.thinkingLevel - Sets the thinking level for reasoning: "minimal", "low", "medium", or "high", which some models expect instead of `thinkingBudget`. Takes precedence over `thinkingBudget` if both are provided. For Ollama models, any value enables reasoning.
   * @param options.safetyEnabled - Controls whether safety filters are enabled. If set to `true`, filters are active; if `false`, they are disabled. By default, this is `false` when using Vertex AI and `true` otherwise. This setting can be explicitly overridden for any model.
   * @param options.webSearch - (Gemini only) If `true`, enables web search grounding for the AI's responses. Be careful of extra costs. Defaults to `false`.
   * @param options.model - The LLM model to use for answering the query. Defaults to the `AI_MODEL` environment variable.
   * @param options.temperature - The temperature setting for the AI model, controlling the randomness of the output. Defaults to `0`.
   * @param options.apiKey - Your API key for the AI service. Defaults to the `AI_KEY` environment variable.
   * @param options.vertex - Set to `true` to use Vertex AI for authentication. Auto-enables if `AI_PROJECT` and `AI_LOCATION` are set. Defaults to `false`.
   * @param options.project - Your Google Cloud project ID. Defaults to the `AI_PROJECT` environment variable.
   * @param options.location - Your Google Cloud location for your project. Defaults to the `AI_LOCATION` environment variable.
   * @param options.ollama - If `true`, uses Ollama. Defaults to the `OLLAMA` environment variable. If you want your Ollama instance to be used, you can pass it here too.
   * @param options.metrics - An object to track cumulative metrics across multiple AI requests. Pass an object with totalCost, totalInputTokens, totalOutputTokens, and totalRequests properties (all initialized to 0). The function will update these values after each request. Note: totalCost is only calculated for Google GenAI models, not for Ollama.
   * @param options.embeddingsModel - The model to use for generating embeddings. Defaults to the `AI_EMBEDDINGS_MODEL` environment variable.
   * @param options.ollamaEmbeddings - If `true`, forces the use of Ollama for embeddings generation, even if Gemini or Vertex is used for the LLM. Defaults to `false`.
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
   * await table.loadData("recipes.parquet");
   *
   * // Ask a question using hybrid RAG (vector + BM25 search)
   * const answer = await table.aiRAG(
   *   "I want a buttery pastry for breakfast.",
   *   "Dish", // Column with unique IDs
   *   "Recipe", // Column with text to search
   *   10, // The 10 most relevant recipes passed to the LLM
   *   {
   *     cache: true, // Cache embeddings
   *     verbose: true, // Log debugging information and timings
   *   }
   * );
   *
   * console.log(answer);
   * // Example output: "I recommend croissants.
   * // They are a classic buttery pastry perfect for breakfast..."
   * ```
   */
  async aiRAG(
    query: string,
    columnId: string,
    columnText: string,
    nbResults: number,
    options: {
      cache?: boolean;
      verbose?: boolean;
      includeThoughts?: boolean;
      systemPrompt?: string;
      modelContextWindow?: number;
      embeddingsModelContextWindow?: number;
      createIndex?: boolean;
      thinkingBudget?: number;
      thinkingLevel?: "minimal" | "low" | "medium" | "high";
      webSearch?: boolean;
      safetyEnabled?: boolean;
      model?: string;
      temperature?: number;
      apiKey?: string;
      vertex?: boolean;
      project?: string;
      location?: string;
      ollama?: boolean | Ollama;
      metrics?: {
        totalCost: number;
        totalInputTokens: number;
        totalOutputTokens: number;
        totalRequests: number;
      };
      embeddingsModel?: string;
      ollamaEmbeddings?: boolean;
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
    } = {},
  ): Promise<string> {
    return await aiRAG(this, query, columnId, columnText, nbResults, options);
  }

  /**
   * Generates and executes a SQL query based on a prompt.
   * Additional instructions, such as column types, are automatically added to your prompt. Set `verbose` to `true` to see the full prompt.
   *
   * This method supports Google Gemini, Vertex AI, and local models running with Ollama. Credentials and model selection are determined by environment variables (`AI_KEY`, `AI_PROJECT`, `AI_LOCATION`, `AI_MODEL`) or directly via `options`, with `options` taking precedence.
   *
   * For Ollama, set the `OLLAMA` environment variable to `true`, ensure Ollama is running, and set `AI_MODEL` to your desired model name. You can also pass your instance of Ollama to the `ollama` option.
   *
   * Temperature is set to 0 to aim for reproducible results. For future consistency, it's recommended to copy the generated query and execute it manually using `await sdb.customQuery(query)` or to cache the query using the `cache` option.
   *
   * When `cache` is `true`, the generated query will be cached locally in `.journalism-cache` (from the `askAI` function in the [journalism library](https://github.com/nshiab/journalism)), saving resources and time. Remember to add `.journalism-cache` to your `.gitignore`.
   *
   * @param prompt - The input string to guide the AI in generating the SQL query.
   * @param options - Configuration options for the AI request.
   * @param options.extraInstructions - Additional instructions to append to the prompt, providing more context or guidance for the AI.
   * @param options.cache - If `true`, the generated query will be cached locally. Defaults to `false`.
   * @param options.model - The AI model to use. Defaults to the `AI_MODEL` environment variable.
   * @param options.apiKey - The API key for the AI service. Defaults to the `AI_KEY` environment variable.
   * @param options.vertex - If `true`, uses Vertex AI. Automatically set to `true` if `AI_PROJECT` and `AI_LOCATION` are set in the environment. Defaults to `false`.
   * @param options.project - The Google Cloud project ID for Vertex AI. Defaults to the `AI_PROJECT` environment variable.
   * @param options.location - The Google Cloud location for Vertex AI. Defaults to the `AI_LOCATION` environment variable.
   * @param options.ollama - If `true`, uses Ollama. Defaults to the `OLLAMA` environment variable. If you want your Ollama instance to be used, you can pass it here too.
   * @param options.contextWindow - An option to specify the context window size for Ollama models. By default, Ollama sets this depending on the model, which can be lower than the actual maximum context window size of the model.
   * @param options.thinkingBudget - Sets the reasoning token budget: 0 to disable (default, though some models may reason regardless), -1 for a dynamic budget, or > 0 for a fixed budget. For Ollama models, any non-zero value simply enables reasoning, ignoring the specific budget amount.
   * @param options.thinkingLevel - Sets the thinking level for reasoning: "minimal", "low", "medium", or "high", which some models expect instead of `thinkingBudget`. Takes precedence over `thinkingBudget` if both are provided. For Ollama models, any value enables reasoning.
   * @param options.temperature - The temperature setting for the AI model, controlling the randomness of the output. Defaults to `0`.
   * @param options.safetyEnabled - Controls whether safety filters are enabled. If set to `true`, filters are active; if `false`, they are disabled. By default, this is `false` when using Vertex AI and `true` otherwise. This setting can be explicitly overridden for any model.
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
   *     { cache: true, verbose: true }
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
   * const allEmployees = await table.getNbRows();
   * console.log(allEmployees); // All employees
   *
   * // New table contains only query results
   * const topEmployees = await results.getNbRows();
   * console.log(topEmployees); // 10
   * ```
   */
  async aiQuery(prompt: string, options: {
    extraInstructions?: string;
    cache?: boolean;
    model?: string;
    apiKey?: string;
    vertex?: boolean;
    project?: string;
    includeThoughts?: boolean;
    location?: string;
    ollama?: boolean | Ollama;
    contextWindow?: number;
    thinkingBudget?: number;
    thinkingLevel?: "minimal" | "low" | "medium" | "high";
    temperature?: number;
    safetyEnabled?: boolean;
    outputTable?: string;
    verbose?: boolean;
  } = {}): Promise<SimpleTable> {
    await aiQuery(this, prompt, options);

    if (typeof options.outputTable === "string") {
      return this.sdb.newTable(
        options.outputTable,
        structuredClone(this.projections),
      );
    } else {
      return this;
    }
  }

  // ===================== GOOGLE SHEETS METHODS =====================

  /**
   * Writes the table data to a Google Sheet.
   * This method uses the `overwriteSheetData` function from the [journalism library](https://jsr.io/@nshiab/journalism). Refer to its documentation for more details.
   *
   * By default, authentication is handled via environment variables (GOOGLE_PRIVATE_KEY and GOOGLE_SERVICE_ACCOUNT_EMAIL). Alternatively, you can use GOOGLE_APPLICATION_CREDENTIALS pointing to a service account JSON file. For detailed setup instructions, refer to the node-google-spreadsheet authentication guide: https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication.
   *
   * @param sheetUrl - The URL pointing to a specific Google Sheet (e.g., `"https://docs.google.com/spreadsheets/d/.../edit#gid=0"`).
   * @param options - An optional object with configuration options:
   * @param options.prepend - A string to prepend to the sheet data (e.g., a title or header).
   * @param options.lastUpdate - If `true`, adds a timestamp of the last update to the sheet.
   * @param options.timeZone - The time zone to use for the last update timestamp.
   * @param options.raw - If `true`, writes the data as raw values without formatting.
   * @param options.apiEmail - If your API email is stored under a different environment variable name, use this option to specify it.
   * @param options.apiKey - If your API key is stored under a different environment variable name, use this option to specify it.
   * @returns A promise that resolves when the data has been written to the sheet.
   * @category Exporting Data
   *
   * @example
   * ```ts
   * // Write the table data to a Google Sheet
   * await table.toSheet("https://docs.google.com/spreadsheets/d/.../edit#gid=0");
   * ```
   */
  async toSheet(sheetUrl: string, options: {
    prepend?: string;
    lastUpdate?: boolean;
    timeZone?:
      | "Canada/Atlantic"
      | "Canada/Central"
      | "Canada/Eastern"
      | "Canada/Mountain"
      | "Canada/Newfoundland"
      | "Canada/Pacific"
      | "Canada/Saskatchewan"
      | "Canada/Yukon";
    raw?: boolean;
    apiEmail?: string;
    apiKey?: string;
  } = {}): Promise<void> {
    await overwriteSheetData(await this.getData(), sheetUrl, options);
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
    await this.loadArray(await getSheetData(sheetUrl, options));
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
   * await table.loadArray(data);
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
    createDirectory(path);
    await saveChart(
      await this.getData(),
      chart as (data: Data) => SVGSVGElement | HTMLElement,
      path,
      options,
    );
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
   * await table.loadGeoData("./CanadianProvincesAndTerritories.geojson");
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
    createDirectory(path);
    options.rewind = options.rewind ?? true;
    await saveChart(
      rewind(
        await this.getGeoData(options.column, {
          rewind: false,
        }),
      ) as unknown as Data,
      map as unknown as (data: Data) => SVGSVGElement | HTMLElement,
      path,
      options,
    );
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
   * await table.loadArray(data)
   * await table.convert({ date: "string" }, { datetimeFormat: "%x" })
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
   * await table.loadArray(data)
   * await table.convert({ date: "string" }, { datetimeFormat: "%x" })
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
      formatY?: (d: unknown) => string;
      smallMultiples?: string;
      fixedScales?: boolean;
      smallMultiplesPerRow?: number;
      width?: number;
      height?: number;
    } = {},
  ): Promise<void> {
    const data = await this.sdb.customQuery(
      `SELECT "${x}", "${y}"${
        typeof options.smallMultiples === "string"
          ? `, "${options.smallMultiples}"`
          : ""
      } FROM "${this.name}"`,
      { returnDataFrom: "query", types: await this.getTypes() },
    );
    logLineChart(data as { [key: string]: unknown }[], x, y, options);
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
   * await table.loadArray(data)
   * await table.convert({ date: "string" }, { datetimeFormat: "%x" })
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
   * await table.loadArray(data)
   * await table.convert({ date: "string" }, { datetimeFormat: "%x" })
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
      formatY?: (d: unknown) => string;
      smallMultiples?: string;
      fixedScales?: boolean;
      smallMultiplesPerRow?: number;
      width?: number;
      height?: number;
    } = {},
  ): Promise<void> {
    const data = await this.sdb.customQuery(
      `SELECT "${x}", "${y}"${
        typeof options.smallMultiples === "string"
          ? `, "${options.smallMultiples}"`
          : ""
      } FROM "${this.name}"`,
      { returnDataFrom: "query", types: await this.getTypes() },
    );
    logDotChart(data as { [key: string]: unknown }[], x, y, options);
  }

  /**
   * Generates and logs a bar chart to the console.
   *
   * @param labels - The name of the column to be used for the labels (categories).
   * @param values - The name of the column to be used for the values.
   * @param options - An optional object with configuration options:
   * @param options.formatLabels - A function to format the labels. Defaults to converting the label to a string.
   * @param options.formatValues - A function to format the values. Defaults to converting the value to a string.
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
   * await table.loadArray(data)
   * await table.logBarChart("category", "value")
   * ```
   */
  async logBarChart(
    labels: string,
    values: string,
    options: {
      formatLabels?: (d: unknown) => string;
      formatValues?: (d: unknown) => string;
      width?: number;
    } = {},
  ): Promise<void> {
    const data = await this.sdb.customQuery(
      `SELECT "${labels}", "${values}" FROM "${this.name}"`,
      { returnDataFrom: "query" },
    );
    logBarChart(
      data as { [key: string]: unknown }[],
      labels,
      values,
      options,
    );
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
