[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / summarize

# Method: summarize()

> **summarize**(`options?`): `this`

Creates a summary table from selected columns, optionally grouped by other columns.
This method allows you to aggregate data, calculate statistics (e.g., count, mean, sum), and group results by categorical columns.

## Parameters

### options?

An object with configuration options for summarization:

#### by?

`string` \| `string`[]

The column name or an array of column names to group by.

#### columns?

`string` \| `string`[]

The column name or an array of column names to summarize. If omitted, only the row count is returned.

#### datesToMs?

`boolean`

If `true`, timestamps, dates, and times will be converted to milliseconds before summarizing. This is useful when summarizing mixed data types (numbers and dates) as columns must be of the same type for aggregation.

#### decimals?

`number`

The number of decimal places to round the summarized columns. Defaults to `undefined` (no rounding).

#### outputTable?

`string` \| `boolean`

If `true`, the results will be stored in a new table with a generated name. If a string, it will be used as the name for the new table. If `false` or omitted, the current table will be overwritten. Defaults to `false`.

#### stats?

`"min"` \| `"max"` \| `"mean"` \| `"median"` \| `"sum"` \| `"count"` \| `"countDistinct"` \| `"countNull"` \| `"skew"` \| `"stdDev"` \| `"variance"` \| (`"min"` \| `"max"` \| `"mean"` \| `"median"` \| `"sum"` \| `"count"` \| `"countDistinct"` \| `"countNull"` \| `"skew"` \| `"stdDev"` \| `"variance"`)[] \| \{\[`key`: `string`\]: `"min"` \| `"max"` \| `"mean"` \| `"median"` \| `"sum"` \| `"count"` \| `"countDistinct"` \| `"countNull"` \| `"skew"` \| `"stdDev"` \| `"variance"`; \}

The statistics to compute. Can be a single statistic (e.g., `"mean"`), an array (e.g., `["min", "max"]`), or an object mapping output column names to statistics (e.g., `{ avgSalary: "mean" }`). Supported statistics are `"count"`, `"countDistinct"`, `"countNull"`, `"min"`, `"max"`, `"mean"`, `"median"`, `"sum"`, `"skew"`, `"stdDev"`, and `"variance"`.

## Returns

`this`

A table instance containing the summarized data (either the current table or a new table), so methods can be chained. When summarizing more than one column, a `column` column identifies which input column each row summarizes.

## Examples

```ts
// Summarize all columns with all available statistics, overwriting the current table
const columns = await table.getColumns();
await table.summarize({ columns }).log();
```

```ts
// Summarize all columns and store the results in a new table with a generated name
const columns = await table.getColumns();
const summaryTable = await table.summarize({ columns, outputTable: true }).log();
```

```ts
// Summarize all columns and store the results in a new table named 'mySummary'
const columns = await table.getColumns();
const mySummaryTable = await table.summarize({ columns, outputTable: "mySummary" }).log();
```

```ts
// Summarize a single column ('sales') with all available statistics
await table.summarize({ columns: "sales" }).log();
```

```ts
// Summarize multiple columns ('sales' and 'profit') with all available statistics
await table.summarize({ columns: ["sales", "profit"] }).log();
```

```ts
// Summarize 'sales' by 'region' (single category)
await table.summarize({ columns: "sales", by: "region" }).log();
```

```ts
// Summarize 'sales' by 'region' and 'product_type'
await table.summarize({ columns: "sales", by: ["region", "product_type"] }).log();
```

```ts
// Summarize 'sales' by 'region' with a specific statistic (mean)
await table.summarize({ columns: "sales", by: "region", stats: "mean" }).log();
```

```ts
// Summarize 'sales' by 'region' with specific statistics (mean and sum)
await table.summarize({ columns: "sales", by: "region", stats: ["mean", "sum"] }).log();
```

```ts
// Summarize 'sales' by 'region' with custom named statistics
await table.summarize({ columns: "sales", by: "region", stats: { averageSales: "mean", totalSales: "sum" } }).log();
```

```ts
// Summarize 'price' and 'cost', rounding aggregated columns to 2 decimal places
await table.summarize({ columns: ["price", "cost"], decimals: 2 }).log();
```

```ts
// Summarize 'timestamp_column' by converting to milliseconds first
await table.summarize({ columns: "timestamp_column", datesToMs: true, stats: "mean" }).log();
```

## Inherited from

`SimpleTableCore.summarize`
