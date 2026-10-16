[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / buffer

# Method: buffer()

> **buffer**(`newColumn`, `distance`, `options?`): `this`

Computes a buffer (a polygon representing a specified distance around a geometry) for geometries in a specified column.
The distance is in the Spatial Reference System (SRS) unit of the input geometries.

## Parameters

### newColumn

`string`

The name of the new column where the buffered geometries will be stored.

### distance

`number`

The distance for the buffer. This value is in the units of the geometry's SRS.

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
// Create a buffer of 1 unit around geometries in the default column, storing results in 'bufferedGeom'
await table.buffer("bufferedGeom", 1).log();
```

```ts
// Create a buffer of 10 units around geometries in a specific column named 'pointsGeom'
await table.buffer("pointsBuffer", 10, { column: "pointsGeom" }).log();
```

## Inherited from

`SimpleTableCore.buffer`
