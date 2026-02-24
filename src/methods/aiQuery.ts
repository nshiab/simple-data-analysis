import { askAI } from "@nshiab/journalism-ai";
import type { SimpleTable } from "../index.ts";
import type { Ollama } from "ollama";

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
    verbose?: boolean;
  } = {},
) {
  const p =
    `I have a SQL table named "${simpleTable.name}". The data is already in it with these columns:\n${
      JSON.stringify(await simpleTable.getTypes())
    }\nI want you to give me a SQL query to do this:\n- ${prompt}\nThe query must replace the existing "${simpleTable.name}" table. This means the the query must start with 'CREATE OR REPLACE TABLE "${simpleTable.name}"...'. Return just the query, nothing else.${
      options.extraInstructions ? `\n${options.extraInstructions}` : ""
    }`;

  if (options.verbose) {
    console.log("\naiQuery()");
  }

  // Types could be improved
  let query = await askAI(p, {
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
  }) as unknown as string;
  query = query.replace("```sql", "").replace("```", "").trim();

  await simpleTable.sdb.customQuery(query);
}
