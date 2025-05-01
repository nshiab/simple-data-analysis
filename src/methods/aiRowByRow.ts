import { askAI, formatNumber, prettyDuration, sleep } from "@nshiab/journalism";
import type { SimpleTable } from "../index.ts";

export default async function aiRowByRow(
  simpleTable: SimpleTable,
  column: string,
  newColumn: string,
  prompt: string,
  options: {
    batchSize?: number;
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
  await simpleTable.updateWithJS(async (rows) => {
    if (options.verbose) {
      console.log("\naiRowByRow()");
    }

    const batchSize = options.batchSize ?? 1;

    for (let i = 0; i < rows.length; i += batchSize) {
      options.verbose &&
        console.log(
          `\n${Math.min(i + batchSize, rows.length)}/${rows.length} | ${
            formatNumber(
              (Math.min(i + batchSize, rows.length)) / rows.length * 100,
              {
                significantDigits: 3,
                suffix: "%",
              },
            )
          }`,
        );
      const batch = rows.slice(i, i + batchSize);
      const fullPrompt = `${prompt}\nHere are the ${column} values as a list: ${
        JSON.stringify(batch.map((d) => d[column]))
      }\nReturn the results in a list as well. It's critical you return the same number of items, exactly in the same order.`;

      if (options.verbose) {
        console.log("\nPrompt:");
        console.log(fullPrompt);
      }

      const start = new Date();

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
                    `The AI returned ${response.length} values, but the batch size is ${batchSize}.`,
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

      const end = new Date();

      if (options.verbose) {
        console.log("\nResponse:", newValues);
      }

      for (let j = 0; j < newValues.length; j++) {
        rows[i + j][newColumn] = newValues[j];
      }

      if (typeof options.rateLimitPerMinute === "number") {
        const delay = Math.round((60 / options.rateLimitPerMinute) * 1000) -
          (end.getTime() - start.getTime());
        if (delay > 0) {
          if (options.verbose) {
            console.log(
              `Waiting ${
                prettyDuration(0, { end: delay })
              } to respect rate limit...`,
            );
          }
          await sleep(delay);
        }
      }
    }

    return rows;
  });
}
