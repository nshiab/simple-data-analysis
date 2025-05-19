import { formatNumber, sleep } from "@nshiab/journalism";
import type { SimpleTable } from "../index.ts";
import tryAI from "../helpers/tryAI.ts";

export default async function aiRowByRow(
  simpleTable: SimpleTable,
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
    ollama?: boolean;
    verbose?: boolean;
    rateLimitPerMinute?: number;
    clean?: (
      response: unknown,
    ) => unknown;
  } = {},
) {
  await simpleTable.updateWithJS(async (rows) => {
    if (options.verbose) {
      console.log("\naiRowByRow()");
    }

    const batchSize = options.batchSize ?? 1;
    const concurrent = options.concurrent ?? 1;

    let requests = [];
    let requestsNb = 1;
    for (let i = 0; i < rows.length; i += batchSize) {
      if (options.verbose) {
        if (batchSize === 1) {
          console.log(
            `\nProcessing row ${i + 1} of ${rows.length}... (${
              formatNumber(
                (i + 1) / rows.length * 100,
                {
                  significantDigits: 3,
                  suffix: "%",
                },
              )
            })`,
          );
        } else {
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
      }

      if (requests.length < concurrent) {
        requests.push(
          tryAI(
            i,
            batchSize,
            rows,
            column,
            newColumn,
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
