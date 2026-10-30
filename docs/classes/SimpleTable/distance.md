[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / distance

# Method: distance()

> **distance**(`column1`, `column2`, `newColumn`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:8509](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L8509)

Computes the distance between geometries in two specified columns.
By default, the distance is calculated in the Spatial Reference System (SRS) unit of the input geometries.
You can optionally specify `"spheroid"` or `"haversine"` methods to get results in meters or kilometers.
If using `"spheroid"` or `"haversine"`, the input geometries must be in EPSG:4326 (WGS84).

## Parameters

### column1

`string`

The name of the first column storing geometries.

### column2

`string`

The name of the second column storing geometries.

### newColumn

`string`

The name of the new column where the computed distances will be stored.

### options?

An optional object with configuration options:

#### decimals?

`number`

The number of decimal places to round the distance values. Defaults to `undefined` (no rounding).

#### method?

`"srs"` \| `"haversine"` \| `"spheroid"`

The method to use for distance calculations: `"srs"` (default, uses SRS unit), `"haversine"` (meters, requires EPSG:4326 (WGS84)), or `"spheroid"` (meters, requires EPSG:4326 (WGS84), most accurate but slowest).

#### unit?

`"m"` \| `"km"`

If `method` is `"spheroid"` or `"haversine"`, you can choose between `"m"` (meters, default) or `"km"` (kilometers).

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Compute distance between 'geomA' and 'geomB' in SRS units, store in 'distance_srs'
await table.distance("geomA", "geomB", "distance_srs").log();
```

```ts
// Compute Haversine distance in meters between 'point1' and 'point2', store in 'distance_m'
// Input geometries must be in EPSG:4326 (WGS84).
await table.distance("point1", "point2", "distance_m", { method: "haversine" }).log();
```

```ts
// Compute Haversine distance in kilometers, rounded to 2 decimal places
// Input geometries must be in EPSG:4326 (WGS84).
await table.distance("point1", "point2", "distance_km", { method: "haversine", unit: "km", decimals: 2 }).log();
```

```ts
// Compute Spheroid distance in kilometers
// Input geometries must be in EPSG:4326 (WGS84).
await table.distance("area1", "area2", "distance_spheroid_km", { method: "spheroid", unit: "km" }).log();
```

## Inherited from

`SimpleTableCore.distance`
