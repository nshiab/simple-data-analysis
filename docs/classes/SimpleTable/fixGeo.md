[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / fixGeo

# Method: fixGeo()

> **fixGeo**(`column?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:7815](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L7815)

Attempts to make invalid geometries valid without removing any vertices.

## Parameters

### column?

`string`

The name of the column storing the geometries to be fixed. If omitted, the method will automatically attempt to find a geometry column.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Fix invalid geometries in the default geometry column
await table.fixGeo().log();
```

```ts
// Fix invalid geometries in a specific column named 'myGeom'
await table.fixGeo("myGeom").log();
```

## Inherited from

`SimpleTableCore.fixGeo`
