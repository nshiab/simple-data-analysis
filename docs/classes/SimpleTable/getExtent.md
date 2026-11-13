[**Simple Data Analysis v6.0.21**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / getExtent

# Method: getExtent()

> **getExtent**(`column`, `options?`): `Promise`\<\[`unknown`, `unknown`\]\>

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:7450](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.24/src/class/SimpleTable.ts#L7450)

Returns the extent (minimum and maximum values) of a specific column as an array.
Temporal values use the same JavaScript representations as `getData()`.

## Parameters

### column

`string`

The name of the column from which to retrieve the extent.

### options?

#### decimals?

`number`

Nonnegative decimal places for the numeric bounds. Defaults to no rounding.

## Returns

`Promise`\<\[`unknown`, `unknown`\]\>

A promise that resolves to an array `[min, max]` containing the minimum and maximum values of the specified column.

## Example

```ts
console.log(await table.getExtent("price", { decimals: 2 }));
```

## Inherited from

`SimpleTableCore.getExtent`
