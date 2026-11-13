[**Simple Data Analysis v6.0.20**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / getMin

# Method: getMin()

> **getMin**(`column`, `options?`): `Promise`\<`unknown`\>

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:7362](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.23/src/class/SimpleTable.ts#L7362)

Returns the minimum value from a specific column.
Temporal values use the same JavaScript representations as `getData()`.

## Parameters

### column

`string`

The name of the column from which to retrieve the minimum value.

### options?

#### decimals?

`number`

Nonnegative decimal places for the numeric minimum. Defaults to no rounding.

## Returns

`Promise`\<`unknown`\>

A promise that resolves to the minimum value of the specified column.

## Example

```ts
console.log(await table.getMin("price", { decimals: 2 }));
```

## Inherited from

`SimpleTableCore.getMin`
