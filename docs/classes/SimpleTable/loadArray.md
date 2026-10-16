[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / loadArray

# Method: loadArray()

> **loadArray**(`rows`, `options?`): `this`

Loads an array of JavaScript objects into the table. Types are inferred for
numbers, bigints, strings, booleans, and Date values. Array and object cells
require an explicit supported type in columnTypes. Types can also be
specified for scalar columns instead of inferred from their values.
Inferred bigints use signed 64-bit `BIGINT`; values outside that range throw
when written instead of wrapping.

JavaScript `Date` values are inferred as DuckDB `TIMESTAMP` values. Their
instant is preserved, but JavaScript `Date` does not retain the timezone or
offset originally used to construct it.

Declare `JSON` for general nested data, `FLOAT[n]` for a fixed-size float
vector, or `GEOMETRY('EPSG:4326')` for GeoJSON geometries in WGS84.

## Parameters

### rows

`object`[]

An array of objects, where each object represents a row and its properties represent columns.

### options?

Options for loading the array, captured when called.

#### columnTypes?

\{\[`key`: `string`\]: `"string"` \| `"number"` \| `"bigint"` \| `"boolean"` \| `"date"` \| `"integer"` \| `"float"` \| `"time"` \| `"datetime"` \| `"datetimeTz"` \| `"double"` \| `"varchar"` \| `"timestamp"` \| `"timestamp with time zone"` \| `"json"` \| `"JSON"` \| `` `float[${number}]` `` \| `` `FLOAT[${number}]` `` \| `"geometry('EPSG:4326')"` \| `"INTEGER"` \| `"BIGINT"` \| `"DOUBLE"` \| `"VARCHAR"` \| `"BOOLEAN"` \| `"DATE"` \| `"TIME"` \| `"TIMESTAMP"` \| `"TIMESTAMP WITH TIME ZONE"` \| `"GEOMETRY('EPSG:4326')"`; \}

Types for specific columns. Required for array and object cells; omitted scalar columns are inferred, and all-null columns default to VARCHAR. Values must be compatible with the selected type without losing information.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Load scalar columns without columnTypes; strings and numbers are inferred.
const data = [
  { letter: "a", number: 1 },
  { letter: "b", number: 2 }
];
await table.loadArray(data).log();
```

```ts
// Choose a numeric type when all-null values provide nothing to infer.
await table.loadArray(
  [{ name: "A", value: null }, { name: "B", value: null }],
  { columnTypes: { value: "DOUBLE" } },
).log();
```

```ts
// Store the Date as a UTC timestamp with JavaScript's millisecond precision.
// The original -04:00 offset is not retained.
await table.loadArray([{
  observedAt: new Date("2024-04-07T13:00:00-04:00"),
}]).log();
```

```ts
// Declare JSON to load nested objects and variable-length arrays directly.
await table.loadArray([{
  name: "Station",
  metadata: { active: true, tags: ["weather", "urban"] },
  measurements: [1, 2.5, null],
}], { columnTypes: { metadata: "JSON", measurements: "JSON" } }).log();
```

```ts
// Declare FLOAT[3] to store each three-element array as a fixed-size vector.
await table.loadArray([{ vector: [1, 2, 3] }], {
  columnTypes: { vector: "FLOAT[3]" },
}).log();
```

```ts
// Declare a geometry type to store WGS84 GeoJSON as a spatial column.
await table.loadArray([{
  name: "Montreal",
  geom: { type: "Point", coordinates: [-73.57, 45.50] },
}], { columnTypes: { geom: "GEOMETRY('EPSG:4326')" } }).log();
```

## Inherited from

`SimpleTableCore.loadArray`
