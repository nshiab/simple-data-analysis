[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / normalizeVector

# Method: normalizeVector()

> **normalizeVector**(`column`, `newColumn`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:5365](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L5365)

Normalizes a numeric vector column. By default, each dimension is scaled
independently to `[0, 1]` across rows: all first elements together, all
second elements together, and so on. With `normalization: "rowL2"`, each
row is scaled to Euclidean unit length while preserving its direction;
zero vectors remain zero.

The input may be a numeric LIST or fixed-size ARRAY. The output is a
fixed-size DOUBLE ARRAY. Converting large integers and exact decimals to
DOUBLE can lose precision. With `"dimensionMinMax"`, a dimension whose
converted values are all equal cannot be normalized.

## Parameters

### column

`string`

The numeric vector column to normalize.

### newColumn

`string`

The output column. Use the source column's name to
replace the source column with the normalized DOUBLE vector.

### options?

Normalization settings.

#### normalization?

`"dimensionMinMax"` \| `"rowL2"`

`"dimensionMinMax"` scales each dimension
across rows; `"rowL2"` scales each row to unit length. Defaults to
`"dimensionMinMax"`.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Scale each dimension across rows to [0, 1] in a new column.
await table
  .normalizeVector("features", "scaledFeatures")
  .log();
```

```ts
// Replace each vector with its unit-length version; zero vectors stay zero.
await table
  .normalizeVector("features", "features", { normalization: "rowL2" })
  .log();
```

## Inherited from

`SimpleTableCore.normalizeVector`
