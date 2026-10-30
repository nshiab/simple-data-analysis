[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / area

# Method: area()

> **area**(`newColumn`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:8024](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L8024)

Computes the area of geometries in square meters (`"m2"`) or optionally square kilometers (`"km2"`).
The input geometry is assumed to be in EPSG:4326 (WGS84).

## Parameters

### newColumn

`string`

The name of the new column where the computed areas will be stored.

### options?

An optional object with configuration options:

#### column?

`string`

The name of the column storing the geometries. If omitted, the method will automatically attempt to find a geometry column.

#### decimals?

`number`

The number of decimal places to round the computed areas. Defaults to `undefined` (no rounding).

#### unit?

`"m2"` \| `"km2"`

The unit for the computed area: `"m2"` (square meters) or `"km2"` (square kilometers). Defaults to `"m2"`.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Compute the area of geometries in square meters and store in 'area_m2'
await table.area("area_m2").log();
```

```ts
// Compute the area of geometries in square kilometers and store in 'area_km2'
await table.area("area_km2", { unit: "km2" }).log();
```

```ts
// Compute areas in square kilometers rounded to two decimal places
await table.area("area_km2", { unit: "km2", decimals: 2 }).log();
```

```ts
// Compute the area of geometries in a specific column named 'myGeom'
await table.area("myGeomArea", { column: "myGeom" }).log();
```

## Inherited from

`SimpleTableCore.area`
