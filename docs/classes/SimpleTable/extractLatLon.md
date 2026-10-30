[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / extractLatLon

# Method: extractLatLon()

> **extractLatLon**(`column`, `latColumn`, `lonColumn`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:8375](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L8375)

Extracts the latitude (y) and longitude (x) coordinates from point geometries.
The input geometry is assumed to be in EPSG:4326 (WGS84).

## Parameters

### column

`string`

The name of the column storing the point geometries.

### latColumn

`string`

The name of the new column where the extracted latitude (y-coordinate) values will be stored.

### lonColumn

`string`

The name of the new column where the extracted longitude (x-coordinate) values will be stored.

## Returns

`this`

The table, so methods can be chained.

## Example

```ts
// Extract latitude (y) and longitude (x) from 'geom' into new 'lat' and 'lon' columns.
await table.extractLatLon("geom", "lat", "lon").log();
```

## Inherited from

`SimpleTableCore.extractLatLon`
