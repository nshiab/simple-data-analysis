[**Simple Data Analysis v6.0.11**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleDB](../SimpleDB.md) / getTables

# Method: getTables()

> **getTables**(): readonly [`SimpleTable`](../SimpleTable.md)[]

Returns an array of all SimpleTable instances in the database.

The returned array is a snapshot and cannot mutate the database's internal
table registry.

## Returns

readonly [`SimpleTable`](../SimpleTable.md)[]

A read-only array of SimpleTable instances.

## Example

```ts
// Get all SimpleTable instances
const tables = sdb.getTables();
```

## Inherited from

`SimpleDBCore.getTables`
