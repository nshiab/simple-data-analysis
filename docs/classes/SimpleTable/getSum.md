[**Simple Data Analysis v6.0.19**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / getSum

# Method: getSum()

> **getSum**(`column`, `options?`): `Promise`\<`number`\>

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:7487](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.23/src/class/SimpleTable.ts#L7487)

Returns the sum of values from a specific numeric column.

## Parameters

### column

`string`

The name of the numeric column from which to retrieve the sum.

### options?

An optional object with configuration options:

#### decimals?

`number`

A nonnegative integer giving the number of decimal places to round the sum to. Defaults to no rounding.

## Returns

`Promise`\<`number`\>

A promise that resolves to the sum of values in the specified column.

## Examples

```ts
// Get the sum of the 'quantity' column
const totalQuantity = await table.getSum("quantity");
console.log(totalQuantity); // e.g., 1250
```

```ts
// Round the total to two decimal places.
const totalSales = await table.getSum("sales", { decimals: 2 });
console.log(totalSales);
```

## Inherited from

`SimpleTableCore.getSum`
