[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / columnProportions

# Method: columnProportions()

> **columnProportions**(`column`, `newColumn`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:6016](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L6016)

Computes proportions vertically over a column's values, relative to the sum of all values in that column or group.

## Parameters

### column

`string`

The column containing values for which proportions will be computed. The proportions are calculated based on the sum of values in the specified column.

### newColumn

`string`

The name of the new column where the proportions will be stored.

### options?

An optional object with configuration options:

#### base?

`number`

A finite positive value that the proportions in the column or each group sum to before rounding. Defaults to `1`.

#### by?

`string` \| `string`[]

The column name or an array of column names to partition by. Proportions are calculated independently within each group.

#### decimals?

`number`

The number of decimal places to round the computed proportions. Defaults to `undefined` (no rounding).

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Add a new column 'perc' with each 'column1' value divided by the sum of all 'column1' values
await table.columnProportions("column1", "perc").log();
```

```ts
// Compute proportions for 'column1' by 'column2', rounded to two decimal places
await table.columnProportions("column1", "perc", { by: "column2", decimals: 2 }).log();
```

```ts
// Compute percentages that sum to 100 before rounding
await table.columnProportions("sales", "sales_percentage", { base: 100, decimals: 1 }).log();
```

```ts
// Compute proportions for 'sales' by 'region' and 'product_type'
await table.columnProportions("sales", "sales_proportion", { by: ["region", "product_type"] }).log();
```

## Inherited from

`SimpleTableCore.columnProportions`
