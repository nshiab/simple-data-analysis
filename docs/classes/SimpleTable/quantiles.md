[**Simple Data Analysis v6.0.10**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / quantiles

# Method: quantiles()

> **quantiles**(`column`, `count`, `newColumn`, `options?`): `this`

Assigns quantiles to rows in a new column based on specified column values.

## Parameters

### column

`string`

The column containing values from which quantiles will be assigned.

### count

`number`

The number of quantiles to divide the data into (e.g., `4` for quartiles, `10` for deciles).

### newColumn

`string`

The name of the new column where the assigned quantiles will be stored.

### options?

An optional object with configuration options:

#### by?

`string` \| `string`[]

The column name or an array of column names to partition by. Quantiles are assigned independently within each group.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Assigns a quantile from 1 to 10 for each row in a new 'quantiles' column, based on 'column1' values.
await table.quantiles("column1", 10, "quantiles").log();
```

```ts
// Assign quantiles by 'column2', based on 'column1' values.
await table.quantiles("column1", 10, "quantiles", { by: "column2" }).log();
```

```ts
// Assigns quartiles (4 quantiles) to 'sales' data, storing results in 'salesQuartile'
await table.quantiles("sales", 4, "salesQuartile").log();
```

## Inherited from

`SimpleTableCore.quantiles`
