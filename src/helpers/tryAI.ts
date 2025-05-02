import { askAI } from "@nshiab/journalism";

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
    retry?: number;
    model?: string;
    apiKey?: string;
    vertex?: boolean;
    project?: string;
    location?: string;
    verbose?: boolean;
    rateLimitPerMinute?: number;
  } = {},
) {
  const batch = rows.slice(i, i + batchSize);
  const fullPrompt = `${prompt}\nHere are the ${column} values as a list:\n${
    JSON.stringify(batch.map((d) => d[column]))
  }\nReturn the results in a list as well. It's critical you return the same number of items, which is ${batch.length}, exactly in the same order.`;

  const retry = options.retry ?? 1;

  let testPassed = false;
  let iterations = 1;
  let newValues: (string | number | boolean | Date | null)[] = [];
  while (!testPassed && iterations <= retry) {
    try {
      // Types could be improved
      newValues = await askAI(
        fullPrompt,
        {
          ...options,
          returnJson: true,
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
          },
        },
      ) as (string | number | boolean | Date | null)[];

      testPassed = true;
    } catch (e: unknown) {
      if (iterations < retry) {
        console.log(
          `Error: the AI didn't return the expected number of items.\nRetrying... (${iterations}/${retry})`,
        );
        iterations++;
      } else {
        console.log(
          `Error: the AI didn't return the expected number of items.\nNo more retries left. (${iterations}/${retry}).`,
        );
        throw e;
      }
    }
  }

  for (let j = 0; j < newValues.length; j++) {
    rows[i + j][newColumn] = newValues[j];
  }
}
