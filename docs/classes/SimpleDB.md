[**Simple Data Analysis v6.0.13**](../index.md)

***

[Simple Data Analysis](../globals.md) / SimpleDB

# Class: SimpleDB

Defined in: [src/class/SimpleDB.ts:46](https://github.com/nshiab/simple-data-analysis/blob/v6.0.13/src/class/SimpleDB.ts#L46)

Manages a DuckDB database instance, providing a simplified interface for database operations.
Extends the core [`SimpleDB`](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/docs/classes/SimpleDB.md) class
from [`simple-data-analysis-core`](https://github.com/nshiab/simple-data-analysis-core) to use
our extended SimpleTable class which includes additional AI, Google Sheets, and charting methods.

All core methods are available on this class.
See the [core SimpleDB reference](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/docs/classes/SimpleDB.md)
for inherited methods such as `newTable()` and `close()`.

## Examples

```ts
// Create an in-memory database instance
const sdb = new SimpleDB();
// Create a table, load a CSV file, and log its first few rows
const employees = await sdb
  .newTable("employees")
  .loadData("./employees.csv")
  .log();

// Close the database connection and clean up resources
await sdb.close();
```

```ts
// Open an existing DuckDB file, or create it on first use
const sdb = new SimpleDB({ file: "./my_database.db" });
// Perform database operations...
// Execute pending work, save metadata, and close the database connection
await sdb.close();
```

```ts
// Create a database instance with custom options
const sdb = new SimpleDB({
  logSQL: true, // Log SQL immediately before execution
  rowsToLog: 20 // Set the number of rows to log by default
});
```

## Extends

- `SimpleDB`\<[`SimpleTable`](SimpleTable.md)\>

## Constructors

### Constructor

> **new SimpleDB**(`options?`): `SimpleDB`

Defined in: [src/class/SimpleDB.ts:88](https://github.com/nshiab/simple-data-analysis/blob/v6.0.13/src/class/SimpleDB.ts#L88)

Creates a new SimpleDB instance.

#### Parameters

##### options?

Configuration options for the SimpleDB instance.

###### cacheVerbose?

`boolean`

A flag indicating whether to log verbose cache-related messages.

###### charsToLog?

`number`

The maximum number of characters to display for text-based cells.

###### duckDbCache?

`boolean` \| `null`

A flag indicating whether to use DuckDB's external file cache.

###### explainSQL?

`boolean`

A flag indicating whether to log DuckDB query plans for supported statements.

###### expressionSyntax?

`"js"` \| `"sql"`

`"js"` (default) translates JavaScript operators; `"sql"` leaves SQL unchanged.

###### file?

`string`

The path to a persistent DuckDB file, opened or created on first use. If not provided, an in-memory database is used.

###### logDuration?

`boolean`

A flag indicating whether to log the total execution duration.

###### logSQL?

`boolean`

A flag indicating whether to log SQL immediately before execution.

###### memoryLimit?

`string`

The maximum amount of memory DuckDB is allowed to use (for example, `"4GB"`).

###### overwrite?

`boolean`

Whether to replace an existing DuckDB file on first use instead of opening it. Defaults to false.

###### progressBar?

`boolean`

A flag indicating whether to display a progress bar for long-running operations.

###### readOnly?

`boolean`

Opens an existing DuckDB file read-only. Defaults to false. Requires a file and cannot be combined with overwrite.

###### rowsToLog?

`number`

The number of rows to display when logging a table.

###### tempDir?

`string`

The path to the directory used for temporary files.

###### typesToLog?

`boolean`

A flag indicating whether to include data types when logging a table.

#### Returns

`SimpleDB`

#### Examples

```ts
const sdb = new SimpleDB({ file: "./archive.duckdb", readOnly: true });
const table = await sdb.getTable("employees");
await table.log();
await sdb.close();
```

```ts
// Keep SQL expressions unchanged.
const sdb = new SimpleDB({ expressionSyntax: "sql" });
await sdb.close();
```

#### Overrides

`SimpleDBCore<SimpleTable>.constructor`

## DuckDB

- [customQuery](SimpleDB/customQuery.md)
- [getExtensions](SimpleDB/getExtensions.md)

## File Operations

- [loadDB](SimpleDB/loadDB.md)
- [writeDB](SimpleDB/writeDB.md)

## Lifecycle

- [close](SimpleDB/close.md)
- [run](SimpleDB/run.md)

## Other

### charsToLog

> **charsToLog**: `number` \| `undefined`

Defined in: [simple-data-analysis-core/src/class/Simple.ts:32](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/Simple.ts#L32)

The maximum number of characters to display for text and stringified nested cells, including the truncation marker. This does not control column width. Set to Infinity to show the entire text.

#### Example

```ts
const sdb = new SimpleDB({ charsToLog: 150 });
await sdb.newTable().loadArray([{ text: "x".repeat(200) }]).log();
```

#### Default Value

`75`

#### Inherited from

`SimpleDBCore.charsToLog`

***

### connection

> **connection**: `DuckDBConnection`

Defined in: [simple-data-analysis-core/src/class/Simple.ts:40](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/Simple.ts#L40)

A connection to a DuckDB database.

#### Inherited from

`SimpleDBCore.connection`

***

### db

> **db**: `DuckDBInstance`

Defined in: [simple-data-analysis-core/src/class/Simple.ts:36](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/Simple.ts#L36)

A DuckDB database instance.

#### Inherited from

`SimpleDBCore.db`

***

### defaultTableName

> **defaultTableName**: `boolean`

Defined in: [simple-data-analysis-core/src/class/Simple.ts:46](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/Simple.ts#L46)

A flag indicating if the table name was assigned by default.

#### Default Value

`false`

#### Inherited from

`SimpleDBCore.defaultTableName`

***

### rowsToLog

> **rowsToLog**: `number`

Defined in: [simple-data-analysis-core/src/class/Simple.ts:14](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/Simple.ts#L14)

The number of rows to display when logging a table.

#### Default Value

`10`

#### Inherited from

`SimpleDBCore.rowsToLog`

***

### runQuery

> **runQuery**: (`query`, `connection`, `returnData`, `options`) => `Promise`\<`object`[] \| `null`\>

Defined in: [simple-data-analysis-core/src/class/Simple.ts:73](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/Simple.ts#L73)

A function for running SQL queries. Subclasses can wrap this seam to observe
execution while forwarding every argument. To run custom SQL, use
`SimpleDB.customQuery()` instead.

#### Parameters

##### query

`string`

The exact SQL statement to execute.

##### connection

`DuckDBConnection`

The DuckDB connection that executes the statement.

##### returnData

`boolean`

Whether to convert and return result rows.

##### options

Error-attribution, binding, and observability options.

###### explainSQL

`boolean`

Whether to log a supported DuckDB query plan before execution.

###### logSQL

`boolean`

Whether to log the SQL immediately before execution.

###### method

`string` \| `null`

The SDA method responsible for the query, when available.

###### parameters

\{\[`key`: `string`\]: `unknown`; \} \| `null`

The method arguments recorded for error attribution.

###### table?

`string` \| `null`

The table associated with returned values and warnings.

###### values?

`DuckDBValue`[]

Data values bound to placeholders in the SQL statement.

#### Returns

`Promise`\<`object`[] \| `null`\>

The converted rows when requested, otherwise `null`.

#### Example

```ts
const original = table.runQuery;
table.runQuery = (query, connection, returnData, options) => {
  console.log(query);
  return original(query, connection, returnData, options);
};
```

#### Inherited from

`SimpleDBCore.runQuery`

***

### typesToLog

> **typesToLog**: `boolean`

Defined in: [simple-data-analysis-core/src/class/Simple.ts:20](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/Simple.ts#L20)

A flag indicating whether to include data types when logging a table.

#### Default Value

`false`

#### Inherited from

`SimpleDBCore.typesToLog`

## Properties

### cacheSourcesUsed

> **cacheSourcesUsed**: `string`[]

Defined in: [simple-data-analysis-core/src/class/SimpleDB.ts:168](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleDB.ts#L168)

An array of paths to the data sources used in the cache.

#### Default Value

`[]`

#### Inherited from

`SimpleDBCore.cacheSourcesUsed`

***

### cacheTimeSaved

> **cacheTimeSaved**: `number`

Defined in: [simple-data-analysis-core/src/class/SimpleDB.ts:204](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleDB.ts#L204)

The total time saved by using the cache, in milliseconds.

#### Default Value

`0`

#### Inherited from

`SimpleDBCore.cacheTimeSaved`

***

### cacheTimeWriting

> **cacheTimeWriting**: `number`

Defined in: [simple-data-analysis-core/src/class/SimpleDB.ts:211](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleDB.ts#L211)

The total time spent writing to the cache, in milliseconds.

#### Default Value

`0`

#### Inherited from

`SimpleDBCore.cacheTimeWriting`

***

### cacheVerbose

> **cacheVerbose**: `boolean`

Defined in: [simple-data-analysis-core/src/class/SimpleDB.ts:197](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleDB.ts#L197)

Whether to log cache hits and misses, code and input changes, TTL status,
and cache read/write timing.

#### Default Value

`false`

#### Inherited from

`SimpleDBCore.cacheVerbose`

***

### duckDbCache

> **duckDbCache**: `boolean` \| `null`

Defined in: [simple-data-analysis-core/src/class/SimpleDB.ts:269](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleDB.ts#L269)

A flag indicating whether to use DuckDB's external file cache.

#### Default Value

`false`

#### Inherited from

`SimpleDBCore.duckDbCache`

***

### durationStart

> **durationStart**: `number` \| `undefined`

Defined in: [simple-data-analysis-core/src/class/SimpleDB.ts:175](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleDB.ts#L175)

A timestamp marking the start of a duration measurement.

#### Default Value

`undefined`

#### Inherited from

`SimpleDBCore.durationStart`

***

### explainSQL

> **explainSQL**: `boolean`

Defined in: [simple-data-analysis-core/src/class/SimpleDB.ts:161](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleDB.ts#L161)

Whether to log DuckDB query plans before supported statements execute.

#### Example

```ts
const sdb = new SimpleDB({ explainSQL: true });
```

#### Default Value

`false`

#### Inherited from

`SimpleDBCore.explainSQL`

***

### expressionSyntax

> `readonly` **expressionSyntax**: `"js"` \| `"sql"`

Defined in: [simple-data-analysis-core/src/class/SimpleDB.ts:137](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleDB.ts#L137)

The operator syntax used by expressions and custom queries in this database.
`"js"` translates JavaScript-style operators (`&&`, `||`, `==`, `===`,
`!==`) and null comparisons within SQL expressions. It does not evaluate
arbitrary JavaScript. `||` remains concatenation when string literals, list
literals, explicit text casts, or `concat()` results make that intent clear.
Otherwise `||` becomes OR; column types are not inferred. Use `concat()`
when concatenation would otherwise be ambiguous, such as `first || last`.
`"sql"` passes SQL through unchanged, including `||` and null comparisons.
Choose the syntax when constructing the database; it applies to all tables.

#### Examples

```ts
const sdb = new SimpleDB({ expressionSyntax: "js" }); // The default mode
// || becomes SQL OR: keep rows where at least one condition is true.
await sdb.newTable().loadArray([{ active: true, admin: false }])
  .filter("active || admin").log();
```

```ts
const sdb = new SimpleDB({ expressionSyntax: "js" });
// && becomes SQL AND: both conditions must be true.
// === becomes SQL =: compare the age with 18.
await sdb.newTable().loadArray([{ active: true, age: 18 }])
  .filter("active && age === 18").log();
```

```ts
const sdb = new SimpleDB({ expressionSyntax: "js" });
// SQL AND and OR also work in JS mode; they pass through unchanged.
// Keep active adults, or anyone who is an admin.
await sdb.newTable().loadArray([{ active: true, age: 18, admin: false }])
  .filter("(active AND age >= 18) OR admin").log();
```

```ts
const sdb = new SimpleDB({ expressionSyntax: "js" });
// Bare column names do not establish concatenation. Use concat() explicitly.
await sdb.newTable().loadArray([{ first: "Jane", last: "Doe" }])
  .addColumn("name", "string", "concat(first, ' ', last)").log();
```

```ts
const sdb = new SimpleDB(); // JS mode is the default
// The string literal ' ' makes concatenation clear, so both || stay unchanged.
await sdb.newTable().loadArray([{ first: "Jane", last: "Doe" }])
  .addColumn("name", "string", "first || ' ' || last").log();
```

```ts
const sdb = new SimpleDB({ expressionSyntax: "sql" });
// SQL mode preserves || as concatenation: the name becomes "Jane Doe".
await sdb.newTable().loadArray([{ first: "Jane", last: "Doe" }])
  .addColumn("name", "string", "first || ' ' || last").log();
```

```ts
const sdb = new SimpleDB({ expressionSyntax: "sql" });
// Use SQL AND and OR for logical conditions; && and || are not translated.
// Both active and adult must be true, unless admin is true.
await sdb.newTable().loadArray([{ active: true, age: 18, admin: false }])
  .filter("(active AND age >= 18) OR admin").log();
```

#### Default Value

`"js"`

#### Inherited from

`SimpleDBCore.expressionSyntax`

***

### file

> **file**: `string`

Defined in: [simple-data-analysis-core/src/class/SimpleDB.ts:291](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleDB.ts#L291)

The path to the persistent DuckDB database, opened or created on first use.
If not provided, an in-memory database is used. Imports and exports do not change this path.

#### Default Value

`:memory:`

#### Inherited from

`SimpleDBCore.file`

***

### logDuration

> **logDuration**: `boolean`

Defined in: [simple-data-analysis-core/src/class/SimpleDB.ts:189](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleDB.ts#L189)

A flag indicating whether to log the total execution duration.

#### Default Value

`false`

#### Inherited from

`SimpleDBCore.logDuration`

***

### logSQL

> **logSQL**: `boolean`

Defined in: [simple-data-analysis-core/src/class/SimpleDB.ts:149](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleDB.ts#L149)

Whether to log each SQL statement immediately before execution.

#### Example

```ts
const sdb = new SimpleDB({ logSQL: true });
```

#### Default Value

`false`

#### Inherited from

`SimpleDBCore.logSQL`

***

### memoryLimit

> **memoryLimit**: `string` \| `undefined`

Defined in: [simple-data-analysis-core/src/class/SimpleDB.ts:276](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleDB.ts#L276)

The maximum amount of memory DuckDB is allowed to use (e.g., `'4GB'`). Defaults to 80% of system RAM.

#### Default Value

`undefined`

#### Inherited from

`SimpleDBCore.memoryLimit`

***

### overwrite

> **overwrite**: `boolean`

Defined in: [simple-data-analysis-core/src/class/SimpleDB.ts:298](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleDB.ts#L298)

Whether to replace an existing DuckDB file on first use instead of opening it.

#### Default Value

`false`

#### Inherited from

`SimpleDBCore.overwrite`

***

### progressBar

> **progressBar**: `boolean`

Defined in: [simple-data-analysis-core/src/class/SimpleDB.ts:218](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleDB.ts#L218)

A flag indicating whether to display a progress bar for long-running operations.

#### Default Value

`false`

#### Inherited from

`SimpleDBCore.progressBar`

***

### readOnly

> **readOnly**: `boolean`

Defined in: [simple-data-analysis-core/src/class/SimpleDB.ts:314](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleDB.ts#L314)

Whether the persistent DuckDB file is opened read-only. Requires an existing
file and cannot be combined with `overwrite`. DuckDB rejects writes to it.

#### Example

```ts
const sdb = new SimpleDB({ file: "./archive.duckdb", readOnly: true });
const table = await sdb.getTable("employees");
await table.log();
await sdb.close();
```

#### Default Value

`false`

#### Inherited from

`SimpleDBCore.readOnly`

***

### tableIncrement

> **tableIncrement**: `number`

Defined in: [simple-data-analysis-core/src/class/SimpleDB.ts:182](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleDB.ts#L182)

A counter for incrementing default table names.

#### Default Value

`1`

#### Inherited from

`SimpleDBCore.tableIncrement`

***

### tempDir

> **tempDir**: `string` \| `undefined`

Defined in: [simple-data-analysis-core/src/class/SimpleDB.ts:283](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleDB.ts#L283)

The path to the directory used for temporary files when data exceeds the memory limit (e.g., `'/tmp/duckdb_swap'`). Defaults to `.tmp` for in-memory databases or `<file>.tmp` for file-based databases. Temporary directories are automatically removed when calling `close()`.

#### Default Value

`undefined`

#### Inherited from

`SimpleDBCore.tempDir`

## Table Management

- [getTable](SimpleDB/getTable.md)
- [getTableNames](SimpleDB/getTableNames.md)
- [getTables](SimpleDB/getTables.md)
- [hasTable](SimpleDB/hasTable.md)
- [logTableNames](SimpleDB/logTableNames.md)
- [newTable](SimpleDB/newTable.md)
- [removeTables](SimpleDB/removeTables.md)
- [selectTables](SimpleDB/selectTables.md)
