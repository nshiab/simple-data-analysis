[**Simple Data Analysis v6.0.14**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / normalize

# Method: normalize()

> **normalize**(`column`, `newColumn`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:6583](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L6583)

Normalizes the values in a column using min-max normalization.

## Parameters

### column

`string`

The name of the column in which values will be normalized.

### newColumn

`string`

The name of the new column where normalized values will be stored.

### options?

An optional object with configuration options:

#### by?

`string` \| `string`[]

The column name or an array of column names to partition by. Normalization is performed independently within each group.

#### decimals?

`number`

The number of decimal places to round the normalized values. Defaults to `undefined` (no rounding).

#### range?

\[`number`, `number`\]

The inclusive range to scale normalized values to, as `[minimum, maximum]`. Both values must be finite and the minimum must be less than the maximum. Defaults to `[0, 1]`.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Normalize the values in 'column1' and store them in a new 'normalizedColumn1' column
await table.normalize("column1", "normalizedColumn1").log();
```

```ts
// Normalize 'value' by 'group'
await table.normalize("value", "normalizedValue", { by: "group" }).log();
```

```ts
// Normalize 'data' values, rounded to 2 decimal places
await table.normalize("data", "normalizedData", { decimals: 2 }).log();
```

```ts
// Normalize 'score' values to a range from 0 to 10
await table.normalize("score", "scaledScore", { range: [0, 10] }).log();
```

## Inherited from

`SimpleTableCore.normalize`
