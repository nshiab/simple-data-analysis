[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / getBoundingBox

# Method: getBoundingBox()

> **getBoundingBox**(`column?`): `Promise`\<\[`number`, `number`, `number`, `number`\]\>

Returns the bounding box of geometries in `[minLon, minLat, maxLon, maxLat]` order.
By default, the method will try to find the column with the geometries. The input geometry is assumed to be in EPSG:4326 (WGS84).

## Parameters

### column?

`string`

The name of the column storing geometries. If omitted, the method will automatically attempt to find a geometry column.

## Returns

`Promise`\<\[`number`, `number`, `number`, `number`\]\>

A promise that resolves to an array `[minLon, minLat, maxLon, maxLat]` representing the bounding box.

## Examples

```ts
// Get the bounding box of geometries in the default column
const bbox = await table.getBoundingBox();
console.log(bbox); // e.g., [-75.0, 45.0, -73.0, 46.0]
```

```ts
// Get the bounding box of geometries in a specific column named 'areaGeom'
const areaBbox = await table.getBoundingBox("areaGeom");
console.log(areaBbox);
```

## Inherited from

`SimpleTableCore.getBoundingBox`
