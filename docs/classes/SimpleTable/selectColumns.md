[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / selectColumns

# Method: selectColumns()

> **selectColumns**(`columns`): `this`

Selects specific columns in the table, removing all others.

## Parameters

### columns

`string` \| `string`[]

The name or an array of names of the columns to be selected.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Select only the 'firstName' and 'lastName' columns, removing all other columns.
await table.selectColumns(["firstName", "lastName"]).log();
```

```ts
// Select only the 'productName' column.
await table.selectColumns("productName").log();
```

## Inherited from

`SimpleTableCore.selectColumns`
