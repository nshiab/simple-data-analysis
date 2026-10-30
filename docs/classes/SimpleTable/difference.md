[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / difference

# Method: difference()

> **difference**(`column1`, `column2`, `newColumn`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:8275](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L8275)

Computes the geometric difference between two geometries, returning the portion of the first geometry that does not intersect the second.

## Parameters

### column1

`string`

The name of the column storing the geometries from which the second geometries will be subtracted.

### column2

`string`

The name of the column storing the geometries to subtract. Both columns must have the same projection.

### newColumn

`string`

The name of the new column where the geometric differences will be stored.

## Returns

`this`

The table, so methods can be chained.

## Example

```ts
// Subtract 'geomB' from 'geomA', storing the result in 'geomA_minus_geomB'
await table.difference("geomA", "geomB", "geomA_minus_geomB").log();
```

## Inherited from

`SimpleTableCore.difference`
