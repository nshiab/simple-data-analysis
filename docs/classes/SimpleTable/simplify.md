[**Simple Data Analysis v6.0.11**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / simplify

# Method: simplify()

> **simplify**(`tolerance`, `options?`): `this`

Simplifies geometries while preserving their overall coverage. A higher tolerance results in more significant simplification.

## Parameters

### tolerance

`number`

A numeric value representing the simplification tolerance. A higher value leads to greater simplification.

### options?

An optional object with configuration options:

#### column?

`string`

The name of the column storing the geometries. If omitted, the method will automatically attempt to find a geometry column.

#### simplifyBoundary?

`boolean`

If `true` (default), the boundary of the geometries will also be simplified. If `false`, only the interior of the geometries will be simplified, preserving the original boundary.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Simplify geometries in the default column with a tolerance of 0.1
await table.simplify(0.1).log();
```

```ts
// Simplify geometries in 'myGeom' column, preserving the boundary
await table.simplify(0.05, { column: "myGeom", simplifyBoundary: false }).log();
```

## Inherited from

`SimpleTableCore.simplify`
