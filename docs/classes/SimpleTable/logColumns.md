[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / logColumns

# Method: logColumns()

> **logColumns**(`options?`): `Promise`\<[`SimpleTable`](../SimpleTable.md)\>

Logs the columns in the table to the console. You can optionally include their data types.

## Parameters

### options?

An optional object with configuration options:

#### types?

`boolean`

If `true`, logs the column names along with their data types. Defaults to `false`.

## Returns

`Promise`\<[`SimpleTable`](../SimpleTable.md)\>

A promise that resolves to the SimpleTable instance after logging the columns.

## Examples

```ts
// Log only the column names
await table.logColumns();
```

```ts
// Log column names along with their types
await table.logColumns({ types: true });
```

## Inherited from

`SimpleTableCore.logColumns`
