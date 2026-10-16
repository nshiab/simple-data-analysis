[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / loadDatawrapper

# Method: loadDatawrapper()

> **loadDatawrapper**(`chartId`, `options?`): `this`

Loads data from a Datawrapper chart or table into the table.

Environment variables are named configuration values supplied to the running process. By default, this method reads the API key from `DATAWRAPPER_KEY` (for example, `"your-datawrapper-api-key"`).
The download is queued and runs in chain order at the next awaited observer or `run()` call.

## Parameters

### chartId

`string`

The unique ID of the Datawrapper chart or table. This ID can be found in the Datawrapper URL or dashboard.

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
// Load data from a Datawrapper chart
const chartData = await sdb
  .newTable("chartData")
  .loadDatawrapper("myChartId")
  .log();
```
