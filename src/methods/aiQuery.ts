import { askAI } from "@nshiab/journalism";
import type { SimpleTable } from "../index.ts";

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
    verbose?: boolean;
  } = {},
) {
  const p =
    `I have a SQL table named "${simpleTable.name}". The data is already in it with these columns:\n${
      JSON.stringify(await simpleTable.getTypes(), undefined, 2)
    }\nI want you to give me a SQL query to do this:\n- ${prompt}\nThe query must replace the existing "${simpleTable.name}" table with 'CREATE OR REPLACE TABLE "${simpleTable.name}"'. Return just the query, nothing else.`;

  if (options.verbose) {
    console.log("\naiQuery()");
    console.log("\nPrompt:");
    console.log(p);
  }

  // Types could be improved
  let query = await askAI(p, options) as unknown as string;
  query = query.replace("```sql", "").replace("```", "").trim();

  if (options.verbose) {
    console.log("\nResponse:");
    console.log(query);
  }

  await simpleTable.sdb.customQuery(query);
}
