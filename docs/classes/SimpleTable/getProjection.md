[**Simple Data Analysis v6.0.11**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / getProjection

# Method: getProjection()

> **getProjection**(`column`): `Promise`\<`string`\>

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
