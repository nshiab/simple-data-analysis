[**Simple Data Analysis v6.0.10**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleDB](../SimpleDB.md) / hasTable

# Method: hasTable()

> **hasTable**(`table`): `Promise`\<`boolean`\>

Checks if a table exists in the database.

## Parameters

### table

`string` \| [`SimpleTable`](../SimpleTable.md)

The name of the table or a SimpleTable instance.

## Returns

`Promise`\<`boolean`\>

A promise that resolves to `true` if the table exists, `false` otherwise.

## Examples

```ts
// Check if a table named "employees" exists
const exists = await sdb.hasTable("employees");
console.log(exists); // Output: true or false
```

```ts
// Check if a SimpleTable instance exists in the database
const myTable = sdb.newTable("my_data");
const existsInstance = await sdb.hasTable(myTable);
console.log(existsInstance); // Output: true or false
```

## Inherited from

`SimpleDBCore.hasTable`
