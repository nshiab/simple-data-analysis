[**Simple Data Analysis v6.0.14**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / fuzzyJoin

# Method: fuzzyJoin()

> **fuzzyJoin**(`rightTable`, `leftColumn`, `rightColumn`, `threshold`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:4772](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L4772)

Performs a fuzzy left join between this table (considered the left table) and another table
(the right table) based on string similarity between two text columns. Uses the
[rapidfuzz](https://query.farm/duckdb_extension_rapidfuzz) DuckDB community extension.

If a similarity score column is added to the results, the rows will be ordered alphabetically by the left column, and then by descending similarity score within each group of identical left column values. Otherwise, the rows will be order alphabetically by the left column and then by the right column.

This operation might create temporary files in a `.tmp` folder; consider adding `.tmp` to your `.gitignore`.

## Parameters

### rightTable

`SimpleTable`

The SimpleTable instance to be joined with this table.

### leftColumn

`string`

The name of the column in this (left) table containing the text to compare.

### rightColumn

`string`

The name of the column in the right table containing the text to compare.

### threshold

`number`

The minimum similarity score (0–100) required for two rows to be joined. For `method: "ratio"`, a length-based pre-filter is automatically applied based on the threshold to improve performance without losing accuracy.

### options?

An optional object with configuration options:

#### method?

`"ratio"` \| `"partial_ratio"` \| `"token_sort_ratio"` \| `"token_set_ratio"`

The rapidfuzz similarity algorithm to use. Defaults to `"ratio"`.
  - `"ratio"`: Overall similarity (Levenshtein-based).
  - `"partial_ratio"`: Best partial/substring similarity.
  - `"token_sort_ratio"`: Similarity after sorting tokens (words), useful for reordered words.
  - `"token_set_ratio"`: Similarity based on sets of tokens, ignoring duplicates and word order.

#### outputTable?

`string` \| `boolean`

If `true`, the results will be stored in a new table with a generated name. If a string, it will be used as the name for the new table. If `false` or omitted, the current table will be overwritten. Defaults to `false`.

#### prefilterPrefixLength?

`number`

An optional prefix length. Only strings sharing the same first N characters are compared. Note that prefix filtering is lossy (e.g. "John" vs. "Phon" will not match despite high similarity).

#### similarityColumn?

`string`

If provided, a column with this name is added to the result containing the similarity score (0–100). If omitted, the score is not included in the output.

## Returns

`this`

A table instance containing the fuzzy-joined data (either the current table or a new table), so methods can be chained.

## Examples

```ts
// Fuzzy left join tableA with tableB on 'name' (left) and 'standardName' (right) with a threshold of 80
// A length-based pre-filter is automatically applied.
await tableA.fuzzyJoin(tableB, "name", "standardName", 80).log();
```

```ts
// Fuzzy join with a prefix-based pre-filter and a threshold of 80
await tableA.fuzzyJoin(tableB, "name", "standardName", 80, {
  prefilterPrefixLength: 3, // Must share the same first 3 characters
}).log();
```

```ts
// Fuzzy join with a custom threshold and method, storing results in a new table
const tableC = await tableA.fuzzyJoin(tableB, "name", "standardName", 90, {
  method: "token_sort_ratio",
  outputTable: "tableC",
}).log();
```

```ts
// Fuzzy join with a custom similarity column name and a threshold of 80
await tableA.fuzzyJoin(tableB, "name", "standardName", 80, {
  similarityColumn: "matchScore",
}).log();
```

## Inherited from

`SimpleTableCore.fuzzyJoin`
