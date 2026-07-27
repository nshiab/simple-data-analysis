/**
 * @module
 *
 * The Simple Data Analysis Library
 *
 * To install the library with Deno, use:
 * ```bash
 * deno add jsr:@nshiab/simple-data-analysis
 * ```
 *
 * To install the library with Node.js, use:
 * ```bash
 * npx jsr add @nshiab/simple-data-analysis
 * ```
 *
 * To start, create a SimpleDB instance and then a SimpleTable from this instance:
 * ```ts
 * import { SimpleDB } from "@nshiab/simple-data-analysis";
 *
 * const sdb = new SimpleDB();
 * const table = sdb.newTable("myTable"); // This returns a SimpleTable instance
 * table.loadData("path/to/your/data.csv");
 *
 * // You can now perform various data analysis operations on the table.
 *
 * await sdb.done(); // Ensure to call done when you're finished.
 * ```
 */

export { default as SimpleDB } from "./class/SimpleDB.ts";
export { default as SimpleTable } from "./class/SimpleTable.ts";
export type {
  AIRequestMetrics,
  AskGeminiOptions,
  AskOllamaOptions,
  EmbeddingOptions,
  EnvironmentEmbeddingOptions,
  EnvironmentGenerationOptions,
  GeminiEmbeddingOptions,
  GeminiGenerationOptions,
  GenerationOptions,
  GetEmbeddingOptions,
  OllamaEmbeddingOptions,
  OllamaGenerationOptions,
  UnstructuredGenerationOptions,
} from "./helpers/aiOptions.ts";
export type { AIEmbeddingsOptions } from "./methods/aiEmbeddings.ts";
export type { AIQueryOptions } from "./methods/aiQuery.ts";
export type { AIRAGOptions } from "./methods/aiRAG.ts";
export type { AIRowByRowOptions } from "./methods/aiRowByRow.ts";
export type { AIRowByRowPoolOptions } from "./methods/aiRowByRowPool.ts";
export type { AIVectorSimilarityOptions } from "./methods/aiVectorSimilarity.ts";
export type {
  HybridSearchOptions,
  HybridSearchTimes,
} from "./methods/hybridSearch.ts";
