[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / wider

# Method: wider()

> **wider**(`namesFrom`, `valuesFrom`, `options?`): `this`

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

We can restructure it by creating new columns for each year, with the associated employee counts as values.

## Parameters

### namesFrom

`string`

The name of the column containing the values that will be transformed into new column headers (e.g., "Year").

### valuesFrom

`string`

The name of the column containing the values to be spread across the new columns (e.g., "Employees").

### options?

An optional object with configuration options:

#### stat?

`"min"` \| `"max"` \| `"mean"` \| `"median"` \| `"sum"` \| `"count"` \| `"first"`

The stat function applied when multiple rows share the same `namesFrom`/grouping combination: `"sum"`, `"count"`, `"min"`, `"max"`, `"mean"`, `"median"`, or `"first"`. Defaults to `"sum"`.

## Returns

`this`

The table, so methods can be chained.

## Example

```ts
// Restructure the table by pivoting 'Year' into new columns with 'Employees' as values
await table.wider("Year", "Employees").log();
```

The table will then look like this:

| Department | 2021 | 2022 | 2023 |
| :--------- | :--- | :--- | :--- |
| Accounting | 10   | 9    | 15   |
| Sales      | 52   | 75   | 98   |

When multiple rows share the same `namesFrom`/grouping combination, their `valuesFrom` values are combined with the `options.stat` function (`"sum"` by default).

## Inherited from

`SimpleTableCore.wider`
