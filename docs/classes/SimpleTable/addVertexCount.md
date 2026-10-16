[**Simple Data Analysis v6.0.11**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / addVertexCount

# Method: addVertexCount()

> **addVertexCount**(`newColumn`, `options?`): `this`

Adds a column with the number of vertices (points) in each geometry.

## Parameters

### newColumn

`string`

The name of the new column where the vertex counts will be stored.

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
// Add a new column 'vertexCount' with the number of vertices for each geometry
// The method will automatically detect the geometry column.
await table.addVertexCount("vertexCount").log();
```

```ts
// Add vertex counts for geometries in a specific column named 'myGeom'
await table.addVertexCount("myGeomVertices", { column: "myGeom" }).log();
```

## Inherited from

`SimpleTableCore.addVertexCount`
