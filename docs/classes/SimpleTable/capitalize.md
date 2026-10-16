[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / capitalize

# Method: capitalize()

> **capitalize**(`columns`): `this`

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
