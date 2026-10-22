[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / logExtent

# Method: logExtent()

> **logExtent**(`column`): `Promise`\<[`SimpleTable`](../SimpleTable.md)\>

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:9257](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L9257)

Logs the extent (minimum and maximum values) of a numeric column to the console.

## Parameters

### column

`string`

The name of the numeric column for which to log the extent.

## Returns

`Promise`\<[`SimpleTable`](../SimpleTable.md)\>

A promise that resolves to the table, so methods can be chained.

## Example

```ts
// Log the extent of the 'price' column
await table.logExtent("price");
```

## Inherited from

`SimpleTableCore.logExtent`
