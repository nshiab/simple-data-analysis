[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / umap

# Method: umap()

> **umap**(`columns`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:1167](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L1167)

Reduces numeric features, such as embeddings, to a two-dimensional UMAP
projection. The resulting coordinates are added as `umapX` and `umapY`,
while all existing columns (including the source feature columns), their
values and types, and the input row order are preserved. DuckDB computes
neighbors and the fuzzy graph; TypeScript optimizes the coordinates without
copying the input vectors into JavaScript. Neighbor search is selected
automatically.

Accepts a numeric LIST or ARRAY column, or an array of numeric scalar column
names combined internally into a vector in the supplied order. Features
must be finite and non-null; vectors must be nonempty and equally sized.
Features are converted to DOUBLE without automatic scaling. Large integers
and exact decimals can lose precision in this conversion. If feature scales
differ, consider `normalize()` or `zScore()` before projection.

The defaults are a starting point for exploration. To adjust the projection:

- `neighbors` (default `15`): How many nearby points influence the layout.
  Smaller values emphasize local detail but can fragment groups. Larger
  values emphasize broader structure, can hide local detail, and generally
  require more time and memory.
- `metric` (default `"euclidean"`): How similarity is measured. Euclidean
  compares distance, including differences in vector magnitude. Cosine
  compares direction, ignoring magnitude. Choose according to what makes
  vectors similar in your data; neither is universally better.
- `epochs` (default `200`): How many passes refine the coordinates. Fewer
  passes finish sooner but may leave the layout unfinished. More passes
  allow further refinement and take longer, with diminishing returns.
- `minDistance` (default `0.1`): How tightly points can group in the
  projection. Smaller values allow tighter clumps; larger values spread
  points out. This changes the layout's appearance, not an accuracy level
  or the number of optimization passes.
- `learningRate` (default `1`): The initial size of coordinate adjustments.
  Smaller values make gentler adjustments and may need more epochs. Larger
  values make bigger adjustments but can overshoot useful positions. This
  does not change the number of passes.
- `negativeSamples` (default `5`): How many random points are sampled for
  repulsion per attractive update. Smaller values reduce work and
  repulsion; larger values increase both, tending to separate unrelated
  points more strongly. More samples do not guarantee a better projection.

## Parameters

### columns

`string` \| `string`[]

A numeric vector column name, or a nonempty array of numeric scalar column names in feature order. Use a one-element array for a single scalar feature.

### options?

Optional projection settings.

#### epochs?

`number`

Integer number of refinement passes, at least 1. Defaults to 200.

#### learningRate?

`number`

Finite, positive initial learning rate. Defaults to 1.

#### metric?

`"euclidean"` \| `"cosine"`

Input distance metric: "euclidean" or "cosine". Defaults to "euclidean".

#### minDistance?

`number`

Grouping distance parameter between 0 and 1. Defaults to 0.1.

#### negativeSamples?

`number`

Integer number of samples used to separate unrelated points, at least 1. Defaults to 5.

#### neighbors?

`number`

Neighborhood size, including the point itself. Integer of at least 2, clamped to row count minus one. Defaults to 15.

#### seed?

`number`

Integer used to initialize random choices. Defaults to 42.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
await table.umap("embedding", {
  metric: "cosine",
  seed: 42,
}).log();
```

```ts
await table.umap("embedding", {
  neighbors: 30,
  minDistance: 0.25,
}).selectColumns(["label", "umapX", "umapY"]).log();
```

```ts
await table
  .umap(["height", "weight", "age"], { seed: 42 })
  .log();
```

## Inherited from

`SimpleTableCore.umap`
