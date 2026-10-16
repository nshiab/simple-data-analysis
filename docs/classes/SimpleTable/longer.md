[**Simple Data Analysis v6.0.10**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / longer

# Method: longer()

> **longer**(`columns`, `namesTo`, `valuesTo`): `this`

Restructures this table by stacking (unpivoting) columns. This is useful for tidying up data from a wide format to a long format.

For example, given a table showing employee counts per department per year:

| Department | 2021 | 2022 | 2023 |
| :--------- | :--- | :--- | :--- |
| Accounting | 10   | 9    | 15   |
| Sales      | 52   | 75   | 98   |

We can restructure it by putting all year columns into a new column named `Year` and their corresponding employee counts into a new column named `Employees`.

## Parameters

### columns

`string`[]

An array of strings representing the names of the columns to be stacked (unpivoted).

### namesTo

`string`

The name of the new column that will contain the original column names (e.g., "Year").

### valuesTo

`string`

The name of the new column that will contain the values from the stacked columns (e.g., "Employees").

## Returns

`this`

The table, so methods can be chained.

## Example

```ts
// Restructure the table by stacking year columns into 'year' and 'employees'
await table.longer(["2021", "2022", "2023"], "year", "employees").log();
```

The table will then look like this:

| Department | Year | Employees |
| :--------- | :--- | :-------- |
| Accounting | 2021 | 10        |
| Accounting | 2022 | 9         |
| Accounting | 2023 | 15        |
| Sales      | 2021 | 52        |
| Sales      | 2022 | 75        |
| Sales      | 2023 | 98        |

## Inherited from

`SimpleTableCore.longer`
