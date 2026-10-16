import type { SimpleTable } from "../index.ts";
import { snapshotAIOptions } from "../helpers/aiOptions.ts";
import { queueAsyncBarrier } from "@nshiab/simple-data-analysis-core/helpers";

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
  /** Model options; SDA owns the response schema and SQL handling. */
  generation?: NonNullable<Parameters<SimpleTable["aiQuery"]>[1]>["generation"];
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
  options = snapshotAIOptions(options);
  const outputTable =
    options.outputTable === undefined ? simpleTable : simpleTable.sdb.newTable(options.outputTable);
  queueAsyncBarrier(outputTable, {
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

  const p = `I have a SQL table named "${simpleTable.name}". The data is already in it with these columns:\n\n${JSON.stringify(
    await simpleTable.getTypes(),
    null,
    2,
  )}\n\nI want you to give me a SQL query to do this:\n- ${prompt}\nThe query must ${
    options.outputTable
      ? `create a new table named "${tableName}" with the results`
      : `replace the existing "${simpleTable.name}" table`
  }. This means the query must start with 'CREATE OR REPLACE TABLE "${tableName}"...'. Return a JSON object matching the provided schema, with the SQL query in the "query" property. Do not include markdown or any other text.${
    options.extraInstructions ? `\n${options.extraInstructions}` : ""
  }`;

  if (options.verbose) {
    console.log("\naiQuery()");
  }

  const [{ object, string, toJSONSchema }, { default: askAI }] = await Promise.all([
    import("zod"),
    import("../helpers/askAI.ts"),
  ]);
  const schema = object({ query: string() });
  const schemaJson = toJSONSchema(schema);

  const answer = await askAI<{ query: string }>(p, {
    generation: { ...options.generation, processResponse: undefined },
    verbose: options.verbose,
    includeThoughts: options.includeThoughts,
    schemaJson,
  });
  const query = answer.query;

  await simpleTable.sdb.customQuery(query);
}
