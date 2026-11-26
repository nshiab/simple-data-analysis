[**Simple Data Analysis v6.0.24**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / addColumn

# Method: addColumn()

> **addColumn**(`newColumn`, `type`, `definition`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:2723](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.26/src/class/SimpleTable.ts#L2723)

Adds a column by evaluating `definition` for each row and casting the result to `type`.

Pass `definition` as a JavaScript string containing a SQL expression.

- To add a string, wrap the value in SQL single quotes, as in
  `"'pending'"`. Double any apostrophe inside the value, as in `"'O''Brien'"`.
- To add a number, put the number directly inside the JavaScript string,
  as in `"12.5"`.
- To add a boolean, use `"TRUE"` or `"FALSE"`.
- To add a value calculated from other columns, refer to those columns by
  name, as in `"price * quantity"`.
- To add a value from a `STRUCT` column, join the field names with dots,
  as in `"customer.address.city"`.
- To add a value from a `JSON` column, use `json_extract_string()` for text,
  as in `"json_extract_string(customer, '$.address.city')"`. Use
  `json_extract()` with `"JSON"` as the new column type to put a nested
  array or object in its own column.

With the default `SimpleDB.expressionSyntax: "js"`, expressions support
JavaScript-style operators (`&&`, `||`, `===`, `!==`). Set
`expressionSyntax: "sql"` to pass the expression directly to DuckDB.

To get one row per array element or JSON object property, see
[unnest()](unnest.md).

Use `await table.getTypes()` to retrieve the column types or
`await table.log({ types: true })` to display them alongside the data.

## Parameters

### newColumn

`string`

The name of the new column to be added.

### type

`"string"` \| `"number"` \| `"bigint"` \| `"boolean"` \| `"date"` \| `"integer"` \| `"float"` \| `"time"` \| `"datetime"` \| `"datetimeTz"` \| `"double"` \| `"varchar"` \| `"timestamp"` \| `"timestamp with time zone"` \| `"json"` \| `"JSON"` \| `` `float[${number}]` `` \| `` `FLOAT[${number}]` `` \| `` `geometry('${string}')` `` \| `` `GEOMETRY('${string}')` ``

The data type for the new column. Can be a JavaScript type (e.g., `"number"`, `"string"`) or a SQL type (e.g., `"integer"`, `"varchar"`, `"JSON"`, `"FLOAT[3]"`, `"GEOMETRY('EPSG:4326')"`).

### definition

`string`

The SQL expression to evaluate for each row, supplied as a JavaScript string.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Add the same text, number, and boolean to every row.
await table
  .loadArray([{ id: 1 }, { id: 2 }])
  .addColumn("name", "string", "'O''Brien'")
  .addColumn("price", "number", "12.5")
  .addColumn("active", "boolean", "TRUE")
  .log();
```

```ts
// Add a new column 'total' as a float, calculated from 'column1' and 'column2'
await table.addColumn("total", "float", "column1 + column2").log();
```

```ts
// Add a new geometry column 'centroid' using the centroid of an existing 'country' geometry column
await table.addColumn("centroid", "geometry('EPSG:4326')", `ST_Centroid("country")`).log();
```

```ts
// orders.json contains [{"customer":{"address":{"city":"Montréal"}}}].
// The new city column contains Montréal.
await table
  .loadData("orders.json")
  .addColumn("city", "string", "customer.address.city")
  .log();
```

```ts
// Read the city name from a JSON column into a text column.
// The new city column contains Montréal.
await table
  .loadArray([{ customer: { address: { city: "Montréal" } } }], {
    columnTypes: { customer: "JSON" },
  })
  .addColumn("city", "string", "json_extract_string(customer, '$.address.city')")
  .log();
```

```ts
// Read the tags array from a JSON column into a new JSON column.
// The new tags column contains ["member","newsletter"].
await table
  .loadArray([{ customer: { tags: ["member", "newsletter"] } }], {
    columnTypes: { customer: "JSON" },
  })
  .addColumn("tags", "JSON", "json_extract(customer, '$.tags')")
  .log();
```

```ts
// Create JSON and fixed-size vector columns with DuckDB expressions.
await table.loadArray([{ count: 3 }])
  .addColumn("details", "JSON", "json_object('count', count)")
  .addColumn("embedding", "FLOAT[3]", "[0.25, 0.5, 0.75]")
  .log();
```

## Inherited from

`SimpleTableCore.addColumn`
