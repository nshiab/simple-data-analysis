[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / getMax

# Method: getMax()

> **getMax**(`column`): `Promise`\<`unknown`\>

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:7112](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L7112)

Returns the maximum value from a specific column.
Temporal values use the same JavaScript representations as `getData()`.

## Parameters

### column

`string`

The name of the column from which to retrieve the maximum value.

## Returns

`Promise`\<`unknown`\>

A promise that resolves to the maximum value of the specified column.

## Example

```ts
// Get the maximum value from the 'price' column
const maxPrice = await table.getMax("price");
console.log(maxPrice); // e.g., 99.99
```

## Inherited from

`SimpleTableCore.getMax`
