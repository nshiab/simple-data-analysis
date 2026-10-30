[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / getSkew

# Method: getSkew()

> **getSkew**(`column`, `options?`): `Promise`\<`number`\>

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:7238](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L7238)

Returns the skewness of values from a specific numeric column.

## Parameters

### column

`string`

The name of the numeric column from which to retrieve the skewness.

### options?

An optional object with configuration options:

#### decimals?

`number`

The number of decimal places to round the result to. Defaults to `undefined` (no rounding).

## Returns

`Promise`\<`number`\>

A promise that resolves to the skewness value of the specified column.

## Examples

```ts
// Get the skewness of the 'data' column
const dataSkew = await table.getSkew("data");
console.log(dataSkew); // e.g., 0.5
```

```ts
// Get the skewness of the 'values' column, rounded to 2 decimal places
const valuesSkew = await table.getSkew("values", { decimals: 2 });
console.log(valuesSkew); // e.g., -0.25
```

## Inherited from

`SimpleTableCore.getSkew`
