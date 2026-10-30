[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / rolling

# Method: rolling()

> **rolling**(`column`, `newColumn`, `stat`, `preceding`, `following`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:6352](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L6352)

Computes rolling aggregations (e.g., rolling average, min, max) over a specified column.
For rows without enough preceding or following rows to form a complete window, `NULL` will be returned.
For this method to work properly, ensure your data is sorted by the relevant column(s) first.
Windows count rows, not calendar days.
For daily windows, first prepare one row per consecutive date within each group.
A window containing `NULL` values returns `NULL`.

## Parameters

### column

`string`

The name of the column storing the values to be aggregated.

### newColumn

`string`

The name of the new column in which the computed rolling values will be stored.

### stat

`"min"` \| `"max"` \| `"mean"` \| `"median"` \| `"sum"`

The aggregation function to apply: `"min"`, `"max"`, `"mean"`, `"median"`, or `"sum"`.

### preceding

`number`

The number of preceding rows to include in the rolling window.

### following

`number`

The number of following rows to include in the rolling window.

### options?

An optional object with configuration options:

#### by?

`string` \| `string`[]

The column name or an array of column names to partition by. Rolling statistics are computed independently within each group.

#### decimals?

`number`

The number of decimal places to round the aggregated values. Defaults to `undefined` (no rounding).

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Compute a 7-row rolling average of 'sales' with 3 preceding and 3 following rows
// (total window size of 7: 3 preceding + current + 3 following)
await table.rolling("sales", "rollingAvgSales", "mean", 3, 3).log();
```

```ts
// Compute a rolling sum of 'transactions' by 'customer_id'
await table.rolling("transactions", "rollingSumTransactions", "sum", 5, 0, { by: "customer_id" }).log();
```

```ts
// Compute a rolling maximum of 'temperature' rounded to 1 decimal place
await table.rolling("temperature", "rollingMaxTemp", "max", 2, 2, { decimals: 1 }).log();
```

## Inherited from

`SimpleTableCore.rolling`
