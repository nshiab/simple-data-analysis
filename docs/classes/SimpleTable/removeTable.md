[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / removeTable

# Method: removeTable()

> **removeTable**(): `Promise`\<[`SimpleTable`](../SimpleTable.md)\>

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:2421](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L2421)

Removes the table from the database. After this operation, invoking methods on this SimpleTable instance will result in an error.

## Returns

`Promise`\<[`SimpleTable`](../SimpleTable.md)\>

A promise that resolves after the table is removed.

## Example

```ts
// Remove the current table from the database
await table.removeTable();
```

## Inherited from

`SimpleTableCore.removeTable`
