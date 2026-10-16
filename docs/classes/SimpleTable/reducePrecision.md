[**Simple Data Analysis v6.0.10**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / reducePrecision

# Method: reducePrecision()

> **reducePrecision**(`decimals`, `options?`): `this`

Reduces the precision of geometries in a specified column to a given number of decimal places.

## Parameters

### decimals

`number`

The number of decimal places to keep in the coordinates of the geometries.

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
// Reduce the precision of geometries in the default column to 3 decimal places
await table.reducePrecision(3).log();
```

```ts
// Reduce the precision of geometries in a specific column named 'myGeom' to 2 decimal places
await table.reducePrecision(2, { column: "myGeom" }).log();
```

## Inherited from

`SimpleTableCore.reducePrecision`
