[**Simple Data Analysis v6.0.10**](../index.md)

***

[Simple Data Analysis](../globals.md) / SimpleDB

# Class: SimpleDB

Manages a DuckDB database instance, providing a simplified interface for database operations.
Extends the core [`SimpleDB`](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/docs/classes/SimpleDB.md) class
from [`simple-data-analysis-core`](https://github.com/nshiab/simple-data-analysis-core) to use
our extended SimpleTable class which includes additional AI, Google Sheets, and charting methods.

All core methods are available on this class.
See the [core SimpleDB reference](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/docs/classes/SimpleDB.md)
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

#### Example

```ts
const sdb = new SimpleDB({ file: "./archive.duckdb", readOnly: true });
const table = await sdb.getTable("employees");
await table.log();
await sdb.close();
```

#### Overrides

`SimpleDBCore<SimpleTable>.constructor`

## DuckDB

### customQuery()

> **customQuery**(`query`, `options?`): `Promise`\<`object`[] \| `null`\>

Executes a custom SQL query directly against the DuckDB instance.
With the default `SimpleDB.expressionSyntax: "js"`, queries support JavaScript-style operators (`&&`, `||`, `===`, `!==`). Set `expressionSyntax: "sql"` for unchanged SQL.
Queries run in UTC. When data is returned, temporal values use the same
JavaScript representations as `SimpleTable.getData()`.

`customQuery()` bypasses the dependency and table-generation tracking used
by `SimpleTable.cache()`. Reading or changing a table with `customQuery()`
can therefore cause `cache()` to return stale data. Include a value that
identifies the custom query's dependencies in the cache's `options.inputs`
(such as a table content hash), or use tracked `SimpleTable` methods.

#### Parameters

##### query

`string`

The SQL query string to execute.

##### options?

Configuration options for the query.

###### returnData?

`boolean`

If `true`, the query result is returned. Defaults to `false`.

###### table?

`string`

The name of the table associated with the query, primarily used for debugging and logging.

#### Returns

`Promise`\<`object`[] \| `null`\>

A promise that resolves to the query result as an array of objects if `returnData` is `true`, otherwise `null`.

#### Examples

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

#### Inherited from

`SimpleDBCore.customQuery`

***

### getExtensions()

> **getExtensions**(): `Promise`\<`object`[]\>

Returns a list of installed DuckDB extensions.

#### Returns

`Promise`\<`object`[]\>

A promise that resolves to an array of objects, each representing an installed extension.

#### Example

```ts
// Get a list of all installed extensions
const extensions = await sdb.getExtensions();
console.log(extensions); // Output: [{ extension_name: "spatial", loaded: true, ... }]
```

#### Inherited from

`SimpleDBCore.getExtensions`

## File Operations

### loadDB()

> **loadDB**(`file`): `Promise`\<`SimpleDB`\>

Imports a copy of a `.db` or `.duckdb` (DuckDB) or `.sqlite` (SQLite)
file into the current database. The source is opened read-only and detached
after importing; subsequent transformations do not modify the source file.
Imports work with in-memory and writable persistent databases. Existing
table-name conflicts are rejected. A failed import may leave partial changes
in the destination database.

DuckDB files restore embedded SDA index definitions when present. SQLite
imports copy data without SDA index metadata. The `__sda` schema is reserved
for SDA metadata.
To edit an existing DuckDB file in place, use `new SimpleDB({ file })`.

#### Parameters

##### file

`string`

The relative or absolute path to the database file.

#### Returns

`Promise`\<`SimpleDB`\>

A promise that resolves to the database, so methods can be chained.

#### Examples

```ts
// Load a DuckDB database file
await sdb.loadDB("./my_database.db");
```

```ts
// Import SQLite tables without modifying the original file
await sdb.loadDB("./my_database.sqlite");
```

```ts
// Import a copy into a persistent DuckDB database
const sdb = new SimpleDB({ file: "./analysis.duckdb" });
await sdb.loadDB("./archive.db");
await sdb.close();
```

#### Inherited from

`SimpleDBCore.loadDB`

***

### writeDB()

> **writeDB**(`file`, `options?`): `Promise`\<`SimpleDB`\>

Exports a snapshot of the current database after executing pending work.
Does not change the working database or where subsequent changes persist.
DuckDB outputs (`.db` and `.duckdb`) preserve database objects and embed SDA
index definitions in the reserved `__sda` schema.

SQLite output (`.sqlite`) materializes main-schema tables and views as
tables. It does not preserve DuckDB schemas, indexes, constraints, or SDA
metadata, and SQLite type conversion may lose type information. Unsupported
conversions fail without replacing an existing destination.

Existing files require explicit overwrite permission. The completed export
is published only after its connection is detached. Database files attached
to this instance, directories, and symbolic links cannot be replaced.

#### Parameters

##### file

`string`

The relative or absolute path to the output file.

##### options?

Configuration options for writing the database.

###### metadata?

`boolean`

If false, omits logical SDA index definitions from DuckDB exports. Defaults to true. Does not control physical indexes; SQLite exports never include SDA metadata.

###### overwrite?

`boolean`

If true, permits atomic replacement of an existing output file. Defaults to false.

#### Returns

`Promise`\<`SimpleDB`\>

A promise that resolves to the database, so methods can be chained.

#### Examples

```ts
// Write the current database to a DuckDB file
await sdb.writeDB("./my_exported_database.db");
```

```ts
// Explicitly replace an earlier snapshot
await sdb.writeDB("./my_exported_database.duckdb", { overwrite: true });
```

```ts
// Export table data for use with SQLite
await sdb.writeDB("./my_exported_database.sqlite");
```

#### Inherited from

`SimpleDBCore.writeDB`

## Lifecycle

### close()

> **close**(): `Promise`\<`SimpleDB`\<`SimpleTable`\>\>

Executes pending transformations, saves SDA metadata for writable persistent
databases, and closes the connection and instance. Also cleans up temporary
files and the cache. Does not copy, compact, or replace the database file.

#### Returns

`Promise`\<`SimpleDB`\<`SimpleTable`\>\>

A promise that resolves to the SimpleDB instance after cleanup.

#### Example

```ts
// close() executes queued transformations before cleaning up resources.
table.loadData("data.csv").convert({ price: "number" });
await sdb.close();
```

#### Throws

An error after cleanup when pending execution or cleanup fails.

#### Inherited from

`SimpleDBCore.close`

***

### run()

> **run**(): `Promise`\<`SimpleDB`\<`SimpleTable`\>\>

Executes all queued methods across every table in the database. Sync
builder methods (like `filter()` or `convert()`) only queue their
operation; execution happens when an async observer method (like
`getData()`, `log()`, or `writeData()`) is awaited. Use `run()` when
your script ends in pure mutations with nothing to observe and you want
the work done now.

The whole database is flushed in program order, so operations on
different tables execute exactly in the order they were queued. This is
the database-level counterpart to `SimpleTable.run()`.

#### Returns

`Promise`\<`SimpleDB`\<`SimpleTable`\>\>

A promise that resolves to the SimpleDB instance once the queued methods have been executed.

#### Example

```ts
// Nothing is observed after the mutations, so run() executes them.
table1.loadData("data1.csv").convert({ price: "number" });
table2.loadData("data2.csv").filter(`price > 0`);
await sdb.run();
```

#### Inherited from

`SimpleDBCore.run`

## Other

### charsToLog

> **charsToLog**: `number` \| `undefined`

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

A connection to a DuckDB database.

#### Inherited from

`SimpleDBCore.connection`

***

### db

> **db**: `DuckDBInstance`

A DuckDB database instance.

#### Inherited from

`SimpleDBCore.db`

***

### defaultTableName

> **defaultTableName**: `boolean`

A flag indicating if the table name was assigned by default.

#### Default Value

`false`

#### Inherited from

`SimpleDBCore.defaultTableName`

***

### rowsToLog

> **rowsToLog**: `number`

The number of rows to display when logging a table.

#### Default Value

`10`

#### Inherited from

`SimpleDBCore.rowsToLog`

***

### runQuery

> **runQuery**: (`query`, `connection`, `returnData`, `options`) => `Promise`\<`object`[] \| `null`\>

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

A flag indicating whether to include data types when logging a table.

#### Default Value

`false`

#### Inherited from

`SimpleDBCore.typesToLog`

## Properties

### cacheSourcesUsed

> **cacheSourcesUsed**: `string`[]

An array of paths to the data sources used in the cache.

#### Default Value

`[]`

#### Inherited from

`SimpleDBCore.cacheSourcesUsed`

***

### cacheTimeSaved

> **cacheTimeSaved**: `number`

The total time saved by using the cache, in milliseconds.

#### Default Value

`0`

#### Inherited from

`SimpleDBCore.cacheTimeSaved`

***

### cacheTimeWriting

> **cacheTimeWriting**: `number`

The total time spent writing to the cache, in milliseconds.

#### Default Value

`0`

#### Inherited from

`SimpleDBCore.cacheTimeWriting`

***

### cacheVerbose

> **cacheVerbose**: `boolean`

Whether to log cache hits and misses, code and input changes, TTL status,
and cache read/write timing.

#### Default Value

`false`

#### Inherited from

`SimpleDBCore.cacheVerbose`

***

### duckDbCache

> **duckDbCache**: `boolean` \| `null`

A flag indicating whether to use DuckDB's external file cache.

#### Default Value

`false`

#### Inherited from

`SimpleDBCore.duckDbCache`

***

### durationStart

> **durationStart**: `number` \| `undefined`

A timestamp marking the start of a duration measurement.

#### Default Value

`undefined`

#### Inherited from

`SimpleDBCore.durationStart`

***

### explainSQL

> **explainSQL**: `boolean`

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

The path to the persistent DuckDB database, opened or created on first use.
If not provided, an in-memory database is used. Imports and exports do not change this path.

#### Default Value

`:memory:`

#### Inherited from

`SimpleDBCore.file`

***

### logDuration

> **logDuration**: `boolean`

A flag indicating whether to log the total execution duration.

#### Default Value

`false`

#### Inherited from

`SimpleDBCore.logDuration`

***

### logSQL

> **logSQL**: `boolean`

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

The maximum amount of memory DuckDB is allowed to use (e.g., `'4GB'`). Defaults to 80% of system RAM.

#### Default Value

`undefined`

#### Inherited from

`SimpleDBCore.memoryLimit`

***

### overwrite

> **overwrite**: `boolean`

Whether to replace an existing DuckDB file on first use instead of opening it.

#### Default Value

`false`

#### Inherited from

`SimpleDBCore.overwrite`

***

### progressBar

> **progressBar**: `boolean`

A flag indicating whether to display a progress bar for long-running operations.

#### Default Value

`false`

#### Inherited from

`SimpleDBCore.progressBar`

***

### readOnly

> **readOnly**: `boolean`

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

A counter for incrementing default table names.

#### Default Value

`1`

#### Inherited from

`SimpleDBCore.tableIncrement`

***

### tempDir

> **tempDir**: `string` \| `undefined`

The path to the directory used for temporary files when data exceeds the memory limit (e.g., `'/tmp/duckdb_swap'`). Defaults to `.tmp` for in-memory databases or `<file>.tmp` for file-based databases. Temporary directories are automatically removed when calling `close()`.

#### Default Value

`undefined`

#### Inherited from

`SimpleDBCore.tempDir`

## Table Management

### getTable()

> **getTable**(`name`): `Promise`\<[`SimpleTable`](SimpleTable.md)\>

Retrieves an existing SimpleTable instance from the database.

#### Parameters

##### name

`string`

The name of the table to retrieve.

#### Returns

`Promise`\<[`SimpleTable`](SimpleTable.md)\>

A promise that resolves to the SimpleTable instance if found.

#### Example

```ts
// Retrieve the "employees" table
const employees = await sdb.getTable("employees");
await employees.log();
```

#### Inherited from

`SimpleDBCore.getTable`

***

### getTableNames()

> **getTableNames**(): `Promise`\<`string`[]\>

Returns an array of all table names in the database, sorted alphabetically.

#### Returns

`Promise`\<`string`[]\>

A promise that resolves to an array of table names.

#### Example

```ts
// Get all table names
const tableNames = await sdb.getTableNames();
console.log(tableNames); // Output: ["employees", "customers"]
```

#### Inherited from

`SimpleDBCore.getTableNames`

***

### getTables()

> **getTables**(): readonly [`SimpleTable`](SimpleTable.md)[]

Returns an array of all SimpleTable instances in the database.

The returned array is a snapshot and cannot mutate the database's internal
table registry.

#### Returns

readonly [`SimpleTable`](SimpleTable.md)[]

A read-only array of SimpleTable instances.

#### Example

```ts
// Get all SimpleTable instances
const tables = sdb.getTables();
```

#### Inherited from

`SimpleDBCore.getTables`

***

### hasTable()

> **hasTable**(`table`): `Promise`\<`boolean`\>

Checks if a table exists in the database.

#### Parameters

##### table

`string` \| [`SimpleTable`](SimpleTable.md)

The name of the table or a SimpleTable instance.

#### Returns

`Promise`\<`boolean`\>

A promise that resolves to `true` if the table exists, `false` otherwise.

#### Examples

```ts
// Check if a table named "employees" exists
const exists = await sdb.hasTable("employees");
console.log(exists); // Output: true or false
```

```ts
// Check if a SimpleTable instance exists in the database
const myTable = sdb.newTable("my_data");
const existsInstance = await sdb.hasTable(myTable);
console.log(existsInstance); // Output: true or false
```

#### Inherited from

`SimpleDBCore.hasTable`

***

### logTableNames()

> **logTableNames**(): `Promise`\<`SimpleDB`\>

Logs the names of all tables in the database to the console, sorted alphabetically.

#### Returns

`Promise`\<`SimpleDB`\>

A promise that resolves to the database, so methods can be chained.

#### Example

```ts
// Log all table names to the console
await sdb.logTableNames();
// Example output: SimpleDB - Tables:  ["employees","customers"]
```

#### Inherited from

`SimpleDBCore.logTableNames`

***

### newTable()

> **newTable**(`name?`): [`SimpleTable`](SimpleTable.md)

Creates a new SimpleTable instance within the database.
The name must be unique among registered tables, ignoring ASCII letter case.

#### Parameters

##### name?

`string`

The name of the new table. If not provided, a default name is generated (e.g., "table1").

#### Returns

[`SimpleTable`](SimpleTable.md)

A new table instance.

#### Examples

```ts
// Create a table with a default name (e.g., "table1", "table2", etc.)
const dataTable = await sdb
  .newTable()
  .loadArray([{ value: 1 }])
  .log();
```

```ts
// Create a table with a specific name
const employees = await sdb
  .newTable("employees")
  .loadData("employees.csv")
  .log();
```

#### Inherited from

`SimpleDBCore.newTable`

***

### removeTables()

> **removeTables**(`tables`): `Promise`\<`SimpleDB`\>

Removes one or more tables from the database.

#### Parameters

##### tables

`string` \| [`SimpleTable`](SimpleTable.md) \| (`string` \| [`SimpleTable`](SimpleTable.md))[]

A single table or an array of tables to remove, specified by name or as SimpleTable instances. Pass `"all"` to remove all tables.

#### Returns

`Promise`\<`SimpleDB`\>

A promise that resolves to the database, so methods can be chained.

#### Examples

```ts
// Remove a single table by name
await sdb.removeTables("employees");
```

```ts
// Remove multiple tables by name
await sdb.removeTables(["customers", "products"]);
```

```ts
// Remove a single table using a SimpleTable instance
const employeesTable = sdb.newTable("employees");
// ... load data ...
await sdb.removeTables(employeesTable);
```

```ts
// Remove all tables
await sdb.removeTables("all");
```

#### Inherited from

`SimpleDBCore.removeTables`

***

### selectTables()

> **selectTables**(`tables`): `Promise`\<`SimpleDB`\>

Selects one or more tables to keep in the database, removing all others.

#### Parameters

##### tables

`string` \| [`SimpleTable`](SimpleTable.md) \| (`string` \| [`SimpleTable`](SimpleTable.md))[]

A single table or an array of tables to select, specified by name or as SimpleTable instances.

#### Returns

`Promise`\<`SimpleDB`\>

A promise that resolves to the database, so methods can be chained.

#### Examples

```ts
// Select a single table by name, removing all other tables
await sdb.selectTables("employees");
```

```ts
// Select multiple tables by name, removing all other tables
await sdb.selectTables(["customers", "products"]);
```

```ts
// Select a single table using a SimpleTable instance
const employeesTable = sdb.newTable("employees");
// ... load data ...
await sdb.selectTables(employeesTable);
```

#### Inherited from

`SimpleDBCore.selectTables`
