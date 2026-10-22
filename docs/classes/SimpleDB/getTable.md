[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleDB](../SimpleDB.md) / getTable

# Method: getTable()

> **getTable**(`name`): `Promise`\<[`SimpleTable`](../SimpleTable.md)\>

Defined in: [simple-data-analysis-core/src/class/SimpleDB.ts:623](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleDB.ts#L623)

Retrieves an existing SimpleTable instance from the database.

## Parameters

### name

`string`

The name of the table to retrieve.

## Returns

`Promise`\<[`SimpleTable`](../SimpleTable.md)\>

A promise that resolves to the SimpleTable instance if found.

## Example

```ts
// Retrieve the "employees" table
const employees = await sdb.getTable("employees");
await employees.log();
```

## Inherited from

`SimpleDBCore.getTable`
