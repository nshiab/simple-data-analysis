[**Simple Data Analysis v6.0.21**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / getMax

# Method: getMax()

> **getMax**(`column`, `options?`): `Promise`\<`unknown`\>

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:7433](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.24/src/class/SimpleTable.ts#L7433)

Returns the maximum value from a specific column.
Temporal values use the same JavaScript representations as `getData()`.

## Parameters

### column

`string`

The name of the column from which to retrieve the maximum value.

### options?

#### decimals?

`number`

Nonnegative decimal places for the numeric maximum. Defaults to no rounding.

## Returns

`Promise`\<`unknown`\>

A promise that resolves to the maximum value of the specified column.

## Example

```ts
console.log(await table.getMax("price", { decimals: 2 }));
```

## Inherited from

`SimpleTableCore.getMax`
