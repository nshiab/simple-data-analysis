[**Simple Data Analysis v6.0.14**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / sort

# Method: sort()

> **sort**(`order?`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:1756](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L1756)

Sorts the rows of the table based on specified column(s) and order(s).
If no columns are specified, all columns are sorted from left to right in ascending order.

Order-preserving transformations after a sort retain that order. Operations such as joins, grouping, aggregation, and sampling do not guarantee input order; chain `sort()` after them when deterministic output order matters.

## Parameters

### order?

\{\[`key`: `string`\]: `"desc"` \| `"asc"`; \} \| `null`

An object mapping column names to their sorting order: `"asc"` for ascending or `"desc"` for descending. If `null`, all columns are sorted ascendingly.

### options?

An optional object with configuration options:

#### lang?

\{\[`key`: `string`\]: `string`; \}

An object mapping column names to language codes for collation (e.g., `{ column1: "fr" }`). See DuckDB Collations documentation for more details: https://duckdb.org/docs/sql/expressions/collations.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Sort all columns from left to right in ascending order
await table.sort().log();
```

```ts
// Sort 'column1' in ascending order
await table.sort({ column1: "asc" }).log();
```

```ts
// Sort 'column1' ascendingly, then 'column2' descendingly
await table.sort({ column1: "asc", column2: "desc" }).log();
```

```ts
// Sort 'column1' considering French accents
await table.sort({ column1: "asc" }, { lang: { column1: "fr" } }).log();
```

## Inherited from

`SimpleTableCore.sort`
