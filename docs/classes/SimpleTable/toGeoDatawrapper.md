[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / toGeoDatawrapper

# Method: toGeoDatawrapper()

> **toGeoDatawrapper**(`chartId`, `options?`): `Promise`\<[`SimpleTable`](../SimpleTable.md)\>

Defined in: [src/class/SimpleTable.ts:1727](https://github.com/nshiab/simple-data-analysis/blob/v6.0.13/src/class/SimpleTable.ts#L1727)

Writes the table's geospatial data as GeoJSON to a Datawrapper map.

Environment variables are named configuration values supplied to the running process. By default, this method reads the API key from `DATAWRAPPER_KEY` (for example, `"your-datawrapper-api-key"`).

## Parameters

### chartId

`string`

The unique ID of the Datawrapper map to update. This ID can be found in the Datawrapper URL or dashboard.

### options?

An optional object with configuration options:

#### apiKeyEnvVar?

`string`

A custom environment-variable name from which to read the Datawrapper API key. Defaults to `"DATAWRAPPER_KEY"`.

#### column?

`string`

The name of the geometry column to use. If omitted, the method will automatically attempt to find a geometry column.

#### description?

`string`

The description below the map's title. Omit to preserve it, or pass an empty string to clear it.

#### note?

`string`

The map's notes (e.g., a last-updated timestamp). Omit to preserve them, or pass an empty string to clear them.

#### republish?

`boolean`

If `true`, republishes the map after updating the data and any supplied title, description, or notes. Defaults to `false`.

#### title?

`string`

The map's title. Omit to preserve it, or pass an empty string to clear it.

## Returns

`Promise`\<[`SimpleTable`](../SimpleTable.md)\>

A promise that resolves to this table after the data has been sent to Datawrapper.

## Examples

```ts
// Set DATAWRAPPER_KEY=your-datawrapper-api-key before running.
// Load, transform, and send geospatial data to a Datawrapper map
const table = await sdb
  .newTable()
  .loadGeoData("regions.geojson")
  .selectColumns(["name", "population", "geometry"])
  .toGeoDatawrapper("myMapId");

await table.log();
```

```ts
// Update data, title, description, and notes, then republish
await table.toGeoDatawrapper("myMapId", {
  title: "Population by region",
  description: "Latest population estimates.",
  note: `Last updated: ${new Date().toLocaleString()}`,
  republish: true,
});

await table.log();
```
