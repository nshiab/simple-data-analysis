[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / loadBucket

# Method: loadBucket()

> **loadBucket**(`source`, `options?`): `this`

Defined in: [src/class/SimpleTable.ts:1418](https://github.com/nshiab/simple-data-analysis/blob/v6.0.12/src/class/SimpleTable.ts#L1418)

Downloads a file from Google Cloud Storage and loads it into the table.
Supported sources are `.csv`, `.csv.gz`, `.json`, `.json.gz`, `.parquet`,
`.geojson`, `.geoparquet`, and `.shp.zip`.

This method uses the `downloadFromBucket` function from the
[journalism-google library](https://github.com/nshiab/journalism-google/tree/v2.0.0/docs).
Set `BUCKET_PROJECT` and `BUCKET_NAME` in your `.env` file, or pass
`project` and `bucket`.
Authentication uses Google Application Default Credentials. To load
credentials from a specific JSON file, set `GOOGLE_APPLICATION_CREDENTIALS`
in your `.env` file to that file's path.

The download and load are queued and run in chain order at the next awaited
observer or `run()` call.

## Parameters

### source

`string`

The path and filename of the object within the bucket.

### options?

Download options.

#### bucket?

`string`

The Google Cloud Storage bucket name. Defaults to `BUCKET_NAME`.

#### project?

`string`

The Google Cloud project ID. Defaults to `BUCKET_PROJECT`.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Set BUCKET_PROJECT and BUCKET_NAME in .env, and configure Google Application Default Credentials.
await sdb
  .newTable("results")
  .loadBucket("exports/results.parquet")
  .filter("value > 0")
  .log();
```

```ts
await sdb
  .newTable("districts")
  .loadBucket("maps/districts.shp.zip", {
    project: "my-project",
    bucket: "my-bucket",
  })
  .log();
```
