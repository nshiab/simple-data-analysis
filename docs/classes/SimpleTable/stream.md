[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / stream

# Method: stream()

> **stream**(`options?`): `AsyncGenerator`\<\{\[`key`: `string`\]: `unknown`; \}, `void`, `undefined`\>

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:7658](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L7658)

Streams the table rows one by one as an async iterator, without
materializing the whole table in memory. Values are converted to
JavaScript types the same way as `getData()`.
With the default `SimpleDB.expressionSyntax: "js"`, conditions support JavaScript-style operators (`&&`, `||`, `===`, `!==`). Set `expressionSyntax: "sql"` for unchanged SQL.

The underlying DuckDB result is streamed chunk by chunk, so tables
larger than the available memory can be iterated. Avoid running other
queries on the same database while iterating.

## Parameters

### options?

An optional object with configuration options:

#### columns?

`string` \| `string`[]

The column name or an array of column names to include. If omitted, all columns are streamed.

#### conditions?

`string`

A SQL `WHERE` clause condition to filter the rows.

## Returns

`AsyncGenerator`\<\{\[`key`: `string`\]: `unknown`; \}, `void`, `undefined`\>

An async generator yielding one row object at a time.

## Examples

```ts
// Stream all rows
for await (const row of table.stream()) {
  console.log(row);
}
```

```ts
// Stream specific columns and rows
for await (const row of table.stream({ columns: "temperature", conditions: `temperature > 20` })) {
  console.log(row);
}
```

## Inherited from

`SimpleTableCore.stream`
