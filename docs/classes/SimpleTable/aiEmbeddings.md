[**Simple Data Analysis v6.0.14**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / aiEmbeddings

# Method: aiEmbeddings()

> **aiEmbeddings**(`column`, `newColumn`, `options?`): `this`

Defined in: [src/class/SimpleTable.ts:420](https://github.com/nshiab/simple-data-analysis/blob/v6.0.14/src/class/SimpleTable.ts#L420)

Generates embeddings for a specified text column and stores the results in a new column.

This method supports Gemini, Vertex AI, and Ollama embeddings.

Environment variables are named configuration values supplied to the running process. By default, this method reads `AI_EMBEDDINGS_PROVIDER` (`"gemini"` or `"ollama"`; defaults to `"gemini"`), `AI_EMBEDDINGS_MODEL` (for example, `"gemini-embedding-001"` or `"nomic-embed-text"`), and, for Gemini, either `AI_KEY` (for example, `"your-gemini-api-key"`) or both `AI_PROJECT` (for example, `"my-google-cloud-project"`) and `AI_LOCATION` (for example, `"us-central1"`). Values passed through `embeddings` override the corresponding environment values. When using Ollama, ensure it is running.

Use `rateLimitPerMinute` to space provider request starts across the worker pool, including across transfer batches. Cached responses bypass pacing. The `concurrency` option bounds active tasks, and free slots refill as requests finish. Retries are disabled by default; set `retry` and optionally `retryCheck` to retry failed requests. Each dispatched retry respects the rate limit.

By default, a terminal request failure stops new tasks and settles active work before throwing. Set `errorColumn` to continue instead: failed rows receive a `NULL` embedding and an error message, while successful rows receive `NULL` in the error column. If every request fails, the embedding column is entirely `NULL`. Check errors and handle null embeddings before indexing or searching. Errors in staging or retry-policy callbacks still throw.

Set `logProgress` to log completed request tasks, including failures and cache hits; retries do not increment completion counts. The `verbose` option retains detailed row-processing and index-creation logging.

Individual embedding responses are cached in `.journalism-cache` by default. Set `embeddings.cache` to `false` to disable this request cache, and remember to add `.journalism-cache` to your `.gitignore`.
To cache the resulting table and skip the entire operation, including processing, wrap it in [cache()](cache.md). This stores the table in `.sda-cache`.

Every call generates embeddings from the current text and replaces the output column if it already exists. Unchanged text can reuse cached embedding responses. Call this method again after changing the source text to refresh its embeddings.

If `createIndex` is `true`, an HNSW index will be created on the new column using the [duckdb-vss extension](https://github.com/duckdb/duckdb-vss). This is useful for speeding up the `aiVectorSimilarity` method. When refreshing an existing embedding column, its managed VSS index is dropped and rebuilt if `createIndex` is `true`.

Only the input text and generated vectors pass through JavaScript. Unrelated SQL values and types remain in DuckDB. Vectors are staged in bounded batches before replacing the output column, including when dimensions change. Uncaught generation or staging failures leave the original table data unchanged.

The work is queued and runs in chain order at the next awaited observer or `run()` call.

## Parameters

### column

`string`

The name of the column to be used as input for generating embeddings.

### newColumn

`string`

The name of the new column where the generated embeddings will be stored.

### options?

Configuration options for the AI request.

#### concurrency?

`number`

The number of concurrent requests to send. Defaults to `1`.

#### createIndex?

`boolean`

If `true`, an HNSW index will be created on the new column. Useful for speeding up the `aiVectorSimilarity` method. Defaults to `false`.

#### efConstruction?

`number`

The number of candidate vertices to consider during index construction. Higher values result in more accurate indexes but increase build time. Defaults to 128.

#### efSearch?

`number`

The number of candidate vertices to consider during search. Higher values result in more accurate searches but increase search time. Defaults to 64.

#### embeddings?

\{ `apiKey?`: `undefined`; `cache?`: `boolean`; `contextWindow?`: `undefined`; `location?`: `undefined`; `model?`: `string`; `ollama?`: `undefined`; `project?`: `undefined`; `provider?`: `undefined`; `verbose?`: `boolean`; `vertex?`: `undefined`; \} \| \{ `apiKey?`: `string`; `cache?`: `boolean`; `contextWindow?`: `undefined`; `location?`: `undefined`; `model?`: `string`; `ollama?`: `undefined`; `project?`: `undefined`; `provider`: `"gemini"`; `verbose?`: `boolean`; `vertex?`: `false`; \} \| \{ `apiKey?`: `string`; `cache?`: `boolean`; `contextWindow?`: `undefined`; `location?`: `string`; `model?`: `string`; `ollama?`: `undefined`; `project?`: `string`; `provider`: `"gemini"`; `verbose?`: `boolean`; `vertex`: `true`; \} \| \{ `apiKey?`: `undefined`; `cache?`: `boolean`; `contextWindow?`: `number`; `location?`: `undefined`; `model?`: `string`; `ollama?`: \{ `embeddingEndpoint?`: `string`; `embed`(`request`): `Promise`\<\{ `embeddings`: `number`[][]; \}\>; \}; `project?`: `undefined`; `provider`: `"ollama"`; `verbose?`: `boolean`; `vertex?`: `undefined`; \}

Optional Gemini or Ollama embedding configuration.

#### errorColumn?

`string`

Column receiving terminal request errors instead of throwing. Failed embeddings are `NULL`; successful rows have a `NULL` error. Must differ from `newColumn`. Defaults to `undefined`.

#### logProgress?

`boolean`

If `true`, logs request-task completion counts across transfer batches. Defaults to `false`.

#### M?

`number`

The maximum number of neighbors to keep for each vertex in the graph. Higher values result in more accurate indexes but increase build time and memory usage. Defaults to 16.

#### overwriteIndex?

`boolean`

If `true` and `createIndex` is `true`, drops and recreates the VSS index even if it already exists. Defaults to `false`.

#### rateLimitPerMinute?

`number`

The maximum number of provider requests started per minute. Must be positive and finite. Request starts are spaced across the worker pool; cached responses bypass the limit. Defaults to `undefined` (no limit).

#### retry?

`number`

Number of additional attempts after a request failure. Must be a non-negative safe integer. Defaults to `0`.

#### retryCheck?

(`error`) => `boolean` \| `Promise`\<`boolean`\>

Optional synchronous or asynchronous predicate that decides whether a failed request may be retried while attempts remain. Defaults to `undefined`.

#### verbose?

`boolean`

If `true`, logs additional debugging information. Defaults to `false`.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Set these environment variables before running:
// AI_EMBEDDINGS_PROVIDER=gemini
// AI_EMBEDDINGS_MODEL=gemini-embedding-001
// AI_KEY=your-gemini-api-key
const food = await sdb
  .newTable("food")
  .loadArray([
    { food: "pizza" },
    { food: "sushi" },
    { food: "burger" },
    { food: "pasta" },
    { food: "salad" },
    { food: "tacos" },
  ])
  .aiEmbeddings("food", "embeddings", {
    rateLimitPerMinute: 15,
    createIndex: true,
    verbose: true,
  })
  .log();
```

```ts
// Generate embeddings with a local Ollama model.
const food = await table
  .aiEmbeddings("food", "embeddings", {
    embeddings: { provider: "ollama", model: "nomic-embed-text" },
  })
  .log();
```

```ts
// Retry requests and retain errors for inspection.
await table
  .aiEmbeddings("text", "embedding", {
    embeddings: { provider: "ollama", model: "nomic-embed-text" },
    errorColumn: "embedding_error",
    retry: 2,
    retryCheck: (error) => error instanceof Error,
    logProgress: true,
  })
  .log();
```
