[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / getUniques

# Method: getUniques()

> **getUniques**(`column`): `Promise`\<`unknown`[]\>

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:7351](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L7351)

Returns unique values from a specific column. The values are returned in ascending order.
Temporal values use the same JavaScript representations as `getData()`.

## Parameters

### column

`string`

The name of the column from which to retrieve unique values.

## Returns

`Promise`\<`unknown`[]\>

A promise that resolves to an array containing the unique values from the specified column, sorted in ascending order.

## Example

```ts
// Get unique values from the 'category' column
const uniqueCategories = await table.getUniques("category");
console.log(uniqueCategories); // e.g., ["Books", "Clothing", "Electronics"]
```

## Inherited from

`SimpleTableCore.getUniques`
