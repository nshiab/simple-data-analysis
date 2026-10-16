[**Simple Data Analysis v6.0.11**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / createFtsIndex

# Method: createFtsIndex()

> **createFtsIndex**(`idColumn`, `textColumn`, `options?`): `this`

Creates a full-text search (FTS) index on a specified text column using DuckDB's [FTS extension](https://duckdb.org/docs/stable/core_extensions/full_text_search).

If an FTS index already exists on the table, this method will skip creation and log a message (when verbose is enabled), unless the `overwrite` option is set to `true`.
The index definition is recorded in [indexes](../SimpleTable.md#indexes). The [bm25](bm25.md)
method requires an FTS index and creates one automatically when needed.
DuckDB FTS indexes do not update automatically when the table changes; use
`overwrite: true` to rebuild the index after modifying the table.

## Parameters

### idColumn

`string`

The column containing the document identifiers.

### textColumn

`string`

The column containing the text to search.

### options?

An optional object with configuration options:

#### ignore?

`string`

The regular expression of patterns to be ignored. Defaults to "(\\.|[^a-z])+".

#### lower?

`boolean`

A boolean indicating whether to convert all text to lowercase. Defaults to true.

#### overwrite?

`boolean`

A boolean indicating whether to overwrite the existing FTS index. Defaults to false.

#### stemmer?

`"arabic"` \| `"basque"` \| `"catalan"` \| `"danish"` \| `"dutch"` \| `"english"` \| `"finnish"` \| `"french"` \| `"german"` \| `"greek"` \| `"hindi"` \| `"hungarian"` \| `"indonesian"` \| `"irish"` \| `"italian"` \| `"lithuanian"` \| `"nepali"` \| `"norwegian"` \| `"porter"` \| `"portuguese"` \| `"romanian"` \| `"russian"` \| `"serbian"` \| `"spanish"` \| `"swedish"` \| `"tamil"` \| `"turkish"` \| `"none"`

The stemmer to use for the FTS index. Supports multiple languages or "none" to disable stemming. Defaults to "porter".

#### stopwords?

`string`

The table containing the stopwords to use for the FTS index. Supports multiple languages or "none" to disable stopwords. Defaults to "english".

#### stripAccents?

`boolean`

A boolean indicating whether to remove accents. Defaults to true.

#### verbose?

`boolean`

If `true`, logs FTS index creation status. Defaults to `false`.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Load a dataset and create an FTS index for later searches
await table
  .loadData("recipes.parquet")
  .createFtsIndex("Dish", "Recipe").log();
```

```ts
// Create an index with a specific language stemmer
await table.createFtsIndex("Dish", "Recipe", {
  stemmer: "french",
}).log();
```

```ts
// Recreate an existing index with different settings
await table.createFtsIndex("Dish", "Recipe", {
  stemmer: "english",
  overwrite: true,
}).log();
```

```ts
// Create index with verbose logging
await table.createFtsIndex("Dish", "Recipe", {
  verbose: true,
}).log();
// Logs: 'Creating FTS index on "Recipe" column...'
// Logs: "FTS index created successfully."
```

## Inherited from

`SimpleTableCore.createFtsIndex`
