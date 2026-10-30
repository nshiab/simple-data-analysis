[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / getColumns

# Method: getColumns()

> **getColumns**(): `Promise`\<`string`[]\>

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:6864](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L6864)

Returns a list of all column names in the table.

## Returns

`Promise`\<`string`[]\>

A promise that resolves to an array of strings, where each string is a column name.

## Example

```ts
// Get all column names from the table
const columns = await table.getColumns();
console.log(columns); // e.g., ["id", "name", "age"]
```

## Inherited from

`SimpleTableCore.getColumns`
