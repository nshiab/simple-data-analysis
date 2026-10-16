[**Simple Data Analysis v6.0.10**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / firstChars

# Method: firstChars()

> **firstChars**(`column`, `count`): `this`

Extracts a specific number of characters from the beginning (left side) of string values in the specified column.

## Parameters

### column

`string`

The name of the column containing the strings to be modified.

### count

`number`

The number of characters to extract from the left side of each string.

## Returns

`this`

The table, so methods can be chained.

## Example

```ts
// Replace strings in 'productCode' with their first two characters
// e.g., "ABC-123" becomes "AB"
await table.firstChars("productCode", 2).log();
```

## Inherited from

`SimpleTableCore.firstChars`
