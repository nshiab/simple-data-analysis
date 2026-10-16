[**Simple Data Analysis v6.0.10**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / splitExtract

# Method: splitExtract()

> **splitExtract**(`column`, `separator`, `index`, `newColumn`): `this`

Splits strings in a specified column by a separator and extracts a substring at a given index, storing the result in a new or existing column.
If the index is out of bounds, an empty string will be returned for that row.

## Parameters

### column

`string`

The name of the column containing the strings to be split.

### separator

`string`

The substring to use as a delimiter for splitting the strings.

### index

`number`

The zero-based index of the substring to extract after splitting. For example, `0` for the first part, `1` for the second, etc.

### newColumn

`string`

The name of the column where the extracted substrings will be stored. To overwrite the original column, use the same name as `column`.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Split 'address' by comma and extract the second part (index 1) into a new 'city' column
// e.g., "123 Main St, Anytown, USA" -> "Anytown"
await table.splitExtract("address", ",", 1, "city").log();
```

```ts
// Split 'filename' by dot and extract the first part (index 0), overwriting 'filename'
// e.g., "document.pdf" -> "document"
await table.splitExtract("filename", ".", 0, "filename").log();
```

## Inherited from

`SimpleTableCore.splitExtract`
