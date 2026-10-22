[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / getStdDev

# Method: getStdDev()

> **getStdDev**(`column`, `options?`): `Promise`\<`number`\>

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:7266](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L7266)

Returns the standard deviation of values from a specific numeric column.

## Parameters

### column

`string`

The name of the numeric column from which to retrieve the standard deviation.

### options?

An optional object with configuration options:

#### decimals?

`number`

The number of decimal places to round the result to. Defaults to `undefined` (no rounding).

## Returns

`Promise`\<`number`\>

A promise that resolves to the standard deviation value of the specified column.

## Examples

```ts
// Get the standard deviation of the 'height' column
const heightStdDev = await table.getStdDev("height");
console.log(heightStdDev); // e.g., 5.2
```

```ts
// Get the standard deviation of the 'score' column, rounded to 3 decimal places
const scoreStdDev = await table.getStdDev("score", { decimals: 3 });
console.log(scoreStdDev); // e.g., 12.345
```

## Inherited from

`SimpleTableCore.getStdDev`
