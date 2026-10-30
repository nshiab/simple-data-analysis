[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / reproject

# Method: reproject()

> **reproject**(`crs`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:7984](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L7984)

Reprojects the geometries in a specified column to another Spatial Reference System (SRS).

## Parameters

### crs

`string`

The target SRS (e.g., `"EPSG:3347"`, or `"EPSG:4326"` for EPSG:4326 (WGS84)).

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
// Reproject geometries in the default column to EPSG:3347 (NAD83/Statistics Canada Lambert)
await table.reproject("EPSG:3347").log();
```

```ts
// Reproject geometries in a specific column named 'myGeom' to EPSG:3347
await table.reproject("EPSG:3347", { column: "myGeom" }).log();
```

## Inherited from

`SimpleTableCore.reproject`
