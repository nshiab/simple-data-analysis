[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / getSum

# Method: getSum()

> **getSum**(`column`): `Promise`\<`number`\>

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:7212](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L7212)

Returns the sum of values from a specific numeric column.

## Parameters

### column

`string`

The name of the numeric column from which to retrieve the sum.

## Returns

`Promise`\<`number`\>

A promise that resolves to the sum of values in the specified column.

## Example

```ts
// Get the sum of the 'quantity' column
const totalQuantity = await table.getSum("quantity");
console.log(totalQuantity); // e.g., 1250
```

## Inherited from

`SimpleTableCore.getSum`
