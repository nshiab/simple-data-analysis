[**Simple Data Analysis v6.0.11**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / toBucket

# Method: toBucket()

> **toBucket**(`destination`, `options?`): `Promise`\<`string`\>

Writes the table to a file and uploads it to a Google Cloud Storage bucket.
Supported destinations are `.csv`, `.csv.gz`, `.json`, `.json.gz`,
`.parquet`, `.geojson`, `.geoparquet`, and `.shp.zip`.

This method uses the `toBucket` function from the
[journalism-google library](https://github.com/nshiab/journalism-google/tree/v2.0.0/docs).
Set `BUCKET_PROJECT` and `BUCKET_NAME` in your `.env` file, or pass
`project` and `bucket`.
Authentication uses Google Application Default Credentials. To load
credentials from a specific JSON file, set `GOOGLE_APPLICATION_CREDENTIALS`
in your `.env` file to that file's path.

## Parameters

### destination

`string`

The path and filename for the object within the bucket.

### options?

Upload options.

#### bucket?

`string`

The Google Cloud Storage bucket name. Defaults to `BUCKET_NAME`.

#### metadata?

`unknown`

Metadata object passed to `journalism-google` for the uploaded object.

#### overwrite?

`boolean`

If `true`, replaces an existing object. Cannot be combined with `skip`. Defaults to `false`.

#### project?

`string`

The Google Cloud project ID. Defaults to `BUCKET_PROJECT`.

#### skip?

`boolean`

If `true`, skips the upload when the object already exists. Cannot be combined with `overwrite`. Defaults to `false`.

## Returns

`Promise`\<`string`\>

The `gs://` URI of the uploaded object.

## Examples

```ts
// Set BUCKET_PROJECT and BUCKET_NAME in .env, and configure Google Application Default Credentials.
const uri = await sdb
  .newTable("results")
  .loadData("results.csv")
  .selectColumns(["name", "value"])
  .toBucket("exports/results.parquet", { overwrite: true });
console.log(uri); // gs://my-bucket/exports/results.parquet
```

```ts
// Export a geometry table as one zipped Shapefile object.
await sdb
  .newTable("districts")
  .loadGeoData("districts.geojson")
  .toBucket("maps/districts.shp.zip", {
    project: "my-project",
    bucket: "my-bucket",
  });
```
