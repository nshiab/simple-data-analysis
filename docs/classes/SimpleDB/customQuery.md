[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleDB](../SimpleDB.md) / customQuery

# Method: customQuery()

> **customQuery**(`query`, `options?`): `Promise`\<`object`[] \| `null`\>

Defined in: [simple-data-analysis-core/src/class/SimpleDB.ts:864](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleDB.ts#L864)

Executes a custom SQL query directly against the DuckDB instance.
With the default `SimpleDB.expressionSyntax: "js"`, queries support JavaScript-style operators (`&&`, `||`, `===`, `!==`). Set `expressionSyntax: "sql"` for unchanged SQL.
Queries run in UTC. When data is returned, temporal values use the same
JavaScript representations as `SimpleTable.getData()`.

`customQuery()` bypasses the dependency and table-generation tracking used
by `SimpleTable.cache()`. Reading or changing a table with `customQuery()`
can therefore cause `cache()` to return stale data. Include a value that
identifies the custom query's dependencies in the cache's `options.inputs`
(such as a table content hash), or use tracked `SimpleTable` methods.

## Parameters

### query

`string`

The SQL query string to execute.

### options?

Configuration options for the query.

#### returnData?

`boolean`

If `true`, the query result is returned. Defaults to `false`.

#### table?

`string`

The name of the table associated with the query, primarily used for debugging and logging.

## Returns

`Promise`\<`object`[] \| `null`\>

A promise that resolves to the query result as an array of objects if `returnData` is `true`, otherwise `null`.

## Examples

```ts
// Execute a query without returning data
await sdb.customQuery("CREATE TABLE young_employees AS SELECT * FROM employees WHERE age > 30");
```

```ts
// Execute a query and return the results
const youngEmployees = await sdb.customQuery(
  "SELECT * FROM employees WHERE age < 30",
  { returnData: true }
);
console.log(youngEmployees);
```

## Inherited from

`SimpleDBCore.customQuery`
