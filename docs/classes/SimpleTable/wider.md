[**Simple Data Analysis v6.0.18**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / wider

# Method: wider()

> **wider**(`namesFrom`, `valuesFrom`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:2389](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.22/src/class/SimpleTable.ts#L2389)

Restructures this table by unstacking (pivoting) values, transforming data from a long format to a wide format.

For example, given a table showing employee counts per department per year:

| Department | Year | Employees |
| :--------- | :--- | :-------- |
| Accounting | 2021 | 10        |
| Accounting | 2022 | 9         |
| Accounting | 2023 | 15        |
| Sales      | 2021 | 52        |
| Sales      | 2022 | 75        |
| Sales      | 2023 | 98        |

Pivoting `Year` creates one column per year with the associated employee counts:

| Department | 2021 | 2022 | 2023 |
| :--------- | :--- | :--- | :--- |
| Accounting | 10   | 9    | 15   |
| Sales      | 52   | 75   | 98   |

Each combination of the pivot value and the remaining grouping columns
must identify at most one row. If several rows map to the same output
cell, pass `options.stat` to combine them or remove the duplicate rows.
A `NULL` pivot value does not create a column.

## Parameters

### namesFrom

`string`

The name of the column containing the values that will be transformed into new column headers (e.g., "Year").

### valuesFrom

`string`

The name of the column containing the values to be spread across the new columns (e.g., "Employees").

### options?

An optional object with configuration options:

#### decimals?

`number`

Nonnegative decimal places for numeric pivot values. Defaults to no rounding.

#### stat?

`"min"` \| `"max"` \| `"mean"` \| `"median"` \| `"sum"` \| `"count"` \| `"first"`

The function applied to the rows for each pivot cell: `"sum"`, `"count"`, `"min"`, `"max"`, `"mean"`, `"median"`, or `"first"`. If omitted, each cell uses its source value and multiple rows for the same cell cause an error.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
await table.wider("Year", "Employees").log();
```

```ts
// Average sales when several rows map to the same cell, then round the result.
await table.wider("year", "sales", { stat: "mean", decimals: 2 }).log();
```

## Inherited from

`SimpleTableCore.wider`
