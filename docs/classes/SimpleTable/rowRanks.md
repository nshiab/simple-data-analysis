[**Simple Data Analysis v6.0.10**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / rowRanks

# Method: rowRanks()

> **rowRanks**(`columns`, `options`): `this`

Selects a ranked numeric value within each row and adds its source column
name, its value, or both as new columns.

Values are ranked from highest to lowest by default. Null values are
ignored. By default, a tie at the requested rank throws an error. Set
`options.ties` to `"first"` to select the first tied column in the supplied
order, or to `"all"` to produce one row for each tied column. The `"all"`
option can therefore increase the table's row count. If null values leave
a row without the requested rank, the new columns contain null.

## Parameters

### columns

`string`[]

The numeric columns to rank within each row.

### options

\{ `nameColumn`: `string`; `valueColumn?`: `string`; \} \| \{ `nameColumn?`: `string`; `valueColumn`: `string`; \} & `object`

The output columns and ranking configuration. At least one of `nameColumn` or `valueColumn` is required.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Add the name and value of the highest-scoring party on each row.
await table.rowRanks(["CAQ", "PLQ", "PQ"], {
  nameColumn: "winner",
  valueColumn: "winningVotes",
}).log();
```

```ts
// Add only the second-lowest value on each row.
await table.rowRanks(["CAQ", "PLQ", "PQ"], {
  valueColumn: "secondLowestVotes",
  rank: 2,
  order: "asc",
}).log();
```

## Inherited from

`SimpleTableCore.rowRanks`
