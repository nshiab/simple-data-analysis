[**Simple Data Analysis v6.0.11**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / getExtent

# Method: getExtent()

> **getExtent**(`column`): `Promise`\<\[`unknown`, `unknown`\]\>

Returns the extent (minimum and maximum values) of a specific column as an array.
Temporal values use the same JavaScript representations as `getData()`.

## Parameters

### column

`string`

The name of the column from which to retrieve the extent.

## Returns

`Promise`\<\[`unknown`, `unknown`\]\>

A promise that resolves to an array `[min, max]` containing the minimum and maximum values of the specified column.

## Example

```ts
// Get the extent of the 'temperature' column
const tempExtent = await table.getExtent("temperature");
console.log(tempExtent); // e.g., [15.2, 30.1]
```

## Inherited from

`SimpleTableCore.getExtent`
