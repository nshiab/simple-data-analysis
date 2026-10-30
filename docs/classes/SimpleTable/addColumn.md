[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / addColumn

# Method: addColumn()

> **addColumn**(`newColumn`, `type`, `definition`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:2489](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L2489)

Adds a new column to the table based on a specified data type (JavaScript or SQL types) and a SQL definition.
With the default `SimpleDB.expressionSyntax: "js"`, expressions support JavaScript-style operators (`&&`, `||`, `===`, `!==`). Set `expressionSyntax: "sql"` for unchanged SQL.

## Parameters

### newColumn

`string`

The name of the new column to be added.

### type

`"string"` \| `"number"` \| `"bigint"` \| `"boolean"` \| `"date"` \| `"integer"` \| `"float"` \| `"time"` \| `"datetime"` \| `"datetimeTz"` \| `"double"` \| `"varchar"` \| `"timestamp"` \| `"timestamp with time zone"` \| `"json"` \| `"JSON"` \| `` `float[${number}]` `` \| `` `FLOAT[${number}]` `` \| `` `geometry('${string}')` `` \| `` `GEOMETRY('${string}')` ``

The data type for the new column. Can be a JavaScript type (e.g., `"number"`, `"string"`) or a SQL type (e.g., `"integer"`, `"varchar"`, `"JSON"`, `"FLOAT[3]"`, `"GEOMETRY('EPSG:4326')"`).

### definition

`string`

A SQL expression defining how the values for the new column should be computed (e.g., `"column1 + column2"`, `"ST_Centroid(geom_column)"`).

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Add a new column 'total' as a float, calculated from 'column1' and 'column2'
await table.addColumn("total", "float", "column1 + column2").log();
```

```ts
// Add a new geometry column 'centroid' using the centroid of an existing 'country' geometry column
await table.addColumn("centroid", "geometry('EPSG:4326')", `ST_Centroid("country")`).log();
```

```ts
// Read a number from a JSON object into a new column using dot notation.
await table.loadArray([{ details: { count: 3 } }], {
  columnTypes: { details: "JSON" },
})
  .addColumn("count", "integer", "details.count")
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
