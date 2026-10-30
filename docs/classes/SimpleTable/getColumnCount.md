[**Simple Data Analysis v6.0.14**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / getColumnCount

# Method: getColumnCount()

> **getColumnCount**(): `Promise`\<`number`\>

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:6924](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L6924)

Returns the number of columns in the table.

## Returns

`Promise`\<`number`\>

A promise that resolves to a number representing the total count of columns.

## Example

```ts
// Get the number of columns in the table
const columnCount = await table.getColumnCount();
console.log(columnCount); // e.g., 3
```

## Inherited from

`SimpleTableCore.getColumnCount`
