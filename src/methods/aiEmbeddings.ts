import { camelCase, formatNumber, sleep } from "@nshiab/journalism";
import type { SimpleTable } from "../index.ts";
import tryEmbedding from "../helpers/tryEmbedding.ts";

export default async function aiEmbeddings(
  simpleTable: SimpleTable,
  column: string,
  newColumn: string,
  options: {
    createIndex?: boolean;
    concurrent?: number;
    cache?: boolean;
    model?: string;
    apiKey?: string;
    vertex?: boolean;
    project?: string;
    location?: string;
    ollama?: boolean;
    verbose?: boolean;
    rateLimitPerMinute?: number;
  } = {},
) {
  await simpleTable.updateWithJS(async (rows) => {
    if (options.verbose) {
      console.log("\naiEmbeddings()");
    }

    const concurrent = options.concurrent ?? 1;

    let requests = [];
    for (let i = 0; i < rows.length; i++) {
      if (options.verbose) {
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
      }

      if (requests.length < concurrent) {
        const text = rows[i][column];
        if (typeof text !== "string") {
          throw new Error(
            `The column "${column}" must be a string. Found ${text} instead.`,
          );
        }
        requests.push(
          tryEmbedding(i, rows, text, newColumn, options),
        );
      }

      if (requests.length === concurrent || i + 1 >= rows.length) {
        const start = new Date();
        await Promise.all(requests);
        const end = new Date();

        const duration = end.getTime() - start.getTime();
        // If duration is less than 10ms per request, it should means data comes from cache and we don't need to wait
        if (
          typeof options.rateLimitPerMinute === "number" &&
          duration > 10 * requests.length && i + 1 < rows.length
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

  if (options.createIndex) {
    options.verbose &&
      console.log(
        `\nCreating index on "${newColumn}" column...`,
      );
    await simpleTable.sdb.customQuery(
      `INSTALL vss; LOAD vss;
    CREATE INDEX vss_cosine_index${
        camelCase(simpleTable.name)
      } ON "${simpleTable.name}" USING HNSW ("${newColumn}") WITH (metric = 'cosine');`,
    );
    simpleTable.indexes.push(
      `vss_cosine_index${camelCase(simpleTable.name)}`,
    );
  }
}
