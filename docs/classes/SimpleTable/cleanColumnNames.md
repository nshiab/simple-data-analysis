[**Simple Data Analysis v6.0.20**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / cleanColumnNames

# Method: cleanColumnNames()

> **cleanColumnNames**(): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:2314](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.23/src/class/SimpleTable.ts#L2314)

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
