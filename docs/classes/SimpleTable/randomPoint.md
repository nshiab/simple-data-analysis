[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / randomPoint

# Method: randomPoint()

> **randomPoint**(`newColumn`, `tries`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:8455](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L8455)

Generates a random point within the geometries of a specified column.

## Parameters

### newColumn

`string`

The name of the new column where the random points will be stored.

### tries

`number`

The number of points to generate within the bounding box of each geometry to find one that is within the geometry itself.

### options?

An optional object with configuration options:

#### column?

`string`

The name of the column storing the geometries within which the random points will be generated. If omitted, the method will automatically attempt to find a geometry column.

#### strict?

`boolean`

If `false`, the method will not throw an error if some points cannot be generated. Corresponding rows will have `NULL` in the new column. Defaults to `true`.

## Returns

`this`

## Examples

```ts
// Generate a random point for each geometry in the default column, trying 100 points
await table.randomPoint("randomPoint", 100).log();
```

```ts
// Generate a random point for each geometry in a specific column named 'areaGeom', trying 50 points
await table.randomPoint("pointInArea", 50, { column: "areaGeom" }).log();
```

```ts
// Generate a random point for each geometry, but don't throw if some points cannot be generated
await table.randomPoint("pointInArea", 1, { strict: false }).log();
```

## Inherited from

`SimpleTableCore.randomPoint`
