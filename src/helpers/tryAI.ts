import { askAI } from "@nshiab/journalism-ai";
import type { Ollama } from "ollama";
import { array, object, string, toJSONSchema } from "zod";

export default async function tryAI(
  i: number,
  batchSize: number,
  rows: {
    [key: string]: string | number | boolean | Date | null;
  }[],
  column: string,
  newColumns: string[],
  prompt: string,
  options: {
    batchSize?: number;
    concurrent?: number;
    cache?: boolean;
    test?: (result: { [key: string]: unknown }) => void;
    retry?: number;
    model?: string;
    temperature?: number;
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
    thinkingLevel?: "minimal" | "low" | "medium" | "high";
    webSearch?: boolean;
    extraInstructions?: string;
    schemaJson?: unknown;
    metrics?: {
      totalCost: number;
      totalInputTokens: number;
      totalOutputTokens: number;
      totalRequests: number;
    };
  } = {},
) {
  const batch = rows.slice(i, i + batchSize);

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

  const fullPrompt =
    `${prompt}\n\nHere are the ${column} values as a JSON array:\n${
      JSON.stringify(batch.map((d) => d[column]), null, 2)
    }\n\n${options.extraInstructions ? `\n${options.extraInstructions}` : ""}`;

  const retry = options.retry ?? 1;

  let testPassed = false;
  let iterations = 1;
  let newValues;
  while (!testPassed && iterations <= retry) {
    try {
      newValues = await askAI(
        `${fullPrompt}${
          iterations > 1
            ? `\nThis is your attempt #${iterations}. So get it right by following my instructions closely!`
            : ""
        }`,
        {
          ...options,
          includeThoughts: options.verbose ? true : false,
          systemPrompt: systemPrompt,
          schemaJson,
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

  // Types could be improved
  for (
    let j = 0;
    j <
      (newValues as {
        [key: string]: string | number | boolean | Date | null;
      }[]).length;
    j++
  ) {
    for (const newColumn of newColumns) {
      rows[i + j][newColumn] = (newValues as {
        [key: string]: string | number | boolean | Date | null;
      }[])[j][newColumn];
    }
  }
}
