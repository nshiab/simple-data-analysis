import type SimpleTable from "../class/SimpleTable.ts";
import type {
  AIRequestMetrics,
  GenerationOptions,
} from "../helpers/aiOptions.ts";
import { snapshotAIOptions } from "../helpers/aiOptions.ts";
import askAI from "../helpers/askAI.ts";
import buildAIRowsRequest from "../helpers/buildAIRowsRequest.ts";
import processAIRowsResponse from "../helpers/processAIRowsResponse.ts";
import runAIRequestPool from "../helpers/runAIRequestPool.ts";

type AIRow = { [key: string]: unknown };

/**
 * Options for applying a generation model to table rows.
 *
 * @example
 * ```ts
 * const options: AIRowByRowOptions = {
 *   generation: { provider: "gemini" },
 *   batchSize: 10,
 *   concurrent: 5,
 *   errorColumn: "error",
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
  /** Column used to store request errors instead of throwing them. */
  errorColumn?: string;
  /** Logs request-pool progress when enabled. */
  logProgress?: boolean;
  /** Validates each processed result and throws to trigger a retry. */
  test?: (result: { [key: string]: unknown }) => void;
  /** Number of retries after a request or validation failure. */
  retry?: number;
  /** Decides whether a failed request should be retried. */
  retryCheck?: (error: unknown) => Promise<boolean> | boolean;
  /** Logs prompts and provider responses when enabled. */
  verbose?: boolean;
  /** Maximum number of provider requests started per minute. Cached responses bypass this limit. */
  rateLimitPerMinute?: number;
  /** Transforms a parsed response before validation and storage. */
  clean?: (response: unknown) => unknown;
  /** Additional instructions appended to the row-processing prompt. */
  extraInstructions?: string;
  /** Mutable aggregate request metrics updated after each provider response. */
  metrics?: AIRequestMetrics;
};

export default function aiRowByRow(
  table: SimpleTable,
  column: string,
  newColumn: string | string[],
  prompt: string,
  options: AIRowByRowOptions = {},
): void {
  const newColumns = Array.isArray(newColumn) ? [...newColumn] : [newColumn];
  options = snapshotAIOptions(options);

  table.updateWithJS(async (rows) => {
    if (options.verbose) {
      console.log("\naiRowByRow()");
    }

    const batchSize = options.batchSize ?? 1;
    const concurrent = options.concurrent ?? 1;
    if (!Number.isInteger(batchSize) || batchSize < 1) {
      throw new Error("batchSize must be a positive integer.");
    }
    if (
      options.rateLimitPerMinute !== undefined &&
      (!Number.isFinite(options.rateLimitPerMinute) ||
        options.rateLimitPerMinute <= 0)
    ) {
      throw new Error("rateLimitPerMinute must be greater than 0.");
    }

    const batches: AIRow[][] = [];
    for (let i = 0; i < rows.length; i += batchSize) {
      batches.push(rows.slice(i, i + batchSize));
    }

    const requests = batches.map((batch) => {
      const request = buildAIRowsRequest(
        batch,
        column,
        newColumns,
        prompt,
        options,
      );

      if (options.verbose) {
        console.log(`\nPrompt:\n${request.prompt}`);
      }

      return {
        ...request,
        processResponse: (response: unknown) =>
          processAIRowsResponse(
            response,
            batch.length,
            newColumns,
            options,
          ),
      };
    });

    const { results, errors } = await runAIRequestPool(
      requests.map((request) => (beforeRequest) =>
        askAI<AIRow[]>(request.prompt, {
          generation: options.generation,
          systemPrompt: request.systemPrompt,
          schemaJson: request.schemaJson,
          metrics: options.metrics,
          verbose: options.verbose,
          processResponse: request.processResponse,
          beforeRequest,
        })
      ),
      concurrent,
      {
        retry: options.retry,
        retryCheck: options.retryCheck,
        minRequestIntervalMs: options.rateLimitPerMinute === undefined
          ? undefined
          : 60_000 / options.rateLimitPerMinute,
        logProgress: options.logProgress,
      },
    );

    if (options.errorColumn === undefined) {
      const error = errors.find((item) => item !== undefined);
      if (error !== undefined) {
        throw error;
      }
    }

    const newRows: AIRow[] = [];
    for (let i = 0; i < batches.length; i++) {
      const result = results[i];
      if (result !== undefined) {
        for (let j = 0; j < result.length; j++) {
          newRows.push({
            ...batches[i][j],
            ...result[j],
            ...(options.errorColumn === undefined
              ? {}
              : { [options.errorColumn]: null }),
          });
        }
        continue;
      }

      const error = errors[i];
      const errorMessage = error instanceof Error && error.message
        ? error.message
        : String(error);
      const emptyResult = Object.fromEntries(
        newColumns.map((name) => [name, null]),
      );
      for (const row of batches[i]) {
        newRows.push({
          ...row,
          ...emptyResult,
          [options.errorColumn as string]: errorMessage,
        });
      }
    }

    return newRows;
  });
}
