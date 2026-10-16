[**Simple Data Analysis v6.0.10**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / writeGeoData

# Method: writeGeoData()

> **writeGeoData**(`file`, `options?`): `Promise`\<[`SimpleTable`](../SimpleTable.md)\>

Writes the table's geospatial data to a file in GeoJSON, GeoParquet, or Shapefile format.
If the specified path does not exist, it will be created.

## Parameters

### file

`string`

The absolute path to the output file (e.g., `"./output.geojson"`, `"./output.geoparquet"`, `"./shapefile-folder/output.shp"`, `"./output.shp.zip"`). A `.shp.zip` extension writes a ZIP archive using fast DEFLATE compression. Creating the archive temporarily requires enough disk space for both the uncompressed Shapefile and the ZIP, and ZIP archives are limited to 4 GB.

### options?

An optional object with configuration options:

#### compression?

`boolean`

For GeoParquet, if `true`, uses ZSTD compression; otherwise, uses DuckDB's default SNAPPY compression. SNAPPY prioritizes faster compression, while ZSTD typically produces smaller files but takes longer to write. Read performance depends on the data and storage because smaller files can reduce I/O. This option is not supported for GeoJSON or Shapefiles. Defaults to `false`.

#### formatDates?

`boolean`

For GeoJSON, if `true`, formats date and timestamp columns to ISO 8601 strings. Defaults to `false`.

#### metadata?

`unknown`

For GeoJSON, an object to be added as top-level metadata to the GeoJSON output.

#### precision?

`number`

For GeoJSON, the maximum number of figures after the decimal separator to write in coordinates. Defaults to `undefined` (full precision).

#### rewind?

`boolean`

For GeoJSON, if `true`, rewinds the coordinates of polygons to follow the right-hand rule (RFC 7946). Defaults to `false`.

## Returns

`Promise`\<[`SimpleTable`](../SimpleTable.md)\>

A promise that resolves to the table, so methods can be chained.

## Examples

```ts
// Write geospatial data to a GeoJSON file
await table.writeGeoData("./output.geojson");
```

```ts
// Write geospatial data to a ZSTD-compressed GeoParquet file
await table.writeGeoData("./output.geoparquet", { compression: true });
```

```ts
// Write geospatial data to a Shapefile with all relevant files  in the same folder
await table.writeGeoData("./shapefile-folder/output.shp");
```

```ts
// Write a Shapefile and its related files to output.shp.zip
await table.writeGeoData("./output.shp.zip");
```

```ts
// Write GeoJSON with specific precision and metadata
await table.writeGeoData("./output_high_precision.geojson", {
  precision: 6,
  metadata: { source: "SimpleDataAnalysis" },
});
```

## Inherited from

`SimpleTableCore.writeGeoData`
