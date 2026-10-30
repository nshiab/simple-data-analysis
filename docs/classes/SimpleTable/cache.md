[**Simple Data Analysis v6.0.14**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / cache

# Method: cache()

> **cache**(`compute`, `options?`): `Promise`\<[`SimpleTable`](../SimpleTable.md)\>

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:8936](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L8936)

Caches the results of computations in `./.sda-cache`.
You should add `./.sda-cache` to your `.gitignore` file.

Callback code and function/class inputs ignore comments, indentation, and
line wrapping where safe.

`cache()` automatically tracks whether earlier SDA operations changed the
table. It also records every other already registered `SimpleTable` read
through `SimpleTable` methods while `compute` runs and invalidates the
cached step when any of their generations change. Tables created inside
`compute` are part of the computation itself and are not dependencies.

Inside `compute`, you may modify the table being cached and create or
modify temporary tables, provided you remove them before the callback
finishes. Other tables that already existed may be read but not modified,
renamed, or removed. `customQuery()` bypasses enforcement of these rules.

`SimpleDB.customQuery()` bypasses this tracking. Reading or changing a
table with `customQuery()` can therefore return stale cached data. Include
a value that identifies the custom query's dependencies in `options.inputs`
(such as a table content hash), or use tracked `SimpleTable` methods.

Cache entries are stored as DuckDB database files. Full-text search (FTS)
indexes are persisted in the cache file and restored directly on a cache
hit. Vector similarity search (VSS/HNSW) indexes are not persisted in the
cache file; their definitions are stored as metadata and used to rebuild
the indexes on every cache hit. If loading the entry or restoring its
indexes fails, the computation runs again and replaces the cache entry.

## Parameters

### compute

(`table`) => `void` \| `Promise`\<`void`\>

A function wrapping the computations to be cached. It receives the table on which `cache()` was called. This function will be executed on the first run or if the cached data is invalid/expired.

### options?

An optional object with configuration options:

#### inputs?

readonly `unknown`[]

An ordered array of additional values captured by `compute` that affect its result. Each position is compared structurally across runs, so adding, removing, moving, or changing an input invalidates the cache. Functions and class constructors are compared by source. `SimpleTable` dependencies read by `compute` are tracked automatically, and the table being cached is already tracked, so neither needs to be included here.

#### ttl?

`number`

Cache lifetime in seconds. Omit for no expiration, use `0` to refresh the matching cache entry immediately, or provide a positive value to refresh once the entry reaches that age. The cache is also invalidated when the `compute` function, the table, or an input changes.

## Returns

`Promise`\<[`SimpleTable`](../SimpleTable.md)\>

A promise that resolves to the table, so methods can be chained.

## Examples

```ts
// Computations are re-run if the callback changes or earlier operations modify the table
const sdb = new SimpleDB();
const items = await sdb.newTable("items").cache((table) => {
  table
    .loadData("items.csv")
    .summarize({
      columns: "price",
      by: "department",
      stats: ["min", "max", "mean"],
    });
});
await items.log();

// It's important to call close() on the SimpleDB instance to clean up the cache.
// This prevents the cache from growing indefinitely.
await sdb.close();
```

```ts
// Cache with a Time-To-Live (TTL) of 60 seconds
// The computations will be re-run if the cached data is older than 1 minute, the callback changes, or the table changes.
const sdb = new SimpleDB();
const table = await sdb.newTable().cache((table) => {
  table
    .loadData("items.csv")
    .summarize({
      columns: "price",
      by: "department",
      stats: ["min", "max", "mean"],
    });
}, { ttl: 60 });
await table.log();

await sdb.close();
```

```ts
// Enable verbose logging for cache operations via SimpleDB instance
const sdb = new SimpleDB({ cacheVerbose: true });
const table = await sdb.newTable().cache((table) => {
  table
    .loadData("items.csv")
    .summarize({
      columns: "price",
      by: "department",
      stats: ["min", "max", "mean"],
    });
});
await table.log();

await sdb.close();
```

```ts
// Read-only table dependencies are tracked automatically. Other captured values go in inputs.
const year = 2026;
const summary = await sdb.newTable("summary").cache(async (table) => {
  table.loadArray(
    await fires.getData({ conditions: `year = ${year}` }),
  );
}, { inputs: [year] });
await summary.log();
```

## Inherited from

`SimpleTableCore.cache`
