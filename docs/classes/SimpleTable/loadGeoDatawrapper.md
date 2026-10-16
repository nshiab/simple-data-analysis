[**Simple Data Analysis v6.0.11**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / loadGeoDatawrapper

# Method: loadGeoDatawrapper()

> **loadGeoDatawrapper**(`chartId`, `options?`): `this`

Loads geospatial data from a Datawrapper map into the table.

Environment variables are named configuration values supplied to the running process. By default, this method reads the API key from `DATAWRAPPER_KEY` (for example, `"your-datawrapper-api-key"`).

The data is temporarily written to `.sda-cache/tmp/dataviz/<uuid>.geojson` and removed after loading. Remember to add `.sda-cache` to your `.gitignore`.
The download is queued and runs in chain order at the next awaited observer or `run()` call.

## Parameters

### chartId

`string`

The unique ID of the Datawrapper map. This ID can be found in the Datawrapper URL or dashboard.

### options?

An optional object with configuration options:

#### apiKeyEnvVar?

`string`

A custom environment-variable name from which to read the Datawrapper API key. Defaults to `"DATAWRAPPER_KEY"`.

## Returns

`this`

The table, so methods can be chained.

## Example

```ts
// Set DATAWRAPPER_KEY=your-datawrapper-api-key before running.
// Load geo data from a Datawrapper map
const mapData = await sdb
  .newTable("mapData")
  .loadGeoDatawrapper("myMapId")
  .log();
```
