[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / addWordCount

# Method: addWordCount()

> **addWordCount**(`column`, `newColumn`): `this`

Adds a new column containing the word count for each string in the specified column.
A word is any contiguous sequence of non-whitespace characters. Spaces, tabs, and line breaks separate words. Punctuation is not removed, so a standalone punctuation sequence counts as a word. Text without whitespace counts as one word, regardless of language. Empty or whitespace-only strings produce `0`, and `NULL` input values produce `NULL` counts.

## Parameters

### column

`string`

The name of the column containing the strings to count.

### newColumn

`string`

The name of the new column where the word counts will be stored.

## Returns

`this`

The table, so methods can be chained.

## Example

```ts
// Add a word count for each value in the 'article' column
await table.addWordCount("article", "wordCount").log();
```

## Inherited from

`SimpleTableCore.addWordCount`
