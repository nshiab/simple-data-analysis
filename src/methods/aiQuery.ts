import askAI from "../helpers/askAI.ts";
import type { SimpleTable } from "../index.ts";
import { object, string, toJSONSchema } from "zod";
import type { UnstructuredGenerationOptions } from "../helpers/aiOptions.ts";
import { queueOp } from "@nshiab/simple-data-analysis-core/helpers";

/**
 * Options for generating and executing a SQL query.
 *
 * @example
 * ```ts
 * const options: AIQueryOptions = {
 *   generation: { provider: "gemini" },
 *   outputTable: "results",
 * };
 * ```
 */
export type AIQueryOptions = {
  /** Additional requirements appended to the SQL-generation prompt. */
  extraInstructions?: string;
  /** Generation options excluding `schemaJson`, which is owned by SDA. */
  generation?: UnstructuredGenerationOptions;
  /** Includes model thoughts in verbose logs when the provider returns them. */
  includeThoughts?: boolean;
  /** Writes results to a new table instead of replacing the current table. */
  outputTable?: string;
  /** Logs the request and provider response when enabled. */
  verbose?: boolean;
};

export default function aiQuery(
  simpleTable: SimpleTable,
  prompt: string,
  options: AIQueryOptions = {},
): SimpleTable {
  options = {
    ...options,
    generation: options.generation === undefined
      ? undefined
      : { ...options.generation },
  };
  const outputTable = options.outputTable === undefined
    ? simpleTable
    : simpleTable.sdb.newTable(options.outputTable);
  queueOp(outputTable, {
    kind: "asyncBarrier",
    method: "aiQuery()",
    parameters: { prompt, outputTable: options.outputTable },
    execute: () => runAIQuery(simpleTable, prompt, options),
  });
  return outputTable;
}

async function runAIQuery(
  simpleTable: SimpleTable,
  prompt: string,
  options: AIQueryOptions,
): Promise<void> {
  const tableName = options.outputTable ?? simpleTable.name;

  const p =
    `I have a SQL table named "${simpleTable.name}". The data is already in it with these columns:\n\n${
      JSON.stringify(await simpleTable.getTypes(), null, 2)
    }\n\nI want you to give me a SQL query to do this:\n- ${prompt}\nThe query must ${
      options.outputTable
        ? `create a new table named "${tableName}" with the results`
        : `replace the existing "${simpleTable.name}" table`
    }. This means the query must start with 'CREATE OR REPLACE TABLE "${tableName}"...'. Return a JSON object matching the provided schema, with the SQL query in the "query" property. Do not include markdown or any other text.${
      options.extraInstructions ? `\n${options.extraInstructions}` : ""
    }`;

  if (options.verbose) {
    console.log("\naiQuery()");
  }

  const schemaJson = toJSONSchema(
    object({
      query: string(),
    }),
  );

  // Types could be improved
  const answer = await askAI(p, {
    generation: options.generation,
    verbose: options.verbose,
    includeThoughts: options.includeThoughts,
    schemaJson,
  }) as { query: string };
  const query = answer.query;

  await simpleTable.sdb.customQuery(query);
}
