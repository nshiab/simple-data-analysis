[**Simple Data Analysis v6.0.19**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / percentChange

# Method: percentChange()

> **percentChange**(`column`, `reference`, `newColumn`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:6234](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.23/src/class/SimpleTable.ts#L6234)

Adds a column with the relative change from a reference value for each row.
The result is `(value - reference) / reference * base`, calculated in double
precision. A null input value, a null reference, or a zero reference gives
a null result.

A reference can be another numeric column on the same row or a statistic
computed from `column` over the whole table or within groups. The statistic
ignores null values.

## Parameters

### column

`string`

The numeric column containing the values to compare.

### reference

`string` \| \{ `by?`: `string` \| `string`[]; `stat`: `"min"` \| `"max"` \| `"mean"` \| `"median"`; \}

A numeric column name or an object describing the reference statistic.

`string`

***

#### Type Literal

\{ `by?`: `string` \| `string`[]; `stat`: `"min"` \| `"max"` \| `"mean"` \| `"median"`; \}

A numeric column name or an object describing the reference statistic.

##### by?

`string` \| `string`[]

A column name or array of column names to group by. Defaults to the whole table.

##### stat

`"min"` \| `"max"` \| `"mean"` \| `"median"`

The statistic to compute from `column`, one of `"mean"`, `"median"`, `"min"`, or `"max"`.

### newColumn

`string`

The name of the new column where the results will be stored.

### options?

Optional settings for scaling and rounding the results.

#### base?

`number`

A finite positive multiplier. Defaults to `1` for fractional change. Use `100` for percent units.

#### decimals?

`number`

A nonnegative integer giving the number of decimal places to round to after scaling. Defaults to no rounding.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Each row contains an employee's salary for this year and last year.
// Calculate the year-over-year percent change in salary for each employee.
await table.percentChange(
  "salary",
  "previousYearSalary",
  "salaryPercentChange",
  { base: 100 },
).log();
```

```ts
// Show the percent change from each department's mean salary, rounded to one decimal.
await table.percentChange(
  "salary",
  { stat: "mean", by: "department" },
  "changeFromDepartmentMean",
  { base: 100, decimals: 1 },
).log();
```

```ts
// Compare each salary with the median for its department and country.
// A result of 0.25 means the salary is 25% above that median.
await table.percentChange(
  "salary",
  { stat: "median", by: ["department", "country"] },
  "changeFromDepartmentCountryMedian",
).log();
```

## Inherited from

`SimpleTableCore.percentChange`
