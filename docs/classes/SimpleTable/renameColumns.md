[**Simple Data Analysis v6.0.10**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / renameColumns

# Method: renameColumns()

> **renameColumns**(`names`, `options?`): `this`

Renames one or more columns in the table. Throws if a source column does
not exist, so a typo fails loudly instead of being silently ignored.

## Parameters

### names

\{\[`key`: `string`\]: `string`; \}

An object mapping old column names to their new column names (e.g., `{ "oldName": "newName", "anotherOld": "anotherNew" }`).

### options?

Configuration options.

#### strict?

`boolean`

Whether to verify the source columns exist before renaming. Defaults to `true`. Set to `false` to skip the check and its schema lookup when you know the columns exist and are renaming across many tables where the extra round-trip adds up.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Rename "How old?" to "age" and "Man or woman?" to "sex"
await table.renameColumns({ "How old?": "age", "Man or woman?": "sex" }).log();
```

```ts
// Rename a single column
await table.renameColumns({ "product_id": "productId" }).log();
```

```ts
// Skip the existence check when renaming across many tables
await table.renameColumns({ "product_id": "productId" }, { strict: false }).log();
```

## Inherited from

`SimpleTableCore.renameColumns`
