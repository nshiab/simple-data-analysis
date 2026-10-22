[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / capitalize

# Method: capitalize()

> **capitalize**(`columns`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:4978](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L4978)

Capitalizes the first letter of each string in the specified columns and converts the rest of the string to lowercase.

## Parameters

### columns

`string` \| `string`[]

The column name or an array of column names to be capitalized.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Capitalize strings in 'column1' (e.g., "hello world" becomes "Hello world")
await table.capitalize("column1").log();
```

```ts
// Capitalize strings in 'column1' and 'column2'
await table.capitalize(["column1", "column2"]).log();
```

## Inherited from

`SimpleTableCore.capitalize`
