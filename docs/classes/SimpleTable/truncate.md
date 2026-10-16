[**Simple Data Analysis v6.0.11**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / truncate

# Method: truncate()

> **truncate**(`column`, `length`): `this`

Truncates string values in a specified column to a maximum number of characters.

## Parameters

### column

`string`

The column name containing strings to be truncated.

### length

`number`

The maximum number of characters to keep.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Truncate strings in 'description' column to 50 characters
await table.truncate("description", 50).log();
```

```ts
// Truncate strings in 'name' column to 10 characters
await table.truncate("name", 10).log();
```

## Inherited from

`SimpleTableCore.truncate`
