[**Simple Data Analysis v6.0.11**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / coveredBy

# Method: coveredBy()

> **coveredBy**(`column`, `containerColumn`, `newColumn`): `this`

Returns `TRUE` if every point of a geometry in `column` is covered by a geometry in `containerColumn`, including their boundaries, and `FALSE` otherwise.

## Parameters

### column

`string`

The name of the column storing the geometries to be tested for containment.

### containerColumn

`string`

The name of the column storing the geometries to be tested as containers. Both columns must have the same projection.

### newColumn

`string`

The name of the new column where the boolean results (`TRUE` when covered, `FALSE` otherwise) will be stored.

## Returns

`this`

The table, so methods can be chained.

## Example

```ts
// Check if geometries in 'pointGeom' are covered by 'polygonGeom', storing results in 'isCovered'
await table.coveredBy("pointGeom", "polygonGeom", "isCovered").log();
```

## Inherited from

`SimpleTableCore.coveredBy`
