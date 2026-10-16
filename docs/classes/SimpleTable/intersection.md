[**Simple Data Analysis v6.0.10**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / intersection

# Method: intersection()

> **intersection**(`column1`, `column2`, `newColumn`): `this`

Computes the intersection of two sets of geometries, creating new geometries where they overlap.

## Parameters

### column1

`string`

The name of the first column storing geometries.

### column2

`string`

The name of the second column storing geometries. Both columns must have the same projection.

### newColumn

`string`

The name of the new column where the computed intersection geometries will be stored.

## Returns

`this`

The table, so methods can be chained.

## Example

```ts
// Compute the intersection of geometries in 'geomA' and 'geomB' columns, storing results in 'intersectGeom'
await table.intersection("geomA", "geomB", "intersectGeom").log();
```

## Inherited from

`SimpleTableCore.intersection`
