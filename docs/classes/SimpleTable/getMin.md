[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / getMin

# Method: getMin()

> **getMin**(`column`): `Promise`\<`unknown`\>

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:7094](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L7094)

Returns the minimum value from a specific column.
Temporal values use the same JavaScript representations as `getData()`.

## Parameters

### column

`string`

The name of the column from which to retrieve the minimum value.

## Returns

`Promise`\<`unknown`\>

A promise that resolves to the minimum value of the specified column.

## Example

```ts
// Get the minimum value from the 'price' column
const minPrice = await table.getMin("price");
console.log(minPrice); // e.g., 10.50
```

## Inherited from

`SimpleTableCore.getMin`
