import type SimpleTable from "../class/SimpleTable.ts";
import askAI from "../helpers/askAI.ts";
import buildAIRowsRequest from "../helpers/buildAIRowsRequest.ts";
import processAIRowsResponse from "../helpers/processAIRowsResponse.ts";
import runAIRequestPool from "../helpers/runAIRequestPool.ts";
import type {
  AIRequestMetrics,
  GenerationOptions,
} from "../helpers/aiOptions.ts";
import { snapshotAIOptions } from "../helpers/aiOptions.ts";

type AIRow = { [key: string]: unknown };

/**
 * Options for pool-based AI row processing.
 *
 * @example
 * ```ts
 * const options: AIRowByRowPoolOptions = {
 *   generation: { provider: "ollama" },
 *   batchSize: 10,
 *   retry: 2,
 * };
 * ```
 */
export type AIRowByRowPoolOptions = {
  /** Provider-specific generation options, or options for the environment-selected provider. */
  generation?: GenerationOptions;
  /** Number of rows sent in each request. */
  batchSize?: number;
  /** Logs pool progress when enabled. */
  logProgress?: boolean;
  /** Logs prompts and provider responses when enabled. */
  verbose?: boolean;
  /** Validates each processed result and throws to trigger a retry. */
  test?: (result: AIRow) => void;
  /** Number of retries after a request or validation failure. */
  retry?: number;
  /** Decides whether a failed request should be retried. */
  retryCheck?: (error: unknown) => Promise<boolean> | boolean;
  /** Additional instructions appended to the row-processing prompt. */
  extraInstructions?: string;
  /** Minimum duration allocated to each pooled request. */
  minRequestDurationMs?: number;
  /** Transforms a parsed response before validation and storage. */
  clean?: (response: unknown) => unknown;
  /** Mutable aggregate request metrics updated after each provider response. */
  metrics?: AIRequestMetrics;
};

export default function aiRowByRowPool(
  table: SimpleTable,
  column: string,
  newColumn: string | string[],
  errorColumn: string,
  prompt: string,
  poolSize: number,
  options: AIRowByRowPoolOptions,
): void {
  const newColumns = Array.isArray(newColumn) ? [...newColumn] : [newColumn];
  options = snapshotAIOptions(options);

  table.updateWithJS(async (rows) => {
    if (options.verbose) {
      console.log("\naiRowByRowPool()");
    }

    const batches: AIRow[][] = [];
    for (let i = 0; i < rows.length; i += options.batchSize ?? 1) {
      batches.push(rows.slice(i, i + (options.batchSize ?? 1)));
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
      requests.map((request) => () =>
        askAI<AIRow[]>(request.prompt, {
          generation: options.generation,
          systemPrompt: request.systemPrompt,
          schemaJson: request.schemaJson,
          metrics: options.metrics,
          verbose: options.verbose,
          processResponse: request.processResponse,
        })
      ),
      poolSize,
      {
        retry: options.retry,
        retryCheck: options.retryCheck,
        minRequestDurationMs: options.minRequestDurationMs,
        logProgress: options.logProgress,
      },
    );

    const newRows: AIRow[] = [];
    for (let i = 0; i < batches.length; i++) {
      const result = results[i];
      if (result) {
        for (let j = 0; j < result.length; j++) {
          newRows.push({
            ...batches[i][j],
            ...result[j],
            [errorColumn]: null,
          });
        }
        continue;
      }

      const error = errors[i];
      const errorMessage = error instanceof Error && error.message
        ? error.message
        : String(error);
      for (const row of batches[i]) {
        const emptyResult = Object.fromEntries(
          newColumns.map((name) => [name, null]),
        );
        newRows.push({
          ...row,
          ...emptyResult,
          [errorColumn]: errorMessage,
        });
      }
    }

    return newRows;
  });
}
