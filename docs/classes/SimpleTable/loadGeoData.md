[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / loadGeoData

# Method: loadGeoData()

> **loadGeoData**(`file`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:815](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L815)

Loads geospatial data from an external file or URL into the table.
With the default `SimpleDB.expressionSyntax: "js"`, conditions support JavaScript-style operators (`&&`, `||`, `===`, `!==`). Set `expressionSyntax: "sql"` for unchanged SQL.

## Parameters

### file

`string`

The path or URL of the external file containing the geospatial data.

### options?

An optional object with configuration options:

#### columns?

`string`[]

The columns to load. Include the geometry column that should remain in the resulting table, usually `"geom"`. By default, all columns are loaded.

#### conditions?

`string`

A SQL `WHERE` clause expression, without the `WHERE` keyword, to filter source rows before materialization and reprojection. Can reference source columns excluded from `columns`. Geometry conditions use the source coordinate system.

#### toEPSG4326?

`boolean`

If `true`, the method will attempt to reproject the data to EPSG:4326 (WGS84).

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Load geospatial data from a URL
await table.loadGeoData("https://some-website.com/some-data.geojson").log();
```

```ts
// Load geospatial data from a local file
await table.loadGeoData("./some-data.geojson").log();
```

```ts
// Load only the name and geometry columns
await table
  .loadGeoData("./boundaries.geojson", {
    columns: ["name", "geom"],
  })
  .log();
```

```ts
// Load geospatial data from a shapefile (with relevant files in the same folder) and reproject to EPSG:4326 (WGS84)
await table.loadGeoData("./some-data/some-data.shp", { toEPSG4326: true }).log();
```

```ts
// Load geospatial data from a zipped shapefile and reproject to EPSG:4326 (WGS84)
await table.loadGeoData("./some-data.shp.zip", { toEPSG4326: true }).log();
```

```ts
// Filter on a source property without retaining it in the table
await table
  .loadGeoData("./boundaries.geojson", {
    conditions: "population > 100000",
    columns: ["name", "geom"],
  })
  .log();
```

## Inherited from

`SimpleTableCore.loadGeoData`
