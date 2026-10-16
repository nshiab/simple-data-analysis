[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / addBoundingBox

# Method: addBoundingBox()

> **addBoundingBox**(`options?`): `this`

Adds the bounding box coordinates of geometries in a specified column as four new columns: `minLon`, `minLat`, `maxLon`, and `maxLat`.

## Parameters

### options?

An optional object with configuration options:

#### column?

`string`

The name of the column storing the geometries for which the bounding box will be computed. If omitted, the method will automatically attempt to find a geometry column.

#### decimals?

`number`

The number of decimal places to round the bounding box coordinates. Defaults to `undefined` (no rounding).

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Compute the bounding box for geometries in the default column
await table.addBoundingBox().log();
// The table now has minLon, minLat, maxLon, and maxLat columns.
```

```ts
// Compute the bounding box for geometries in 'geom' column and round coordinates to 2 decimal places
await table.addBoundingBox({ column: "geom", decimals: 2 }).log();
// The table now has minLon, minLat, maxLon, and maxLat columns with values rounded to 2 decimal places.
```

## Inherited from

`SimpleTableCore.addBoundingBox`
