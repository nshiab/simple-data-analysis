[**Simple Data Analysis v6.0.14**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / addGeoNoise

# Method: addGeoNoise()

> **addGeoNoise**(`maxDistance`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:7927](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L7927)

Moves EPSG:4326 point geometries to random locations within a maximum great-circle distance of their original positions.

Points are sampled uniformly within the requested distance using the spherical direct geodesic (destination-point) formula and the same spherical Earth model as DuckDB's `ST_Distance_Sphere()`. This accounts for longitude scale changing with latitude. This method adds random jitter; it does not provide anonymization or differential privacy guarantees.

This method supports only `POINT` geometries in `EPSG:4326`. Null and empty geometries are preserved.

## Parameters

### maxDistance

`number`

The maximum great-circle displacement in the selected unit. Must be a finite number greater than or equal to `0` and no greater than half Earth's circumference.

### options?

An optional object with configuration options:

#### column?

`string`

The name of the EPSG:4326 point geometry column. If omitted, the method will automatically attempt to find a geometry column.

#### onlyDuplicates?

`boolean`

If `true`, moves only points whose complete original geometry occurs more than once in the selected geometry column. Every point in a duplicated group is moved. Defaults to `false`.

#### unit?

`"m"` \| `"km"`

The unit of `maxDistance`: `"m"` for metres or `"km"` for kilometres. Defaults to `"m"`.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Move every point by no more than 500 metres
await table.addGeoNoise(500).log();
```

```ts
// Separate duplicated points by up to 0.1 kilometres
await table.addGeoNoise(0.1, {
  column: "geom",
  unit: "km",
  onlyDuplicates: true,
}).log();
```

## Inherited from

`SimpleTableCore.addGeoNoise`
