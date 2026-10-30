[**Simple Data Analysis v6.0.14**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / addCharacterCount

# Method: addCharacterCount()

> **addCharacterCount**(`column`, `newColumn`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:6944](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L6944)

Adds a new column containing the number of characters in each string in the specified column.
Counts are based on Unicode code points, not grapheme clusters. A user-perceived character composed of multiple code points, such as some emoji or decomposed accented letters, counts as multiple characters.
`NULL` input values produce `NULL` counts.

## Parameters

### column

`string`

The name of the column containing the strings to count.

### newColumn

`string`

The name of the new column where the character counts will be stored.

## Returns

`this`

The table, so methods can be chained.

## Example

```ts
// Add a character count for each value in the 'name' column
await table.addCharacterCount("name", "nameCharacterCount").log();
```

## Inherited from

`SimpleTableCore.addCharacterCount`
