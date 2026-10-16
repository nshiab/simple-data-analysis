[**Simple Data Analysis v6.0.10**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / aiRAG

# Method: aiRAG()

> **aiRAG**(`query`, `idColumn`, `textColumn`, `nbResults`, `options?`): `Promise`\<`string`\>

Performs Retrieval-Augmented Generation (RAG) by combining semantic vector search and BM25 full-text search to retrieve the most relevant context, then passing it to an LLM for answering queries. This hybrid approach uses both `aiVectorSimilarity` (embeddings-based) and `bm25` (keyword-based) methods in parallel, fusing their results using Reciprocal Rank Fusion (RRF) before using [journalism-ai](https://nshiab.github.io/journalism-ai/) to generate an answer.

Internally, this method uses the `hybridSearch` method to retrieve relevant rows. If you want to perform hybrid search without the LLM step (i.e., to get the table of results directly), use `hybridSearch` instead.

When vector search is enabled, retrieval caches embedding responses in `.journalism-cache` and the table with its generated embedding column in `.sda-cache`. Set `embeddings.cache: false` to disable these retrieval caches.

**Generation caching**: model calls can be slow and costly, so original responses are cached in `.journalism-cache` by default. `generation.processResponse` reruns on every call, including cache hits, and its output is never cached. Keep it lightweight and optimize heavier processing, especially for large workloads. Set `generation.cache: false` to disable generation caching.

Remove `.journalism-cache` and `.sda-cache` to clear existing cache entries. Remember to add both directories to your `.gitignore`.

Generation and embeddings are independently configurable.

Environment variables are named configuration values supplied to the running process. By default, generation reads `AI_PROVIDER` (`"gemini"` or `"ollama"`; defaults to `"gemini"`) and `AI_MODEL` (for example, `"gemini-3-flash-preview"` or `"gemma3:4b"`), while embeddings read `AI_EMBEDDINGS_PROVIDER` (`"gemini"` or `"ollama"`; defaults to `"gemini"`) and `AI_EMBEDDINGS_MODEL` (for example, `"gemini-embedding-001"` or `"nomic-embed-text"`). Gemini generation and embeddings also read either `AI_KEY` (for example, `"your-gemini-api-key"`) or both `AI_PROJECT` (for example, `"my-google-cloud-project"`) and `AI_LOCATION` (for example, `"us-central1"`). Values passed through either option override its environment defaults.

For example, `generation.provider` can be `"gemini"` while `embeddings.provider` is `"ollama"`; the same mix can be selected through `AI_PROVIDER=gemini` and `AI_EMBEDDINGS_PROVIDER=ollama`.

Ollama temperature defaults to 0. Gemini uses the provider's default temperature.

When BM25 search is enabled, its required full-text search index is created or reused automatically. When vector search is enabled, set `createIndex` to `true` to also create an HNSW index using the [duckdb-vss extension](https://github.com/duckdb/duckdb-vss).

## Parameters

### query

`string`

The question or query to answer using the retrieved context.

### idColumn

`string`

The name of the column containing unique identifiers for each row.

### textColumn

`string`

The name of the column containing the text content to search through and use as context.

### nbResults

`number`

The number of most similar rows to retrieve and use as context for the AI.

### options?

Configuration options for the RAG process.

#### b?

`number`

The BM25 b parameter controlling document length normalization (0-1 range). Defaults to `0.75`.

#### bm25?

`boolean`

If `true`, includes BM25 text search in the hybrid search. Defaults to `true`.

#### bm25MinScore?

`number`

A threshold to filter BM25 results. Only rows with a BM25 score above this value will be included in the final results. Defaults to `undefined` (no threshold).

#### bm25ScoreColumn?

`string`

If provided, a new column with this name will be added to the output table containing the BM25 score for each row.

#### conjunctive?

`boolean`

If `true`, all terms in the query string must be present in order for a document to be retrieved during the BM25 search. Defaults to `false`.

#### createIndex?

`boolean`

If `true`, creates an HNSW index when vector search is enabled. The BM25 FTS index is managed automatically whenever BM25 search is enabled. Defaults to `false`.

#### efConstruction?

`number`

The number of candidate vertices to consider during index construction. Higher values result in more accurate indexes but increase build time. Defaults to 128.

#### efSearch?

`number`

The number of candidate vertices to consider during search. Higher values result in more accurate searches but increase search time. Defaults to 64.

#### embeddings?

\{ `apiKey?`: `undefined`; `cache?`: `boolean`; `contextWindow?`: `undefined`; `location?`: `undefined`; `model?`: `string`; `ollama?`: `undefined`; `project?`: `undefined`; `provider?`: `undefined`; `verbose?`: `boolean`; `vertex?`: `undefined`; \} \| \{ `apiKey?`: `string`; `cache?`: `boolean`; `contextWindow?`: `undefined`; `location?`: `undefined`; `model?`: `string`; `ollama?`: `undefined`; `project?`: `undefined`; `provider`: `"gemini"`; `verbose?`: `boolean`; `vertex?`: `false`; \} \| \{ `apiKey?`: `string`; `cache?`: `boolean`; `contextWindow?`: `undefined`; `location?`: `string`; `model?`: `string`; `ollama?`: `undefined`; `project?`: `string`; `provider`: `"gemini"`; `verbose?`: `boolean`; `vertex`: `true`; \} \| \{ `apiKey?`: `undefined`; `cache?`: `boolean`; `contextWindow?`: `number`; `location?`: `undefined`; `model?`: `string`; `ollama?`: \{ `embeddingEndpoint?`: `string`; `embed`(`request`): `Promise`\<\{ `embeddings`: `number`[][]; \}\>; \}; `project?`: `undefined`; `provider`: `"ollama"`; `verbose?`: `boolean`; `vertex?`: `undefined`; \}

Optional Gemini or Ollama embedding configuration.

#### embeddingsConcurrency?

`number`

The number of concurrent requests to send to the embeddings service. Defaults to `1`.

#### generation?

\{ systemPrompt?: string \| undefined; model?: string \| undefined; cache?: boolean \| undefined; processResponse?: ((response: unknown) =\> unknown) \| undefined; temperature?: number \| undefined; \} & (\{ ...; \} \| ... 2 more ... \| \{ ...; \})

Optional Gemini or Ollama generation configuration.

#### ignore?

`string`

The regular expression of patterns to be ignored for the BM25 FTS index. Defaults to "(\\.|[^a-z])+".

#### includeThoughts?

`boolean`

If `true`, includes the AI model's reasoning process in the logged output when using models that support extended thinking. Only relevant when used with thinking-capable models. Defaults to `false`.

#### k?

`number`

The BM25 k parameter controlling term frequency saturation. Defaults to `1.2`.

#### lower?

`boolean`

A boolean indicating whether to convert all text to lowercase for the BM25 FTS index. Defaults to true.

#### M?

`number`

The maximum number of neighbors to keep for each vertex in the graph. Higher values result in more accurate indexes but increase build time and memory usage. Defaults to 16.

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

#### stemmer?

`"arabic"` \| `"basque"` \| `"catalan"` \| `"danish"` \| `"dutch"` \| `"english"` \| `"finnish"` \| `"french"` \| `"german"` \| `"greek"` \| `"hindi"` \| `"hungarian"` \| `"indonesian"` \| `"irish"` \| `"italian"` \| `"lithuanian"` \| `"nepali"` \| `"norwegian"` \| `"porter"` \| `"portuguese"` \| `"romanian"` \| `"russian"` \| `"serbian"` \| `"spanish"` \| `"swedish"` \| `"tamil"` \| `"turkish"` \| `"none"`

The language stemmer to apply for BM25 word normalization. Supports multiple languages or "none" to disable stemming. Defaults to `'porter'`.

#### stopwords?

`string`

The table containing the stopwords to use for the BM25 FTS index. Supports multiple languages or "none" to disable stopwords. Defaults to "english".

#### stripAccents?

`boolean`

A boolean indicating whether to remove accents for the BM25 FTS index. Defaults to true.

#### vectorMinSimilarity?

`number`

A threshold between 0.0 and 1.0 to filter out vector search results that are not similar enough. For example, 0.7 ensures only results with a 70% similarity or higher are included in the final results. Defaults to `undefined` (no threshold).

#### vectorSearch?

`boolean`

If `true`, includes vector similarity search in the hybrid search. Defaults to `true`.

#### vectorSimilarityColumn?

`string`

If provided, a new column with this name will be added to the output table containing the vector similarity score (from 0.0 to 1.0) for each row.

#### verbose?

`boolean`

If `true`, logs additional debugging information. Defaults to `false`.

## Returns

`Promise`\<`string`\>

A promise that resolves to the AI's answer to the query based on the retrieved context.

## Examples

```ts
// Set these environment variables before running:
// AI_PROVIDER=gemini
// AI_MODEL=gemini-3-flash-preview
// AI_KEY=your-gemini-api-key
// AI_EMBEDDINGS_PROVIDER=ollama
// AI_EMBEDDINGS_MODEL=nomic-embed-text
// Load a dataset of recipes
const sdb = new SimpleDB();
const answer = await sdb
  .newTable("recipes")
  .loadData("recipes.parquet")
  .aiRAG(
    "I want a buttery pastry for breakfast.",
    "Dish", // Column with unique IDs
    "Recipe", // Column with text to search
    10, // The 10 most relevant recipes passed to the LLM
    { verbose: true }, // Log debugging information and timings
  );

console.log(answer);
// Example output: "I recommend croissants.
// They are a classic buttery pastry perfect for breakfast..."
```

```ts
// Use Ollama for both retrieval embeddings and answer generation.
const answer = await table.aiRAG(
  "I want a buttery pastry for breakfast.",
  "Dish",
  "Recipe",
  10,
  {
    generation: { provider: "ollama", model: "gemma3:4b" },
    embeddings: { provider: "ollama", model: "nomic-embed-text" },
  },
);
```
