[**Simple Data Analysis v6.0.14**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / similarityMahalanobis

# Method: similarityMahalanobis()

> **similarityMahalanobis**(`columns`, `referencePoint`, `newColumn`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:5435](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L5435)

Measures numeric profile similarity using each row's Mahalanobis distance
from a supplied reference point and stores it in a new DOUBLE column.
Smaller distances indicate more similar profiles. Optionally adds a
dataset-relative similarity score, where larger values mean more similar.
Sample covariance (`n - 1`) is estimated from the dataset, independently
of the reference point.

Accounts for differences in feature scales and correlations between features,
making it useful for comparing profiles with measurements in different units.

Pass one numeric LIST or ARRAY column, or an array of numeric scalar columns.
Reference arrays follow the same dimension order. For scalar columns, a
reference object supplies its own finite numeric values by column name; extra
fields are ignored. Reference values are captured when this method is called.
Inputs are converted privately to DOUBLE, which can lose precision for large
integers and exact
decimals; source columns and types remain unchanged.

Requires more rows than dimensions and finite, non-null, consistent features
with invertible, numerically stable covariance. Invalid inputs leave the
source unchanged.

## Parameters

### columns

`string` \| `string`[]

A numeric vector column, or numeric scalar columns in feature order.

### referencePoint

`number`[] \| \{\[`key`: `string`\]: `unknown`; \}

An array of finite numbers in feature order, or an object with an own finite numeric value for each scalar feature column; may be outside the dataset.

### newColumn

`string`

The name of the new DOUBLE distance column.

### options?

Optional output settings.

#### similarityColumn?

`string` \| `boolean`

A custom name, or true for a new DOUBLE column named "similarity"; false or omitted adds no score. The dataset-relative
score is `1 - distance / maxDistance`. Exact matches score 1 and the farthest
rows score 0; if all distances are zero, every score is 1.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Measure distance from a reference height and weight.
await table
  .similarityMahalanobis(["height", "weight"], [175, 70], "distance")
  .log();
```

```ts
// Compare feature vectors and add a dataset-relative similarity score.
await table
  .similarityMahalanobis("features", [175, 70], "distance", {
    similarityColumn: "similarity",
  })
  .log();
```

```ts
// Compare profiles directly with a row and use the default score column.
const reference = await table.getRow("name === 'Alex'");
await table
  .similarityMahalanobis(["height", "weight"], reference, "distance", {
    similarityColumn: true,
  })
  .log();
```

## Inherited from

`SimpleTableCore.similarityMahalanobis`
