[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / rowToText

# Method: rowToText()

> **rowToText**(`columns`, `newColumn`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:5283](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L5283)

Concatenates values from multiple columns into a new column with labeled rows.

This method creates a new column where each value is a concatenation of the specified columns,
with each column value prefixed by its column name and a colon, followed by a newline.
Column entries are separated by double newlines ("\n\n").

All values must be string, otherwise an error will be thrown. Use the `convert()` method first to convert non-string columns to string.

If a column value is `NULL`, it will be replaced by `'Unknown'` in the concatenated result.

## Parameters

### columns

`string`[]

An array of column names whose values will be concatenated with labels.

### newColumn

`string`

The name of the new column to create with the concatenated values.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Concatenate multiple string columns into a labeled text field
await table.rowToText(
  ["summary", "findings", "context", "date", "quote"],
  "fullText"
).log();
// Result in "fullText" will look like:
// summary:
// [value]
//
// findings:
// [value]
//
// context:
// [value]
//
// date:
// [value]
//
// quote:
// [value]
```

```ts
// Convert numeric columns to strings first, then concatenate
// NULL values will appear as 'Unknown'
await table
  .convert({ age: "string", salary: "string" })
  .rowToText(["name", "age", "salary"], "profile").log();
```

## Inherited from

`SimpleTableCore.rowToText`
