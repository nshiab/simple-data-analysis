import type { SimpleTable } from "../index.ts";
import {
  type EmbeddingOptions,
  snapshotAIOptions,
} from "../helpers/aiOptions.ts";
import ensureEmbeddingColumn from "../helpers/ensureEmbeddingColumn.ts";
import { queueAsyncBarrier } from "@nshiab/simple-data-analysis-core/helpers";

/**
 * Options for generating an embedding column.
 *
 * @example
 * ```ts
 * const options: AIEmbeddingsOptions = {
 *   embeddings: { provider: "ollama" },
 *   concurrent: 4,
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
  concurrent?: number;
  /** Logs embedding progress and index creation when enabled. */
  verbose?: boolean;
  /** Maximum request rate used to calculate delays between batches. */
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

async function runAIEmbeddings(
  simpleTable: SimpleTable,
  column: string,
  newColumn: string,
  options: AIEmbeddingsOptions,
): Promise<void> {
  const { getEmbeddingIdentity } = await import("@nshiab/journalism-ai");
  const identity = getEmbeddingIdentity(options.embeddings);
  const embeddingStatus = await ensureEmbeddingColumn(
    simpleTable,
    column,
    newColumn,
    identity,
    () => generateEmbeddingColumn(simpleTable, column, newColumn, options),
  );

  if (options.verbose && embeddingStatus === "reused") {
    console.log(
      `${newColumn} in table ${simpleTable.name} has compatible provenance. Reusing embeddings...`,
    );
  }

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
 * @param simpleTable Table containing the source rows.
 * @param column Text column to embed.
 * @param newColumn Column that receives the generated vectors.
 * @param options Embedding generation and concurrency options.
 * @returns A promise that resolves after every row has been embedded.
 *
 * @example
 * ```ts
 * await generateEmbeddingColumn(table, "text", "text_embeddings", {
 *   embeddings: { provider: "ollama", model: "nomic-embed-text" },
 * });
 * ```
 *
 * @internal
 */
export async function generateEmbeddingColumn(
  simpleTable: SimpleTable,
  column: string,
  newColumn: string,
  options: AIEmbeddingsOptions = {},
): Promise<void> {
  await simpleTable.updateWithJS(async (rows) => {
    const [{ formatNumber }, { default: sleep }, { default: tryEmbedding }] =
      await Promise.all([
        import("@nshiab/journalism-format"),
        import("../helpers/sleep.ts"),
        import("../helpers/tryEmbedding.ts"),
      ]);
    if (options.verbose) {
      console.log("\naiEmbeddings()");
    }

    const concurrent = options.concurrent ?? 1;

    let requests = [];
    for (let i = 0; i < rows.length; i++) {
      if (options.verbose) {
        console.log(
          `Processing row ${i + 1} of ${rows.length}... (${
            formatNumber(
              (i + 1) / rows.length * 100,
              {
                significantDigits: 3,
                suffix: "%",
              },
            )
          })`,
        );
      }

      if (requests.length < concurrent) {
        const text = rows[i][column];
        if (typeof text !== "string") {
          throw new Error(
            `The column "${column}" must be a string. Found ${text} instead.`,
          );
        }
        requests.push(
          tryEmbedding(i, rows, text, newColumn, options),
        );
      }

      if (requests.length === concurrent || i + 1 >= rows.length) {
        const start = new Date();
        await Promise.all(requests);
        const end = new Date();

        const duration = end.getTime() - start.getTime();
        // If duration is less than 10ms per request, it should means data comes from cache and we don't need to wait
        if (
          typeof options.rateLimitPerMinute === "number" &&
          duration > 10 * requests.length && i + 1 < rows.length
        ) {
          const delay = Math.round(
            (60 / (options.rateLimitPerMinute / concurrent)) * 1000,
          );
          await sleep(delay, { start, log: options.verbose });
        }

        requests = [];
      }
    }

    return rows;
  });
}
