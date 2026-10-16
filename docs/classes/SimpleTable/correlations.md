[**Simple Data Analysis v6.0.11**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / correlations

# Method: correlations()

> **correlations**(`options?`): `this`

Calculates correlations between columns. If no `x` and `y` columns are specified, the method computes the correlations for all numeric column combinations.
Note that correlation is symmetrical: the correlation of `x` with `y` is the same as `y` with `x`.

## Parameters

### options?

An optional object with configuration options:

#### by?

`string` \| `string`[]

The column name or an array of column names to group by. Correlations are calculated independently within each group.

#### decimals?

`number`

The number of decimal places to round the correlation values. Defaults to `undefined` (no rounding).

#### outputTable?

`string` \| `boolean`

If `true`, the results will be stored in a new table with a generated name. If a string, it will be used as the name for the new table. If `false` or omitted, the current table will be overwritten. Defaults to `false`.

#### x?

`string`

The name of the column for the x-values. If omitted, correlations will be computed for all numeric columns.

#### y?

`string`

The name of the column for the y-values. It can be provided only when `options.x` is also set. If both are omitted, correlations will be computed for all numeric column pairs.

## Returns

`this`

A table instance containing the correlation results (either the current table or a new table), so methods can be chained.

## Examples

```ts
// Compute correlations between all numeric columns, overwriting the current table
await table.correlations().log();
```

```ts
// Compute correlations between 'column1' and all other numeric columns
await table.correlations({ x: "column1" }).log();
```

```ts
// Compute the correlation between 'column1' and 'column2'
await table.correlations({ x: "column1", y: "column2" }).log();
```

```ts
// Compute correlations within 'categoryColumn' and store results in a new table
const correlationTable = await table.correlations({ by: "categoryColumn", outputTable: true }).log();
```

```ts
// Compute correlations, rounded to 2 decimal places
await table.correlations({ decimals: 2 }).log();
```

## Inherited from

`SimpleTableCore.correlations`
