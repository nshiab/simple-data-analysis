[**Simple Data Analysis v6.0.11**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / getColumnCount

# Method: getColumnCount()

> **getColumnCount**(): `Promise`\<`number`\>

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
