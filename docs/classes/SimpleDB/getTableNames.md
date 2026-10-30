[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleDB](../SimpleDB.md) / getTableNames

# Method: getTableNames()

> **getTableNames**(): `Promise`\<`string`[]\>

Defined in: [simple-data-analysis-core/src/class/SimpleDB.ts:723](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleDB.ts#L723)

Returns an array of all table names in the database, sorted alphabetically.

## Returns

`Promise`\<`string`[]\>

A promise that resolves to an array of table names.

## Example

```ts
// Get all table names
const tableNames = await sdb.getTableNames();
console.log(tableNames); // Output: ["employees", "customers"]
```

## Inherited from

`SimpleDBCore.getTableNames`
