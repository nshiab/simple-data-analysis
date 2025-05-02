import { prettyDuration, sleep } from "@nshiab/journalism";
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
    const concurrent = options.concurrent ?? 1;

    let requests = [];
    for (let i = 0; i < rows.length; i += batchSize) {
      if (concurrent === 1) {
        const start = new Date();
        await tryAI(
          i,
          batchSize,
          rows,
          column,
          newColumn,
          prompt,
          options,
        );
        const end = new Date();

        const duration = end.getTime() - start.getTime();
        // If duration is less than 50ms, it means data comes from cache and we don't need to wait
        if (
          typeof options.rateLimitPerMinute === "number" && duration > 50
        ) {
          const delay = Math.round((60 / options.rateLimitPerMinute) * 1000) -
            duration;
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
      } else if (concurrent) {
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

          requests = [];

          const duration = end.getTime() - start.getTime();
          // If duration is less than 50ms, it means data comes from cache and we don't need to wait
          if (
            typeof options.rateLimitPerMinute === "number" && duration > 50
          ) {
            const delay = Math.round(
              (60 / (options.rateLimitPerMinute / concurrent)) * 1000,
            ) -
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
      }
    }

    return rows;
  });
}
