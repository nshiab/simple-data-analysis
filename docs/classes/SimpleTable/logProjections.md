[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / logProjections

# Method: logProjections()

> **logProjections**(): `Promise`\<[`SimpleTable`](../SimpleTable.md)\>

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:9099](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L9099)

Logs the projections of the geospatial data (if any) to the console.

## Returns

`Promise`\<[`SimpleTable`](../SimpleTable.md)\>

A promise that resolves to the SimpleTable instance after logging the projections.

## Example

```ts
// Log the geospatial projections of the table
await table.logProjections();
```

## Inherited from

`SimpleTableCore.logProjections`
