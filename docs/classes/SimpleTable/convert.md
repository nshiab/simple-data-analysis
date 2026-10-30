[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / convert

# Method: convert()

> **convert**(`types`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:2377](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L2377)

Converts data types of specified columns to target types (JavaScript or SQL types).

When converting non-standard timestamp, date, or time strings, provide a `datetimeFormat` option using [DuckDB's format specifiers](https://duckdb.org/docs/sql/functions/dateformat).
Strings converted to `datetimeTz` or `timestamp with time zone` use an
explicit `Z` or numeric offset when present; strings without an offset are
interpreted as UTC. Returned `TIMESTAMP WITH TIME ZONE` values are rendered
as UTC strings.

When converting timestamps, dates, or times to/from numbers, the numerical representation will be in milliseconds since the Unix epoch (1970-01-01 00:00:00 UTC).

When converting strings to numbers, commas (often used as thousand separators) will be automatically removed before conversion.

## Parameters

### types

\{\[`key`: `string`\]: `"string"` \| `"number"` \| `"bigint"` \| `"boolean"` \| `"date"` \| `"integer"` \| `"float"` \| `"time"` \| `"datetime"` \| `"datetimeTz"` \| `"double"` \| `"varchar"` \| `"timestamp"` \| `"timestamp with time zone"` \| `"json"` \| `"JSON"` \| `` `float[${number}]` `` \| `` `FLOAT[${number}]` `` \| `` `geometry('${string}')` `` \| `` `GEOMETRY('${string}')` ``; \}

An object mapping column names to their target data types for conversion, including JSON, FLOAT[n] vectors, and GEOMETRY with a CRS.

### options?

An optional object with configuration options:

#### datetimeFormat?

`string`

A string specifying the format for date and time conversions. Uses `strftime` and `strptime` functions from DuckDB. For format specifiers, see [DuckDB's documentation](https://duckdb.org/docs/sql/functions/dateformat).

#### strict?

`boolean`

If `false`, values that cannot be converted will be replaced by `NULL` instead of throwing an error. Defaults to `true`.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Convert 'column1' to string and 'column2' to integer (JavaScript types)
await table.convert({ column1: "string", column2: "integer" }).log();
```

```ts
// Convert 'column1' to VARCHAR and 'column2' to BIGINT (SQL types)
await table.convert({ column1: "varchar", column2: "bigint" }).log();
```

```ts
// Convert strings in 'column3' to datetime using a specific format
await table.convert({ column3: "datetime" }, { datetimeFormat: "%Y-%m-%d" }).log();
```

```ts
// Both values identify instants and are rendered in UTC.
await table
  .loadArray([
    { observedAt: "2024-04-07T13:00:00-04:00" },
    { observedAt: "2024-04-07T17:00:00Z" },
  ])
  .convert({ observedAt: "datetimeTz" }).log();
```

```ts
// Convert datetime values in 'column3' to strings using a specific format
await table.convert({ column3: "string" }, { datetimeFormat: "%Y-%m-%d %H:%M:%S" }).log();
```

```ts
// Convert 'amount' to float, replacing unconvertible values with NULL
await table.convert({ amount: "float" }, { strict: false }).log();
```

```ts
// Parse JSON, a fixed-size float vector, and WKT geometry from text.
await table.loadArray([{
  details: '{"count":3}',
  embedding: "[0.25,0.5,0.75]",
  geom: "POINT (-73 45)",
}])
  .convert({ details: "JSON", embedding: "FLOAT[3]", geom: "GEOMETRY('EPSG:4326')" })
  .log();
```

## Inherited from

`SimpleTableCore.convert`
