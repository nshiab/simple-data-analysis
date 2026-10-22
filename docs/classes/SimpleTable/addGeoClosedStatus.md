[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / addGeoClosedStatus

# Method: addGeoClosedStatus()

> **addGeoClosedStatus**(`newColumn`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:7840](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L7840)

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
