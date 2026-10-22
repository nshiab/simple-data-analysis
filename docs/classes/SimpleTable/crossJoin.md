[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / crossJoin

# Method: crossJoin()

> **crossJoin**(`rightTable`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:4657](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L4657)

Performs a cross join operation with another table. A cross join returns the Cartesian product of the rows from both tables, meaning all possible pairs of rows will be in the resulting table.
This means that if the left table has `n` rows and the right table has `m` rows, the result will have `n * m` rows.

## Parameters

### rightTable

`SimpleTable`

The SimpleTable instance to cross join with.

### options?

An optional object with configuration options:

#### outputTable?

`string` \| `boolean`

If `true`, the results will be stored in a new table with a generated name. If a string, it will be used as the name for the new table. If `false` or omitted, the current table will be overwritten. Defaults to `false`.

## Returns

`this`

A table instance containing the cross-joined data (either the current table or a new table), so methods can be chained.

## Examples

```ts
// Perform a cross join with 'tableB', overwriting the current table (tableA)
await tableA.crossJoin(tableB).log();
```

```ts
// Perform a cross join with 'tableB' and store the results in a new table with a generated name
const tableC = await tableA.crossJoin(tableB, { outputTable: true }).log();
```

```ts
// Perform a cross join with 'tableB' and store the results in a new table named 'tableC'
const tableC = await tableA.crossJoin(tableB, { outputTable: "tableC" }).log();
```

## Inherited from

`SimpleTableCore.crossJoin`
