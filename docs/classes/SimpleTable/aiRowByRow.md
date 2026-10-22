[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / aiRowByRow

# Method: aiRowByRow()

> **aiRowByRow**(`column`, `newColumn`, `prompt`, `options?`): `this`

Defined in: [src/class/SimpleTable.ts:220](https://github.com/nshiab/simple-data-analysis/blob/v6.0.12/src/class/SimpleTable.ts#L220)

Applies a prompt to the value of each row in a specified column, storing the AI's response in one or more new columns. Requests are processed by a worker pool with configurable batching and concurrency.

This method automatically appends instructions to your prompt; set `verbose` to `true` to see the full prompt.

This method uses [journalism-ai](https://nshiab.github.io/journalism-ai/) to call Gemini, Vertex AI, or Ollama.

Environment variables are named configuration values supplied to the running process. By default, this method reads `AI_PROVIDER` (`"gemini"` or `"ollama"`; defaults to `"gemini"`), `AI_MODEL` (for example, `"gemini-3-flash-preview"` or `"gemma3:4b"`), and, for Gemini, either `AI_KEY` (for example, `"your-gemini-api-key"`) or both `AI_PROJECT` (for example, `"my-google-cloud-project"`) and `AI_LOCATION` (for example, `"us-central1"`). Values passed through `generation` override the corresponding environment values. When using Ollama, ensure it is running.

To manage rate limits, use `batchSize` to process multiple rows per request and `rateLimitPerMinute` to pace requests across the worker pool. The `concurrency` option controls how many requests may run in parallel.

**Caching**: model calls can be slow and costly, so original responses are cached in Journalism AI's `.journalism-cache` folder by default. `processResponse` reruns on every call, including cache hits, and its output is never cached. Keep processing lightweight and optimize heavier work, especially for large tables. Set `generation.cache: false` to disable caching.
To cache the resulting table and skip the entire operation, including processing, wrap it in [cache()](cache.md). This stores the table in `.sda-cache`.

Pass a JSON Schema for the response array through `generation.schemaJson`. Convert a Zod array schema with `z.toJSONSchema()`.

`processResponse` receives one generated row object at a time, even when batching. Return an object with the requested columns, or a promise of it. Throwing or rejecting follows `retry` and `retryCheck` for the whole batch; its model cache entry is discarded.

By default, a failed batch throws. Set `errorColumn` to store the error on every row in the failed batch, set its output columns to `NULL`, and continue processing other batches. Successful rows contain `NULL` in the error column.

Only the input column and generated columns pass through JavaScript. Unrelated SQL values and types, including vectors and geometry, remain in DuckDB. Generated columns are staged in bounded batches and replace existing output columns with inferred types. Uncaught generation or staging failures leave the original table data unchanged.

This method queues the AI processing; requests are sent when an async observer method (like `getData()` or `log()`) is awaited, or when `run()` is called.

## Parameters

### column

`string`

The name of the column to be used as input for the AI prompt.

### newColumn

`string` \| `string`[]

The name of the new column (or an array of column names) where the AI's response will be stored.

### prompt

`string`

The input string to guide the AI's response.

### options?

Configuration options for the AI request.

#### batchSize?

`number`

The number of rows to process in each batch. Defaults to `1`.

#### concurrency?

`number`

The number of concurrent requests to send. Defaults to `1`.

#### errorColumn?

`string`

The optional column where per-row error messages are stored. When omitted, a failed batch throws.

#### extraInstructions?

`string`

Additional instructions to append to the prompt, providing more context or guidance for the AI.

#### generation?

\{ systemPrompt?: string \| undefined; model?: string \| undefined; schemaJson?: unknown; cache?: boolean \| undefined; temperature?: number \| undefined; \} & (\{ provider: "gemini"; apiKey?: string \| undefined; ... 11 more ...; ollamaParameters?: undefined; \} \| \{ ...; \} \| \{ ...; \} \| \{ ...; \})

Optional Gemini or Ollama generation configuration.

#### logProgress?

`boolean`

If `true`, logs request-pool progress. Defaults to `false`.

#### metrics?

\{ `totalCost`: `number`; `totalInputTokens`: `number`; `totalOutputTokens`: `number`; `totalRequests`: `number`; \}

An object to track cumulative metrics across multiple AI requests. Pass an object with totalCost, totalInputTokens, totalOutputTokens, and totalRequests properties (all initialized to 0). The function will update these values after each request. Note: totalCost is only calculated for Google GenAI models, not for Ollama.

#### metrics.totalCost

`number`

#### metrics.totalInputTokens

`number`

#### metrics.totalOutputTokens

`number`

#### metrics.totalRequests

`number`

#### processResponse?

(`response`) => \{\[`key`: `string`\]: `unknown`; \} \| `Promise`\<\{\[`key`: `string`\]: `unknown`; \}\>

Transforms or validates one generated row object. Return an object containing every requested column, or a promise of it. Runs on cache hits too. Throwing or rejecting follows the batch retry policy.

#### rateLimitPerMinute?

`number`

The maximum number of provider requests started per minute. Request starts are spaced across the worker pool; cached responses bypass the limit. Defaults to `undefined` (no limit).

#### retry?

`number`

The number of times to retry the request in case of failure. Defaults to `0`.

#### retryCheck?

(`error`) => `boolean` \| `Promise`\<`boolean`\>

A function that receives an error and returns whether it should be retried. Defaults to `undefined`.

#### verbose?

`boolean`

If `true`, logs additional debugging information, including the full prompt sent to the AI. Defaults to `false`.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
import { z } from "zod";

// aiRowByRow requests an array of objects, even with batchSize: 1.
// Each object represents one input row and contains the new columns.
const schemaJson = z.toJSONSchema(
  z.array(z.object({ gender: z.enum(["Man", "Woman", "Neutral"]) })),
);
const people = await sdb
  .newTable("people")
  .loadArray([
    { name: "Marie" },
    { name: "John" },
    { name: "Alex" },
  ])
  .aiRowByRow(
    "name",
    "gender",
    `Guess whether it's a "Man" or a "Woman". If it could be both, return "Neutral".`,
    {
      generation: {
        provider: "gemini",
        model: "gemini-3-flash-preview",
        schemaJson,
      },
      batchSize: 10, // Process up to 10 rows per request
      concurrency: 5, // Process up to 5 requests concurrently
      errorColumn: "error", // Store failed rows instead of throwing
      retry: 3, // Retry the batch up to 3 times on failure
      rateLimitPerMinute: 15, // Limit requests to 15 per minute
      verbose: true, // Log detailed information
    },
  )
  .log();

// Example results:
// [
//   { name: "Marie", gender: "Woman", error: null },
//   { name: "John", gender: "Man", error: null },
//   { name: "Alex", gender: "Neutral", error: null },
// ]
```

```ts
// Set these environment variables before running:
// AI_PROVIDER=gemini
// AI_MODEL=gemini-3-flash-preview
// AI_KEY=your-gemini-api-key
const cities = await sdb
  .newTable("cities")
  .loadArray([
    { city: "Marrakech" },
    { city: "Kyoto" },
    { city: "Auckland" },
  ])
  .aiRowByRow(
    "city",
    ["country", "continent"], // Multiple new columns
    `Give me the country and continent of the city.`,
    { verbose: true },
  )
  .log();

// Example results:
// [
//   { city: "Marrakech", country: "Morocco", continent: "Africa" },
//   { city: "Kyoto", country: "Japan", continent: "Asia" },
//   { city: "Auckland", country: "New Zealand", continent: "Oceania" },
// ]
```

```ts
const names = await sdb
  .newTable("names")
  .loadArray([{ name: "Marie" }, { name: "John" }])
  .aiRowByRow("name", "description", "Describe this name.", {
    generation: { provider: "ollama", model: "gemma3:4b" },
  })
  .log();
```

```ts
await sdb
  .newTable("country_names")
  .loadArray([{ city: "Paris" }])
  .aiRowByRow("city", "country", "Return the country name.", {
    processResponse: (row) => {
      if (typeof row.country !== "string") throw new Error("Expected a country name.");
      return { country: row.country.trim() };
    },
    retry: 2,
  })
  .log();
```
