[**Simple Data Analysis v6.0.11**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / getDescription

# Method: getDescription()

> **getDescription**(): `Promise`\<`object`[]\>

Returns descriptive statistical information about the columns, including details like data types, number of null values, and distinct values.

## Returns

`Promise`\<`object`[]\>

A promise that resolves to an array of objects, each representing descriptive statistics for a column.

## Example

```ts
// Get and log descriptive information about the table's columns
const description = await table.getDescription();
console.table(description);
```

## Inherited from

`SimpleTableCore.getDescription`
