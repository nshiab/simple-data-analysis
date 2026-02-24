import { askAI } from "@nshiab/journalism-ai";
import type { SimpleTable } from "../index.ts";
import type { Ollama } from "ollama";
import { object, string, toJSONSchema } from "zod";

export default async function aiQuery(
  simpleTable: SimpleTable,
  prompt: string,
  options: {
    extraInstructions?: string;
    cache?: boolean;
    model?: string;
    apiKey?: string;
    vertex?: boolean;
    project?: string;
    includeThoughts?: boolean;
    location?: string;
    ollama?: boolean | Ollama;
    contextWindow?: number;
    thinkingBudget?: number;
    thinkingLevel?: "minimal" | "low" | "medium" | "high";
    outputTable?: string;
    verbose?: boolean;
  } = {},
) {
  const tableName = options.outputTable ?? simpleTable.name;

  const p =
    `I have a SQL table named "${simpleTable.name}". The data is already in it with these columns:\n\n${
      JSON.stringify(await simpleTable.getTypes(), null, 2)
    }\n\nI want you to give me a SQL query to do this:\n- ${prompt}\nThe query must ${
      options.outputTable
        ? `create a new table named "${tableName}" with the results`
        : `replace the existing "${simpleTable.name}" table`
    }. This means the query must start with 'CREATE OR REPLACE TABLE "${tableName}"...'. Return just the query, nothing else.${
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
    cache: options.cache,
    model: options.model,
    apiKey: options.apiKey,
    vertex: options.vertex,
    project: options.project,
    location: options.location,
    ollama: options.ollama,
    contextWindow: options.contextWindow,
    thinkingBudget: options.thinkingBudget,
    thinkingLevel: options.thinkingLevel,
    verbose: options.verbose,
    includeThoughts: options.includeThoughts,
    schemaJson,
  }) as { query: string };
  const query = answer.query;

  await simpleTable.sdb.customQuery(query);
}
