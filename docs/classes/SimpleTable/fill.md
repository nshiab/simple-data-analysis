[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / fill

# Method: fill()

> **fill**(`columns`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:1709](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L1709)

Fills `NULL` values in specified columns. By default, each `NULL` is replaced with the last non-`NULL` value from the preceding row. When `interpolate` is `true`, `NULL` values are replaced using linear interpolation (or extrapolation at the ends). Pass `interpolateBy` with a real numeric or date column name to use it as the X-axis, so that interpolated values are proportional to the actual distances between X-axis values rather than treating every row as equidistant. When `interpolateBy` is set, `interpolate` is automatically assumed `true`.

## Parameters

### columns

`string` \| `string`[]

The column(s) for which to fill `NULL` values.

### options?

An optional object with configuration options:

#### by?

`string` \| `string`[]

A column name or an array of column names to partition by. The fill is applied independently within each group.

#### interpolate?

`boolean`

If `true`, replaces `NULL` values with linearly interpolated values using DuckDB's `fill()` window function. When `interpolateBy` is not set, row positions are used as the X-axis, treating rows as equidistant. For `NULL` values at the ends, linear extrapolation is used. Both the column values and the X-axis values must support arithmetic. If `false` or omitted, the previous non-`NULL` value is used instead. Automatically assumed `true` when `interpolateBy` is set.

#### interpolateBy?

`string`

A column name to use as the X-axis for interpolation instead of equidistant row positions. When provided, `interpolate` is automatically assumed `true`. Use this when rows are not evenly spaced (e.g., timestamps or non-uniform numeric indices) so that interpolated values are proportional to the actual distance between X-axis values.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Fill NULL values in 'column1' with the previous non-NULL value
await table.fill("column1").log();
```

```ts
// Fill NULL values in multiple columns
await table.fill(["columnA", "columnB"]).log();
```

```ts
// Fill NULL values in 'value' independently within each 'group'
await table.fill("value", { by: "group" }).log();
```

```ts
// Fill NULL values in 'value' using linear interpolation
await table.fill("value", { interpolate: true }).log();
```

```ts
// Fill NULL values in 'value' using linear interpolation, independently within each 'group'
await table.fill("value", { by: "group", interpolate: true }).log();
```

```ts
// Fill NULL values in 'value' using linear interpolation proportional to 'x' distances
await table.fill("value", { interpolate: true, interpolateBy: "x" }).log();
```

```ts
// interpolateBy implies interpolate: true, so this is equivalent to the previous example
await table.fill("value", { interpolateBy: "x" }).log();
```

## Inherited from

`SimpleTableCore.fill`
