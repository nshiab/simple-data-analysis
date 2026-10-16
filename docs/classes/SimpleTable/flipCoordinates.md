[**Simple Data Analysis v6.0.10**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / flipCoordinates

# Method: flipCoordinates()

> **flipCoordinates**(`column?`): `this`

Flips the coordinate order of geometries in a specified column (e.g., from `[longitude (x), latitude (y)]` to `[latitude (y), longitude (x)]` or vice-versa).
**Warning:** This method should be used with caution as it directly manipulates coordinate order and can affect the accuracy of geospatial operations if not used correctly.

## Parameters

### column?

`string`

The name of the column storing the geometries. If omitted, the method will automatically attempt to find a geometry column.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Flip coordinates in the default geometry column
await table.flipCoordinates().log();
```

```ts
// Flip coordinates in a specific column named 'myGeom'
await table.flipCoordinates("myGeom").log();
```

## Inherited from

`SimpleTableCore.flipCoordinates`
