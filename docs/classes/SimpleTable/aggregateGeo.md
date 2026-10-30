[**Simple Data Analysis v6.0.14**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / aggregateGeo

# Method: aggregateGeo()

> **aggregateGeo**(`method`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:8606](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L8606)

Aggregates geometries in a specified column based on a chosen aggregation method.

## Parameters

### method

`"union"` \| `"intersection"`

The aggregation method to apply: `"union"` (combines all geometries into a single multi-geometry) or `"intersection"` (computes the intersection of all geometries).

### options?

An optional object with configuration options:

#### by?

`string` \| `string`[]

The column name or an array of column names to group by. Geometries are aggregated independently within each group.

#### column?

`string`

The name of the column storing the geometries to be aggregated. If omitted, the method will automatically attempt to find a geometry column.

#### outputTable?

`string` \| `boolean`

If `true`, the results will be stored in a new table with a generated name. If a string, it will be used as the name for the new table. If `false` or omitted, the current table will be overwritten. Defaults to `false`.

## Returns

`this`

A table instance containing the aggregated geometries (either the current table or a new table), so methods can be chained.

## Examples

```ts
// Aggregate all geometries in the default column into a single union geometry
await table.aggregateGeo("union").log();
```

```ts
// Aggregate geometries by 'country' and compute their union
await table.aggregateGeo("union", { by: "country" }).log();
```

```ts
// Aggregate geometries in 'regions' column into their intersection, storing results in a new table
const intersectionTable = await table.aggregateGeo("intersection", { column: "regions", outputTable: true }).log();
```

## Inherited from

`SimpleTableCore.aggregateGeo`
