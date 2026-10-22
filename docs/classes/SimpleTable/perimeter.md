[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / perimeter

# Method: perimeter()

> **perimeter**(`newColumn`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:8115](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L8115)

Computes the perimeter of polygon geometries in meters (`"m"`) or optionally kilometers (`"km"`).
The input geometry is assumed to be in EPSG:4326 (WGS84).

## Parameters

### newColumn

`string`

The name of the new column where the computed perimeters will be stored.

### options?

An optional object with configuration options:

#### column?

`string`

The name of the column storing the geometries. If omitted, the method will automatically attempt to find a geometry column.

#### decimals?

`number`

The number of decimal places to round the computed perimeters. Defaults to `undefined` (no rounding).

#### unit?

`"m"` \| `"km"`

The unit for the computed perimeter: `"m"` (meters) or `"km"` (kilometers). Defaults to `"m"`.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Compute the perimeter of polygon geometries in meters and store in 'perimeter_m'
await table.perimeter("perimeter_m").log();
```

```ts
// Compute the perimeter of polygon geometries in kilometers and store in 'perimeter_km'
await table.perimeter("perimeter_km", { unit: "km" }).log();
```

```ts
// Compute perimeters in kilometers rounded to two decimal places
await table.perimeter("perimeter_km", { unit: "km", decimals: 2 }).log();
```

```ts
// Compute the perimeter of geometries in a specific column named 'landParcelGeom'
await table.perimeter("landParcelPerimeter", { column: "landParcelGeom" }).log();
```

## Inherited from

`SimpleTableCore.perimeter`
