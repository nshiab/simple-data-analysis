[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / getMedian

# Method: getMedian()

> **getMedian**(`column`, `options?`): `Promise`\<`number`\>

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:7190](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L7190)

Returns the median value from a specific numeric column.

## Parameters

### column

`string`

The name of the numeric column from which to retrieve the median value.

### options?

An optional object with configuration options:

#### decimals?

`number`

The number of decimal places to round the result to. Defaults to `undefined` (no rounding).

## Returns

`Promise`\<`number`\>

A promise that resolves to the median value of the specified column.

## Examples

```ts
// Get the median of the 'age' column
const medianAge = await table.getMedian("age");
console.log(medianAge); // e.g., 30
```

```ts
// Get the median of the 'salary' column, rounded to 2 decimal places
const medianSalary = await table.getMedian("salary", { decimals: 2 });
console.log(medianSalary); // e.g., 50000.00
```

## Inherited from

`SimpleTableCore.getMedian`
