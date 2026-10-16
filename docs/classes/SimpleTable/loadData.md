[**Simple Data Analysis v6.0.10**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / loadData

# Method: loadData()

> **loadData**(`files`, `options?`): `this`

Loads data from one or more local or remote files into the table.
Supported file formats include CSV, JSON, Parquet, and Excel.

With the default `SimpleDB.expressionSyntax: "js"`, conditions support JavaScript-style operators (`&&`, `||`, `===`, `!==`). Set `expressionSyntax: "sql"` for unchanged SQL.

## Parameters

### files

`string` \| `string`[]

The path(s) or URL(s) of the file(s) containing the data to be loaded.

### options?

An optional object with configuration options:

#### allText?

`boolean`

A boolean indicating whether all columns should be treated as text. Applicable to CSV files. Defaults to `false`.

#### autoDetect?

`boolean`

A boolean indicating whether to automatically detect the data format. Defaults to `true`.

#### columns?

`string`[]

An array of column names to load. When provided, only the specified columns are loaded, reducing memory usage and improving load times. Not supported for Excel files — combining `columns` with Excel files throws an error. If an invalid column name is provided, DuckDB will throw its native error. An empty array behaves the same as omitting the option (loads all columns). Defaults to loading all columns.

#### columnTypes?

\{\[`key`: `string`\]: `string`; \}

An object mapping column names to their expected data types. By default, types are inferred. Geometry types are not supported; use loadGeoData() instead.

#### compression?

`"none"` \| `"gzip"` \| `"zstd"`

The compression type of the file. Applicable to CSV files. Defaults to `none`.

#### conditions?

`string`

A SQL `WHERE` clause expression, without the `WHERE` keyword, to filter source rows before applying `limit`. Can reference source columns excluded from `columns`.

#### delim?

`string`

The delimiter used in the file. Applicable to CSV and DSV files. By default, the delimiter is inferred.

#### encoding?

`string`

The encoding of the file. Applicable to CSV files. Defaults to `utf-8`.

#### fileType?

`"json"` \| `"csv"` \| `"parquet"` \| `"dsv"` \| `"excel"`

The type of file to load ("csv", "dsv", "json", "parquet", "excel"). Defaults to being inferred from the file extension.

#### header?

`boolean`

A boolean indicating whether the file has a header row. Applicable to CSV files. Defaults to `true`.

#### ignoreErrors?

`boolean`

If `true`, parsing errors encountered will be ignored, and rows with errors will be skipped. Defaults to `false`.

#### includeFilename?

`boolean`

A boolean indicating whether to include the filename as a new column in the loaded data. Defaults to `false`.

#### jsonFormat?

`"array"` \| `"unstructured"` \| `"newlineDelimited"`

The format of JSON files ("unstructured", "newlineDelimited", "array"). By default, the format is inferred.

#### limit?

`number`

A number indicating the maximum number of matching rows to load, after applying `conditions` if provided. Defaults to all matching rows.

#### nullPadding?

`boolean`

If `true`, when a row has fewer columns than expected, the remaining columns on the right will be padded with `NULL` values. Defaults to `false`.

#### records?

`boolean`

A boolean indicating whether each line in a newline-delimited JSON file represents a record. Applicable to JSON files. By default, it's inferred.

#### sheet?

`string`

A string indicating a specific sheet to import from an Excel file. By default, the first sheet is imported.

#### skip?

`number`

The number of lines to skip at the beginning of the file. Applicable to CSV files. Defaults to `0`.

#### strict?

`boolean`

If `true`, an error will be thrown when encountering any issues. If `false`, structurally incorrect files will be parsed tentatively. Defaults to `true`.

#### unifyColumns?

`boolean`

A boolean indicating whether to unify columns across multiple files when their structures differ. Missing columns will be filled with `NULL` values. Defaults to `false`.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Load data from a single local CSV file
await table.loadData("./some-data.csv").log();
```

```ts
// Load data from a remote Parquet file
await table.loadData("https://some-website.com/some-data.parquet").log();
```

```ts
// Load data from multiple local JSON files
await table.loadData([
  "./some-data1.json",
  "./some-data2.json",
  "./some-data3.json"
]).log();
```

```ts
// Load multiple CSV files and unify columns that differ between files
await table.loadData("./data/*.csv", { unifyColumns: true }).log();
```

```ts
// Keep the source filename when loading multiple files
await table
  .loadData("./data/*.csv", { includeFilename: true })
  .log();
```

```ts
// Load only specific columns from a CSV file
await table.loadData("./employees.csv", { columns: ["name", "salary"] }).log();
```

```ts
// Load up to 100 matching employees, keeping only their names
await table
  .loadData("./employees.parquet", {
    conditions: "salary > 100000",
    columns: ["name"],
    limit: 100,
  })
  .log();
```

## Inherited from

`SimpleTableCore.loadData`
