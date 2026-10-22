[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / unnest

# Method: unnest()

> **unnest**(`column`, `separator`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:5472](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L5472)

Unnests (expands) rows by splitting a column's string values into multiple rows based on a separator.

Each value in the specified column is split using the provided separator, and a new row is created for each resulting substring. All other column values are duplicated across the newly created rows.

## Parameters

### column

`string`

The name of the column containing string values to be split and unnested.

### separator

`string`

The delimiter string used to split the column values.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Unnest 'tags' column separated by commas
// Before: [{ id: 1, tags: "red,blue,green" }]
// After:  [{ id: 1, tags: "red" }, { id: 1, tags: "blue" }, { id: 1, tags: "green" }]
await table.unnest("tags", ",").log();
```

```ts
// Unnest 'neighborhoods' column separated by " / "
// Before: [{ city: "Montreal", neighborhoods: "Old Montreal / Chinatown / Griffintown" }]
// After:  [{ city: "Montreal", neighborhoods: "Old Montreal" },
//         { city: "Montreal", neighborhoods: "Chinatown" },
//         { city: "Montreal", neighborhoods: "Griffintown" }]
await table.unnest("neighborhoods", " / ").log();
```

## Inherited from

`SimpleTableCore.unnest`
