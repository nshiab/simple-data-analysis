[**Simple Data Analysis v6.0.11**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / unnestGeo

# Method: unnestGeo()

> **unnestGeo**(`column?`): `this`

Unnests geometries recursively, transforming multi-part geometries (e.g., MultiPolygon) into individual single-part geometries (e.g., Polygon).

## Parameters

### column?

`string`

The name of the column storing the geometries to be unnested. If omitted, the method will automatically attempt to find a geometry column.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Unnest geometries in the default column
await table.unnestGeo().log();
```

```ts
// Unnest geometries in a specific column named 'multiGeom'
await table.unnestGeo("multiGeom").log();
```

## Inherited from

`SimpleTableCore.unnestGeo`
