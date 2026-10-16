[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / intersects

# Method: intersects()

> **intersects**(`column1`, `column2`, `newColumn`): `this`

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
