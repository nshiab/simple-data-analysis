import type { SimpleTable } from "../index.ts";
import {
  type EmbeddingOptions,
  snapshotAIOptions,
} from "../helpers/aiOptions.ts";
import validateAIRequestOptions from "../helpers/validateAIRequestOptions.ts";
import ensureEmbeddingColumn from "../helpers/ensureEmbeddingColumn.ts";
import {
  queueAsyncBarrier,
  updateColumnsWithJS,
} from "@nshiab/simple-data-analysis-core/helpers";

/**
 * Options for generating an embedding column.
 *
 * @example
 * ```ts
 * const options: AIEmbeddingsOptions = {
 *   embeddings: { provider: "ollama" },
 *   concurrency: 4,
 * };
 * ```
 */
export type AIEmbeddingsOptions = {
  /** Provider-specific embedding options, or options for the environment-selected provider. */
  embeddings?: EmbeddingOptions;
  /** Creates a vector-similarity index on the generated column. */
  createIndex?: boolean;
  /** Replaces an existing vector-similarity index when creating one. */
  overwriteIndex?: boolean;
  /** Maximum number of embedding requests processed concurrently. */
  concurrency?: number;
  /**
   * Stores terminal request errors and null embeddings instead of throwing.
   * @example
   * ```ts
   * { errorColumn: "embedding_error" }
   * ```
   */
  errorColumn?: string;
  /**
   * Number of additional attempts after a request failure. Defaults to zero.
   * @example
   * ```ts
   * { retry: 2 }
   * ```
   */
  retry?: number;
  /**
   * Decides whether a failed request should be retried while attempts remain.
   * @example
   * ```ts
   * { retry: 2, retryCheck: (error) => error instanceof Error }
   * ```
   */
  retryCheck?: (error: unknown) => Promise<boolean> | boolean;
  /**
   * Logs completed request tasks, including failures and cache hits. Defaults to false.
   * @example
   * ```ts
   * { logProgress: true }
   * ```
   */
  logProgress?: boolean;
  /** Logs embedding progress and index creation when enabled. */
  verbose?: boolean;
  /** Maximum provider request starts per minute. Cache hits bypass pacing. */
  rateLimitPerMinute?: number;
  /** Candidate count used while constructing the vector index. */
  efConstruction?: number;
  /** Candidate count used while searching the vector index. */
  efSearch?: number;
  /** Maximum number of graph neighbors retained by the vector index. */
  M?: number;
};

export default function aiEmbeddings(
  simpleTable: SimpleTable,
  column: string,
  newColumn: string,
  options: AIEmbeddingsOptions = {},
): SimpleTable {
  options = snapshotAIOptions(options);
  queueAsyncBarrier(simpleTable, {
    method: "aiEmbeddings()",
    parameters: { column, newColumn },
    execute: () => runAIEmbeddings(simpleTable, column, newColumn, options),
  });
  return simpleTable;
}

function validateEmbeddingOptions(
  newColumn: string,
  options: AIEmbeddingsOptions,
): void {
  validateAIRequestOptions(options);
  if (
    options.retry !== undefined &&
    (!Number.isSafeInteger(options.retry) || options.retry < 0)
  ) {
    throw new Error("retry must be a non-negative safe integer.");
  }
  if (options.errorColumn?.toLowerCase() === newColumn.toLowerCase()) {
    throw new Error("errorColumn must differ from the embedding column.");
  }
}

async function runAIEmbeddings(
  simpleTable: SimpleTable,
  column: string,
  newColumn: string,
  options: AIEmbeddingsOptions,
): Promise<void> {
  validateEmbeddingOptions(newColumn, options);
  const { getEmbeddingIdentity } = await import("@nshiab/journalism-ai");
  const identity = getEmbeddingIdentity(options.embeddings);
  await ensureEmbeddingColumn(
    simpleTable,
    column,
    newColumn,
    identity,
    () => generateEmbeddingColumn(simpleTable, column, newColumn, options),
    { reuseExisting: false },
  );

  if (options.createIndex) {
    simpleTable.createVssIndex(newColumn, {
      overwrite: options.overwriteIndex,
      verbose: options.verbose,
      efConstruction: options.efConstruction,
      efSearch: options.efSearch,
      M: options.M,
    });
    await simpleTable.run();
  }
}

/**
 * Generates every vector in an embedding column without managing provenance.
 * Callers must wrap this operation with `ensureEmbeddingColumn`.
 *
 * @example
 * ```ts
 * await generateEmbeddingColumn(table, "text", "text_embeddings", {
 *   embeddings: { provider: "ollama", model: "nomic-embed-text" },
 * });
 * ```
 *
 * @param simpleTable Table containing the source rows.
 * @param column Text column to embed.
 * @param newColumn Column that receives the generated vectors.
 * @param options Embedding generation and concurrency options.
 * @returns A promise that resolves after every row has been embedded.
 * @internal
 */
export async function generateEmbeddingColumn(
  simpleTable: SimpleTable,
  column: string,
  newColumn: string,
  options: AIEmbeddingsOptions = {},
): Promise<void> {
  validateEmbeddingOptions(newColumn, options);
  const concurrency = options.concurrency ?? 1;
  const total = await simpleTable.getRowCount();
  const state = { nextRequestStart: 0, completed: 0, total };
  let processed = 0;
  if (options.verbose) console.log("\naiEmbeddings()");
  await updateColumnsWithJS(
    simpleTable,
    [column],
    options.errorColumn === undefined
      ? [newColumn]
      : [newColumn, options.errorColumn],
    async (rows) => {
      const [
        { formatNumber },
        { getEmbeddingForProvider },
        { default: runAIRequestPool },
      ] = await Promise.all([
        import("@nshiab/journalism-format"),
        import("../helpers/getEmbeddingForProvider.ts"),
        import("../helpers/runAIRequestPool.ts"),
      ]);
      const tasks = rows.map(
        (row, i) => async (beforeRequest: () => Promise<void>) => {
          const text = row[column];
          if (typeof text !== "string") {
            throw new Error(
              `The column "${column}" must be a string. Found ${text} instead.`,
            );
          }
          if (options.verbose) {
            console.log(
              `Processing row ${processed + i + 1} of ${total}... (${
                formatNumber(
                  (processed + i + 1) / total * 100,
                  { significantDigits: 3, suffix: "%" },
                )
              })`,
            );
          }
          return await getEmbeddingForProvider(
            text,
            options.embeddings,
            beforeRequest,
          );
        },
      );
      const { results, errors } = await runAIRequestPool(tasks, concurrency, {
        stopOnError: options.errorColumn === undefined,
        retry: options.retry,
        retryCheck: options.retryCheck,
        logProgress: options.logProgress,
        minRequestIntervalMs: options.rateLimitPerMinute === undefined
          ? undefined
          : 60_000 / options.rateLimitPerMinute,
        state,
      });
      processed += rows.length;
      return results.map((vector, i) => {
        if (vector !== undefined) {
          return {
            [newColumn]: vector,
            ...(options.errorColumn === undefined
              ? {}
              : { [options.errorColumn]: null }),
          };
        }
        if (options.errorColumn === undefined) {
          throw new Error("Missing embedding result.");
        }
        const error = errors[i];
        return {
          [newColumn]: null,
          [options.errorColumn]: error instanceof Error && error.message
            ? error.message
            : String(error),
        };
      });
    },
    { batchSize: 1000 },
  );
}
