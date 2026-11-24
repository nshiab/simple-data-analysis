[**Simple Data Analysis v6.0.23**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleDB](../SimpleDB.md) / close

# Method: close()

> **close**(`options?`): `Promise`\<`SimpleDB`\<`SimpleTable`\>\>

Defined in: [simple-data-analysis-core/src/class/SimpleDB.ts:1033](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.26/src/class/SimpleDB.ts#L1033)

Executes pending transformations, saves SDA metadata for writable persistent
databases, and closes the connection and instance. Also cleans up temporary
files and, by default, prunes unused table cache entries after a run that
uses the cache.

## Parameters

### options?

#### pruneCache?

`boolean`

Whether to prune unused table cache entries. Defaults to `true`.

## Returns

`Promise`\<`SimpleDB`\<`SimpleTable`\>\>

A promise that resolves to the SimpleDB instance after cleanup.

## Examples

```ts
// close() executes queued transformations before cleaning up resources.
table.loadData("data.csv").convert({ price: "number" });
await sdb.close();
```

```ts
// Preserve entries in a shared table cache when closing a test database.
await sdb.close({ pruneCache: false });
```

## Throws

An error after cleanup when pending execution or cleanup fails.

## Inherited from

`SimpleDBCore.close`
