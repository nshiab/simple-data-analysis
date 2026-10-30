[**Simple Data Analysis v6.0.14**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / intersection

# Method: intersection()

> **intersection**(`column1`, `column2`, `newColumn`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:8256](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L8256)

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
