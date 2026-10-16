[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleDB](../SimpleDB.md) / getTableNames

# Method: getTableNames()

> **getTableNames**(): `Promise`\<`string`[]\>

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
