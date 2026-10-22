[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / getData

# Method: getData()

> **getData**(`options?`): `Promise`\<`object`[]\>

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:7613](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L7613)

Returns the data from the table as an array of objects, optionally filtered by SQL conditions.
With the default `SimpleDB.expressionSyntax: "js"`, conditions support JavaScript-style operators (`&&`, `||`, `===`, `!==`). Set `expressionSyntax: "sql"` for unchanged SQL.

Top-level DuckDB `DATE` and `TIMESTAMP` columns are returned as JavaScript
`Date` objects interpreted in UTC. `TIMESTAMP WITH TIME ZONE` values are
returned as UTC strings, preserving DuckDB's microsecond precision;
JavaScript `Date` supports only milliseconds.

Top-level `BIGINT`, `UBIGINT`, `HUGEINT`, and `UHUGEINT` columns are
returned as JavaScript numbers. Values outside `Number.MIN_SAFE_INTEGER`
through `Number.MAX_SAFE_INTEGER` throw instead of losing precision.
Use `convert({ columnName: "string" })` before `getData()` to retrieve
their exact digits as strings.

SQL arrays and lists, including float vectors, return their actual elements
as JavaScript arrays. Null cells and null elements remain null.

Nested SQL lists and structs become JavaScript arrays and objects. Within
them, `BIGINT`, `UBIGINT`, `HUGEINT`, `UHUGEINT`, and `DECIMAL` values remain
strings to preserve precision, even for small integers.

## Parameters

### options?

An optional object with configuration options:

#### columns?

`string` \| `string`[]

An array of column names to include in the result. If omitted, all columns will be included.

#### conditions?

`string`

The filtering conditions specified as a SQL `WHERE` clause (e.g., `"category = 'Book'"`).

#### limit?

`number`

The maximum number of rows to return. Must be an integer greater than or equal to `0`.

## Returns

`Promise`\<`object`[]\>

A promise that resolves to an array of objects, where each object represents a row in the table.

## Examples

```ts
// Get all data from the table
const allData = await table.getData();
console.log(allData);
```

```ts
// Get data filtered by a condition (using JS or SQL syntax)
const booksData = await table.getData({ conditions: `category === 'Book'` });
console.log(booksData);
```

```ts
// Get data filtered by a condition and specific columns
const booksData = await table.getData({ columns: ["title", "author"], conditions: `category === 'Book'` });
console.log(booksData);
```

```ts
// Return at most two rows.
const preview = await table.getData({ limit: 2 });
```

```ts
// Read nested integers without losing digits. SQL creates the nested types.
await sdb.customQuery(`CREATE TABLE nested_example AS SELECT
  [42::BIGINT, 9007199254740993::BIGINT] AS ids,
  {'count': 2::INTEGER, 'amount': 123.450::DECIMAL(6,3)} AS details`);
const nested = sdb.newTable("nested_example");
const rows = await nested.getData();
// [{ ids: ["42", "9007199254740993"], details: { count: 2, amount: "123.450" } }]
await nested.log();
```

## Inherited from

`SimpleTableCore.getData`
