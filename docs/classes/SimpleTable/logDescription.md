[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / logDescription

# Method: logDescription()

> **logDescription**(): `Promise`\<[`SimpleTable`](../SimpleTable.md)\>

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:9051](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L9051)

Logs descriptive information about the columns in the table to the console. This includes details such as data types, number of null values, and number of distinct values for each column.
It internally calls the `getDescription` method to retrieve the descriptive statistics.

## Returns

`Promise`\<[`SimpleTable`](../SimpleTable.md)\>

A promise that resolves to the table, so methods can be chained.

## Example

```ts
// Log descriptive information for all columns in the table
await table.logDescription();
```

## Inherited from

`SimpleTableCore.logDescription`
