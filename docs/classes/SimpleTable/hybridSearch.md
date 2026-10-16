[**Simple Data Analysis v6.0.10**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / hybridSearch

# Method: hybridSearch()

> **hybridSearch**(`query`, `idColumn`, `textColumn`, `nbResults`, `options?`): `this`

Performs hybrid text search combining vector similarity and BM25 text search using Reciprocal Rank Fusion (RRF).

This method:
1. Ensures compatible embeddings exist for the text column
2. Runs vector similarity search and BM25 text search in parallel
3. Fuses the results using Reciprocal Rank Fusion to get the best matches
4. Returns the top results ordered by relevance, replacing the current table unless `outputTable` is specified

When vector search is enabled, embedding responses are cached in `.journalism-cache`, and the table with its generated embedding column is cached in `.sda-cache`. Set `embeddings.cache` to `false` to disable both caches.
To cache the resulting table and skip the entire operation, including processing, wrap it in [cache()](cache.md). This stores the table in `.sda-cache`.

The method stores document embeddings in `{textColumn}_embeddings`. SDA saves the embedding settings alongside the table in DuckDB so it can check whether existing vectors are compatible, including after reopening the database. Missing, incompatible, or untracked embeddings are generated automatically. Managed vector indexes are dropped before replacing existing embeddings.

Changes to the source text are not detected. After editing or reloading the text, call `aiEmbeddings(textColumn, textColumn + "_embeddings", { embeddings })` with the same embedding options to refresh the vectors before searching.

Remove `.journalism-cache` and `.sda-cache` to clear existing cache entries. Remember to add both directories to your `.gitignore`.

This method supports Gemini, Vertex AI, and Ollama embeddings.

Environment variables are named configuration values supplied to the running process. By default, this method reads `AI_EMBEDDINGS_PROVIDER` (`"gemini"` or `"ollama"`; defaults to `"gemini"`), `AI_EMBEDDINGS_MODEL` (for example, `"gemini-embedding-001"` or `"nomic-embed-text"`), and, for Gemini, either `AI_KEY` (for example, `"your-gemini-api-key"`) or both `AI_PROJECT` (for example, `"my-google-cloud-project"`) and `AI_LOCATION` (for example, `"us-central1"`). Values passed through `embeddings` override the corresponding environment values.

The selected embedding provider is used for both stored row embeddings and the query embedding.

When BM25 search is enabled, its required full-text search index is created or reused automatically. When vector search is enabled, set `createIndex` to `true` to also create an HNSW index using the [duckdb-vss extension](https://github.com/duckdb/duckdb-vss).

The work is queued and runs in chain order at the next awaited observer or `run()` call.

## Parameters

### query

`string`

The search query text.

### idColumn

`string`

The name of the column containing unique identifiers for each row.

### textColumn

`string`

The name of the column containing the text content to search through.

### nbResults

`number`

The number of most similar rows to retrieve.

### options?

Configuration options for the hybrid search.

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

#### ignore?

`string`

The regular expression of patterns to be ignored for the BM25 FTS index. Defaults to "(\\.|[^a-z])+".

#### k?

`number`

The BM25 k parameter controlling term frequency saturation. Defaults to `1.2`.

#### lower?

`boolean`

A boolean indicating whether to convert all text to lowercase for the BM25 FTS index. Defaults to true.

#### M?

`number`

The maximum number of neighbors to keep for each vertex in the graph. Higher values result in more accurate indexes but increase build time and memory usage. Defaults to 16.

#### outputTable?

`string`

The name of a new table where the results will be stored. If not provided, the current table will be replaced with the search results.

#### stemmer?

`"arabic"` \| `"basque"` \| `"catalan"` \| `"danish"` \| `"dutch"` \| `"english"` \| `"finnish"` \| `"french"` \| `"german"` \| `"greek"` \| `"hindi"` \| `"hungarian"` \| `"indonesian"` \| `"irish"` \| `"italian"` \| `"lithuanian"` \| `"nepali"` \| `"norwegian"` \| `"porter"` \| `"portuguese"` \| `"romanian"` \| `"russian"` \| `"serbian"` \| `"spanish"` \| `"swedish"` \| `"tamil"` \| `"turkish"` \| `"none"`

The language stemmer to apply for BM25 word normalization. Supports multiple languages or "none" to disable stemming. Defaults to `'porter'`.

#### stopwords?

`string`

The table containing the stopwords to use for the BM25 FTS index. Supports multiple languages or "none" to disable stopwords. Defaults to "english".

#### stripAccents?

`boolean`

A boolean indicating whether to remove accents for the BM25 FTS index. Defaults to true.

#### times?

\{ `bm25End?`: `number`; `bm25Start?`: `number`; `embeddingEnd?`: `number`; `embeddingStart?`: `number`; `start?`: `number`; `vectorSearchEnd?`: `number`; `vectorSearchStart?`: `number`; \}

An optional object to track timing information. If provided, it will be updated with detailed timing breakdowns (embeddingStart, embeddingEnd, vectorSearchStart, vectorSearchEnd, bm25Start, bm25End). Useful when calling from aiRAG to get combined timing information.

#### times.bm25End?

`number`

#### times.bm25Start?

`number`

#### times.embeddingEnd?

`number`

#### times.embeddingStart?

`number`

#### times.start?

`number`

#### times.vectorSearchEnd?

`number`

#### times.vectorSearchStart?

`number`

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

`this`

The table that will contain the search results, so methods can be chained.

## Examples

```ts
// Set these environment variables before running:
// AI_EMBEDDINGS_PROVIDER=gemini
// AI_EMBEDDINGS_MODEL=gemini-embedding-001
// AI_KEY=your-gemini-api-key
// Load a dataset of recipes
const sdb = new SimpleDB();
const results = await sdb
  .newTable("recipes")
  .loadData("recipes.parquet")
  .hybridSearch("buttery pastry for breakfast", "Dish", "Recipe", 10, {
    verbose: true,
  })
  .log();
```

```ts
// Run hybrid search with local Ollama embeddings.
const results = await table
  .hybridSearch("buttery pastry", "Dish", "Recipe", 10, {
    embeddings: { provider: "ollama", model: "nomic-embed-text" },
  })
  .log();
```
