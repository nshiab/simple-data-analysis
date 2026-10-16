[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / fuzzyClean

# Method: fuzzyClean()

> **fuzzyClean**(`column`, `newColumn`, `threshold`, `options?`): `this`

Normalizes string values in a column by detecting fuzzy duplicates and replacing them with a single canonical value.

Similar strings are grouped into clusters. Matching is transitive: if `"New York"` is similar to `"New Yorke"` and
`"New Yorke"` is similar to `"New Yorkk"`, all three land in the same cluster even if `"New York"` and `"New Yorkk"`
would not match directly. Each cluster is then collapsed to one representative value based on the `strategy` option.

Similarity is computed using the [rapidfuzz](https://query.farm/duckdb_extension_rapidfuzz) DuckDB community extension,
which is installed and loaded automatically.

## Parameters

### column

`string`

The name of the column containing the strings to normalize.

### newColumn

`string`

The name of the column to write the normalized values to. Use the same name as `column` to normalize in-place.

### threshold

`number`

The minimum similarity score (0–100) for two strings to be considered duplicates. For `method: "ratio"`, a length-based pre-filter is automatically applied based on the threshold to improve performance without losing accuracy.

### options?

An optional object with configuration options:

#### method?

`"ratio"` \| `"partial_ratio"` \| `"token_sort_ratio"` \| `"token_set_ratio"`

The rapidfuzz similarity algorithm to use. Defaults to `"ratio"`.
  - `"ratio"`: Overall similarity.
  - `"partial_ratio"`: Best partial/substring similarity.
  - `"token_sort_ratio"`: Similarity after sorting tokens (words), useful for reordered words.
  - `"token_set_ratio"`: Similarity based on sets of tokens, ignoring duplicates and word order.

#### prefilterPrefixLength?

`number`

An optional prefix length. Only strings sharing the same first N characters are compared. Note that prefix filtering is lossy (e.g. "John" vs. "Phon" will not match despite high similarity).

#### strategy?

`"mostCommon"` \| `"longestString"` \| `"shortestString"` \| `"mostCentral"` \| `"maxScore"`

The strategy for choosing the canonical value within each cluster of similar strings. Defaults to `"mostCommon"`.
  - `"mostCommon"`: Keep the value that appears most frequently in the original column.
  - `"longestString"`: Keep the longest string in the cluster.
  - `"shortestString"`: Keep the shortest string in the cluster.
  - `"mostCentral"`: Keep the string with the highest total similarity score to all other cluster members (the most "central" string).
  - `"maxScore"`: Keep the string that participates in the single highest-scoring pairwise match within the cluster.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Normalize 'city' into a new 'cityClean' column, keeping the most common string per cluster with a threshold of 80
// A length-based pre-filter is automatically applied.
await table.fuzzyClean("city", "cityClean", 80).log();
```

```ts
// Normalize with a prefix-based pre-filter and a threshold of 80
await table.fuzzyClean("city", "cityClean", 80, {
  prefilterPrefixLength: 5, // Must share the same first 5 characters
}).log();
```

```ts
// Normalize 'companyName' into a new column using token_sort_ratio and a threshold of 90
await table.fuzzyClean("companyName", "companyNameClean", 90, { method: "token_sort_ratio" }).log();
```

```ts
// Normalize 'category' in-place, keeping the longest string in each cluster and a threshold of 80
await table.fuzzyClean("category", "category", 80, { strategy: "longestString" }).log();
```

## Inherited from

`SimpleTableCore.fuzzyClean`
