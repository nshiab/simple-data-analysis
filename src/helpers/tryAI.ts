import { askAI } from "@nshiab/journalism";
import type { Ollama } from "ollama";

export default async function tryAI(
  i: number,
  batchSize: number,
  rows: {
    [key: string]: string | number | boolean | Date | null;
  }[],
  column: string,
  newColumn: string,
  prompt: string,
  options: {
    batchSize?: number;
    concurrent?: number;
    cache?: boolean;
    test?: (response: unknown) => void;
    retry?: number;
    model?: string;
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
    extraInstructions?: string;
    metrics?: {
      totalCost: number;
      totalInputTokens: number;
      totalOutputTokens: number;
      totalRequests: number;
    };
  } = {},
) {
  const batch = rows.slice(i, i + batchSize);
  const fullPrompt = batch.length === 1
    ? `${prompt}\nHere is the ${column} value:\n${
      JSON.stringify(batch[0][column])
    }\nYou must return your result as a string. Do not return an object.${
      options.extraInstructions ? `\n${options.extraInstructions}` : ""
    }`
    : `${prompt}\nHere are the ${column} values as a JSON array:\n${
      JSON.stringify(batch.map((d) => d[column]))
    }\nReturn your results in a JSON array as well. It's critical you return the same number of items, which is ${batch.length}, exactly in the same order.${
      options.extraInstructions ? `\n${options.extraInstructions}` : ""
    }`;

  const retry = options.retry ?? 1;

  let testPassed = false;
  let iterations = 1;
  let newValues: (string | number | boolean | Date | null)[] = [];
  while (!testPassed && iterations <= retry) {
    try {
      // Types could be improved
      newValues = await askAI(
        `${fullPrompt}${
          iterations > 1
            ? `\nThis is your attempt #${iterations}. So get it right by following my instructions closely!`
            : ""
        }`,
        {
          ...options,
          returnJson: true,
          test: batch.length === 1
            ? (response: unknown) => {
              if (typeof response !== "string") {
                throw new Error(
                  `The AI returned a non-string value: ${
                    JSON.stringify(response)
                  }`,
                );
              }
              if (options.test) {
                options.test(response);
              }
            }
            : (response: unknown) => {
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
              if (options.test) {
                for (const item of response) {
                  options.test(item);
                }
              }
            },
        },
      ) as (string | number | boolean | Date | null)[];

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

  if (batch.length === 1) {
    rows[i][newColumn] = newValues as unknown as string;
  } else {
    for (let j = 0; j < newValues.length; j++) {
      rows[i + j][newColumn] = newValues[j];
    }
  }
}
