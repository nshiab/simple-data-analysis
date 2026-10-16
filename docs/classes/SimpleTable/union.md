[**Simple Data Analysis v6.0.10**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / union

# Method: union()

> **union**(`column1`, `column2`, `newColumn`): `this`

Computes the union of two geometries, creating a new geometry that represents the merged area of both.

## Parameters

### column1

`string`

The name of the first column storing geometries.

### column2

`string`

The name of the second column storing geometries. Both columns must have the same projection.

### newColumn

`string`

The name of the new column where the computed union geometries will be stored.

## Returns

`this`

The table, so methods can be chained.

## Example

```ts
// Compute the union of geometries in 'geomA' and 'geomB', storing results in 'unionGeom'
await table.union("geomA", "geomB", "unionGeom").log();
```

## Inherited from

`SimpleTableCore.union`
