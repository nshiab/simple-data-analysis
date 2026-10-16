[**Simple Data Analysis v6.0.11**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / renameTable

# Method: renameTable()

> **renameTable**(`name`): `Promise`\<[`SimpleTable`](../SimpleTable.md)\>

Renames the current table.
The new name must not belong to another registered table, ignoring ASCII letter case.

## Parameters

### name

`string`

The new name for the table.

## Returns

`Promise`\<[`SimpleTable`](../SimpleTable.md)\>

A promise that resolves to the renamed table.

## Example

```ts
// Rename the table to "new_employees"
await table.renameTable("new_employees");
await table.log();
```

## Inherited from

`SimpleTableCore.renameTable`
