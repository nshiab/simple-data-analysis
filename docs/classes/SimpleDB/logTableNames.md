[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleDB](../SimpleDB.md) / logTableNames

# Method: logTableNames()

> **logTableNames**(): `Promise`\<[`SimpleDB`](../SimpleDB.md)\>

Logs the names of all tables in the database to the console, sorted alphabetically.

## Returns

`Promise`\<[`SimpleDB`](../SimpleDB.md)\>

A promise that resolves to the database, so methods can be chained.

## Example

```ts
// Log all table names to the console
await sdb.logTableNames();
// Example output: SimpleDB - Tables:  ["employees","customers"]
```

## Inherited from

`SimpleDBCore.logTableNames`
