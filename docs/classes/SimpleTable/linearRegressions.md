[**Simple Data Analysis v6.0.11**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / linearRegressions

# Method: linearRegressions()

> **linearRegressions**(`options?`): `this`

Performs linear regression analysis. The results include the slope, the y-intercept, and the R-squared value.
If no `x` and `y` columns are specified, the method computes linear regression analysis for all numeric column permutations.
Note that linear regression analysis is asymmetrical: the linear regression of `x` over `y` is not the same as `y` over `x`.

## Parameters

### options?

An optional object with configuration options:

#### by?

`string` \| `string`[]

The column name or an array of column names to group by. Linear regressions are calculated independently within each group.

#### decimals?

`number`

The number of decimal places to round the regression values (slope, intercept, r-squared). Defaults to `undefined` (no rounding).

#### outputTable?

`string` \| `boolean`

If `true`, the results will be stored in a new table with a generated name. If a string, it will be used as the name for the new table. If `false` or omitted, the current table will be overwritten. Defaults to `false`.

#### x?

`string`

The name of the column for the independent variable (x-values). If omitted, linear regressions will be computed for all numeric columns as x.

#### y?

`string`

The name of the column for the dependent variable (y-values). It can be provided only when `options.x` is also set. If both are omitted, linear regressions will be computed for all numeric column permutations.

## Returns

`this`

A table instance containing the linear regression results (either the current table or a new table), so methods can be chained.

## Examples

```ts
// Compute all linear regressions between all numeric columns, overwriting the current table
await table.linearRegressions().log();
```

```ts
// Compute linear regressions with 'column1' as the independent variable and all other numeric columns as dependent variables
await table.linearRegressions({ x: "column1" }).log();
```

```ts
// Compute the linear regression of 'sales' (y) over 'advertising' (x)
await table.linearRegressions({ x: "advertising", y: "sales" }).log();
```

```ts
// Compute linear regressions by 'region' and store results in a new table
const regressionTable = await table.linearRegressions({ by: "region", outputTable: true }).log();
```

```ts
// Compute linear regressions, rounded to 3 decimal places
await table.linearRegressions({ decimals: 3 }).log();
```

## Inherited from

`SimpleTableCore.linearRegressions`
