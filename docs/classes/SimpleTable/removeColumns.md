[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / removeColumns

# Method: removeColumns()

> **removeColumns**(`columns`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:2444](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L2444)

Removes one or more columns from this table.

## Parameters

### columns

`string` \| `string`[]

The name or an array of names of the columns to be removed.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Remove 'column1' and 'column2' from the table
await table.removeColumns(["column1", "column2"]).log();
```

```ts
// Remove a single column named 'tempColumn'
await table.removeColumns("tempColumn").log();
```

## Inherited from

`SimpleTableCore.removeColumns`
