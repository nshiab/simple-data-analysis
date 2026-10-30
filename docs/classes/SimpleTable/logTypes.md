[**Simple Data Analysis v6.0.14**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / logTypes

# Method: logTypes()

> **logTypes**(): `Promise`\<[`SimpleTable`](../SimpleTable.md)\>

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:9129](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L9129)

Logs the types of all columns in the table to the console.

## Returns

`Promise`\<[`SimpleTable`](../SimpleTable.md)\>

A promise that resolves to the SimpleTable instance after logging the column types.

## Example

```ts
// Log the data types of all columns in the table
await table.logTypes();
```

## Inherited from

`SimpleTableCore.logTypes`
