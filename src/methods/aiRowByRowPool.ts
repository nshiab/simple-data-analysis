import type SimpleTable from "../class/SimpleTable.ts";
import askAI from "../helpers/askAI.ts";
import processAIRowsResponse from "../helpers/processAIRowsResponse.ts";
import runAIRequestPool from "../helpers/runAIRequestPool.ts";
import { array, object, string, toJSONSchema } from "zod";

type AIRow = { [key: string]: unknown };

export default async function aiRowByRowPool(
  table: SimpleTable,
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
    test?: (result: AIRow) => void;
    retry?: number;
    retryCheck?: (error: unknown) => Promise<boolean> | boolean;
    extraInstructions?: string;
    minRequestDurationMs?: number;
    clean?: (response: unknown) => unknown;
    thinkingLevel?: "minimal" | "low" | "medium" | "high";
    webSearch?: boolean;
    safetyEnabled?: boolean;
    schemaJson?: unknown;
    model?: string;
    apiKey?: string;
    vertex?: boolean;
    project?: string;
    location?: string;
    metrics?: {
      totalCost: number;
      totalInputTokens: number;
      totalOutputTokens: number;
      totalRequests: number;
    };
  },
) {
  const newColumns = Array.isArray(newColumn) ? newColumn : [newColumn];

  await table.updateWithJS(async (rows) => {
    if (options.verbose) {
      console.log("\naiRowByRowPool()");
    }

    const batches: AIRow[][] = [];
    for (let i = 0; i < rows.length; i += options.batchSize ?? 1) {
      batches.push(rows.slice(i, i + (options.batchSize ?? 1)));
    }

    const requests = batches.map((batch) => {
      const schemaJson = options.schemaJson ?? toJSONSchema(array(object(
        Object.fromEntries(newColumns.map((name) => [name, string()])),
      )));
      const systemPrompt =
        `You will be provided with a JSON array of ${batch.length} string items. You must return a JSON array containing exactly ${batch.length} objects, in the same corresponding order.`;
      const batchPrompt =
        `${prompt}\n\nHere are the ${column} values as a JSON array:\n${
          JSON.stringify(batch.map((row) => row[column]), null, 2)
        }\n\n${
          options.extraInstructions ? `\n${options.extraInstructions}` : ""
        }`;

      if (options.verbose) {
        console.log(`\nPrompt:\n${batchPrompt}`);
      }

      return {
        prompt: batchPrompt,
        systemPrompt,
        schemaJson,
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
          provider: "gemini",
          systemPrompt: request.systemPrompt,
          cache: options.cache,
          schemaJson: request.schemaJson,
          webSearch: options.webSearch,
          model: options.model,
          thinkingLevel: options.thinkingLevel,
          safetyEnabled: options.safetyEnabled,
          apiKey: options.apiKey,
          vertex: options.vertex,
          project: options.project,
          location: options.location,
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
