[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / flipCoordinates

# Method: flipCoordinates()

> **flipCoordinates**(`column?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:7889](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L7889)

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
