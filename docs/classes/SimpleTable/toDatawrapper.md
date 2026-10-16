[**Simple Data Analysis v6.0.11**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / toDatawrapper

# Method: toDatawrapper()

> **toDatawrapper**(`chartId`, `options?`): `Promise`\<[`SimpleTable`](../SimpleTable.md)\>

Writes the table data as CSV to a Datawrapper chart or table.

Environment variables are named configuration values supplied to the running process. By default, this method reads the API key from `DATAWRAPPER_KEY` (for example, `"your-datawrapper-api-key"`).

## Parameters

### chartId

`string`

The unique ID of the Datawrapper chart or table to update. This ID can be found in the Datawrapper URL or dashboard.

### options?

An optional object with configuration options:

#### apiKeyEnvVar?

`string`

A custom environment-variable name from which to read the Datawrapper API key. Defaults to `"DATAWRAPPER_KEY"`.

#### description?

`string`

The description below the chart's title. Omit to preserve it, or pass an empty string to clear it.

#### note?

`string`

The chart's notes (e.g., a last-updated timestamp). Omit to preserve them, or pass an empty string to clear them.

#### republish?

`boolean`

If `true`, republishes the chart after updating the data and any supplied title, description, or notes. Defaults to `false`.

#### title?

`string`

The chart's title. Omit to preserve it, or pass an empty string to clear it.

## Returns

`Promise`\<[`SimpleTable`](../SimpleTable.md)\>

A promise that resolves to this table after the data has been sent to Datawrapper.

## Examples

```ts
// Set DATAWRAPPER_KEY=your-datawrapper-api-key before running.
// Load, transform, and send data to a Datawrapper chart
const table = await sdb
  .newTable()
  .loadData("sales.csv")
  .selectColumns(["date", "revenue"])
  .toDatawrapper("myChartId");

await table.log();
```

```ts
// Update data, title, description, and notes, then republish
await table.toDatawrapper("myChartId", {
  title: "Monthly sales",
  description: "Revenue since January 2025.",
  note: `Last updated: ${new Date().toLocaleString()}`,
  republish: true,
});

await table.log();
```
