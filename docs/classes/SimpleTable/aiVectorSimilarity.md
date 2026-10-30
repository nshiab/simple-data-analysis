[**Simple Data Analysis v6.0.14**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / aiVectorSimilarity

# Method: aiVectorSimilarity()

> **aiVectorSimilarity**(`text`, `column`, `nbResults`, `options?`): `this`

Defined in: [src/class/SimpleTable.ts:574](https://github.com/nshiab/simple-data-analysis/blob/v6.0.14/src/class/SimpleTable.ts#L574)

Creates an embedding from a specified text and returns the most similar text content based on their embeddings.
This method is useful for semantic search and text similarity tasks, computing cosine distance and sorting results by similarity.

Environment variables are named configuration values supplied to the running process. By default, this method reads `AI_EMBEDDINGS_PROVIDER` (`"gemini"` or `"ollama"`; defaults to `"gemini"`), `AI_EMBEDDINGS_MODEL` (for example, `"gemini-embedding-001"` or `"nomic-embed-text"`), and, for Gemini, either `AI_KEY` (for example, `"your-gemini-api-key"`) or both `AI_PROJECT` (for example, `"my-google-cloud-project"`) and `AI_LOCATION` (for example, `"us-central1"`). Values passed through `embeddings` override the corresponding environment values.

Gemini, Vertex AI, and Ollama are supported. The selected provider and model must match those used to create the stored embedding column so the vectors share the same dimensions and embedding space.

The query embedding is cached in `.journalism-cache` by default. Set `embeddings.cache` to `false` to disable this request cache, and remember to add `.journalism-cache` to your `.gitignore`.
To cache the resulting table and skip the entire operation, including processing, wrap it in [cache()](cache.md). This stores the table in `.sda-cache`.

If `createIndex` is `true`, an HNSW index will be created on the embeddings column using the [duckdb-vss extension](https://github.com/duckdb/duckdb-vss) to speed up processing. If the index already exists, it will not be recreated unless `overwriteIndex` is `true`.
The work is queued and runs in chain order at the next awaited observer or `run()` call.

## Parameters

### text

`string`

The text for which to generate an embedding and find similar content.

### column

`string`

The name of the column containing the embeddings to be used for the similarity search.

### nbResults

`number`

The maximum number of most similar results to return.

### options?

An optional object with configuration options:

#### createIndex?

`boolean`

If `true`, an HNSW index will be created on the embeddings column. Defaults to `false`.

#### efConstruction?

`number`

The number of candidate vertices to consider during index construction. Higher values result in more accurate indexes but increase build time. Defaults to 128.

#### efSearch?

`number`

The number of candidate vertices to consider during search. Higher values result in more accurate searches but increase search time. Defaults to 64.

#### embeddings?

\{ `apiKey?`: `undefined`; `cache?`: `boolean`; `contextWindow?`: `undefined`; `location?`: `undefined`; `model?`: `string`; `ollama?`: `undefined`; `project?`: `undefined`; `provider?`: `undefined`; `verbose?`: `boolean`; `vertex?`: `undefined`; \} \| \{ `apiKey?`: `string`; `cache?`: `boolean`; `contextWindow?`: `undefined`; `location?`: `undefined`; `model?`: `string`; `ollama?`: `undefined`; `project?`: `undefined`; `provider`: `"gemini"`; `verbose?`: `boolean`; `vertex?`: `false`; \} \| \{ `apiKey?`: `string`; `cache?`: `boolean`; `contextWindow?`: `undefined`; `location?`: `string`; `model?`: `string`; `ollama?`: `undefined`; `project?`: `string`; `provider`: `"gemini"`; `verbose?`: `boolean`; `vertex`: `true`; \} \| \{ `apiKey?`: `undefined`; `cache?`: `boolean`; `contextWindow?`: `number`; `location?`: `undefined`; `model?`: `string`; `ollama?`: \{ `embeddingEndpoint?`: `string`; `embed`(`request`): `Promise`\<\{ `embeddings`: `number`[][]; \}\>; \}; `project?`: `undefined`; `provider`: `"ollama"`; `verbose?`: `boolean`; `vertex?`: `undefined`; \}

Optional Gemini or Ollama embedding configuration.

#### M?

`number`

The maximum number of neighbors to keep for each vertex in the graph. Higher values result in more accurate indexes but increase build time and memory usage. Defaults to 16.

#### minSimilarity?

`number`

A threshold between 0.0 and 1.0 to filter out results that are not similar enough. For example, 0.7 ensures only results with a 70% similarity or higher are returned. Defaults to `undefined` (no threshold).

#### outputTable?

`string`

The name of the output table where the results will be stored. If not provided, the current table will be modified. Defaults to `undefined`.

#### overwriteIndex?

`boolean`

If `true` and `createIndex` is `true`, drops and recreates the VSS index even if it already exists. Defaults to `false`.

#### similarityColumn?

`string` \| `boolean`

A custom name, or true for a new column named "similarity" containing cosine similarity scores; false or omitted adds no score. Names must be nonempty and contain no null characters. Existing column names conflict case-insensitively (ASCII), including when outputTable is set, and are rejected before requesting embeddings or modifying the table.

#### verbose?

`boolean`

If `true`, logs additional debugging information. Defaults to `false`.

## Returns

`this`

The table that will contain the similarity results, so methods can be chained.

## Examples

```ts
// Set these environment variables before running:
// AI_EMBEDDINGS_PROVIDER=gemini
// AI_EMBEDDINGS_MODEL=gemini-embedding-001
// AI_KEY=your-gemini-api-key
const similarFood = await sdb
  .newTable("food")
  .loadArray([
    { food: "pizza" },
    { food: "sushi" },
    { food: "burger" },
    { food: "pasta" },
    { food: "salad" },
    { food: "tacos" },
  ])
  .aiEmbeddings("food", "embeddings")
  .aiVectorSimilarity("italian food", "embeddings", 3, {
    createIndex: true,
    minSimilarity: 0.6,
    similarityColumn: "score",
  })
  .log();
```

```ts
// Query an embedding column created with the same Ollama model.
const similarFood = await table
  .aiVectorSimilarity("italian food", "embeddings", 3, {
    embeddings: { provider: "ollama", model: "nomic-embed-text" },
  })
  .log();
```

```ts
// Include scores under the default "similarity" column name.
await table
  .aiVectorSimilarity("italian food", "embeddings", 3, {
    similarityColumn: true,
  })
  .log();
```
