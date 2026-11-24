[**Simple Data Analysis v6.0.23**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / unnest

# Method: unnest()

> **unnest**(`column`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:5845](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.26/src/class/SimpleTable.ts#L5845)

Expands delimited text, DuckDB lists and fixed-size arrays, and JSON arrays
and objects into rows.

Set `options.separator` to split a string column. Each trimmed substring
replaces the original string in its own row.
For lists and arrays, each element replaces the original value in its own row.
For JSON objects, each top-level property produces a row with a string key and a
JSON value. The key and value columns replace the original object column.
Other columns are copied onto each output row. An empty or null list, array,
or object produces zero rows by default.

With `loadArray()`, declare `JSON` for variable-length arrays or
`FLOAT[n]` for fixed-size float arrays.

A JSON column must contain arrays or objects of a single shape. The first non-null
value determines the shape by default, and an empty or all-null column uses the
array shape. A key or value column name selects the object shape. An index column
name selects the array shape. Use `sort()` to order object rows by their keys.

To expand multiple levels, chain `unnest()` calls. Use
[addColumn()](addColumn.md) to put a nested array or object into its
own column when you need to expand it next.

## Parameters

### column

`string`

The name of the column to expand.

### options?

Settings for expanding the column. Defaults to `{}`.

#### indexColumn?

`string`

An optional output column for the one-based position within each list or array.

#### keepEmpty?

`boolean`

Emit one row with null outputs for each empty or null list, array, or object. Defaults to `false`.

#### keyColumn?

`string`

The output column for JSON object keys. Defaults to `"key"`.

#### separator?

`string`

The delimiter for splitting a string column. Use this option by itself.

#### valueColumn?

`string`

The output column for JSON object values. Defaults to `"value"`.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Split text on commas and trim the pieces. Both rows keep id 1.
// The tags values are "red" and "blue".
await table
  .loadArray([{ id: 1, tags: "red, blue" }])
  .unnest("tags", { separator: "," })
  .log();
```

```ts
// Expand JSON arrays of different lengths. Team A gets two rows, and team B gets one.
await table
  .loadArray(
    [
      { team: "A", scores: [12, 18] },
      { team: "B", scores: [15] },
    ],
    { columnTypes: { scores: "JSON" } },
  )
  .unnest("scores")
  .log();
```

```ts
// Expand a fixed-size array. Station A gets a row for each reading.
await table
  .loadArray([{ station: "A", readings: [18.5, 20.5] }], {
    columnTypes: { readings: "FLOAT[2]" },
  })
  .unnest("readings")
  .log();
```

```ts
// Expand a JSON array and number its elements starting at 1.
// Order 1 gets two rows. Orders 2 and 3 each get a row with null items and itemNumber.
await table
  .loadArray(
    [
      { orderId: 1, items: [{ name: "tea" }, { name: "coffee" }] },
      { orderId: 2, items: [] },
      { orderId: 3, items: null },
    ],
    { columnTypes: { items: "JSON" } },
  )
  .unnest("items", { indexColumn: "itemNumber", keepEmpty: true })
  .log();
```

```ts
// Expand a JSON object. The key and value columns replace inventory.
// The rows have key "coffee" with value 3 and key "tea" with value 7.
await table
  .loadArray([{ store: "East", inventory: { tea: 7, coffee: 3 } }], {
    columnTypes: { inventory: "JSON" },
  })
  .unnest("inventory")
  .sort({ key: "asc" })
  .log();
```

```ts
// Name the key and value columns product and stock.
// Store West stays in the result with null product and stock.
await table
  .loadArray(
    [
      { store: "East", inventory: { tea: 7 } },
      { store: "West", inventory: {} },
    ],
    { columnTypes: { inventory: "JSON" } },
  )
  .unnest("inventory", { keyColumn: "product", valueColumn: "stock", keepEmpty: true })
  .sort({ store: "asc" })
  .log();
```

```ts
// Chain unnest() calls to expand deeply nested JSON.
// First make one row per store, then one row per product in that store.
const inventory = {
  East: { tea: 7, coffee: 3 },
  West: { tea: 2 },
};

await table
  .loadArray([{ inventory }], {
    columnTypes: { inventory: "JSON" },
  })
  .unnest("inventory", { keyColumn: "store", valueColumn: "products" })
  .unnest("products", { keyColumn: "product", valueColumn: "stock" })
  .sort({ store: "asc", product: "asc" })
  .log();
```

## Throws

If options conflict, the column is missing or incompatible with the options, the JSON shapes differ, or output names collide.

## Inherited from

`SimpleTableCore.unnest`
