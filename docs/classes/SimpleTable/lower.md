[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / lower

# Method: lower()

> **lower**(`columns`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:4932](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L4932)

Converts string values in the specified columns to lowercase.

## Parameters

### columns

`string` \| `string`[]

The column name or an array of column names to be converted to lowercase.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Convert strings in 'column1' to lowercase
await table.lower("column1").log();
```

```ts
// Convert strings in 'column1' and 'column2' to lowercase
await table.lower(["column1", "column2"]).log();
```

## Inherited from

`SimpleTableCore.lower`
