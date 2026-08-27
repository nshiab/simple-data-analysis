import { formatNumber } from "@nshiab/journalism-format";
import sleep from "../helpers/sleep.ts";
import type { SimpleTable } from "../index.ts";
import tryAI from "../helpers/tryAI.ts";
import { stringToArray } from "@nshiab/simple-data-analysis-core/helpers";
import type {
  AIRequestMetrics,
  GenerationOptions,
} from "../helpers/aiOptions.ts";
import { snapshotAIOptions } from "../helpers/aiOptions.ts";

/**
 * Options for applying a generation model to table rows.
 *
 * @example
 * ```ts
 * const options: AIRowByRowOptions = {
 *   generation: { provider: "gemini" },
 *   batchSize: 10,
 * };
 * ```
 */
export type AIRowByRowOptions = {
  /** Provider-specific generation options, or options for the environment-selected provider. */
  generation?: GenerationOptions;
  /** Number of rows sent in each request. */
  batchSize?: number;
  /** Maximum number of requests processed concurrently. */
  concurrent?: number;
  /** Validates each processed result and throws to trigger a retry. */
  test?: (result: { [key: string]: unknown }) => void;
  /** Number of retries after a request or validation failure. */
  retry?: number;
  /** Logs prompts, progress, and provider responses when enabled. */
  verbose?: boolean;
  /** Maximum request rate used to calculate delays between batches. */
  rateLimitPerMinute?: number;
  /** Transforms a parsed response before validation and storage. */
  clean?: (response: unknown) => unknown;
  /** Additional instructions appended to the row-processing prompt. */
  extraInstructions?: string;
  /** Mutable aggregate request metrics updated after each provider response. */
  metrics?: AIRequestMetrics;
};

export default function aiRowByRow(
  simpleTable: SimpleTable,
  column: string,
  newColumn: string | string[],
  prompt: string,
  options: AIRowByRowOptions = {},
): void {
  const newColumns = [...stringToArray(newColumn)];
  options = snapshotAIOptions(options);

  simpleTable.updateWithJS(async (rows) => {
    if (options.verbose) {
      console.log("\naiRowByRow()");
    }

    const batchSize = options.batchSize ?? 1;
    const concurrent = options.concurrent ?? 1;

    let requests = [];
    let requestsNb = 1;
    for (let i = 0; i < rows.length; i += batchSize) {
      if (options.verbose) {
        console.log(
          `\nRequest ${requestsNb} - Processing rows ${i + 1} to ${
            Math.min(
              i + batchSize,
              rows.length,
            )
          }... (${
            formatNumber(
              (Math.min(
                i + batchSize,
                rows.length,
              )) / rows.length * 100,
              {
                significantDigits: 3,
                suffix: "%",
              },
            )
          })`,
        );
        requestsNb++;
      }

      if (requests.length < concurrent) {
        requests.push(
          tryAI(
            i,
            batchSize,
            rows,
            column,
            newColumns,
            prompt,
            options,
          ),
        );
      }

      if (requests.length === concurrent || i + batchSize >= rows.length) {
        const start = new Date();
        await Promise.all(requests);
        const end = new Date();

        const duration = end.getTime() - start.getTime();
        // If duration is less than 10ms per request, it should means data comes from cache and we don't need to wait
        if (
          typeof options.rateLimitPerMinute === "number" &&
          duration > 10 * requests.length && i + batchSize < rows.length
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
