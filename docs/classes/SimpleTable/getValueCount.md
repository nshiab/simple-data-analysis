[**Simple Data Analysis v6.0.10**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / getValueCount

# Method: getValueCount()

> **getValueCount**(): `Promise`\<`number`\>

Returns the total number of values in the table (number of columns multiplied by the number of rows).

## Returns

`Promise`\<`number`\>

A promise that resolves to a number representing the total count of values.

## Example

```ts
// Get the total number of values in the table
const valueCount = await table.getValueCount();
console.log(valueCount); // e.g., 300 (if 3 columns and 100 rows)
```

## Inherited from

`SimpleTableCore.getValueCount`
