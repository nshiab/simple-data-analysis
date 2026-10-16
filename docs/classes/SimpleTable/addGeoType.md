[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / addGeoType

# Method: addGeoType()

> **addGeoType**(`newColumn`, `options?`): `this`

Adds a column with the geometry type (e.g., `"POINT"`, `"LINESTRING"`, `"POLYGON"`) for each geometry.

## Parameters

### newColumn

`string`

The name of the new column where the geometry types will be stored.

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
// Add a new column 'geometryType' with the type of each geometry
await table.addGeoType("geometryType").log();
```

```ts
// Get the geometry type for geometries in a specific column named 'featureGeom'
await table.addGeoType("featureType", { column: "featureGeom" }).log();
```

## Inherited from

`SimpleTableCore.addGeoType`
