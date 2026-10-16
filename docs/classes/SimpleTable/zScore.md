[**Simple Data Analysis v6.0.11**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / zScore

# Method: zScore()

> **zScore**(`column`, `newColumn`, `options?`): `this`

Computes the Z-score for values in a specified column.

## Parameters

### column

`string`

The name of the column for which Z-scores will be calculated.

### newColumn

`string`

The name of the new column where the computed Z-scores will be stored.

### options?

An optional object with configuration options:

#### by?

`string` \| `string`[]

The column name or an array of column names to partition by. Z-scores are calculated independently within each group.

#### decimals?

`number`

The number of decimal places to round the Z-score values. Defaults to `undefined` (no rounding).

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Calculate the Z-score for 'age' values and store results in a new 'ageZScore' column
await table.zScore("age", "ageZScore").log();
```

```ts
// Calculate Z-scores for 'salary' by 'department'
await table.zScore("salary", "salaryZScore", { by: "department" }).log();
```

```ts
// Calculate Z-scores for 'score', rounded to 2 decimal places
await table.zScore("score", "scoreZScore", { decimals: 2 }).log();
```

## Inherited from

`SimpleTableCore.zScore`
