import { askAI } from "@nshiab/journalism";
import type { SimpleTable } from "../index.ts";
import type { Ollama } from "ollama";

export default async function aiQuery(
  simpleTable: SimpleTable,
  prompt: string,
  options: {
    cache?: boolean;
    model?: string;
    apiKey?: string;
    vertex?: boolean;
    project?: string;
    location?: string;
    ollama?: boolean | Ollama;
    contextWindow?: number;
    thinkingBudget?: number;
    verbose?: boolean;
  } = {},
) {
  const p =
    `I have a SQL table named "${simpleTable.name}". The data is already in it with these columns:\n${
      JSON.stringify(await simpleTable.getTypes())
    }\nI want you to give me a SQL query to do this:\n- ${prompt}\nThe query must replace the existing "${simpleTable.name}" table. This means the the query must start with 'CREATE OR REPLACE TABLE "${simpleTable.name}"...'. Return just the query, nothing else.`;

  if (options.verbose) {
    console.log("\naiQuery()");
  }

  // Types could be improved
  let query = await askAI(p, options) as unknown as string;
  query = query.replace("```sql", "").replace("```", "").trim();

  await simpleTable.sdb.customQuery(query);
}
