[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / loadStatCanData

# Method: loadStatCanData()

> **loadStatCanData**(`pid`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:681](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L681)

Downloads a complete Statistics Canada table and loads it into this table.

Results are cached as Parquet files in `.sda-cache/statcan` by default.
Cached data does not expire unless a TTL is provided.

## Parameters

### pid

`string`

The Statistics Canada Product ID. Eight-digit PIDs, ten-digit view PIDs, and hyphenated table identifiers are accepted.

### options?

Optional retrieval and cache settings.

#### cache?

`boolean`

Whether to read and write the cache. Defaults to `true`.

#### lang?

`"en"` \| `"fr"`

The language of the table data. Defaults to `"en"`.

#### ttl?

`number`

Cache lifetime in seconds. Omit for no expiration, use `0` to refresh the matching cache entry immediately, or provide a positive value to refresh once the entry reaches that age.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
await sdb
  .newTable("population")
  .loadStatCanData("17-10-0005-01")
  .filter("GEO = 'Canada'")
  .log();
```

```ts
// Refresh French data when the cached table is at least one day old.
await table
  .loadStatCanData("17-10-0005", {
    lang: "fr",
    ttl: 24 * 60 * 60,
  })
  .log();
```

## Inherited from

`SimpleTableCore.loadStatCanData`
