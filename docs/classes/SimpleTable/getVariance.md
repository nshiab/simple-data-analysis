[**Simple Data Analysis v6.0.14**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / getVariance

# Method: getVariance()

> **getVariance**(`column`, `options?`): `Promise`\<`number`\>

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:7300](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L7300)

Returns the variance of values from a specific numeric column.

## Parameters

### column

`string`

The name of the numeric column from which to retrieve the variance.

### options?

An optional object with configuration options:

#### decimals?

`number`

The number of decimal places to round the result to. Defaults to `undefined` (no rounding).

## Returns

`Promise`\<`number`\>

A promise that resolves to the variance value of the specified column.

## Examples

```ts
// Get the variance of the 'data' column
const dataVariance = await table.getVariance("data");
console.log(dataVariance); // e.g., 25.5
```

```ts
// Get the variance of the 'values' column, rounded to 2 decimal places
const valuesVariance = await table.getVariance("values", { decimals: 2 });
console.log(valuesVariance); // e.g., 10.23
```

## Inherited from

`SimpleTableCore.getVariance`
