[**Simple Data Analysis v6.0.14**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / addGeoValidity

# Method: addGeoValidity()

> **addGeoValidity**(`newColumn`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:7769](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L7769)

Adds a column with boolean values indicating the validity of geometries.

## Parameters

### newColumn

`string`

The name of the new column where the boolean results (`TRUE` for valid, `FALSE` for invalid) will be stored.

### options?

An optional object with configuration options:

#### column?

`string`

The name of the column storing the geometries to be checked. If omitted, the method will automatically attempt to find a geometry column.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Check if geometries are valid and store results in a new 'isValid' column
// The method will automatically detect the geometry column.
await table.addGeoValidity("isValid").log();
```

```ts
// Check validity of geometries in a specific column named 'myGeom'
await table.addGeoValidity("isValidMyGeom", { column: "myGeom" }).log();
```

## Inherited from

`SimpleTableCore.addGeoValidity`
