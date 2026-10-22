[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / indexValues

# Method: indexValues()

> **indexValues**(`column`, `newColumn`, `reference`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:6649](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L6649)

Indexes a numeric column by dividing each value by a reference value and multiplying the result by a base value.

The reference can be calculated from the indexed column with a statistic, read from exactly one row selected by another column's value, or read from the unique row where another column reaches its minimum or maximum. With `options.by`, references are calculated or selected independently within each group. Null values in the indexed column remain null when their group has a valid reference. The operation throws when a group has no unique selected row or its reference value is null or zero.

Exact temporal references are compared at their full DuckDB precision. JavaScript `Date` objects only have millisecond precision and always represent an instant. Construct them with an explicit timezone, such as `new Date("2001-01-01T00:00:00Z")`; date-time strings without `Z` or an offset use the user's local timezone.

## Parameters

### column

`string`

The numeric column containing the values to index.

### newColumn

`string`

The name of the new column where indexed values will be stored.

### reference

\{ `at?`: `undefined`; `column?`: `undefined`; `equals?`: `undefined`; `stat`: `"min"` \| `"max"` \| `"mean"` \| `"median"`; \} \| \{ `at?`: `undefined`; `column`: `string`; `equals`: `string` \| `number` \| `bigint` \| `boolean` \| `Date`; `stat?`: `undefined`; \} \| \{ `at`: `"min"` \| `"max"`; `column`: `string`; `equals?`: `undefined`; `stat?`: `undefined`; \}

A statistic calculated from `column`, a column and exact non-null `equals` value selecting a row, or a column and `at` set to `min` or `max` selecting its unique extreme row. The selected row's `column` value becomes the reference.

#### Type Literal

\{ `at?`: `undefined`; `column?`: `undefined`; `equals?`: `undefined`; `stat`: `"min"` \| `"max"` \| `"mean"` \| `"median"`; \}

A statistic calculated from `column`, a column and exact non-null `equals` value selecting a row, or a column and `at` set to `min` or `max` selecting its unique extreme row. The selected row's `column` value becomes the reference.

##### at?

`undefined`

Selects the unique row where `reference.column` reaches its minimum or maximum.

##### column?

`undefined`

The column used to select an exact reference row or its unique minimum or maximum row.

##### equals?

`undefined`

The non-null value used to select an exact reference row. Its JavaScript type must be compatible with the reference column's DuckDB type; string, numeric, boolean, and temporal values are not coerced across type families. Date values should be constructed with an explicit timezone.

##### stat

`"min"` \| `"max"` \| `"mean"` \| `"median"`

The statistic used to calculate the reference directly from the indexed column.

***

#### Type Literal

\{ `at?`: `undefined`; `column`: `string`; `equals`: `string` \| `number` \| `bigint` \| `boolean` \| `Date`; `stat?`: `undefined`; \}

A statistic calculated from `column`, a column and exact non-null `equals` value selecting a row, or a column and `at` set to `min` or `max` selecting its unique extreme row. The selected row's `column` value becomes the reference.

##### at?

`undefined`

Selects the unique row where `reference.column` reaches its minimum or maximum.

##### column

`string`

The column used to select an exact reference row or its unique minimum or maximum row.

##### equals

`string` \| `number` \| `bigint` \| `boolean` \| `Date`

The non-null value used to select an exact reference row. Its JavaScript type must be compatible with the reference column's DuckDB type; string, numeric, boolean, and temporal values are not coerced across type families. Date values should be constructed with an explicit timezone.

##### stat?

`undefined`

The statistic used to calculate the reference directly from the indexed column.

***

#### Type Literal

\{ `at`: `"min"` \| `"max"`; `column`: `string`; `equals?`: `undefined`; `stat?`: `undefined`; \}

A statistic calculated from `column`, a column and exact non-null `equals` value selecting a row, or a column and `at` set to `min` or `max` selecting its unique extreme row. The selected row's `column` value becomes the reference.

##### at

`"min"` \| `"max"`

Selects the unique row where `reference.column` reaches its minimum or maximum.

##### column

`string`

The column used to select an exact reference row or its unique minimum or maximum row.

##### equals?

`undefined`

The non-null value used to select an exact reference row. Its JavaScript type must be compatible with the reference column's DuckDB type; string, numeric, boolean, and temporal values are not coerced across type families. Date values should be constructed with an explicit timezone.

##### stat?

`undefined`

The statistic used to calculate the reference directly from the indexed column.

### options?

An optional object with configuration options.

#### base?

`number`

The finite positive value assigned to the reference. Defaults to `100`.

#### by?

`string` \| `string`[]

A column name or an array of column names to partition by. The reference is calculated independently within each group.

#### decimals?

`number`

A finite non-negative integer specifying the number of decimal places to retain. By default, values are not rounded.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Index each country's average home price to its January 2001 value.
await table.indexValues(
  "homePrice",
  "homePriceIndexed",
  {
    column: "date",
    equals: new Date("2001-01-01T00:00:00Z"),
  },
  {
    by: "country",
    base: 100,
    decimals: 1,
  },
).log();
```

```ts
// Index each value against the mean of its group.
await table.indexValues("homePrice", "homePriceIndexed", { stat: "mean" }, {
  by: "country",
}).log();
```

```ts
// Index each country's average home price to its earliest value.
// This throws if multiple rows share the earliest date in a country.
await table.indexValues("homePrice", "homePriceIndexed", {
  column: "date",
  at: "min",
}, { by: "country" }).log();
```

## Inherited from

`SimpleTableCore.indexValues`
