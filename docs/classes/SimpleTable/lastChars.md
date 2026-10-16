[**Simple Data Analysis v6.0.11**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / lastChars

# Method: lastChars()

> **lastChars**(`column`, `count`): `this`

Extracts a specific number of characters from the end (right side) of string values in the specified column.

## Parameters

### column

`string`

The name of the column containing the strings to be modified.

### count

`number`

The number of characters to extract from the right side of each string.

## Returns

`this`

The table, so methods can be chained.

## Example

```ts
// Replace strings in 'productCode' with their last two characters
// e.g., "ABC-123" becomes "23"
await table.lastChars("productCode", 2).log();
```

## Inherited from

`SimpleTableCore.lastChars`
