[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / writeData

# Method: writeData()

> **writeData**(`file`, `options?`): `Promise`\<[`SimpleTable`](../SimpleTable.md)\>

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:8759](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L8759)

Writes the table's data to a file in various formats (CSV, JSON, Parquet, DuckDB, SQLite).
Tables with geometry columns must use `writeGeoData()` instead.
If the specified path does not exist, it will be created.
In CSV files, `NULL` values become empty fields, while numeric zero remains numeric (e.g., `0.0`).

## Parameters

### file

`string`

The absolute path to the output file (e.g., `"./output.csv"`, `"./output.json"`).

### options?

An optional object with configuration options:

#### compression?

`boolean`

A boolean indicating whether to compress the output file. If `true`, CSV and JSON files will be compressed with GZIP, while Parquet files will use ZSTD. Defaults to `false`.

#### dataAsArrays?

`boolean`

For JSON files only. If `true`, JSON files are written as a single object with arrays for each column (e.g., `{ "col1": [v1, v2], "col2": [v3, v4] }`) instead of an array of objects. This can reduce file size for web projects. You can use the `arraysToData` function from the [journalism-format library](https://nshiab.github.io/journalism-format/functions/arraysToData.html) to convert it back.

#### formatDates?

`boolean`

For CSV and JSON files only. If `true`, date and timestamp columns will be formatted as ISO 8601 strings (e.g., `"2025-01-01T01:00:00.000Z"`). Defaults to `false`.

## Returns

`Promise`\<[`SimpleTable`](../SimpleTable.md)\>

A promise that resolves to the table, so methods can be chained.

## Examples

```ts
// Write data to a CSV file
await table.writeData("./output.csv");
```

```ts
// Write data to a JSON file with GZIP compression.
// The output file will be named output.json.gz.
await table.writeData("./output.json", { compression: true });
```

```ts
// Write data to a Parquet file
await table.writeData("./output.parquet");
```

```ts
// Write data to a DuckDB database file
await table.writeData("./my_database.db");
```

```ts
// Write data to a SQLite database file
await table.writeData("./my_database.sqlite");
```

```ts
// Write JSON data with dates formatted as ISO strings
await table.writeData("./output_dates.json", { formatDates: true });
```

## Inherited from

`SimpleTableCore.writeData`
