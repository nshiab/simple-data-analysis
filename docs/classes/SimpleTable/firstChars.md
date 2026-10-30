[**Simple Data Analysis v6.0.14**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / firstChars

# Method: firstChars()

> **firstChars**(`column`, `count`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:5142](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L5142)

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
