[**Simple Data Analysis v6.0.14**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / intersects

# Method: intersects()

> **intersects**(`column1`, `column2`, `newColumn`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:8317](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L8317)

Returns `TRUE` if two geometries intersect (overlap in any way), and `FALSE` otherwise.

## Parameters

### column1

`string`

The name of the first column storing geometries.

### column2

`string`

The name of the second column storing geometries. Both columns must have the same projection.

### newColumn

`string`

The name of the new column where the boolean results (`TRUE` for intersection, `FALSE` otherwise) will be stored.

## Returns

`this`

The table, so methods can be chained.

## Example

```ts
// Check if geometries in 'geomA' and 'geomB' intersect, storing results in 'doIntersect'
await table.intersects("geomA", "geomB", "doIntersect").log();
```

## Inherited from

`SimpleTableCore.intersects`
