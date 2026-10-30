[**Simple Data Analysis v6.0.14**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / nest

# Method: nest()

> **nest**(`column`, `separator`, `by`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:5537](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L5537)

Nests (collapses) rows by aggregating a column's values into a single string per group, separated by a delimiter.

This is the inverse operation of `unnest()`. Multiple rows are combined into fewer rows by grouping on specified category columns and concatenating the target column values with a separator.

## Parameters

### column

`string`

The name of the column whose values will be aggregated and concatenated.

### separator

`string`

The delimiter string used to join the column values.

### by

`string` \| `string`[]

The column name or an array of column names to group by.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Nest 'neighborhoods' column separated by " / " for each city
// Before: [{ city: "Montreal", neighborhoods: "Old Montreal" },
//         { city: "Montreal", neighborhoods: "Chinatown" },
//         { city: "Montreal", neighborhoods: "Griffintown" }]
// After:  [{ city: "Montreal", neighborhoods: "Old Montreal / Chinatown / Griffintown" }]
await table.nest("neighborhoods", " / ", "city").log();
```

```ts
// Nest with multiple category columns
// Before: [{ country: "Canada", city: "Montreal", tags: "red" },
//         { country: "Canada", city: "Montreal", tags: "blue" }]
// After:  [{ country: "Canada", city: "Montreal", tags: "red,blue" }]
await table.nest("tags", ",", ["country", "city"]).log();
```

## Inherited from

`SimpleTableCore.nest`
