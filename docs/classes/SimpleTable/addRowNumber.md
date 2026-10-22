[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / addRowNumber

# Method: addRowNumber()

> **addRowNumber**(`newColumn`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:4625](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L4625)

Adds a new column to the table containing the row number, starting at 0 (like an index).

## Parameters

### newColumn

`string`

The name of the new column that will store the row number.

### options?

An optional object with configuration options:

#### by?

`string` \| `string`[]

A column name or an array of column names to partition by. The row number restarts at 0 within each group.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Add a new column named 'rowNumber' with the row number for each row
await table.addRowNumber("rowNumber").log();
```

```ts
// Add a new column named 'rowNumber' with the row number for each 'category'
await table.addRowNumber("rowNumber", { by: "category" }).log();
```

## Inherited from

`SimpleTableCore.addRowNumber`
