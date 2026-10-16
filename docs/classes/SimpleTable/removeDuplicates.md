[**Simple Data Analysis v6.0.11**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / removeDuplicates

# Method: removeDuplicates()

> **removeDuplicates**(`options?`): `this`

Removes duplicate rows from this table, keeping only unique rows.
Note that the resulting data order might differ from the original.

## Parameters

### options?

An optional object with configuration options:

#### on?

`string` \| `string`[]

A column name or an array of column names to consider when identifying duplicates. If specified, duplicates are determined based only on the values in these columns. If omitted, all columns are considered.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Remove duplicate rows based on all columns
await table.removeDuplicates().log();
```

```ts
// Remove duplicate rows based only on the 'email' column
await table.removeDuplicates({ on: "email" }).log();
```

```ts
// Remove duplicate rows based on 'firstName' and 'lastName' columns
await table.removeDuplicates({ on: ["firstName", "lastName"] }).log();
```

## Inherited from

`SimpleTableCore.removeDuplicates`
