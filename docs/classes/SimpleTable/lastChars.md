[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / lastChars

# Method: lastChars()

> **lastChars**(`column`, `count`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:5161](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L5161)

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
