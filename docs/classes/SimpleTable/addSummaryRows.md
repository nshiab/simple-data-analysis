[**Simple Data Analysis v6.0.14**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / addSummaryRows

# Method: addSummaryRows()

> **addSummaryRows**(`columns`, `labelColumn`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:6213](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L6213)

Adds one or more summary rows to the table. Each row is calculated from
the original rows before any summary rows are added. This is useful for
preparing totals and other statistics before exporting tabular data.

Passing `"all"` selects every numeric column. Columns that are neither
summarized nor used for labels contain `NULL` in the added rows. A stat
string is also used as its row label; pass an object to customize that
label. If `options.stats` is omitted, every supported stat is added.

## Parameters

### columns

`string` \| `string`[]

The numeric column name, an array of numeric column names, or `"all"` to summarize every numeric column.

### labelColumn

`string`

The existing string column in which stat row labels will be written.

### options?

An optional object with configuration options:

#### position?

`"bottom"` \| `"top"`

Whether to add the summary rows at the `"top"` or `"bottom"` of the table. Defaults to `"bottom"`.

#### stats?

`"min"` \| `"max"` \| `"mean"` \| `"median"` \| `"sum"` \| `"countDistinct"` \| `"countNull"` \| `"skew"` \| `"stdDev"` \| `"variance"` \| \{ `label?`: `string`; `stat`: `"min"` \| `"max"` \| `"mean"` \| `"median"` \| `"sum"` \| `"countDistinct"` \| `"countNull"` \| `"skew"` \| `"stdDev"` \| `"variance"`; \} \| (`"min"` \| `"max"` \| `"mean"` \| `"median"` \| `"sum"` \| `"countDistinct"` \| `"countNull"` \| `"skew"` \| `"stdDev"` \| `"variance"` \| \{ `label?`: `string`; `stat`: `"min"` \| `"max"` \| `"mean"` \| `"median"` \| `"sum"` \| `"countDistinct"` \| `"countNull"` \| `"skew"` \| `"stdDev"` \| `"variance"`; \})[]

A stat, stat configuration, or array of either. Supported stats are `"countDistinct"`, `"countNull"`, `"min"`, `"max"`, `"mean"`, `"median"`, `"sum"`, `"skew"`, `"stdDev"`, and `"variance"`. An object's `label` defaults to its `stat`. If omitted, all supported stats are added.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Add a total row for every numeric column, labelled "sum" in "region".
await table.addSummaryRows("all", "region", { stats: "sum" }).log();
```

```ts
// Add two summary rows with default labels.
await table.addSummaryRows(["sales", "expenses"], "region", {
  stats: ["sum", "mean"],
  position: "top",
}).log();
```

```ts
// Customize the labels written to the label column.
await table.addSummaryRows("all", "region", {
  stats: [
    { stat: "sum", label: "Total" },
    { stat: "mean", label: "Average" },
  ],
}).log();
```

## Inherited from

`SimpleTableCore.addSummaryRows`
