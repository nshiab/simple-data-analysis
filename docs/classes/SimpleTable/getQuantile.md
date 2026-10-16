[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / getQuantile

# Method: getQuantile()

> **getQuantile**(`column`, `quantile`, `options?`): `Promise`\<`number`\>

Returns the value of a specific quantile from the values in a given numeric column.

## Parameters

### column

`string`

The name of the numeric column from which to calculate the quantile.

### quantile

`number`

The quantile to calculate, expressed as a number between 0 and 1 (e.g., `0.25` for the first quartile, `0.5` for the median, `0.75` for the third quartile).

### options?

An optional object with configuration options:

#### decimals?

`number`

The number of decimal places to round the result to. Defaults to `undefined` (no rounding).

## Returns

`Promise`\<`number`\>

A promise that resolves to the quantile value of the specified column.

## Examples

```ts
// Get the first quartile (25th percentile) of 'column1'
const firstQuartile = await table.getQuantile("column1", 0.25);
console.log(firstQuartile); // e.g., 15.7
```

```ts
// Get the 90th percentile of 'score' values, rounded to 2 decimal places
const ninetiethPercentile = await table.getQuantile("score", 0.9, { decimals: 2 });
console.log(ninetiethPercentile); // e.g., 88.55
```

## Inherited from

`SimpleTableCore.getQuantile`
