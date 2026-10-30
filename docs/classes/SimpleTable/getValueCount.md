[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / getValueCount

# Method: getValueCount()

> **getValueCount**(): `Promise`\<`number`\>

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:7024](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L7024)

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
