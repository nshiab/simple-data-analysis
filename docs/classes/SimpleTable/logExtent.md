[**Simple Data Analysis v6.0.10**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / logExtent

# Method: logExtent()

> **logExtent**(`column`): `Promise`\<[`SimpleTable`](../SimpleTable.md)\>

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
