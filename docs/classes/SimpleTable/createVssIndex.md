[**Simple Data Analysis v6.0.14**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / createVssIndex

# Method: createVssIndex()

> **createVssIndex**(`column`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:1077](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L1077)

Creates a vector similarity search (VSS) index on a specified column using DuckDB's [VSS extension](https://duckdb.org/docs/stable/extensions/vss).

If a VSS index already exists on the table, this method will skip creation and log a message (when verbose is enabled), unless the `overwrite` option is set to `true`.
The index definition is recorded in [indexes](../SimpleTable.md#indexes).

## Parameters

### column

`string`

The name of the column containing vector embeddings (must be FLOAT array type).

### options?

An optional object with configuration options:

#### efConstruction?

`number`

The number of candidate vertices to consider during index construction. Higher values result in more accurate indexes but increase build time. Defaults to 128.

#### efSearch?

`number`

The number of candidate vertices to consider during search. Higher values result in more accurate searches but increase search time. Defaults to 64.

#### M?

`number`

The maximum number of neighbors to keep for each vertex in the graph. Higher values result in more accurate indexes but increase build time and memory usage. Defaults to 16.

#### overwrite?

`boolean`

If `true`, drops and recreates the index even if it already exists. Defaults to `false`.

#### verbose?

`boolean`

If `true`, logs VSS index creation status. Defaults to `false`.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Load data that already contains an embedding column
await table
  .loadData("data.csv")
  .createVssIndex("embedding_column").log();
```

```ts
// Recreate an existing index
await table.createVssIndex("embedding_column", {
  overwrite: true,
}).log();
```

```ts
// Create index with verbose logging
await table.createVssIndex("embedding_column", {
  verbose: true,
}).log();
// Logs: 'Creating VSS index on "embedding_column" column...'
// Logs: "VSS index created successfully."
```

```ts
// Create index with custom HNSW parameters for higher accuracy
await table.createVssIndex("embedding_column", {
  efConstruction: 256,
  efSearch: 128,
  M: 32,
}).log();
```

## Inherited from

`SimpleTableCore.createVssIndex`
