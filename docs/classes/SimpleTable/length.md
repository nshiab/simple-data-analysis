[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / length

# Method: length()

> **length**(`newColumn`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:8068](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L8068)

Computes the length of line geometries in meters (`"m"`) or optionally kilometers (`"km"`).
The input geometry is assumed to be in EPSG:4326 (WGS84).

## Parameters

### newColumn

`string`

The name of the new column where the computed lengths will be stored.

### options?

An optional object with configuration options:

#### column?

`string`

The name of the column storing the geometries. If omitted, the method will automatically attempt to find a geometry column.

#### decimals?

`number`

The number of decimal places to round the computed lengths. Defaults to `undefined` (no rounding).

#### unit?

`"m"` \| `"km"`

The unit for the computed length: `"m"` (meters) or `"km"` (kilometers). Defaults to `"m"`.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Compute the length of line geometries in meters and store in 'length_m'
await table.length("length_m").log();
```

```ts
// Compute the length of line geometries in kilometers and store in 'length_km'
await table.length("length_km", { unit: "km" }).log();
```

```ts
// Compute lengths in kilometers rounded to two decimal places
await table.length("length_km", { unit: "km", decimals: 2 }).log();
```

```ts
// Compute the length of geometries in a specific column named 'routeGeom'
await table.length("routeLength", { column: "routeGeom" }).log();
```

## Inherited from

`SimpleTableCore.length`
