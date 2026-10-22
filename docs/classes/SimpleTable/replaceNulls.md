[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / replaceNulls

# Method: replaceNulls()

> **replaceNulls**(`columns`, `value`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:5198](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L5198)

Replaces `NULL` values in the specified columns with a given value.
Use `["all"]` to target a column literally named `all`.

## Parameters

### columns

`string` \| `string`[]

The column name, an array of column names, or `"all"` to apply the replacement to every column in the table.

### value

`unknown`

The value to replace `NULL` occurrences with.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Replace NULL values in 'column1' with 0
await table.replaceNulls("column1", 0).log();
```

```ts
// Replace NULL values in 'columnA' and 'columnB' with the string "N/A"
await table.replaceNulls(["columnA", "columnB"], "N/A").log();
```

```ts
// Replace NULL values in 'dateColumn' with a specific date
await table.replaceNulls("dateColumn", new Date("2023-01-01")).log();
```

```ts
// Replace NULL values in all columns with 0
await table.replaceNulls("all", 0).log();
```

## Inherited from

`SimpleTableCore.replaceNulls`
