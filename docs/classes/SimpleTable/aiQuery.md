[**Simple Data Analysis v6.0.10**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / aiQuery

# Method: aiQuery()

> **aiQuery**(`prompt`, `options?`): `this`

Generates and executes a SQL query based on a prompt.
Additional instructions, such as column types, are automatically added to your prompt. Set `verbose` to `true` to see the full prompt.

This method uses [journalism-ai](https://nshiab.github.io/journalism-ai/) to call Gemini, Vertex AI, or Ollama.

Environment variables are named configuration values supplied to the running process. By default, this method reads `AI_PROVIDER` (`"gemini"` or `"ollama"`; defaults to `"gemini"`), `AI_MODEL` (for example, `"gemini-3-flash-preview"` or `"gemma3:4b"`), and, for Gemini, either `AI_KEY` (for example, `"your-gemini-api-key"`) or both `AI_PROJECT` (for example, `"my-google-cloud-project"`) and `AI_LOCATION` (for example, `"us-central1"`). Values passed through `generation` override the corresponding environment values. When using Ollama, ensure it is running.

Ollama temperature defaults to 0, while Gemini uses the provider's default. Provider-specific controls live under `generation`.

**Caching**: model calls can be slow and costly, so Journalism AI caches generated SQL responses in `.journalism-cache` by default. The SQL query still executes against the current table on every call; query results are not cached. Set `generation.cache: false` to disable caching.
To cache the resulting table and skip the entire operation, including processing, wrap it in [cache()](cache.md). This stores the table in `.sda-cache`.
The work is queued and runs in chain order at the next awaited observer or `run()` call.

## Parameters

### prompt

`string`

The input string to guide the AI in generating the SQL query.

### options?

Configuration options for the AI request.

#### extraInstructions?

`string`

Additional instructions to append to the prompt, providing more context or guidance for the AI.

#### generation?

\{ systemPrompt?: string \| undefined; model?: string \| undefined; cache?: boolean \| undefined; temperature?: number \| undefined; \} & (\{ provider: "gemini"; apiKey?: string \| undefined; ... 11 more ...; ollamaParameters?: undefined; \} \| \{ ...; \} \| \{ ...; \} \| \{ ...; \})

Optional Gemini or Ollama generation configuration.

#### includeThoughts?

`boolean`

If `true`, includes the AI model's reasoning process in the logged output when using models that support extended thinking. Only relevant when used with thinking-capable models. Defaults to `false`.

#### outputTable?

`string`

The name of a new table where the results will be stored. If not provided, the current table will be replaced with the query results.

#### verbose?

`boolean`

If `true`, logs additional debugging information, including the full prompt sent to the AI. Defaults to `false`.

## Returns

`this`

The table that will contain the query results, so methods can be chained.

## Examples

```ts
// Set these environment variables before running:
// AI_PROVIDER=gemini
// AI_MODEL=gemini-3-flash-preview
// AI_KEY=your-gemini-api-key
// The AI will generate a query that will be executed, and
// the result will replace the existing table.
// If run again, it will use the previous query from the cache.
// Don't forget to add .journalism-cache to your .gitignore file!
const averageSalaryByDepartment = await table
  .aiQuery("Give me the average salary by department", {
    verbose: true,
  })
  .log();
```

```ts
// Save results to a new table without modifying the original
// Original table remains unchanged
const allEmployees = await table.getRowCount();
console.log(allEmployees); // All employees

// Generate the query in chain order and observe the new table.
const topEmployees = await table
  .aiQuery("Give me the top 10 employees by salary", {
    outputTable: "top_employees",
  })
  .log();
console.log(await topEmployees.getRowCount()); // Up to 10
```

```ts
// Generate and execute the query with a local Ollama model.
const averageSalaryByDepartment = await table
  .aiQuery("Give me the average salary by department", {
    generation: { provider: "ollama", model: "gemma3:4b" },
  })
  .log();
```
