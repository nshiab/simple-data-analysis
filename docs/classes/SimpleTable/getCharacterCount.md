[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / getCharacterCount

# Method: getCharacterCount()

> **getCharacterCount**(`column`): `Promise`\<`number`\>

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:6982](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L6982)

Returns the total number of characters in a column storing strings.
Counts are based on Unicode code points, not grapheme clusters. A user-perceived character composed of multiple code points, such as some emoji or decomposed accented letters, counts as multiple characters.

## Parameters

### column

`string`

The name of the string column to count characters from.

## Returns

`Promise`\<`number`\>

A promise that resolves to the total number of characters across all rows in the specified column.

## Example

```ts
// Get the total number of characters in the 'name' column
const totalChars = await table.getCharacterCount("name");
console.log(totalChars); // e.g., 523
```

## Inherited from

`SimpleTableCore.getCharacterCount`
