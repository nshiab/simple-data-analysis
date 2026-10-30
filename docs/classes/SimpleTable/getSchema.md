[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / getSchema

# Method: getSchema()

> **getSchema**(): `Promise`\<`object`[]\>

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:6808](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L6808)

Returns the schema of the table, including column names and their data types.

## Returns

`Promise`\<`object`[]\>

A promise that resolves to an array of objects, where each object represents a column with its name and data type.

## Example

```ts
// Get the schema of the table
const schema = await table.getSchema();
console.table(schema); // Log the schema in a readable table format
```

## Inherited from

`SimpleTableCore.getSchema`
