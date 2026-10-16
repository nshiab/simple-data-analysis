[**Simple Data Analysis v6.0.10**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / fillHoles

# Method: fillHoles()

> **fillHoles**(`column?`): `this`

Fills holes in polygon geometries.

## Parameters

### column?

`string`

The name of the column storing the geometries. If omitted, the method will automatically attempt to find a geometry column.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Fill holes in geometries in the default geometry column
await table.fillHoles().log();
```

```ts
// Fill holes in geometries in a specific column named 'polygonGeom'
await table.fillHoles("polygonGeom").log();
```

## Inherited from

`SimpleTableCore.fillHoles`
