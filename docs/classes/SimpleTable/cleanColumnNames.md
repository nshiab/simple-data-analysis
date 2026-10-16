[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / cleanColumnNames

# Method: cleanColumnNames()

> **cleanColumnNames**(): `this`

Cleans column names by removing non-alphanumeric characters and formatting them to camel case.

## Returns

`this`

The table, so methods can be chained.

## Example

```ts
// Clean all column names in the table
// e.g., "First Name" becomes "firstName", "Product ID" becomes "productId"
await table.cleanColumnNames().log();
```

## Inherited from

`SimpleTableCore.cleanColumnNames`
