[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / centroid

# Method: centroid()

> **centroid**(`newColumn`, `options?`): `this`

Computes the centroid of geometries.
The values are returned in the SRS unit of the input geometries.

## Parameters

### newColumn

`string`

The name of the new column where the computed centroid geometries will be stored.

### options?

An optional object with configuration options:

#### column?

`string`

The name of the column storing the geometries. If omitted, the method will automatically attempt to find a geometry column.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Compute the centroid of geometries in the default column, storing results in 'centerPoint'
await table.centroid("centerPoint").log();
```

```ts
// Compute the centroid of geometries in a specific column named 'areaGeom'
await table.centroid("areaCentroid", { column: "areaGeom" }).log();
```

## Inherited from

`SimpleTableCore.centroid`
