[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / getGeoData

# Method: getGeoData()

> **getGeoData**(`options?`): `Promise`\<\{ `features`: `unknown`[]; `type`: `string`; \}\>

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:8694](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L8694)

Returns the table's geospatial data as a GeoJSON FeatureCollection.
Each row becomes a Feature: the selected geometry column becomes its geometry,
and the remaining columns become its properties.
If the table has multiple geometry columns, you must specify which one to use.

## Parameters

### options?

An optional object with configuration options:

#### column?

`string`

The name of the column storing the geometries. If omitted, the table must have exactly one geometry column, which will be selected automatically.

#### rewind?

`boolean`

If `true`, rewinds the coordinates of polygons to follow the spherical winding order (important for D3.js). Defaults to `false`.

## Returns

`Promise`\<\{ `features`: `unknown`[]; `type`: `string`; \}\>

A promise that resolves to a GeoJSON object representing the table's geospatial data.

## Examples

```ts
// Get GeoJSON data from the default geometry column
const geojson = await table.getGeoData();
console.log(geojson);
```

```ts
// Get GeoJSON data from a specific geometry column named 'myGeometries'
const myGeomJson = await table.getGeoData({ column: "myGeometries" });
console.log(myGeomJson);
```

```ts
// Get GeoJSON data and rewind polygon coordinates for D3.js compatibility
const rewoundGeojson = await table.getGeoData({ rewind: true });
console.log(rewoundGeojson);
```

## Inherited from

`SimpleTableCore.getGeoData`
