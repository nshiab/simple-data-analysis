[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / getDescription

# Method: getDescription()

> **getDescription**(): `Promise`\<`object`[]\>

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:6825](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L6825)

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
