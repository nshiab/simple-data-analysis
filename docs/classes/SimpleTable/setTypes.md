[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / setTypes

# Method: setTypes()

> **setTypes**(`types`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:387](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L387)

Sets the data types for columns in a new table. If the table already exists, it will be replaced.
To convert the types of an existing table, use the `.convert()` method instead.

## Parameters

### types

\{\[`key`: `string`\]: `"string"` \| `"number"` \| `"bigint"` \| `"boolean"` \| `"date"` \| `"integer"` \| `"float"` \| `"time"` \| `"datetime"` \| `"datetimeTz"` \| `"double"` \| `"varchar"` \| `"timestamp"` \| `"timestamp with time zone"` \| `"json"` \| `"JSON"` \| `` `float[${number}]` `` \| `` `FLOAT[${number}]` `` \| `` `geometry('${string}')` `` \| `` `GEOMETRY('${string}')` ``; \}

An object specifying the column names and their target data types (JavaScript or SQL types), including JSON, FLOAT[n] vectors, and GEOMETRY with a CRS.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Set types for a new table
await table.setTypes({
  name: "string",
  salary: "integer",
  raise: "float",
}).log();
```

```ts
// Create an empty table with JSON, embedding, and geometry columns.
await table.setTypes({
  details: "JSON",
  embedding: "FLOAT[3]",
  geom: "GEOMETRY('EPSG:4326')",
}).log();
```

## Inherited from

`SimpleTableCore.setTypes`
