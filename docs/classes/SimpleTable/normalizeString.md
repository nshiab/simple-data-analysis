[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / normalizeString

# Method: normalizeString()

> **normalizeString**(`column`, `newColumn`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:6900](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L6900)

Normalizes string values in a column by:
1. Stripping accents
2. Optionally stripping punctuation (default: true)
3. Converting to lowercase
4. Normalizing whitespace (multiple spaces/tabs/newlines → single space)
5. Trimming leading/trailing whitespace

Produces identical output to `journalism-format`'s `normalizeString()` function
for all common cases including accented Latin characters.

## Parameters

### column

`string`

The column containing the text to normalize

### newColumn

`string`

The column to store the normalized results

### options?

Configuration options

#### stripPunctuation?

`boolean`

Strip punctuation and underscores (default: true)

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Normalize text column and store in new column
await table.normalizeString("recipeName", "recipeNameNormalized").log();
// "Épicerie Parisienne!" → "epicerie parisienne"
```

```ts
// Keep punctuation for emails and URLs
await table.normalizeString("email", "emailNormalized", { stripPunctuation: false }).log();
// "User@Example.com" → "user@example.com"
await table.normalizeString("url", "urlNormalized", { stripPunctuation: false }).log();
// "https://Example.com/path" → "https://example.com/path"
```

## Inherited from

`SimpleTableCore.normalizeString`
