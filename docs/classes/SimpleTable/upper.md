[**Simple Data Analysis v6.0.18**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / upper

# Method: upper()

> **upper**(`columns`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:5081](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.22/src/class/SimpleTable.ts#L5081)

Converts string values in the specified columns to uppercase.

## Parameters

### columns

`string` \| `string`[]

The column name or an array of column names to be converted to uppercase.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Convert strings in 'column1' to uppercase
await table.upper("column1").log();
```

```ts
// Convert strings in 'column1' and 'column2' to uppercase
await table.upper(["column1", "column2"]).log();
```

## Inherited from

`SimpleTableCore.upper`
