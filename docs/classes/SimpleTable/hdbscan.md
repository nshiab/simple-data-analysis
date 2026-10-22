[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / hdbscan

# Method: hdbscan()

> **hdbscan**(`columns`, `newColumn`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:1245](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L1245)

Groups rows with similar numeric features using HDBSCAN, without requiring
a predefined number of clusters. Adds a VARCHAR column containing
`"cluster-0"`, `"cluster-1"`, etc., or `"noise"` for rows outside clusters.
Labels identify groups, not their rank.

Accepts a numeric vector column or several numeric scalar columns. Features
are used as supplied. If their scales differ, consider preparing them with
`normalize()`, `zScore()`, or `normalizeVector()` before clustering.

Exact clustering is the default and can be expensive for large datasets.
Set `approximate: true` to use approximate clustering, which can produce
different results, including between repeated runs.

## Parameters

### columns

`string` \| `string`[]

A numeric vector column, or numeric scalar columns in
feature-dimension order.

### newColumn

`string`

The cluster-label column to create.

### options?

HDBSCAN clustering and output settings.

#### allowSingleCluster?

`boolean`

Allow a result with just one cluster,
possibly alongside noise. Defaults to `false`. Setting this to `true` can
favor one broad group, even when there is little meaningful structure.

#### approximate?

`boolean`

Use approximate clustering. Defaults to `false`.

#### membershipScoreColumn?

`string`

Optional DOUBLE column for membership
strength from `0` to `1`. Higher values indicate stronger membership in the
assigned cluster; noise scores `0`.

#### metric?

`"euclidean"` \| `"cosine"`

Use `"euclidean"` to compare feature values, or
`"cosine"` to compare vector direction regardless of overall magnitude.
Defaults to `"euclidean"`.

#### minClusterSize?

`number`

Minimum cluster size, from `2` through the
row count. Defaults to `5`.

#### minSamples?

`number`

Number of neighbors used to estimate local
density, excluding the point itself. Higher values make clustering more
conservative, generally labeling more rows as noise. Set this separately
to adjust density sensitivity independently of minimum cluster size.
Defaults to `minClusterSize`.

#### outlierScoreColumn?

`string`

Optional DOUBLE column for outlier
scores from `0` to `1`. Higher values indicate more unusual rows relative to
their surroundings, including within clusters. This is not necessarily
`1 - membershipScore`.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Cluster numeric columns and add membership and outlier scores.
await table
  .hdbscan(["height", "weight"], "cluster", {
    minClusterSize: 5,
    membershipScoreColumn: "membership",
    outlierScoreColumn: "outlierScore",
  })
  .log();
```

```ts
// Scale vector dimensions before clustering.
await table
  .normalizeVector("features", "scaledFeatures")
  .hdbscan("scaledFeatures", "cluster")
  .log();
```

## Inherited from

`SimpleTableCore.hdbscan`
