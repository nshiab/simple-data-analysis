import type SimpleTable from "../class/SimpleTable.ts";
import { askAIPool } from "@nshiab/journalism-ai";
import type { askAIRequest } from "@nshiab/journalism-ai";
import { array, object, string, toJSONSchema } from "zod";

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
    webSearch?: boolean;
    schemaJson?: unknown;
    model?: string;
    temperature?: number;
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

    const batches: { [key: string]: unknown }[][] = [];
    for (let i = 0; i < rows.length; i += options.batchSize ?? 1) {
      batches.push(
        rows.slice(i, i + (options.batchSize ?? 1)),
      );
    }

    const requests: askAIRequest[] = batches.map((batch) => {
      let schemaJson;
      if (options.schemaJson) {
        schemaJson = options.schemaJson;
      } else {
        const objectSchema: { [key: string]: unknown } = {};
        for (const newColumn of newColumns) {
          objectSchema[newColumn] = string();
        }
        schemaJson = toJSONSchema(array(
          object(objectSchema),
        ));
      }

      const systemPrompt =
        `You will be provided with a JSON array of ${batch.length} string items. You must return a JSON array containing exactly ${batch.length} objects, in the same corresponding order.`;

      const batchPrompt =
        `${prompt}\n\nHere are the ${column} values as a JSON array:\n${
          JSON.stringify(batch.map((d) => d[column]), null, 2)
        }\n\n${
          options.extraInstructions ? `\n${options.extraInstructions}` : ""
        }`;

      return {
        prompt: batchPrompt,
        options: {
          systemPrompt: systemPrompt,
          cache: options.cache,
          schemaJson,
          webSearch: options.webSearch,
          clean: options.clean,
          model: options.model,
          contextWindow: options.contextWindow,
          thinkingBudget: options.thinkingBudget,
          thinkingLevel: options.thinkingLevel,
          metrics: options.metrics,
          verbose: options.verbose,
          includeThoughts: options.includeThoughts,
          temperature: options.temperature,
          test: (response: unknown) => {
            if (!Array.isArray(response)) {
              throw new Error(
                `The AI returned a non-array value: ${
                  JSON.stringify(response)
                }`,
              );
            }
            if (response.length !== batch.length) {
              throw new Error(
                `The AI returned ${response.length} values, but the batch size is ${batch.length}.`,
              );
            }
            for (const item of response) {
              if (typeof item !== "object" || item === null) {
                throw new Error(
                  `The AI did not return an object: ${JSON.stringify(item)}`,
                );
              }
              for (const newColumn of newColumns) {
                if (!(newColumn in item)) {
                  throw new Error(
                    `The AI's response is missing the key '${newColumn}': ${
                      JSON.stringify(item)
                    }`,
                  );
                }
              }
            }
            if (options.test) {
              for (const item of response) {
                options.test(item as { [key: string]: unknown });
              }
            }
          },
        },
      };
    });

    const { results, errors } = await askAIPool(requests, poolSize, {
      retry: options.retry,
      retryCheck: options.retryCheck,
      minRequestDurationMs: options.minRequestDurationMs,
      logProgress: options.logProgress,
      metrics: options.metrics,
    });

    const resultsFlattened = results.map((d) => ({
      index: d.index,
      result: d.result,
      error: null,
    })).flat();

    const errorsFlattened = errors.map((d) => ({
      index: d.index,
      result: null,
      error: d.error instanceof Error && d.error.message
        ? d.error.message
        : String(d.error),
    })).flat();

    const resultsAndErrors = [...resultsFlattened, ...errorsFlattened].sort((
      a,
      b,
    ) => a.index - b.index);

    const newRows = [];
    for (let i = 0; i < batches.length; i++) {
      const resultOrError = resultsAndErrors[i];
      if (resultOrError.result) {
        if (Array.isArray(resultOrError.result)) {
          for (let j = 0; j < resultOrError.result.length; j++) {
            newRows.push({
              ...batches[i][j],
              ...resultOrError.result[j],
              [errorColumn]: null,
            });
          }
        } else if (
          typeof resultOrError.result === "object" &&
          resultOrError.result !== null
        ) {
          newRows.push({
            ...batches[i][0],
            ...resultOrError.result,
            [errorColumn]: null,
          });
        } else {
          throw new Error(
            `Unexpected result format: ${JSON.stringify(resultOrError.result)}`,
          );
        }
      } else if (resultOrError.error) {
        for (const row of batches[i]) {
          const obj: { [key: string]: unknown } = {
            [errorColumn]: resultOrError.error,
          };
          for (const newColumn of newColumns) {
            obj[newColumn] = null;
          }
          newRows.push({
            ...row,
            ...obj,
          });
        }
      }
    }

    return newRows;
  });
}
