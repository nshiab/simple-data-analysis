import askAI from "./askAI.ts";
import processAIRowsResponse from "./processAIRowsResponse.ts";
import type { AIRequestMetrics, GenerationOptions } from "./aiOptions.ts";
import buildAIRowsRequest from "./buildAIRowsRequest.ts";

export default async function tryAI(
  i: number,
  batchSize: number,
  rows: {
    [key: string]: unknown;
  }[],
  column: string,
  newColumns: string[],
  prompt: string,
  options: {
    batchSize?: number;
    concurrent?: number;
    test?: (result: { [key: string]: unknown }) => void;
    retry?: number;
    generation?: GenerationOptions;
    verbose?: boolean;
    rateLimitPerMinute?: number;
    clean?: (
      response: unknown,
    ) => unknown;
    extraInstructions?: string;
    metrics?: AIRequestMetrics;
  } = {},
) {
  const batch = rows.slice(i, i + batchSize);
  const request = buildAIRowsRequest(
    batch,
    column,
    newColumns,
    prompt,
    options,
  );

  const retry = options.retry ?? 1;

  let testPassed = false;
  let iterations = 1;
  let newValues;
  while (!testPassed && iterations <= retry) {
    try {
      newValues = await askAI<{ [key: string]: unknown }[]>(
        `${request.prompt}${
          iterations > 1
            ? `\nThis is your attempt #${iterations}. So get it right by following my instructions closely!`
            : ""
        }`,
        {
          generation: options.generation,
          metrics: options.metrics,
          verbose: options.verbose,
          includeThoughts: options.verbose ? true : false,
          systemPrompt: request.systemPrompt,
          schemaJson: request.schemaJson,
          processResponse: (rawResponse: unknown) =>
            processAIRowsResponse(
              rawResponse,
              batch.length,
              newColumns,
              options,
            ),
        },
      );

      testPassed = true;
    } catch (e: unknown) {
      if (iterations < retry) {
        console.log(
          `${console.log(e)}\nRetrying... (${iterations}/${retry})`,
        );
        iterations++;
      } else {
        console.log(
          `${console.log(e)}\nNo more retries left. (${iterations}/${retry}).`,
        );
        throw e;
      }
    }
  }

  if (!newValues) {
    throw new Error("The AI did not return any values.");
  }
  for (let j = 0; j < newValues.length; j++) {
    for (const newColumn of newColumns) {
      rows[i + j][newColumn] = newValues[j][newColumn];
    }
  }
}
