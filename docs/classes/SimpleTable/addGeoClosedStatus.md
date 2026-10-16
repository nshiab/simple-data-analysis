[**Simple Data Analysis v6.0.10**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / addGeoClosedStatus

# Method: addGeoClosedStatus()

> **addGeoClosedStatus**(`newColumn`, `options?`): `this`

Adds a column with boolean values indicating whether geometries are closed (e.g., polygons) or open (e.g., linestrings).

## Parameters

### newColumn

`string`

The name of the new column where the boolean results (`TRUE` for closed, `FALSE` for open) will be stored.

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
// Check if geometries are closed and store results in a new 'isClosed' column
await table.addGeoClosedStatus("isClosed").log();
```

```ts
// Check closed status of geometries in a specific column named 'boundaryGeom'
await table.addGeoClosedStatus("boundaryClosed", { column: "boundaryGeom" }).log();
```

## Inherited from

`SimpleTableCore.addGeoClosedStatus`
