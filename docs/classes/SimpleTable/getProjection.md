[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / getProjection

# Method: getProjection()

> **getProjection**(`column`): `Promise`\<`string`\>

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:9070](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L9070)

Retrieves the projection of a specified geospatial column.

## Parameters

### column

`string`

The name of the geospatial column for which to retrieve the projection.

## Returns

`Promise`\<`string`\>

A promise that resolves to the projection of the specified column.

## Example

```ts
// Get the projection of the 'geom' column
const projection = await table.getProjection("geom");
```

## Inherited from

`SimpleTableCore.getProjection`
