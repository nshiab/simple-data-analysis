[**Simple Data Analysis v6.0.23**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / nest

# Method: nest()

> **nest**(`column`, `by`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:5926](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.26/src/class/SimpleTable.ts#L5926)

Collects a column's values into one DuckDB list per group.

Each output row contains the grouping columns and a list in the original
value column. The list keeps the input order, duplicate values, and nulls.
Use [unnest()](unnest.md) to expand the list into rows again.

## Parameters

### column

`string`

The column containing the values to collect into lists.

### by

`string` \| `string`[]

One or more grouping column names, distinct from the value column.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Team A gets scores [12, 18]. Team B gets [15].
await table
  .loadArray([
    { team: "A", score: 12 },
    { team: "B", score: 15 },
    { team: "A", score: 18 },
  ])
  .nest("score", "team")
  .log();
```

```ts
// Collect tags for each country and city.
await table
  .loadArray([
    { country: "Canada", city: "Montréal", tag: "red" },
    { country: "Canada", city: "Montréal", tag: "blue" },
  ])
  .nest("tag", ["country", "city"])
  .log();
```

## Inherited from

`SimpleTableCore.nest`
