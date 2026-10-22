[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / getMean

# Method: getMean()

> **getMean**(`column`, `options?`): `Promise`\<`number`\>

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:7156](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L7156)

Returns the mean (average) value from a specific numeric column.

## Parameters

### column

`string`

The name of the numeric column from which to retrieve the mean value.

### options?

An optional object with configuration options:

#### decimals?

`number`

The number of decimal places to round the result to. Defaults to `undefined` (no rounding).

## Returns

`Promise`\<`number`\>

A promise that resolves to the mean value of the specified column.

## Examples

```ts
// Get the mean of the 'age' column
const meanAge = await table.getMean("age");
console.log(meanAge); // e.g., 35.75
```

```ts
// Get the mean of the 'salary' column, rounded to 2 decimal places
const meanSalary = await table.getMean("salary", { decimals: 2 });
console.log(meanSalary); // e.g., 55000.23
```

## Inherited from

`SimpleTableCore.getMean`
