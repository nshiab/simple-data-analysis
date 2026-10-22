[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / createPoints

# Method: createPoints()

> **createPoints**(`latColumn`, `lonColumn`, `newColumn`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:7735](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L7735)

Creates point geometries from latitude (y) and longitude (x) columns.

## Parameters

### latColumn

`string`

The name of the column storing the latitude (y-coordinate) values.

### lonColumn

`string`

The name of the column storing the longitude (x-coordinate) values.

### newColumn

`string`

The name of the new column where the point geometries will be stored.

### options?

An optional object with configuration options:

#### projection?

`string`

The projection of the coordinates. Defaults to EPSG:4326 (WGS84), passed as `"EPSG:4326"`.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Create point geometries in a new 'geom' column using latitude (y) and longitude (x) columns.
// The resulting coordinates are ordered as [longitude, latitude], or [x, y].
// The projection is assumed to be EPSG:4326 (WGS84).
await table.createPoints("lat", "lon", "geom").log();
```

```ts
// Create point geometries from coordinates in a projected coordinate system
await table.createPoints("y", "x", "geom", { projection: "EPSG:3347" }).log();
```

## Inherited from

`SimpleTableCore.createPoints`
