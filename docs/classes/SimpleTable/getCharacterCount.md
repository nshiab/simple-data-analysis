[**Simple Data Analysis v6.0.11**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / getCharacterCount

# Method: getCharacterCount()

> **getCharacterCount**(`column`): `Promise`\<`number`\>

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
