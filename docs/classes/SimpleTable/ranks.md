[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / ranks

# Method: ranks()

> **ranks**(`column`, `newColumn`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:5703](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L5703)

Assigns ranks to rows in a new column based on the values of a specified column.

## Parameters

### column

`string`

The column containing the values to be used for ranking.

### newColumn

`string`

The name of the new column where the ranks will be stored.

### options?

An optional object with configuration options:

#### by?

`string` \| `string`[]

The column name or an array of column names to rank by. Ranks are assigned independently within each group.

#### dense?

`boolean`

A boolean indicating whether to use dense ranking (no gaps). If `true`, ranks will be consecutive integers (e.g., 1, 2, 2, 3). If `false` (default), ranks might have gaps (e.g., 1, 2, 2, 4).

#### order?

`"desc"` \| `"asc"`

The order of values for ranking: `"asc"` for ascending (default) or `"desc"` for descending.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Compute ranks in a new 'rank' column based on 'score' values (ascending)
await table.ranks("score", "rank").log();
```

```ts
// Compute ranks in a new 'descRank' column based on 'score' values (descending)
await table.ranks("score", "descRank", { order: "desc" }).log();
```

```ts
// Compute ranks by 'department', based on 'salary' values, without gaps
await table.ranks("salary", "salaryRank", { by: "department", dense: true }).log();
```

```ts
// Compute ranks by both 'department' and 'city'
await table.ranks("sales", "salesRank", { by: ["department", "city"] }).log();
```

## Inherited from

`SimpleTableCore.ranks`
