[**Simple Data Analysis v6.0.10**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / getValues

# Method: getValues()

> **getValues**(`column`): `Promise`\<`unknown`[]\>

Returns all values from a specific column.
Temporal values use the same JavaScript representations as `getData()`.

## Parameters

### column

`string`

The name of the column from which to retrieve values.

## Returns

`Promise`\<`unknown`[]\>

A promise that resolves to an array containing all values from the specified column.

## Example

```ts
// Get all values from the 'productName' column
const productNames = await table.getValues("productName");
console.log(productNames); // e.g., ["Laptop", "Mouse", "Keyboard"]
```

## Inherited from

`SimpleTableCore.getValues`
