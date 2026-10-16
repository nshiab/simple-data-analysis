[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / getTypes

# Method: getTypes()

> **getTypes**(): `Promise`\<\{\[`key`: `string`\]: `string`; \}\>

Returns the data types of all columns in the table.

## Returns

`Promise`\<\{\[`key`: `string`\]: `string`; \}\>

A promise that resolves to an object where keys are column names and values are their corresponding data types (e.g., `{ "id": "BIGINT", "name": "VARCHAR" }`).

## Example

```ts
// Get the data types of all columns
const dataTypes = await table.getTypes();
console.log(dataTypes);
```

## Inherited from

`SimpleTableCore.getTypes`
