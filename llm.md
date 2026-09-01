# The Simple Data Analysis Library

To install the library with Deno, use:

```bash
deno add jsr:@nshiab/simple-data-analysis
```

To install the library with Node.js, use:

```bash
npm i @nshiab/simple-data-analysis
```

To start, create a SimpleDB instance and then a SimpleTable from this instance:

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";

const sdb = new SimpleDB();
const table = await sdb
  .newTable("myTable")
  .loadData("path/to/your/data.csv")
  .log();

// You can now perform various data analysis operations on the table.

await sdb.close(); // Close the database when you're finished.
```

## class SDAError

An error thrown when a SQL query fails. It carries the SDA method that triggered
the query, the parameters passed to it, the SQL query itself, and the original
error as `cause`.

### Constructor

Creates an error that preserves the failing query and its original cause.

#### Parameters

- **`options`**: Details of the failed query.
- **`options.method`**: The SDA method that triggered the query, or `null`.
- **`options.parameters`**: The method's arguments, or `null`.
- **`options.query`**: The SQL statement that failed.
- **`options.cause`**: The original error thrown while executing the query.

### Examples

```ts
try {
  await table.selectColumns("aColumnThatDoesNotExist").run();
} catch (error) {
  if (error instanceof SDAError) {
    console.log(error.method); // "selectColumns()"
    console.log(error.query); // The SQL query that failed
    console.log(error.cause); // The original DuckDB error
  }
}
```

## class SimpleDB

Manages a DuckDB database instance, providing a simplified interface for
database operations. Extends the core
[`SimpleDB`](https://jsr.io/@nshiab/simple-data-analysis-core/doc/~/SimpleDB)
class from
[`simple-data-analysis-core`](https://github.com/nshiab/simple-data-analysis-core)
to use our extended SimpleTable class which includes additional AI, Google
Sheets, and charting methods.

All core methods are available on this class. JSR currently omits inherited
methods from subclass reference pages because of an
[upstream limitation](https://github.com/jsr-io/jsr/issues/747). See the
[core SimpleDB reference](https://jsr.io/@nshiab/simple-data-analysis-core/doc/~/SimpleDB)
for inherited methods such as `newTable()` and `close()`.

### Constructor

Creates a new SimpleDB instance.

#### Parameters

- **`options`**: Configuration options for the SimpleDB instance.
- **`options.file`**: The path to a persistent DuckDB file, opened or created on
  first use. If not provided, an in-memory database is used.
- **`options.overwrite`**: Whether to replace an existing DuckDB file on first
  use instead of opening it. Defaults to false.
- **`options.readOnly`**: Opens an existing DuckDB file read-only. Defaults to
  false. Requires a file and cannot be combined with overwrite.
- **`options.logDuration`**: A flag indicating whether to log the total
  execution duration.
- **`options.rowsToLog`**: The number of rows to display when logging a table.
- **`options.charsToLog`**: The maximum number of characters to display for
  text-based cells.
- **`options.typesToLog`**: A flag indicating whether to include data types when
  logging a table.
- **`options.cacheVerbose`**: A flag indicating whether to log verbose
  cache-related messages.
- **`options.logSQL`**: A flag indicating whether to log SQL immediately before
  execution.
- **`options.explainSQL`**: A flag indicating whether to log DuckDB query plans
  for supported statements.
- **`options.duckDbCache`**: A flag indicating whether to use DuckDB's external
  file cache.
- **`options.progressBar`**: A flag indicating whether to display a progress bar
  for long-running operations.
- **`options.memoryLimit`**: The maximum amount of memory DuckDB is allowed to
  use (for example, `"4GB"`).
- **`options.tempDir`**: The path to the directory used for temporary files.

### Methods

#### `newTable`

Creates a new SimpleTable instance within the database.

##### Signature

```typescript
newTable(name?: string): Table;
```

##### Parameters

- **`name`**: The name of the new table. If not provided, a default name is
  generated (e.g., "table1").

##### Returns

A new table instance.

##### Examples

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

#### `getTable`

Retrieves an existing SimpleTable instance from the database.

##### Signature

```typescript
async getTable(name: string): Promise<Table>;
```

##### Parameters

- **`name`**: The name of the table to retrieve.

##### Returns

A promise that resolves to the SimpleTable instance if found.

##### Examples

```ts
// Retrieve the "employees" table
const employees = await sdb.getTable("employees");
await employees.log();
```

#### `removeTables`

Removes one or more tables from the database.

##### Signature

```typescript
async removeTables(tables: Table | string | (Table | string)[]): Promise<this>;
```

##### Parameters

- **`tables`**: A single table or an array of tables to remove, specified by
  name or as SimpleTable instances. Pass `"all"` to remove all tables.

##### Returns

A promise that resolves to the database, so methods can be chained.

##### Examples

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

#### `selectTables`

Selects one or more tables to keep in the database, removing all others.

##### Signature

```typescript
async selectTables(tables: Table | string | (Table | string)[]): Promise<this>;
```

##### Parameters

- **`tables`**: A single table or an array of tables to select, specified by
  name or as SimpleTable instances.

##### Returns

A promise that resolves to the database, so methods can be chained.

##### Examples

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

#### `getTableNames`

Returns an array of all table names in the database, sorted alphabetically.

##### Signature

```typescript
async getTableNames(): Promise<string[]>;
```

##### Returns

A promise that resolves to an array of table names.

##### Examples

```ts
// Get all table names
const tableNames = await sdb.getTableNames();
console.log(tableNames); // Output: ["employees", "customers"]
```

#### `logTableNames`

Logs the names of all tables in the database to the console, sorted
alphabetically.

##### Signature

```typescript
async logTableNames(): Promise<this>;
```

##### Returns

A promise that resolves to the database, so methods can be chained.

##### Examples

```ts
// Log all table names to the console
await sdb.logTableNames();
// Example output: SimpleDB - Tables:  ["employees","customers"]
```

#### `getTables`

Returns an array of all SimpleTable instances in the database.

The returned array is a snapshot and cannot mutate the database's internal table
registry.

##### Signature

```typescript
getTables(): readonly Table[];
```

##### Returns

A read-only array of SimpleTable instances.

##### Examples

```ts
// Get all SimpleTable instances
const tables = sdb.getTables();
```

#### `hasTable`

Checks if a table exists in the database.

##### Signature

```typescript
async hasTable(table: Table | string): Promise<boolean>;
```

##### Parameters

- **`table`**: The name of the table or a SimpleTable instance.

##### Returns

A promise that resolves to `true` if the table exists, `false` otherwise.

##### Examples

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

#### `getExtensions`

Returns a list of installed DuckDB extensions.

##### Signature

```typescript
async getExtensions(): Promise<Record<string, unknown>[]>;
```

##### Returns

A promise that resolves to an array of objects, each representing an installed
extension.

##### Examples

```ts
// Get a list of all installed extensions
const extensions = await sdb.getExtensions();
console.log(extensions); // Output: [{ extension_name: "spatial", loaded: true, ... }]
```

#### `customQuery`

Executes a custom SQL query directly against the DuckDB instance. Queries run in
UTC. When data is returned, temporal values use the same JavaScript
representations as `SimpleTable.getData()`.

`customQuery()` bypasses the dependency and table-generation tracking used by
`SimpleTable.cache()`. Reading or changing a table with `customQuery()` can
therefore cause `cache()` to return stale data. Include a value that identifies
the custom query's dependencies in the cache's `options.inputs` (such as a table
content hash), or use tracked `SimpleTable` methods.

##### Signature

```typescript
async customQuery(query: string, options?: { returnData?: boolean; table?: string }): Promise<Record<string, unknown>[] | null>;
```

##### Parameters

- **`query`**: The SQL query string to execute.
- **`options`**: Configuration options for the query.
- **`options.returnData`**: If `true`, the query result is returned. Defaults to
  `false`.
- **`options.table`**: The name of the table associated with the query,
  primarily used for debugging and logging.

##### Returns

A promise that resolves to the query result as an array of objects if
`returnData` is `true`, otherwise `null`.

##### Examples

```ts
// Execute a query without returning data
await sdb.customQuery(
  "CREATE TABLE young_employees AS SELECT * FROM employees WHERE age > 30",
);
```

```ts
// Execute a query and return the results
const youngEmployees = await sdb.customQuery(
  "SELECT * FROM employees WHERE age < 30",
  { returnData: true },
);
console.log(youngEmployees);
```

#### `loadDB`

Imports a copy of a `.db` or `.duckdb` (DuckDB) or `.sqlite` (SQLite) file into
the current database. The source is opened read-only and detached after
importing; subsequent transformations do not modify the source file. Imports
work with in-memory and writable persistent databases. Existing table-name
conflicts are rejected and a failed copy is rolled back.

DuckDB files restore embedded SDA index definitions when present. SQLite imports
copy data without SDA index metadata. The `__sda` schema is reserved for SDA
metadata. To edit an existing DuckDB file in place, use
`new SimpleDB({ file })`.

##### Signature

```typescript
async loadDB(file: string): Promise<this>;
```

##### Parameters

- **`file`**: The relative or absolute path to the database file.

##### Returns

A promise that resolves to the database, so methods can be chained.

##### Examples

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

#### `writeDB`

Exports a snapshot of the current database after executing pending work. Does
not change the working database or where subsequent changes persist. DuckDB
outputs (`.db` and `.duckdb`) preserve database objects and embed SDA index
definitions in the reserved `__sda` schema.

SQLite output (`.sqlite`) materializes main-schema tables and views as tables.
It does not preserve DuckDB schemas, indexes, constraints, or SDA metadata, and
SQLite type conversion may lose type information. Unsupported conversions fail
without replacing an existing destination.

Existing files require explicit overwrite permission. The completed export is
published only after its connection is detached. Database files attached to this
instance, directories, and symbolic links cannot be replaced.

##### Signature

```typescript
async writeDB(file: string, options?: { overwrite?: boolean; metadata?: boolean }): Promise<this>;
```

##### Parameters

- **`file`**: The relative or absolute path to the output file.
- **`options`**: Configuration options for writing the database.
- **`options.overwrite`**: If true, permits atomic replacement of an existing
  output file. Defaults to false.
- **`options.metadata`**: If false, omits logical SDA index definitions from
  DuckDB exports. Defaults to true. Does not control physical indexes; SQLite
  exports never include SDA metadata.

##### Returns

A promise that resolves to the database, so methods can be chained.

##### Examples

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

#### `run`

Executes all queued methods across every table in the database. Sync builder
methods (like `filter()` or `convert()`) only queue their operation; execution
happens when an async observer method (like `getData()`, `log()`, or
`writeData()`) is awaited. Use `run()` when your script ends in pure mutations
with nothing to observe and you want the work done now.

The whole database is flushed in program order, so operations on different
tables execute exactly in the order they were queued. This is the database-level
counterpart to `SimpleTable.run()`.

##### Signature

```typescript
async run(): Promise<SimpleDB>;
```

##### Returns

A promise that resolves to the SimpleDB instance once the queued methods have
been executed.

##### Examples

```ts
// Nothing is observed after the mutations, so run() executes them.
table1.loadData("data1.csv").convert({ price: "number" });
table2.loadData("data2.csv").filter(`price > 0`);
await sdb.run();
```

#### `close`

Executes pending transformations, saves SDA metadata for writable persistent
databases, and closes the connection and instance. Also cleans up temporary
files and the cache. Does not copy, compact, or replace the database file.

##### Signature

```typescript
async close(): Promise<SimpleDB>;
```

##### Returns

A promise that resolves to the SimpleDB instance after cleanup.

##### Throws

- **`Error`**: An error after cleanup when pending execution or cleanup fails.

##### Examples

```ts
// close() executes queued transformations before cleaning up resources.
table.loadData("data.csv").convert({ price: "number" });
await sdb.close();
```

### Examples

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
  rowsToLog: 20, // Set the number of rows to log by default
});
```

## class SimpleTable

Represents a table within a SimpleDB database, capable of handling tabular,
geospatial, and vector data. Extends the core
[`SimpleTable`](https://jsr.io/@nshiab/simple-data-analysis-core/doc/~/SimpleTable)
class from
[`simple-data-analysis-core`](https://github.com/nshiab/simple-data-analysis-core)
to include additional AI, Google Sheets, and charting methods. Integration
dependencies load only when their operations execute, and are reused by
subsequent calls. Core-only pipelines do not load these dependencies.

All core methods are available on this class. JSR currently omits inherited
methods from subclass reference pages because of an
[upstream limitation](https://github.com/jsr-io/jsr/issues/747). See the
[core SimpleTable reference](https://jsr.io/@nshiab/simple-data-analysis-core/doc/~/SimpleTable)
for inherited methods such as `loadData()`, `filter()`, and `log()`.

### Constructor

Creates an instance of SimpleTable.

#### Parameters

- **`name`**: The name of the table.
- **`simpleDB`**: The SimpleDB instance that this table belongs to.
- **`options`**: An optional object with configuration options:
- **`options.rowsToLog`**: The number of rows to log when displaying table data.
- **`options.charsToLog`**: The maximum number of characters to log for strings.
  Useful to avoid logging large text content.
- **`options.typesToLog`**: A boolean indicating whether to include data types
  when logging a table.

### Methods

#### `aiRowByRow`

Applies a prompt to the value of each row in a specified column, storing the
AI's response in one or more new columns. Requests are processed by a worker
pool with configurable batching and concurrency.

This method automatically appends instructions to your prompt; set `verbose` to
`true` to see the full prompt.

This method supports Gemini, Vertex AI, and Ollama. When the corresponding
`generation` options are omitted, configuration comes from `AI_PROVIDER`
(`"gemini"` or `"ollama"`; defaults to `"gemini"`), `AI_MODEL` (for example,
`"gemini-3-flash-preview"` or `"gemma3:4b"`), and, for Gemini, either `AI_KEY`
(for example, `"your-gemini-api-key"`) or both `AI_PROJECT` (for example,
`"my-google-cloud-project"`) and `AI_LOCATION` (for example, `"us-central1"`).
Explicit `generation` options override the corresponding environment variables.

For Ollama, set `AI_PROVIDER=ollama`, ensure Ollama is running, and set
`AI_MODEL`, or pass `{ provider: "ollama", ... }` through `generation`.

To manage rate limits, use `batchSize` to process multiple rows per request and
`rateLimitPerMinute` to pace requests across the worker pool. The `concurrency`
option controls how many requests may run in parallel.

Results are cached locally in `.journalism-cache` by default. Set
`generation.cache` to `false` to disable caching, and remember to add
`.journalism-cache` to your `.gitignore`.

If the AI returns fewer items than expected in a batch, or if a custom `test`
function fails, the `retry` option will reattempt the request. The `retryCheck`
function can restrict which errors are retried.

By default, a failed batch throws. Set `errorColumn` to store the error on every
row in the failed batch, set its output columns to `NULL`, and continue
processing other batches. Successful rows contain `NULL` in the error column.

This method does not support tables containing geometries.

This method queues the AI processing; requests are sent when an async observer
method (like `getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
aiRowByRow(column: string, newColumn: string | string[], prompt: string, options?: { generation?: { systemPrompt?: string; model?: string; schemaJson?: unknown; cache?: boolean; processResponse?: (response: unknown) => unknown | Promise<unknown>; temperature?: number } & ({ provider: "gemini"; apiKey?: string; vertex?: boolean; project?: string; location?: string; webSearch?: boolean; files?: { path: string; type: "image" | "video" | "audio" | "pdf" | "text" }[]; thinkingBudget?: number; thinkingLevel?: "minimal" | "low" | "medium" | "high"; safetyEnabled?: boolean; geminiParameters?: unknown; ollama?: never; contextWindow?: never; ollamaParameters?: never } | { provider: "ollama"; ollama?: unknown; files?: { path: string; type: "image" | "text" }[]; contextWindow?: number; thinkingLevel?: boolean | "low" | "medium" | "high"; ollamaParameters?: unknown; apiKey?: never; vertex?: never; project?: never; location?: never; webSearch?: never; thinkingBudget?: never; safetyEnabled?: never; geminiParameters?: never } | { provider?: undefined; apiKey?: string; vertex?: boolean; project?: string; location?: string; webSearch?: boolean; files?: { path: string; type: "image" | "video" | "audio" | "pdf" | "text" }[]; thinkingBudget?: number; thinkingLevel?: "minimal" | "low" | "medium" | "high"; safetyEnabled?: boolean; geminiParameters?: unknown; ollama?: never; contextWindow?: never; ollamaParameters?: never } | { provider?: undefined; ollama?: unknown; files?: { path: string; type: "image" | "text" }[]; contextWindow?: number; thinkingLevel?: boolean | "low" | "medium" | "high"; ollamaParameters?: unknown; apiKey?: never; vertex?: never; project?: never; location?: never; webSearch?: never; thinkingBudget?: never; safetyEnabled?: never; geminiParameters?: never }); batchSize?: number; concurrency?: number; errorColumn?: string; logProgress?: boolean; test?: (result: Record<string, unknown>) => void; retry?: number; retryCheck?: (error: unknown) => Promise<boolean> | boolean; verbose?: boolean; rateLimitPerMinute?: number; clean?: (response: unknown) => unknown; extraInstructions?: string; metrics?: { totalCost: number; totalInputTokens: number; totalOutputTokens: number; totalRequests: number } }): this;
```

##### Parameters

- **`column`**: The name of the column to be used as input for the AI prompt.
- **`newColumn`**: The name of the new column (or an array of column names)
  where the AI's response will be stored.
- **`prompt`**: The input string to guide the AI's response.
- **`options`**: Configuration options for the AI request.
- **`options.batchSize`**: The number of rows to process in each batch. Defaults
  to `1`.
- **`options.concurrency`**: The number of concurrent requests to send. Defaults
  to `1`.
- **`options.errorColumn`**: The optional column where per-row error messages
  are stored. When omitted, a failed batch throws.
- **`options.logProgress`**: If `true`, logs request-pool progress. Defaults to
  `false`.
- **`options.generation`**: Gemini or Ollama generation configuration. Set
  `provider` explicitly or omit it to use `AI_PROVIDER`. Values provided here
  override the corresponding environment variables.
- **`options.test`**: A function to validate the returned data. If it throws an
  error, the request will be retried (if `retry` is set). Defaults to
  `undefined`.
- **`options.retry`**: The number of times to retry the request in case of
  failure. Defaults to `0`.
- **`options.retryCheck`**: A function that receives an error and returns
  whether it should be retried. Defaults to `undefined`.
- **`options.rateLimitPerMinute`**: The maximum number of provider requests
  started per minute. Request starts are spaced across the worker pool; cached
  responses bypass the limit. Defaults to `undefined` (no limit).
- **`options.verbose`**: If `true`, logs additional debugging information,
  including the full prompt sent to the AI. Defaults to `false`.
- **`options.clean`**: A function to transform the parsed response before
  validation and caching. Defaults to `undefined`.
- **`options.extraInstructions`**: Additional instructions to append to the
  prompt, providing more context or guidance for the AI.
- **`options.metrics`**: An object to track cumulative metrics across multiple
  AI requests. Pass an object with totalCost, totalInputTokens,
  totalOutputTokens, and totalRequests properties (all initialized to 0). The
  function will update these values after each request. Note: totalCost is only
  calculated for Google GenAI models, not for Ollama.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
const people = await sdb
  .newTable("people")
  .loadArray([
    { name: "Marie" },
    { name: "John" },
    { name: "Alex" },
  ])
  .aiRowByRow(
    "name",
    "gender",
    `Guess whether it's a "Man" or a "Woman". If it could be both, return "Neutral".`,
    {
      generation: {
        provider: "gemini",
        model: "gemini-3-flash-preview",
      },
      batchSize: 10, // Process 10 rows at once
      concurrency: 5, // Process up to 5 requests concurrently
      errorColumn: "error", // Store failed rows instead of throwing
      test: (data: { [key: string]: unknown }) => { // Validate AI's response
        if (
          typeof data.gender !== "string" ||
          !["Man", "Woman", "Neutral"].includes(data.gender)
        ) {
          throw new Error(`Invalid response: ${data.gender}`);
        }
      },
      retry: 3, // Retry up to 3 times on failure
      rateLimitPerMinute: 15, // Limit requests to 15 per minute
      verbose: true, // Log detailed information
    },
  )
  .log();

// Example results:
// [
//   { name: "Marie", gender: "Woman" },
//   { name: "John", gender: "Man" },
//   { name: "Alex", gender: "Neutral" },
// ]
```

```ts
// Set these environment variables before running:
// AI_PROVIDER=gemini
// AI_MODEL=gemini-3-flash-preview
// AI_KEY=your-gemini-api-key
const cities = await sdb
  .newTable("cities")
  .loadArray([
    { city: "Marrakech" },
    { city: "Kyoto" },
    { city: "Auckland" },
  ])
  .aiRowByRow(
    "city",
    ["country", "continent"], // Multiple new columns
    `Give me the country and continent of the city.`,
    { verbose: true },
  )
  .log();

// Example results:
// [
//   { city: "Marrakech", country: "Morocco", continent: "Africa" },
//   { city: "Kyoto", country: "Japan", continent: "Asia" },
//   { city: "Auckland", country: "New Zealand", continent: "Oceania" },
// ]
```

```ts
const names = await sdb
  .newTable("names")
  .loadArray([{ name: "Marie" }, { name: "John" }])
  .aiRowByRow("name", "description", "Describe this name.", {
    generation: { provider: "ollama", model: "gemma3:4b" },
  })
  .log();
```

#### `aiEmbeddings`

Generates embeddings for a specified text column and stores the results in a new
column.

This method supports Gemini, Vertex AI, and Ollama embeddings. When the
corresponding `embeddings` options are omitted, configuration comes from
`AI_EMBEDDINGS_PROVIDER` (`"gemini"` or `"ollama"`; defaults to `"gemini"`),
`AI_EMBEDDINGS_MODEL` (for example, `"gemini-embedding-001"` or
`"nomic-embed-text"`), and, for Gemini, either `AI_KEY` (for example,
`"your-gemini-api-key"`) or both `AI_PROJECT` (for example,
`"my-google-cloud-project"`) and `AI_LOCATION` (for example, `"us-central1"`).
Explicit `embeddings` options override the corresponding environment variables.

For Ollama, set `AI_EMBEDDINGS_PROVIDER=ollama`, ensure Ollama is running, and
set `AI_EMBEDDINGS_MODEL`, or pass `{ provider: "ollama", ... }` through
`embeddings`.

To manage rate limits, use `rateLimitPerMinute` to introduce delays between
requests. For higher rate limits (business/professional accounts), `concurrency`
allows parallel requests.

Individual embedding responses are cached in `.journalism-cache` by default. Set
`embeddings.cache` to `false` to disable this request cache, and remember to add
`.journalism-cache` to your `.gitignore`.

SDA records the canonical provider, backend, model, semantic options, source
column, and vector dimensions for columns generated by this method. A compatible
existing column is reused; changing its embedding identity or source mapping
regenerates the vectors and invalidates a stale VSS index. Existing columns
without provenance are treated as legacy and regenerated safely.

If `createIndex` is `true`, an HNSW index will be created on the new column
using the [duckdb-vss extension](https://github.com/duckdb/duckdb-vss). This is
useful for speeding up the `aiVectorSimilarity` method. If the index already
exists, it will not be recreated unless `overwriteIndex` is `true`.

This method does not support tables containing geometries. The work is queued
and runs in chain order at the next awaited observer or `run()` call.

##### Signature

```typescript
aiEmbeddings(column: string, newColumn: string, options?: { embeddings?: { provider?: never; model?: string; cache?: boolean; verbose?: boolean; apiKey?: never; vertex?: never; project?: never; location?: never; ollama?: never; contextWindow?: never } | { provider: "gemini"; model?: string; cache?: boolean; verbose?: boolean; vertex?: false; apiKey?: string; project?: never; location?: never; ollama?: never; contextWindow?: never } | { provider: "gemini"; model?: string; cache?: boolean; verbose?: boolean; vertex: true; apiKey?: string; project?: string; location?: string; ollama?: never; contextWindow?: never } | { provider: "ollama"; model?: string; cache?: boolean; verbose?: boolean; ollama?: { embeddingEndpoint?: string }; contextWindow?: number; apiKey?: never; vertex?: never; project?: never; location?: never }; createIndex?: boolean; overwriteIndex?: boolean; concurrency?: number; verbose?: boolean; rateLimitPerMinute?: number; efConstruction?: number; efSearch?: number; M?: number }): this;
```

##### Parameters

- **`column`**: The name of the column to be used as input for generating
  embeddings.
- **`newColumn`**: The name of the new column where the generated embeddings
  will be stored.
- **`options`**: Configuration options for the AI request.
- **`options.createIndex`**: If `true`, an HNSW index will be created on the new
  column. Useful for speeding up the `aiVectorSimilarity` method. Defaults to
  `false`.
- **`options.overwriteIndex`**: If `true` and `createIndex` is `true`, drops and
  recreates the VSS index even if it already exists. Defaults to `false`.
- **`options.efConstruction`**: The number of candidate vertices to consider
  during index construction. Higher values result in more accurate indexes but
  increase build time. Defaults to 128.
- **`options.efSearch`**: The number of candidate vertices to consider during
  search. Higher values result in more accurate searches but increase search
  time. Defaults to 64.
- **`options.M`**: The maximum number of neighbors to keep for each vertex in
  the graph. Higher values result in more accurate indexes but increase build
  time and memory usage. Defaults to 16.
- **`options.concurrency`**: The number of concurrent requests to send. Defaults
  to `1`.
- **`options.embeddings`**: Gemini or Ollama embedding configuration. Set
  `provider` explicitly or omit it to use `AI_EMBEDDINGS_PROVIDER`. Values
  provided here override the corresponding environment variables.
- **`options.rateLimitPerMinute`**: The rate limit for AI requests in requests
  per minute. The method will wait between requests if necessary. Defaults to
  `undefined` (no limit).
- **`options.verbose`**: If `true`, logs additional debugging information.
  Defaults to `false`.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Set these environment variables before running:
// AI_EMBEDDINGS_PROVIDER=gemini
// AI_EMBEDDINGS_MODEL=gemini-embedding-001
// AI_KEY=your-gemini-api-key
const food = await sdb
  .newTable("food")
  .loadArray([
    { food: "pizza" },
    { food: "sushi" },
    { food: "burger" },
    { food: "pasta" },
    { food: "salad" },
    { food: "tacos" },
  ])
  .aiEmbeddings("food", "embeddings", {
    rateLimitPerMinute: 15,
    createIndex: true,
    verbose: true,
  })
  .log();
```

```ts
// Generate embeddings with a local Ollama model.
const food = await table
  .aiEmbeddings("food", "embeddings", {
    embeddings: { provider: "ollama", model: "nomic-embed-text" },
  })
  .log();
```

#### `aiVectorSimilarity`

Creates an embedding from a specified text and returns the most similar text
content based on their embeddings. This method is useful for semantic search and
text similarity tasks, computing cosine distance and sorting results by
similarity.

To create the query embedding, pass `embeddings` options directly or use
environment variables. When the corresponding `embeddings` options are omitted,
configuration comes from `AI_EMBEDDINGS_PROVIDER` (`"gemini"` or `"ollama"`;
defaults to `"gemini"`), `AI_EMBEDDINGS_MODEL` (for example,
`"gemini-embedding-001"` or `"nomic-embed-text"`), and, for Gemini, either
`AI_KEY` (for example, `"your-gemini-api-key"`) or both `AI_PROJECT` (for
example, `"my-google-cloud-project"`) and `AI_LOCATION` (for example,
`"us-central1"`). Explicit `embeddings` options override the corresponding
environment variables.

Gemini, Vertex AI, and Ollama are supported. The selected provider and model
must match those used to create the stored embedding column so the vectors share
the same dimensions and embedding space.

The query embedding is cached in `.journalism-cache` by default. Set
`embeddings.cache` to `false` to disable this request cache, and remember to add
`.journalism-cache` to your `.gitignore`.

If `createIndex` is `true`, an HNSW index will be created on the embeddings
column using the [duckdb-vss extension](https://github.com/duckdb/duckdb-vss) to
speed up processing. If the index already exists, it will not be recreated
unless `overwriteIndex` is `true`. The work is queued and runs in chain order at
the next awaited observer or `run()` call.

##### Signature

```typescript
aiVectorSimilarity(text: string, column: string, nbResults: number, options?: { embeddings?: { provider?: never; model?: string; cache?: boolean; verbose?: boolean; apiKey?: never; vertex?: never; project?: never; location?: never; ollama?: never; contextWindow?: never } | { provider: "gemini"; model?: string; cache?: boolean; verbose?: boolean; vertex?: false; apiKey?: string; project?: never; location?: never; ollama?: never; contextWindow?: never } | { provider: "gemini"; model?: string; cache?: boolean; verbose?: boolean; vertex: true; apiKey?: string; project?: string; location?: string; ollama?: never; contextWindow?: never } | { provider: "ollama"; model?: string; cache?: boolean; verbose?: boolean; ollama?: { embeddingEndpoint?: string }; contextWindow?: number; apiKey?: never; vertex?: never; project?: never; location?: never }; createIndex?: boolean; overwriteIndex?: boolean; outputTable?: string; verbose?: boolean; efConstruction?: number; efSearch?: number; M?: number; minSimilarity?: number; similarityColumn?: string }): this;
```

##### Parameters

- **`text`**: The text for which to generate an embedding and find similar
  content.
- **`column`**: The name of the column containing the embeddings to be used for
  the similarity search.
- **`nbResults`**: The maximum number of most similar results to return.
- **`options`**: An optional object with configuration options:
- **`options.minSimilarity`**: A threshold between 0.0 and 1.0 to filter out
  results that are not similar enough. For example, 0.7 ensures only results
  with a 70% similarity or higher are returned. Defaults to `undefined` (no
  threshold).
- **`options.similarityColumn`**: If provided, a new column with this name will
  be added to the output table containing the calculated similarity score (from
  0.0 to 1.0) for each row. Defaults to `undefined`.
- **`options.createIndex`**: If `true`, an HNSW index will be created on the
  embeddings column. Defaults to `false`.
- **`options.overwriteIndex`**: If `true` and `createIndex` is `true`, drops and
  recreates the VSS index even if it already exists. Defaults to `false`.
- **`options.efConstruction`**: The number of candidate vertices to consider
  during index construction. Higher values result in more accurate indexes but
  increase build time. Defaults to 128.
- **`options.efSearch`**: The number of candidate vertices to consider during
  search. Higher values result in more accurate searches but increase search
  time. Defaults to 64.
- **`options.M`**: The maximum number of neighbors to keep for each vertex in
  the graph. Higher values result in more accurate indexes but increase build
  time and memory usage. Defaults to 16.
- **`options.outputTable`**: The name of the output table where the results will
  be stored. If not provided, the current table will be modified. Defaults to
  `undefined`.
- **`options.embeddings`**: Gemini or Ollama embedding configuration. Set
  `provider` explicitly or omit it to use `AI_EMBEDDINGS_PROVIDER`. Values
  provided here override the corresponding environment variables.
- **`options.verbose`**: If `true`, logs additional debugging information.
  Defaults to `false`.

##### Returns

The table that will contain the similarity results, so methods can be chained.

##### Examples

```ts
// Set these environment variables before running:
// AI_EMBEDDINGS_PROVIDER=gemini
// AI_EMBEDDINGS_MODEL=gemini-embedding-001
// AI_KEY=your-gemini-api-key
const similarFood = await sdb
  .newTable("food")
  .loadArray([
    { food: "pizza" },
    { food: "sushi" },
    { food: "burger" },
    { food: "pasta" },
    { food: "salad" },
    { food: "tacos" },
  ])
  .aiEmbeddings("food", "embeddings")
  .aiVectorSimilarity("italian food", "embeddings", 3, {
    createIndex: true,
    minSimilarity: 0.6,
    similarityColumn: "score",
  })
  .log();
```

```ts
// Query an embedding column created with the same Ollama model.
const similarFood = await table
  .aiVectorSimilarity("italian food", "embeddings", 3, {
    embeddings: { provider: "ollama", model: "nomic-embed-text" },
  })
  .log();
```

#### `hybridSearch`

Performs hybrid text search combining vector similarity and BM25 text search
using Reciprocal Rank Fusion (RRF).

This method:

1. Ensures compatible embeddings exist for the text column
2. Runs vector similarity search and BM25 text search in parallel
3. Fuses the results using Reciprocal Rank Fusion to get the best matches
4. Returns a new table with the top results ordered by relevance

When vector search is enabled, embedding responses are cached in
`.journalism-cache`, and the table with its generated embedding column is cached
in `.sda-cache`. Set `embeddings.cache` to `false` to disable both caches.

Also, the method creates the column `{textColumn}_embeddings` to store the
generated embeddings and persists its canonical embedding provenance inside
DuckDB. A stored column is reused only when its provider/backend/model identity,
semantic options, source mapping, and dimensions remain compatible. Legacy or
incompatible columns are regenerated, and stale vector indexes are invalidated
before replacement. This provenance survives reopening a DuckDB database.

Remove `.journalism-cache` and `.sda-cache` to clear existing cache entries.
Remember to add both directories to your `.gitignore`.

This method supports Gemini, Vertex AI, and Ollama embeddings. When the
corresponding `embeddings` options are omitted, configuration comes from
`AI_EMBEDDINGS_PROVIDER` (`"gemini"` or `"ollama"`; defaults to `"gemini"`),
`AI_EMBEDDINGS_MODEL` (for example, `"gemini-embedding-001"` or
`"nomic-embed-text"`), and, for Gemini, either `AI_KEY` (for example,
`"your-gemini-api-key"`) or both `AI_PROJECT` (for example,
`"my-google-cloud-project"`) and `AI_LOCATION` (for example, `"us-central1"`).
Explicit `embeddings` options override the corresponding environment variables.

The selected embedding provider is used for both stored row embeddings and the
query embedding.

When BM25 search is enabled, its required full-text search index is created or
reused automatically. When vector search is enabled, set `createIndex` to `true`
to also create an HNSW index using the
[duckdb-vss extension](https://github.com/duckdb/duckdb-vss).

This method does not support tables containing geometries. The work is queued
and runs in chain order at the next awaited observer or `run()` call.

##### Signature

```typescript
hybridSearch(query: string, idColumn: string, textColumn: string, nbResults: number, options?: { embeddings?: { provider?: never; model?: string; cache?: boolean; verbose?: boolean; apiKey?: never; vertex?: never; project?: never; location?: never; ollama?: never; contextWindow?: never } | { provider: "gemini"; model?: string; cache?: boolean; verbose?: boolean; vertex?: false; apiKey?: string; project?: never; location?: never; ollama?: never; contextWindow?: never } | { provider: "gemini"; model?: string; cache?: boolean; verbose?: boolean; vertex: true; apiKey?: string; project?: string; location?: string; ollama?: never; contextWindow?: never } | { provider: "ollama"; model?: string; cache?: boolean; verbose?: boolean; ollama?: { embeddingEndpoint?: string }; contextWindow?: number; apiKey?: never; vertex?: never; project?: never; location?: never }; verbose?: boolean; createIndex?: boolean; embeddingsConcurrency?: number; stemmer?: "arabic" | "basque" | "catalan" | "danish" | "dutch" | "english" | "finnish" | "french" | "german" | "greek" | "hindi" | "hungarian" | "indonesian" | "irish" | "italian" | "lithuanian" | "nepali" | "norwegian" | "porter" | "portuguese" | "romanian" | "russian" | "serbian" | "spanish" | "swedish" | "tamil" | "turkish" | "none"; stopwords?: string; ignore?: string; stripAccents?: boolean; lower?: boolean; k?: number; b?: number; conjunctive?: boolean; bm25?: boolean; bm25MinScore?: number; bm25ScoreColumn?: string; vectorSearch?: boolean; vectorMinSimilarity?: number; vectorSimilarityColumn?: string; outputTable?: string; efConstruction?: number; efSearch?: number; M?: number; times?: { start?: number; embeddingStart?: number; embeddingEnd?: number; vectorSearchStart?: number; vectorSearchEnd?: number; bm25Start?: number; bm25End?: number } }): this;
```

##### Parameters

- **`query`**: The search query text.
- **`idColumn`**: The name of the column containing unique identifiers for each
  row.
- **`textColumn`**: The name of the column containing the text content to search
  through.
- **`nbResults`**: The number of most similar rows to retrieve.
- **`options`**: Configuration options for the hybrid search.
- **`options.embeddings`**: Gemini or Ollama embedding configuration. Set
  `provider` explicitly or omit it to use `AI_EMBEDDINGS_PROVIDER`. Values
  provided here override the corresponding environment variables.
- **`options.verbose`**: If `true`, logs additional debugging information.
  Defaults to `false`.
- **`options.createIndex`**: If `true`, creates an HNSW index when vector search
  is enabled. The BM25 FTS index is managed automatically whenever BM25 search
  is enabled. Defaults to `false`.
- **`options.efConstruction`**: The number of candidate vertices to consider
  during index construction. Higher values result in more accurate indexes but
  increase build time. Defaults to 128.
- **`options.efSearch`**: The number of candidate vertices to consider during
  search. Higher values result in more accurate searches but increase search
  time. Defaults to 64.
- **`options.M`**: The maximum number of neighbors to keep for each vertex in
  the graph. Higher values result in more accurate indexes but increase build
  time and memory usage. Defaults to 16.
- **`options.embeddingsConcurrency`**: The number of concurrent requests to send
  to the embeddings service. Defaults to `1`.
- **`options.stemmer`**: The language stemmer to apply for BM25 word
  normalization. Supports multiple languages or "none" to disable stemming.
  Defaults to `'porter'`.
- **`options.stopwords`**: The table containing the stopwords to use for the
  BM25 FTS index. Supports multiple languages or "none" to disable stopwords.
  Defaults to "english".
- **`options.ignore`**: The regular expression of patterns to be ignored for the
  BM25 FTS index. Defaults to "(\\.|[^a-z])+".
- **`options.stripAccents`**: A boolean indicating whether to remove accents for
  the BM25 FTS index. Defaults to true.
- **`options.lower`**: A boolean indicating whether to convert all text to
  lowercase for the BM25 FTS index. Defaults to true.
- **`options.k`**: The BM25 k parameter controlling term frequency saturation.
  Defaults to `1.2`.
- **`options.b`**: The BM25 b parameter controlling document length
  normalization (0-1 range). Defaults to `0.75`.
- **`options.conjunctive`**: If `true`, all terms in the query string must be
  present in order for a document to be retrieved during the BM25 search.
  Defaults to `false`.
- **`options.bm25`**: If `true`, includes BM25 text search in the hybrid search.
  Defaults to `true`.
- **`options.bm25MinScore`**: A threshold to filter BM25 results. Only rows with
  a BM25 score above this value will be included in the final results. Defaults
  to `undefined` (no threshold).
- **`options.bm25ScoreColumn`**: If provided, a new column with this name will
  be added to the output table containing the BM25 score for each row.
- **`options.vectorSearch`**: If `true`, includes vector similarity search in
  the hybrid search. Defaults to `true`.
- **`options.vectorMinSimilarity`**: A threshold between 0.0 and 1.0 to filter
  out vector search results that are not similar enough. For example, 0.7
  ensures only results with a 70% similarity or higher are included in the final
  results. Defaults to `undefined` (no threshold).
- **`options.vectorSimilarityColumn`**: If provided, a new column with this name
  will be added to the output table containing the vector similarity score (from
  0.0 to 1.0) for each row.
- **`options.outputTable`**: The name of a new table where the results will be
  stored. If not provided, the current table will be replaced with the search
  results.
- **`options.times`**: An optional object to track timing information. If
  provided, it will be updated with detailed timing breakdowns (embeddingStart,
  embeddingEnd, vectorSearchStart, vectorSearchEnd, bm25Start, bm25End). Useful
  when calling from aiRAG to get combined timing information.

##### Returns

The table that will contain the search results, so methods can be chained.

##### Examples

```ts
// Set these environment variables before running:
// AI_EMBEDDINGS_PROVIDER=gemini
// AI_EMBEDDINGS_MODEL=gemini-embedding-001
// AI_KEY=your-gemini-api-key
// Load a dataset of recipes
const sdb = new SimpleDB();
const results = await sdb
  .newTable("recipes")
  .loadData("recipes.parquet")
  .hybridSearch("buttery pastry for breakfast", "Dish", "Recipe", 10, {
    verbose: true,
  })
  .log();
```

```ts
// Run hybrid search with local Ollama embeddings.
const results = await table
  .hybridSearch("buttery pastry", "Dish", "Recipe", 10, {
    embeddings: { provider: "ollama", model: "nomic-embed-text" },
  })
  .log();
```

#### `aiRAG`

Performs Retrieval-Augmented Generation (RAG) by combining semantic vector
search and BM25 full-text search to retrieve the most relevant context, then
passing it to an LLM for answering queries. This hybrid approach uses both
`aiVectorSimilarity` (embeddings-based) and `bm25` (keyword-based) methods in
parallel, fusing their results using Reciprocal Rank Fusion (RRF) before calling
the `askAI` function from the journalism library.

Internally, this method uses the `hybridSearch` method to retrieve relevant
rows. If you want to perform hybrid search without the LLM step (i.e., to get
the table of results directly), use `hybridSearch` instead.

When vector search is enabled, retrieval caches embedding responses in
`.journalism-cache` and the table with its generated embedding column in
`.sda-cache`. The final generated answer is also cached in `.journalism-cache`.
Set `embeddings.cache` or `generation.cache` to `false` to disable the
corresponding caches.

Remove `.journalism-cache` and `.sda-cache` to clear existing cache entries.
Remember to add both directories to your `.gitignore`.

Generation and embeddings are independently configurable. When the corresponding
options are omitted, generation uses `AI_PROVIDER` (`"gemini"` or `"ollama"`;
defaults to `"gemini"`) and `AI_MODEL` (for example, `"gemini-3-flash-preview"`
or `"gemma3:4b"`), while embeddings use `AI_EMBEDDINGS_PROVIDER` (`"gemini"` or
`"ollama"`; defaults to `"gemini"`) and `AI_EMBEDDINGS_MODEL` (for example,
`"gemini-embedding-001"` or `"nomic-embed-text"`). Gemini generation and
embeddings use either `AI_KEY` (for example, `"your-gemini-api-key"`) or both
`AI_PROJECT` (for example, `"my-google-cloud-project"`) and `AI_LOCATION` (for
example, `"us-central1"`). Explicit nested options override the corresponding
environment variables.

For example, `generation.provider` can be `"gemini"` while `embeddings.provider`
is `"ollama"`; the same mix can be selected through `AI_PROVIDER=gemini` and
`AI_EMBEDDINGS_PROVIDER=ollama`.

Ollama temperature defaults to 0. Gemini uses the provider's default
temperature.

When BM25 search is enabled, its required full-text search index is created or
reused automatically. When vector search is enabled, set `createIndex` to `true`
to also create an HNSW index using the
[duckdb-vss extension](https://github.com/duckdb/duckdb-vss).

This method does not support tables containing geometries.

##### Signature

```typescript
async aiRAG(query: string, idColumn: string, textColumn: string, nbResults: number, options?: { embeddings?: { provider?: never; model?: string; cache?: boolean; verbose?: boolean; apiKey?: never; vertex?: never; project?: never; location?: never; ollama?: never; contextWindow?: never } | { provider: "gemini"; model?: string; cache?: boolean; verbose?: boolean; vertex?: false; apiKey?: string; project?: never; location?: never; ollama?: never; contextWindow?: never } | { provider: "gemini"; model?: string; cache?: boolean; verbose?: boolean; vertex: true; apiKey?: string; project?: string; location?: string; ollama?: never; contextWindow?: never } | { provider: "ollama"; model?: string; cache?: boolean; verbose?: boolean; ollama?: { embeddingEndpoint?: string }; contextWindow?: number; apiKey?: never; vertex?: never; project?: never; location?: never }; verbose?: boolean; createIndex?: boolean; embeddingsConcurrency?: number; stemmer?: "arabic" | "basque" | "catalan" | "danish" | "dutch" | "english" | "finnish" | "french" | "german" | "greek" | "hindi" | "hungarian" | "indonesian" | "irish" | "italian" | "lithuanian" | "nepali" | "norwegian" | "porter" | "portuguese" | "romanian" | "russian" | "serbian" | "spanish" | "swedish" | "tamil" | "turkish" | "none"; stopwords?: string; ignore?: string; stripAccents?: boolean; lower?: boolean; k?: number; b?: number; conjunctive?: boolean; bm25?: boolean; bm25MinScore?: number; bm25ScoreColumn?: string; vectorSearch?: boolean; vectorMinSimilarity?: number; vectorSimilarityColumn?: string; efConstruction?: number; efSearch?: number; M?: number; generation?: { systemPrompt?: string; model?: string; cache?: boolean; processResponse?: (response: unknown) => unknown | Promise<unknown>; temperature?: number } & ({ provider: "gemini"; apiKey?: string; vertex?: boolean; project?: string; location?: string; webSearch?: boolean; files?: { path: string; type: "image" | "video" | "audio" | "pdf" | "text" }[]; thinkingBudget?: number; thinkingLevel?: "minimal" | "low" | "medium" | "high"; safetyEnabled?: boolean; geminiParameters?: unknown; ollama?: never; contextWindow?: never; ollamaParameters?: never } | { provider: "ollama"; ollama?: unknown; files?: { path: string; type: "image" | "text" }[]; contextWindow?: number; thinkingLevel?: boolean | "low" | "medium" | "high"; ollamaParameters?: unknown; apiKey?: never; vertex?: never; project?: never; location?: never; webSearch?: never; thinkingBudget?: never; safetyEnabled?: never; geminiParameters?: never } | { provider?: undefined; apiKey?: string; vertex?: boolean; project?: string; location?: string; webSearch?: boolean; files?: { path: string; type: "image" | "video" | "audio" | "pdf" | "text" }[]; thinkingBudget?: number; thinkingLevel?: "minimal" | "low" | "medium" | "high"; safetyEnabled?: boolean; geminiParameters?: unknown; ollama?: never; contextWindow?: never; ollamaParameters?: never } | { provider?: undefined; ollama?: unknown; files?: { path: string; type: "image" | "text" }[]; contextWindow?: number; thinkingLevel?: boolean | "low" | "medium" | "high"; ollamaParameters?: unknown; apiKey?: never; vertex?: never; project?: never; location?: never; webSearch?: never; thinkingBudget?: never; safetyEnabled?: never; geminiParameters?: never }); includeThoughts?: boolean; metrics?: { totalCost: number; totalInputTokens: number; totalOutputTokens: number; totalRequests: number } }): Promise<string>;
```

##### Parameters

- **`query`**: The question or query to answer using the retrieved context.
- **`idColumn`**: The name of the column containing unique identifiers for each
  row.
- **`textColumn`**: The name of the column containing the text content to search
  through and use as context.
- **`nbResults`**: The number of most similar rows to retrieve and use as
  context for the AI.
- **`options`**: Configuration options for the RAG process.
- **`options.generation`**: Gemini or Ollama generation configuration. Set
  `provider` explicitly or omit it to use `AI_PROVIDER`. Values provided here
  override the corresponding environment variables.
- **`options.embeddings`**: Gemini or Ollama embedding configuration. Set
  `provider` explicitly or omit it to use `AI_EMBEDDINGS_PROVIDER`. Values
  provided here override the corresponding environment variables.
- **`options.verbose`**: If `true`, logs additional debugging information.
  Defaults to `false`.
- **`options.includeThoughts`**: If `true`, includes the AI model's reasoning
  process in the logged output when using models that support extended thinking.
  Only relevant when used with thinking-capable models. Defaults to `false`.
- **`options.metrics`**: An object to track cumulative metrics across multiple
  AI requests. Pass an object with totalCost, totalInputTokens,
  totalOutputTokens, and totalRequests properties (all initialized to 0). The
  function will update these values after each request. Note: totalCost is only
  calculated for Google GenAI models, not for Ollama.
- **`options.embeddingsConcurrency`**: The number of concurrent requests to send
  to the embeddings service. Defaults to `1`.
- **`options.createIndex`**: If `true`, creates an HNSW index when vector search
  is enabled. The BM25 FTS index is managed automatically whenever BM25 search
  is enabled. Defaults to `false`.
- **`options.efConstruction`**: The number of candidate vertices to consider
  during index construction. Higher values result in more accurate indexes but
  increase build time. Defaults to 128.
- **`options.efSearch`**: The number of candidate vertices to consider during
  search. Higher values result in more accurate searches but increase search
  time. Defaults to 64.
- **`options.M`**: The maximum number of neighbors to keep for each vertex in
  the graph. Higher values result in more accurate indexes but increase build
  time and memory usage. Defaults to 16.
- **`options.stemmer`**: The language stemmer to apply for BM25 word
  normalization. Supports multiple languages or "none" to disable stemming.
  Defaults to `'porter'`.
- **`options.stopwords`**: The table containing the stopwords to use for the
  BM25 FTS index. Supports multiple languages or "none" to disable stopwords.
  Defaults to "english".
- **`options.ignore`**: The regular expression of patterns to be ignored for the
  BM25 FTS index. Defaults to "(\\.|[^a-z])+".
- **`options.stripAccents`**: A boolean indicating whether to remove accents for
  the BM25 FTS index. Defaults to true.
- **`options.lower`**: A boolean indicating whether to convert all text to
  lowercase for the BM25 FTS index. Defaults to true.
- **`options.k`**: The BM25 k parameter controlling term frequency saturation.
  Defaults to `1.2`.
- **`options.b`**: The BM25 b parameter controlling document length
  normalization (0-1 range). Defaults to `0.75`.
- **`options.conjunctive`**: If `true`, all terms in the query string must be
  present in order for a document to be retrieved during the BM25 search.
  Defaults to `false`.
- **`options.bm25`**: If `true`, includes BM25 text search in the hybrid search.
  Defaults to `true`.
- **`options.bm25MinScore`**: A threshold to filter BM25 results. Only rows with
  a BM25 score above this value will be included in the final results. Defaults
  to `undefined` (no threshold).
- **`options.bm25ScoreColumn`**: If provided, a new column with this name will
  be added to the output table containing the BM25 score for each row.
- **`options.vectorSearch`**: If `true`, includes vector similarity search in
  the hybrid search. Defaults to `true`.
- **`options.vectorMinSimilarity`**: A threshold between 0.0 and 1.0 to filter
  out vector search results that are not similar enough. For example, 0.7
  ensures only results with a 70% similarity or higher are included in the final
  results. Defaults to `undefined` (no threshold).
- **`options.vectorSimilarityColumn`**: If provided, a new column with this name
  will be added to the output table containing the vector similarity score (from
  0.0 to 1.0) for each row.

##### Returns

A promise that resolves to the AI's answer to the query based on the retrieved
context.

##### Examples

```ts
// Set these environment variables before running:
// AI_PROVIDER=gemini
// AI_MODEL=gemini-3-flash-preview
// AI_KEY=your-gemini-api-key
// AI_EMBEDDINGS_PROVIDER=ollama
// AI_EMBEDDINGS_MODEL=nomic-embed-text
// Load a dataset of recipes
const sdb = new SimpleDB();
const answer = await sdb
  .newTable("recipes")
  .loadData("recipes.parquet")
  .aiRAG(
    "I want a buttery pastry for breakfast.",
    "Dish", // Column with unique IDs
    "Recipe", // Column with text to search
    10, // The 10 most relevant recipes passed to the LLM
    { verbose: true }, // Log debugging information and timings
  );

console.log(answer);
// Example output: "I recommend croissants.
// They are a classic buttery pastry perfect for breakfast..."
```

```ts
// Use Ollama for both retrieval embeddings and answer generation.
const answer = await table.aiRAG(
  "I want a buttery pastry for breakfast.",
  "Dish",
  "Recipe",
  10,
  {
    generation: { provider: "ollama", model: "gemma3:4b" },
    embeddings: { provider: "ollama", model: "nomic-embed-text" },
  },
);
```

#### `aiQuery`

Generates and executes a SQL query based on a prompt. Additional instructions,
such as column types, are automatically added to your prompt. Set `verbose` to
`true` to see the full prompt.

This method supports Gemini, Vertex AI, and Ollama. When the corresponding
`generation` options are omitted, configuration comes from `AI_PROVIDER`
(`"gemini"` or `"ollama"`; defaults to `"gemini"`), `AI_MODEL` (for example,
`"gemini-3-flash-preview"` or `"gemma3:4b"`), and, for Gemini, either `AI_KEY`
(for example, `"your-gemini-api-key"`) or both `AI_PROJECT` (for example,
`"my-google-cloud-project"`) and `AI_LOCATION` (for example, `"us-central1"`).
Explicit `generation` options override the corresponding environment variables.

For Ollama, set `AI_PROVIDER=ollama`, ensure Ollama is running, and set
`AI_MODEL`, or pass `{ provider: "ollama", ... }` through `generation`.

Ollama temperature defaults to 0, while Gemini uses the provider's default.
Provider-specific controls live under `generation`.

The generated query is cached locally in `.journalism-cache` by default. Set
`generation.cache` to `false` to disable caching, and remember to add
`.journalism-cache` to your `.gitignore`. The work is queued and runs in chain
order at the next awaited observer or `run()` call.

##### Signature

```typescript
aiQuery(prompt: string, options?: { extraInstructions?: string; generation?: { systemPrompt?: string; model?: string; cache?: boolean; processResponse?: (response: unknown) => unknown | Promise<unknown>; temperature?: number } & ({ provider: "gemini"; apiKey?: string; vertex?: boolean; project?: string; location?: string; webSearch?: boolean; files?: { path: string; type: "image" | "video" | "audio" | "pdf" | "text" }[]; thinkingBudget?: number; thinkingLevel?: "minimal" | "low" | "medium" | "high"; safetyEnabled?: boolean; geminiParameters?: unknown; ollama?: never; contextWindow?: never; ollamaParameters?: never } | { provider: "ollama"; ollama?: unknown; files?: { path: string; type: "image" | "text" }[]; contextWindow?: number; thinkingLevel?: boolean | "low" | "medium" | "high"; ollamaParameters?: unknown; apiKey?: never; vertex?: never; project?: never; location?: never; webSearch?: never; thinkingBudget?: never; safetyEnabled?: never; geminiParameters?: never } | { provider?: undefined; apiKey?: string; vertex?: boolean; project?: string; location?: string; webSearch?: boolean; files?: { path: string; type: "image" | "video" | "audio" | "pdf" | "text" }[]; thinkingBudget?: number; thinkingLevel?: "minimal" | "low" | "medium" | "high"; safetyEnabled?: boolean; geminiParameters?: unknown; ollama?: never; contextWindow?: never; ollamaParameters?: never } | { provider?: undefined; ollama?: unknown; files?: { path: string; type: "image" | "text" }[]; contextWindow?: number; thinkingLevel?: boolean | "low" | "medium" | "high"; ollamaParameters?: unknown; apiKey?: never; vertex?: never; project?: never; location?: never; webSearch?: never; thinkingBudget?: never; safetyEnabled?: never; geminiParameters?: never }); includeThoughts?: boolean; outputTable?: string; verbose?: boolean }): this;
```

##### Parameters

- **`prompt`**: The input string to guide the AI in generating the SQL query.
- **`options`**: Configuration options for the AI request.
- **`options.extraInstructions`**: Additional instructions to append to the
  prompt, providing more context or guidance for the AI.
- **`options.generation`**: Gemini or Ollama generation configuration. Set
  `provider` explicitly or omit it to use `AI_PROVIDER`. Values provided here
  override the corresponding environment variables.
- **`options.outputTable`**: The name of a new table where the results will be
  stored. If not provided, the current table will be replaced with the query
  results.
- **`options.verbose`**: If `true`, logs additional debugging information,
  including the full prompt sent to the AI. Defaults to `false`.
- **`options.includeThoughts`**: If `true`, includes the AI model's reasoning
  process in the logged output when using models that support extended thinking.
  Only relevant when used with thinking-capable models. Defaults to `false`.

##### Returns

The table that will contain the query results, so methods can be chained.

##### Examples

```ts
// Set these environment variables before running:
// AI_PROVIDER=gemini
// AI_MODEL=gemini-3-flash-preview
// AI_KEY=your-gemini-api-key
// The AI will generate a query that will be executed, and
// the result will replace the existing table.
// If run again, it will use the previous query from the cache.
// Don't forget to add .journalism-cache to your .gitignore file!
const averageSalaryByDepartment = await table
  .aiQuery("Give me the average salary by department", {
    verbose: true,
  })
  .log();
```

```ts
// Save results to a new table without modifying the original
// Original table remains unchanged
const allEmployees = await table.getRowCount();
console.log(allEmployees); // All employees

// Generate the query in chain order and observe the new table.
const topEmployees = await table
  .aiQuery("Give me the top 10 employees by salary", {
    outputTable: "top_employees",
  })
  .log();
console.log(await topEmployees.getRowCount()); // 10
```

```ts
// Generate and execute the query with a local Ollama model.
const averageSalaryByDepartment = await table
  .aiQuery("Give me the average salary by department", {
    generation: { provider: "ollama", model: "gemma3:4b" },
  })
  .log();
```

#### `toSheet`

Writes the table data to a Google Sheet. This method uses the `pushToSheet`
function from the
[journalism-google library](https://jsr.io/@nshiab/journalism-google). Refer to
its documentation for more details.

By default, the selected tab is overwritten and values are written without
Google Sheets interpretation. Authentication uses `GOOGLE_SERVICE_ACCOUNT_EMAIL`
(for example, `"service-account@example.iam.gserviceaccount.com"`) with
`GOOGLE_PRIVATE_KEY` (for example, `"-----BEGIN PRIVATE KEY-----\n..."`).
Alternatively, set `GOOGLE_APPLICATION_CREDENTIALS` to a service-account JSON
path (for example, `"./service-account.json"`). Explicit `options.credentials`
override these environment variables. For detailed setup instructions, refer to
the node-google-spreadsheet authentication guide:
https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication.

##### Signature

```typescript
async toSheet(sheetUrl: string, options?: { mode?: "overwrite" | "append"; tabTitle?: string; create?: boolean; prepend?: string; lastUpdate?: boolean | "Canada/Atlantic" | "Canada/Central" | "Canada/Eastern" | "Canada/Mountain" | "Canada/Newfoundland" | "Canada/Pacific" | "Canada/Saskatchewan" | "Canada/Yukon"; raw?: boolean; credentials?: { email: string; privateKey: string } }): Promise<void>;
```

##### Parameters

- **`sheetUrl`**: A Google Sheets URL. It can point to a spreadsheet or a
  specific tab.
- **`options`**: An optional object with configuration options:
- **`options.mode`**: Whether to overwrite the tab or append rows. Defaults to
  `"overwrite"`.
- **`options.tabTitle`**: Selects a tab by title instead of using the URL's
  `gid`.
- **`options.create`**: If `true`, creates a missing tab selected by `tabTitle`.
  Defaults to `false`.
- **`options.prepend`**: Text to add above the header row in overwrite mode.
- **`options.lastUpdate`**: If `true`, adds a UTC timestamp. Pass a Canadian
  time zone to use it for the timestamp. Available only in overwrite mode.
- **`options.raw`**: If `true`, writes values without Google Sheets
  interpretation. Defaults to `true`.
- **`options.credentials`**: Explicit Google service-account credentials. These
  override credentials provided through environment variables or
  GOOGLE_APPLICATION_CREDENTIALS.
- **`options.credentials.email`**: The Google service-account email.
- **`options.credentials.privateKey`**: The Google service-account private key.

##### Returns

A promise that resolves when the data has been written to the sheet.

##### Examples

```ts
// Set these environment variables before running:
// GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@example.iam.gserviceaccount.com
// GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...
// Load, transform, and write data to a Google Sheet
await sdb
  .newTable()
  .loadData("sales.csv")
  .selectColumns(["date", "revenue"])
  .toSheet("https://docs.google.com/spreadsheets/d/.../edit#gid=0");
```

```ts
// Append rows to a tab selected by title
await table.toSheet("https://docs.google.com/spreadsheets/d/.../edit", {
  mode: "append",
  tabTitle: "Election results",
});
```

```ts
// Create a missing tab and add context above the data
await table.toSheet("https://docs.google.com/spreadsheets/d/.../edit", {
  tabTitle: "Election results",
  create: true,
  prepend: "Preliminary results",
  lastUpdate: "Canada/Eastern",
});
```

```ts
// Let Google Sheets interpret values, such as formulas and dates
await table.toSheet(
  "https://docs.google.com/spreadsheets/d/.../edit#gid=0",
  { raw: false },
);
```

```ts
// Pass service-account credentials explicitly
await table.toSheet(
  "https://docs.google.com/spreadsheets/d/.../edit#gid=0",
  {
    credentials: {
      email: "service-account@example.iam.gserviceaccount.com",
      privateKey: "-----BEGIN PRIVATE KEY-----\\n...",
    },
  },
);
```

#### `loadSheet`

Loads data from a Google Sheet into the table. This method uses the
`getSheetData` function from the
[journalism library](https://jsr.io/@nshiab/journalism). Refer to its
documentation for more details.

By default, authentication uses `GOOGLE_SERVICE_ACCOUNT_EMAIL` (for example,
`"service-account@example.iam.gserviceaccount.com"`) with `GOOGLE_PRIVATE_KEY`
(for example, `"-----BEGIN PRIVATE KEY-----\n..."`). Alternatively, set
`GOOGLE_APPLICATION_CREDENTIALS` to a service-account JSON path (for example,
`"./service-account.json"`). Use `options.apiEmailEnvVar` and
`options.apiKeyEnvVar` to read the email and private key from custom variable
names instead. The download is queued and runs in chain order at the next
awaited observer or `run()` call.

##### Signature

```typescript
loadSheet(sheetUrl: string, options?: { skip?: number; apiEmailEnvVar?: string; apiKeyEnvVar?: string }): this;
```

##### Parameters

- **`sheetUrl`**: The URL pointing to a specific Google Sheet (e.g.,
  `"https://docs.google.com/spreadsheets/d/.../edit#gid=0"`).
- **`options`**: An optional object with configuration options:
- **`options.skip`**: The number of rows to skip from the top of the sheet
  before reading data. Useful when the sheet contains metadata or headers that
  should not be included in the data.
- **`options.apiEmailEnvVar`**: The name of the environment variable that stores
  your Google service-account email (for example, `"MY_GOOGLE_EMAIL"`). Defaults
  to `"GOOGLE_SERVICE_ACCOUNT_EMAIL"`.
- **`options.apiKeyEnvVar`**: The name of the environment variable that stores
  your Google service-account private key (for example,
  `"MY_GOOGLE_PRIVATE_KEY"`). Defaults to `"GOOGLE_PRIVATE_KEY"`.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Set these environment variables before running:
// GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@example.iam.gserviceaccount.com
// GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...
// Load data from a Google Sheet
const sheetData = await sdb
  .newTable("sheetData")
  .loadSheet("https://docs.google.com/spreadsheets/d/.../edit#gid=0")
  .log();
```

```ts
// Load data from a Google Sheet, skipping the first 2 rows (e.g., to skip a prepended message and timestamp)
const sheetData = await table
  .loadSheet("https://docs.google.com/spreadsheets/d/.../edit#gid=0", {
    skip: 2,
  })
  .log();
```

#### `toDatawrapper`

Writes the table data as CSV to a Datawrapper chart or table.

Authentication uses the API key in `DATAWRAPPER_KEY` (for example,
`"your-datawrapper-api-key"`). Set `options.apiKeyEnvVar` to read the key from a
custom environment variable instead.

##### Signature

```typescript
async toDatawrapper(chartId: string, options?: { apiKeyEnvVar?: string; note?: string; republish?: boolean }): Promise<void>;
```

##### Parameters

- **`chartId`**: The unique ID of the Datawrapper chart or table to update. This
  ID can be found in the Datawrapper URL or dashboard.
- **`options`**: An optional object with configuration options:
- **`options.apiKeyEnvVar`**: The name of the environment variable that stores
  your Datawrapper API key (e.g., `"DATAWRAPPER_KEY"`). Defaults to
  `"DATAWRAPPER_KEY"`.
- **`options.note`**: A string to update the chart's notes field with (e.g., a
  last-updated timestamp).
- **`options.republish`**: If `true`, republishes the chart after updating the
  data. Defaults to `false`.

##### Returns

A promise that resolves when the data has been sent to Datawrapper.

##### Examples

```ts
// Set DATAWRAPPER_KEY=your-datawrapper-api-key before running.
// Load, transform, and send data to a Datawrapper chart
await sdb
  .newTable()
  .loadData("sales.csv")
  .selectColumns(["date", "revenue"])
  .toDatawrapper("myChartId");
```

```ts
// Update data, add a note, and republish
await table.toDatawrapper("myChartId", {
  note: `Last updated: ${new Date().toLocaleString()}`,
  republish: true,
});
```

#### `loadDatawrapper`

Loads data from a Datawrapper chart or table into the table.

Authentication uses the API key in `DATAWRAPPER_KEY` (for example,
`"your-datawrapper-api-key"`). Set `options.apiKeyEnvVar` to read the key from a
custom environment variable instead. The download is queued and runs in chain
order at the next awaited observer or `run()` call.

##### Signature

```typescript
loadDatawrapper(chartId: string, options?: { apiKeyEnvVar?: string }): this;
```

##### Parameters

- **`chartId`**: The unique ID of the Datawrapper chart or table. This ID can be
  found in the Datawrapper URL or dashboard.
- **`options`**: An optional object with configuration options:
- **`options.apiKeyEnvVar`**: The name of the environment variable that stores
  your Datawrapper API key (e.g., `"DATAWRAPPER_KEY"`). Defaults to
  `"DATAWRAPPER_KEY"`.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Set DATAWRAPPER_KEY=your-datawrapper-api-key before running.
// Load data from a Datawrapper chart
const chartData = await sdb
  .newTable("chartData")
  .loadDatawrapper("myChartId")
  .log();
```

#### `toGeoDatawrapper`

Writes the table's geospatial data as GeoJSON to a Datawrapper map.

Authentication uses the API key in `DATAWRAPPER_KEY` (for example,
`"your-datawrapper-api-key"`). Set `options.apiKeyEnvVar` to read the key from a
custom environment variable instead.

##### Signature

```typescript
async toGeoDatawrapper(chartId: string, options?: { apiKeyEnvVar?: string; column?: string; note?: string; republish?: boolean }): Promise<void>;
```

##### Parameters

- **`chartId`**: The unique ID of the Datawrapper map to update. This ID can be
  found in the Datawrapper URL or dashboard.
- **`options`**: An optional object with configuration options:
- **`options.apiKeyEnvVar`**: The name of the environment variable that stores
  your Datawrapper API key (e.g., `"DATAWRAPPER_KEY"`). Defaults to
  `"DATAWRAPPER_KEY"`.
- **`options.column`**: The name of the geometry column to use. If omitted, the
  method will automatically attempt to find a geometry column.
- **`options.note`**: A string to update the map's notes field with.
- **`options.republish`**: If `true`, republishes the map after updating the
  data. Defaults to `false`.

##### Returns

A promise that resolves when the data has been sent to Datawrapper.

##### Examples

```ts
// Set DATAWRAPPER_KEY=your-datawrapper-api-key before running.
// Load, transform, and send geospatial data to a Datawrapper map
await sdb
  .newTable()
  .loadGeoData("regions.geojson")
  .selectColumns(["name", "population", "geometry"])
  .toGeoDatawrapper("myMapId");
```

```ts
// Update data, add a note, and republish
await table.toGeoDatawrapper("myMapId", {
  note: `Last updated: ${new Date().toLocaleString()}`,
  republish: true,
});
```

#### `loadGeoDatawrapper`

Loads geospatial data from a Datawrapper map into the table.

Authentication uses the API key in `DATAWRAPPER_KEY` (for example,
`"your-datawrapper-api-key"`). Set `options.apiKeyEnvVar` to read the key from a
custom environment variable instead.

The data is temporarily written to `.sda-cache/tmp/dataviz/<uuid>.geojson` and
removed after loading. Remember to add `.sda-cache` to your `.gitignore`. The
download is queued and runs in chain order at the next awaited observer or
`run()` call.

##### Signature

```typescript
loadGeoDatawrapper(chartId: string, options?: { apiKeyEnvVar?: string }): this;
```

##### Parameters

- **`chartId`**: The unique ID of the Datawrapper map. This ID can be found in
  the Datawrapper URL or dashboard.
- **`options`**: An optional object with configuration options:
- **`options.apiKeyEnvVar`**: The name of the environment variable that stores
  your Datawrapper API key (e.g., `"DATAWRAPPER_KEY"`). Defaults to
  `"DATAWRAPPER_KEY"`.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Set DATAWRAPPER_KEY=your-datawrapper-api-key before running.
// Load geo data from a Datawrapper map
const mapData = await sdb
  .newTable("mapData")
  .loadGeoDatawrapper("myMapId")
  .log();
```

#### `writeChart`

Creates an [Observable Plot](https://github.com/observablehq/plot) chart as an
image file (.png or .svg) from the table data. To create maps, use the
`writeMap` method.

##### Signature

```typescript
async writeChart(chart: (data: unknown[]) => SVGSVGElement | HTMLElement, path: string, options?: { style?: string; dark?: boolean }): Promise<void>;
```

##### Parameters

- **`chart`**: A function that takes data (as an array of objects) and returns
  an Observable Plot chart (an `SVGSVGElement` or `HTMLElement`).
- **`path`**: The path where the chart will be saved. The file extension must be
  `.png` or `.svg` (e.g., `"./output/chart.png"`).
- **`options`**: Optional object containing additional settings:
- **`options.style`**: A CSS string inserted into the generated SVG to customize
  the chart's appearance. Use this if the Plot `style` option is insufficient.
- **`options.dark`**: If `true`, switches the chart to dark mode. Defaults to
  `false`.

##### Returns

A promise that resolves when the chart image has been saved.

##### Examples

```ts
import { dot, plot } from "@observablehq/plot";

const sdb = new SimpleDB();
const data = [{ year: 2024, value: 10 }, { year: 2025, value: 15 }];

const chartFunction = (plotData: unknown[]) =>
  plot({
    marks: [
      dot(plotData, { x: "year", y: "value" }),
    ],
  });

const outputPath = "output/chart.png";

await sdb
  .newTable()
  .loadArray(data)
  .writeChart(chartFunction, outputPath);
```

#### `writeMap`

Creates an [Observable Plot](https://github.com/observablehq/plot) map as an
image file (.png or .svg) from the table's geospatial data. To create charts
from non-geospatial data, use the `writeChart` method.

##### Signature

```typescript
async writeMap(map: (geoData: { features: { properties: Record<string, unknown> }[] }) => SVGSVGElement | HTMLElement, path: string, options?: { column?: string; rewind?: boolean; style?: string; dark?: boolean }): Promise<void>;
```

##### Parameters

- **`map`**: A function that takes geospatial data (in GeoJSON format) and
  returns an Observable Plot map (an `SVGSVGElement` or `HTMLElement`).
- **`path`**: The path where the map will be saved. The file extension must be
  `.png` or `.svg` (e.g., `"./output/map.png"`).
- **`options`**: An optional object with configuration options:
- **`options.column`**: The name of the column storing geometries. If there is
  only one geometry column, it will be used by default.
- **`options.rewind`**: If `true`, rewinds the coordinates of polygons to follow
  the spherical winding order (important for D3.js). Defaults to `true`.
- **`options.style`**: A CSS string inserted into the generated SVG to customize
  the map's appearance. Use this if the Plot `style` option is insufficient.
- **`options.dark`**: If `true`, switches the map to dark mode. Defaults to
  `false`.

##### Returns

A promise that resolves when the map image has been saved.

##### Examples

```ts
import { geo, plot } from "@observablehq/plot";

const sdb = new SimpleDB();
const mapFunction = (geoJsonData: { features: unknown[] }) =>
  plot({
    projection: {
      type: "conic-conformal",
      rotate: [100, -60],
      domain: geoJsonData,
    },
    marks: [
      geo(geoJsonData, { stroke: "black", fill: "lightblue" }),
    ],
  });

const outputPath = "./output/map.png";

await sdb
  .newTable()
  .loadGeoData("./CanadianProvincesAndTerritories.geojson")
  .writeMap(mapFunction, outputPath);
```

#### `logLineChart`

Generates and logs a line chart to the console. The data should be sorted by the
x-axis values for accurate representation.

**Data Type Requirements:**

- **X-axis values**: Must be `number` or `Date` objects.
- **Y-axis values**: Must be `number` values.
- All values must be non-null and defined.

##### Signature

```typescript
async logLineChart(x: string, y: string, options?: { formatX?: (d: unknown) => string; formatY?: (d: number) => string; smallMultiples?: string; fixedScales?: boolean; smallMultiplesPerRow?: number; width?: number; height?: number }): Promise<void>;
```

##### Parameters

- **`x`**: The name of the column to be used for the x-axis. Values must be
  numbers or Date objects.
- **`y`**: The name of the column to be used for the y-axis. Values must be
  numbers.
- **`options`**: An optional object with configuration options:
- **`options.formatX`**: A function to format the x-axis values for display. It
  receives the raw x-value as input and should return a string. If the first
  data point's x value is a Date, it defaults to formatting the date as
  "YYYY-MM-DD".
- **`options.formatY`**: A function to format the y-axis values for display. It
  receives the raw y-value as input and should return a string.
- **`options.smallMultiples`**: The name of a column to create small multiples
  (also known as facets or trellis charts). Each unique value in this column
  will generate a separate chart.
- **`options.fixedScales`**: If `true`, all small multiples will share the same
  y-axis scale. Defaults to `false`.
- **`options.smallMultiplesPerRow`**: The number of small multiples to display
  per row.
- **`options.width`**: The width of the chart in characters.
- **`options.height`**: The height of the chart in characters.

##### Returns

A promise that resolves when the chart has been logged to the console.

##### Examples

// Basic line chart

```typescript
const data = [
  { date: new Date("2023-01-01"), value: 10 },
  { date: new Date("2023-02-01"), value: 20 },
  { date: new Date("2023-03-01"), value: 30 },
  { date: new Date("2023-04-01"), value: 40 },
];
await table
  .loadArray(data)
  .convert({ date: "string" }, { datetimeFormat: "%x" })
  .logLineChart("date", "value");
```

// Line chart with small multiples

```typescript
const data = [
  { date: new Date("2023-01-01"), value: 10, category: "A" },
  { date: new Date("2023-02-01"), value: 20, category: "A" },
  { date: new Date("2023-03-01"), value: 30, category: "A" },
  { date: new Date("2023-04-01"), value: 40, category: "A" },
  { date: new Date("2023-01-01"), value: 15, category: "B" },
  { date: new Date("2023-02-01"), value: 25, category: "B" },
  { date: new Date("2023-03-01"), value: 35, category: "B" },
  { date: new Date("2023-04-01"), value: 45, category: "B" },
];
await table
  .loadArray(data)
  .convert({ date: "string" }, { datetimeFormat: "%x" })
  .logLineChart("date", "value", {
    smallMultiples: "category",
  });
```

#### `logDotChart`

Generates and logs a dot chart to the console. The data should be sorted by the
x-axis values for accurate representation.

**Data Type Requirements:**

- **X-axis values**: Must be `number` or `Date` objects.
- **Y-axis values**: Must be `number` values.
- All values must be non-null and defined.

##### Signature

```typescript
async logDotChart(x: string, y: string, options?: { formatX?: (d: unknown) => string; formatY?: (d: number) => string; smallMultiples?: string; fixedScales?: boolean; smallMultiplesPerRow?: number; width?: number; height?: number }): Promise<void>;
```

##### Parameters

- **`x`**: The name of the column to be used for the x-axis. Values must be
  numbers or Date objects.
- **`y`**: The name of the column to be used for the y-axis. Values must be
  numbers.
- **`options`**: An optional object with configuration options:
- **`options.formatX`**: A function to format the x-axis values for display. It
  receives the raw x-value as input and should return a string. If the first
  data point's x value is a Date, it defaults to formatting the date as
  "YYYY-MM-DD".
- **`options.formatY`**: A function to format the y-axis values for display. It
  receives the raw y-value as input and should return a string.
- **`options.smallMultiples`**: The name of a column to create small multiples
  (also known as facets). Each unique value in this column will generate a
  separate chart.
- **`options.fixedScales`**: If `true`, all small multiples will share the same
  y-axis scale. Defaults to `false`.
- **`options.smallMultiplesPerRow`**: The number of small multiples to display
  per row.
- **`options.width`**: The width of the chart in characters.
- **`options.height`**: The height of the chart in characters.

##### Returns

A promise that resolves when the chart has been logged to the console.

##### Examples

// Basic dot chart

```typescript
const data = [
  { date: new Date("2023-01-01"), value: 10 },
  { date: new Date("2023-02-01"), value: 20 },
  { date: new Date("2023-03-01"), value: 30 },
  { date: new Date("2023-04-01"), value: 40 },
];
await table
  .loadArray(data)
  .convert({ date: "string" }, { datetimeFormat: "%x" })
  .logDotChart("date", "value");
```

// Dot chart with small multiples

```typescript
const data = [
  { date: new Date("2023-01-01"), value: 10, category: "A" },
  { date: new Date("2023-02-01"), value: 20, category: "A" },
  { date: new Date("2023-03-01"), value: 30, category: "A" },
  { date: new Date("2023-04-01"), value: 40, category: "A" },
  { date: new Date("2023-01-01"), value: 15, category: "B" },
  { date: new Date("2023-02-01"), value: 25, category: "B" },
  { date: new Date("2023-03-01"), value: 35, category: "B" },
  { date: new Date("2023-04-01"), value: 45, category: "B" },
];
await table
  .loadArray(data)
  .convert({ date: "string" }, { datetimeFormat: "%x" })
  .logDotChart("date", "value", {
    smallMultiples: "category",
  });
```

#### `logBarChart`

Generates and logs a bar chart to the console.

##### Signature

```typescript
async logBarChart(labels: string, values: string, options?: { formatLabels?: (d: unknown) => string; formatValues?: (d: number) => string; showPercentages?: boolean; showTotal?: boolean; totalLabel?: string; compact?: boolean; width?: number }): Promise<void>;
```

##### Parameters

- **`labels`**: The name of the column to be used for the labels (categories).
- **`values`**: The name of the column to be used for the values.
- **`options`**: An optional object with configuration options:
- **`options.formatLabels`**: A function to format the labels. Defaults to
  converting the label to a string.
- **`options.formatValues`**: A function to format the values. Defaults to
  converting the value to a string.
- **`options.showPercentages`**: If `true`, displays the percentage each bar
  represents relative to the total. Defaults to `false`.
- **`options.showTotal`**: If `true`, calculates and displays a total summary
  row. Defaults to `false`.
- **`options.totalLabel`**: Allows customizing the label used for the total row.
  Defaults to "Total".
- **`options.compact`**: Reduces vertical space in the logged output. Defaults
  to `false`.
- **`options.width`**: The width of the chart in characters. Defaults to 40.

##### Returns

A promise that resolves when the chart has been logged to the console.

##### Examples

```typescript
const data = [
  { category: "A", value: 10 },
  { category: "B", value: 20 },
];
await table
  .loadArray(data)
  .logBarChart("category", "value");
```

#### `logHistogram`

Generates and logs a histogram of a numeric column to the console.

##### Signature

```typescript
async logHistogram(values: string, options?: { bins?: number; formatLabels?: (min: number, max: number) => string; compact?: boolean; width?: number }): Promise<void>;
```

##### Parameters

- **`values`**: The name of the numeric column for which to generate the
  histogram.
- **`options`**: An optional object with configuration options:
- **`options.bins`**: The number of bins (intervals) to use for the histogram.
  Defaults to 10.
- **`options.formatLabels`**: A function to format the labels for the histogram
  bins. It receives the lower and upper bounds of each bin as arguments.
- **`options.compact`**: If `true`, the histogram will be displayed in a more
  compact format. Defaults to `false`.
- **`options.width`**: The maximum width of the histogram bars in characters.

##### Returns

A promise that resolves when the histogram has been logged to the console.

##### Examples

// Basic histogram of the 'temperature' column

```typescript
await table.logHistogram("temperature");
```

// Histogram with 20 bins and custom label formatting

```typescript
await table.logHistogram("age", {
  bins: 20,
  formatLabels: (min, max) => `${min}-${max} years`,
});
```

#### `name`

Name of the table in the database.

##### Signature

```typescript
name(): string;
```

##### Examples

```ts
console.log(table.name); // e.g., "employees"
```

#### `run`

Executes all queued methods across every table in the database, not just this
table. Sync builder methods (like `filter()` or `convert()`) only queue their
operation; execution happens when an async observer method (like `getData()`,
`log()`, or `writeData()`) is awaited. Use `run()` when a chain ends in pure
mutations with nothing to observe and you want the work done now.

Because the whole database is flushed in program order, this behaves identically
to `SimpleDB.run()`; call `sdb.run()` when your intent is to flush the database
rather than this specific table.

##### Signature

```typescript
async run(): Promise<this>;
```

##### Returns

A promise that resolves to the table once the queued methods have been executed.

##### Examples

```ts
// Nothing is observed after convert(), so run() executes the chain.
await table
  .loadData("data.csv")
  .convert({ price: "number" })
  .run();
await table.log();
```

#### `renameTable`

Renames the current table.

##### Signature

```typescript
async renameTable(name: string): Promise<this>;
```

##### Parameters

- **`name`**: The new name for the table.

##### Returns

A promise that resolves to the renamed table.

##### Examples

```ts
// Rename the table to "new_employees"
await table.renameTable("new_employees");
await table.log();
```

#### `setTypes`

Sets the data types for columns in a new table. If the table already exists, it
will be replaced. To convert the types of an existing table, use the
`.convert()` method instead.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
setTypes(types: Record<string, "integer" | "float" | "number" | "string" | "date" | "time" | "datetime" | "datetimeTz" | "bigint" | "double" | "varchar" | "timestamp" | "timestamp with time zone" | "boolean" | geometry('${string}') | GEOMETRY('${string}')>): this;
```

##### Parameters

- **`types`**: An object specifying the column names and their target data types
  (JavaScript or SQL types).

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Set types for a new table
await table.setTypes({
  name: "string",
  salary: "integer",
  raise: "float",
}).log();
```

#### `loadArray`

Loads an array of JavaScript objects into the table. This method queues the
load; it runs when an async observer method (like `getData()` or `log()`) is
awaited, or when `run()` is called.

JavaScript `Date` values are inferred as DuckDB `TIMESTAMP` values. Their
instant is preserved, but JavaScript `Date` does not retain the timezone or
offset originally used to construct it. String values remain `VARCHAR`; use
`convert()` to parse them as temporal values.

##### Signature

```typescript
loadArray(rows: Record<string, unknown>[]): this;
```

##### Parameters

- **`rows`**: An array of objects, where each object represents a row and its
  properties represent columns.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Load data from an array of objects
const data = [
  { letter: "a", number: 1 },
  { letter: "b", number: 2 },
];
await table.loadArray(data).log();
```

```ts
// The offset determines the instant; the loaded TIMESTAMP is returned as
// the equivalent UTC JavaScript Date.
await table.loadArray([{
  observedAt: new Date("2024-04-07T13:00:00-04:00"),
}]).log();
```

#### `loadData`

Loads data from one or more local or remote files into the table. Supported file
formats include CSV, JSON, Parquet, and Excel. This method queues the load; it
runs when an async observer method (like `getData()` or `log()`) is awaited, or
when `run()` is called.

##### Signature

```typescript
loadData(files: string | string[], options?: { fileType?: "csv" | "dsv" | "json" | "parquet" | "excel"; autoDetect?: boolean; conditions?: string; limit?: number; includeFilename?: boolean; unifyColumns?: boolean; columnTypes?: Record<string, string>; columns?: string[]; header?: boolean; allText?: boolean; delim?: string; skip?: number; nullPadding?: boolean; ignoreErrors?: boolean; compression?: "none" | "gzip" | "zstd"; encoding?: string; strict?: boolean; jsonFormat?: "unstructured" | "newlineDelimited" | "array"; records?: boolean; sheet?: string }): this;
```

##### Parameters

- **`files`**: The path(s) or URL(s) of the file(s) containing the data to be
  loaded.
- **`options`**: An optional object with configuration options:
- **`options.fileType`**: The type of file to load ("csv", "dsv", "json",
  "parquet", "excel"). Defaults to being inferred from the file extension.
- **`options.autoDetect`**: A boolean indicating whether to automatically detect
  the data format. Defaults to `true`.
- **`options.conditions`**: A SQL `WHERE` clause expression, without the `WHERE`
  keyword, to filter source rows before applying `limit`. Uses the same syntax
  as `filter()`, including JavaScript operators. Can reference source columns
  excluded from `columns`. Defaults to no filtering; an empty string behaves the
  same as omitting this option.
- **`options.limit`**: A number indicating the maximum number of matching rows
  to load, after applying `conditions` if provided. Defaults to all matching
  rows.
- **`options.includeFilename`**: A boolean indicating whether to include the
  filename as a new column in the loaded data. Defaults to `false`.
- **`options.unifyColumns`**: A boolean indicating whether to unify columns
  across multiple files when their structures differ. Missing columns will be
  filled with `NULL` values. Defaults to `false`.
- **`options.columnTypes`**: An object mapping column names to their expected
  data types. By default, types are inferred.
- **`options.columns`**: An array of column names to load. When provided, only
  the specified columns are loaded, reducing memory usage and improving load
  times. Not supported for Excel files — combining `columns` with Excel files
  throws an error. If an invalid column name is provided, DuckDB will throw its
  native error. An empty array behaves the same as omitting the option (loads
  all columns). Defaults to loading all columns.
- **`options.header`**: A boolean indicating whether the file has a header row.
  Applicable to CSV files. Defaults to `true`.
- **`options.allText`**: A boolean indicating whether all columns should be
  treated as text. Applicable to CSV files. Defaults to `false`.
- **`options.delim`**: The delimiter used in the file. Applicable to CSV and DSV
  files. By default, the delimiter is inferred.
- **`options.skip`**: The number of lines to skip at the beginning of the file.
  Applicable to CSV files. Defaults to `0`.
- **`options.nullPadding`**: If `true`, when a row has fewer columns than
  expected, the remaining columns on the right will be padded with `NULL`
  values. Defaults to `false`.
- **`options.ignoreErrors`**: If `true`, parsing errors encountered will be
  ignored, and rows with errors will be skipped. Defaults to `false`.
- **`options.compression`**: The compression type of the file. Applicable to CSV
  files. Defaults to `none`.
- **`options.strict`**: If `true`, an error will be thrown when encountering any
  issues. If `false`, structurally incorrect files will be parsed tentatively.
  Defaults to `true`.
- **`options.encoding`**: The encoding of the file. Applicable to CSV files.
  Defaults to `utf-8`.
- **`options.jsonFormat`**: The format of JSON files ("unstructured",
  "newlineDelimited", "array"). By default, the format is inferred.
- **`options.records`**: A boolean indicating whether each line in a
  newline-delimited JSON file represents a record. Applicable to JSON files. By
  default, it's inferred.
- **`options.sheet`**: A string indicating a specific sheet to import from an
  Excel file. By default, the first sheet is imported.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Load data from a single local CSV file
await table.loadData("./some-data.csv").log();
```

```ts
// Load data from a remote Parquet file
await table.loadData("https://some-website.com/some-data.parquet").log();
```

```ts
// Load data from multiple local JSON files
await table.loadData([
  "./some-data1.json",
  "./some-data2.json",
  "./some-data3.json",
]).log();
```

```ts
// Load multiple CSV files and unify columns that differ between files
await table.loadData("./data/*.csv", { unifyColumns: true }).log();
```

```ts
// Keep the source filename when loading multiple files
await table
  .loadData("./data/*.csv", { includeFilename: true })
  .log();
```

```ts
// Load only specific columns from a CSV file
await table.loadData("./employees.csv", { columns: ["name", "salary"] }).log();
```

```ts
// Load up to 100 matching employees, keeping only their names
await table
  .loadData("./employees.parquet", {
    conditions: "salary > 100000",
    columns: ["name"],
    limit: 100,
  })
  .log();
```

#### `loadStatCanData`

Downloads a complete Statistics Canada table and loads it into this table. The
method queues the download and load; they run when an async observer method
(like `getData()` or `log()`) is awaited, or when `run()` is called.

Results are cached as Parquet files in `.sda-cache/statcan` by default. Cached
data does not expire unless a TTL is provided.

##### Signature

```typescript
loadStatCanData(pid: string, options?: { lang?: "en" | "fr"; cache?: boolean; ttl?: number }): this;
```

##### Parameters

- **`pid`**: The Statistics Canada Product ID. Eight-digit PIDs, ten-digit view
  PIDs, and hyphenated table identifiers are accepted.
- **`options`**: Optional retrieval and cache settings.
- **`options.lang`**: The language of the table data. Defaults to `"en"`.
- **`options.cache`**: Whether to read and write the cache. Defaults to `true`.
- **`options.ttl`**: Cache time to live in seconds. By default, cached data does
  not expire. Use `0` to refresh and replace the cache entry.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
await sdb
  .newTable("population")
  .loadStatCanData("17-10-0005-01")
  .filter("GEO = 'Canada'")
  .log();
```

```ts
// Refresh French data when the cached table is at least one day old.
await table
  .loadStatCanData("17-10-0005", {
    lang: "fr",
    ttl: 24 * 60 * 60,
  })
  .log();
```

#### `loadGeoData`

Loads geospatial data from an external file or URL into the table. OpenStreetMap
`.osm` and `.osm.pbf` files are loaded through DuckDB's Osmium community
extension.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
loadGeoData(file: string, options?: { toEPSG4326?: boolean; columns?: string[]; conditions?: string }): this;
```

##### Parameters

- **`file`**: The URL or absolute path to the external file containing the
  geospatial data.
- **`options`**: An optional object with configuration options:
- **`options.toEPSG4326`**: If `true`, the method will attempt to reproject the
  data to EPSG:4326 (WGS84).
- **`options.columns`**: The columns to load. Include the geometry column that
  should remain in the resulting table, usually `"geom"`. By default, all
  columns are loaded.
- **`options.conditions`**: A SQL `WHERE` clause expression, without the `WHERE`
  keyword, to filter source rows before materialization and reprojection. Uses
  the same syntax as `filter()`, including JavaScript operators. Can reference
  source columns excluded from `columns`. Geometry conditions use the source
  coordinate system; OSM geometry is available as `geom` in EPSG:4326. Defaults
  to no filtering; an empty string behaves the same as omitting this option.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Load geospatial data from a URL
await table.loadGeoData("https://some-website.com/some-data.geojson").log();
```

```ts
// Load geospatial data from a local file
await table.loadGeoData("./some-data.geojson").log();
```

```ts
// Load only the name and geometry columns
await table
  .loadGeoData("./boundaries.geojson", {
    columns: ["name", "geom"],
  })
  .log();
```

```ts
// Load geospatial data from a shapefile (with relevant files in the same folder) and reproject to EPSG:4326 (WGS84)
await table.loadGeoData("./some-data/some-data.shp", { toEPSG4326: true })
  .log();
```

```ts
// Load geospatial data from a zipped shapefile and reproject to EPSG:4326 (WGS84)
await table.loadGeoData("./some-data.shp.zip", { toEPSG4326: true }).log();
```

```ts
// Load OpenStreetMap XML or PBF data
await table.loadGeoData("./montreal.osm.pbf").log();
```

```ts
// Filter on a source property without retaining it in the table
await table
  .loadGeoData("./boundaries.geojson", {
    conditions: "population > 100000",
    columns: ["name", "geom"],
  })
  .log();
```

#### `loadOSM`

Downloads OpenStreetMap data and loads it as a geospatial table. The method
queues the download and load; they run when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

DuckDB's
[Osmium community extension](https://duckdb.org/community_extensions/extensions/osmium)
reconstructs the geometries, which are stored with the EPSG:4326 projection.

Filters use the standard
[Overpass QL filter syntax](https://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_QL#Filters).
Equality filters are passed as `[key, value]` tuples and serialized by the
method. A raw filter fragment string can be used for advanced Overpass filters.

The default endpoint is a shared public service. Follow the
[Overpass public-instance usage guidelines](https://dev.overpass-api.de/overpass-doc/en/preface/commons.html),
and configure another endpoint or run your own instance for high-volume usage.

OpenStreetMap data is licensed under the
[Open Data Commons Open Database License](https://www.openstreetmap.org/copyright).
Public use requires
[OpenStreetMap attribution](https://osmfoundation.org/wiki/Licence/Attribution_Guidelines),
and distributing OSM or derivative databases can trigger the licence's
share-alike requirements.

##### Signature

```typescript
loadOSM(bbox: { west: number; south: number; east: number; north: number }, options: { filters: string | [string, string] | [string, string][]; endpoint?: string; timeout?: number; cache?: boolean }): this;
```

##### Parameters

- **`bbox`**: The bounding box to query.
- **`bbox.west`**: The western longitude, between -180 and 180 and less than
  `east`.
- **`bbox.south`**: The southern latitude, between -90 and 90 and less than
  `north`.
- **`bbox.east`**: The eastern longitude, between -180 and 180 and greater than
  `west`.
- **`bbox.north`**: The northern latitude, between -90 and 90 and greater than
  `south`.
- **`options`**: Overpass request options.
- **`options.filters`**: One `[key, value]` tuple or an array of tuples. Array
  entries are combined as a union. A raw Overpass QL filter fragment string is
  also accepted.
- **`options.endpoint`**: The Overpass interpreter endpoint. Defaults to
  `https://overpass-api.de/api/interpreter`.
- **`options.timeout`**: A positive integer timeout in seconds, applied to both
  the Overpass query and HTTP request. If omitted, the endpoint's default query
  timeout applies and no HTTP request timeout is set.
- **`options.cache`**: If `true`, reads and writes the processed GeoParquet
  cache in `.sda-cache/osm`, which remains available until that directory is
  removed. If `false`, always requests fresh data and does not read or write the
  cache. Defaults to `true`.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Load features matching one equality filter
const schools = await table
  .loadOSM(
    { west: -73.587799, south: 45.445078, east: -73.552265, north: 45.471086 },
    { filters: ["amenity", "school"] },
  )
  .log();
```

```ts
// Load features matching either equality filter
await table.loadOSM(
  { west: -73.587799, south: 45.445078, east: -73.552265, north: 45.471086 },
  {
    filters: [["amenity", "school"], ["amenity", "college"]],
  },
).log();
```

```ts
// Use a raw Overpass filter fragment for an advanced filter
await table.loadOSM(
  { west: -73.587799, south: 45.445078, east: -73.552265, north: 45.471086 },
  { filters: `["amenity"~"school|college"]` },
).log();
```

#### `createFtsIndex`

Creates a full-text search (FTS) index on a specified text column using DuckDB's
[FTS extension](https://duckdb.org/docs/stable/core_extensions/full_text_search).

If an FTS index already exists on the table, this method will skip creation and
log a message (when verbose is enabled), unless the `overwrite` option is set to
`true`. The index definition is recorded in {@link indexes}. The {@link bm25}
method requires an FTS index and creates one automatically when needed. DuckDB
FTS indexes do not update automatically when the table changes; use
`overwrite: true` to rebuild the index after modifying the table.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
createFtsIndex(idColumn: string, textColumn: string, options?: { stemmer?: "arabic" | "basque" | "catalan" | "danish" | "dutch" | "english" | "finnish" | "french" | "german" | "greek" | "hindi" | "hungarian" | "indonesian" | "irish" | "italian" | "lithuanian" | "nepali" | "norwegian" | "porter" | "portuguese" | "romanian" | "russian" | "serbian" | "spanish" | "swedish" | "tamil" | "turkish" | "none"; stopwords?: string; ignore?: string; stripAccents?: boolean; lower?: boolean; overwrite?: boolean; verbose?: boolean }): this;
```

##### Parameters

- **`idColumn`**: The column containing the document identifiers.
- **`textColumn`**: The column containing the text to search.
- **`options`**: An optional object with configuration options:
- **`options.stemmer`**: The stemmer to use for the FTS index. Supports multiple
  languages or "none" to disable stemming. Defaults to "porter".
- **`options.stopwords`**: The table containing the stopwords to use for the FTS
  index. Supports multiple languages or "none" to disable stopwords. Defaults to
  "english".
- **`options.ignore`**: The regular expression of patterns to be ignored.
  Defaults to "(\\.|[^a-z])+".
- **`options.stripAccents`**: A boolean indicating whether to remove accents.
  Defaults to true.
- **`options.lower`**: A boolean indicating whether to convert all text to
  lowercase. Defaults to true.
- **`options.overwrite`**: A boolean indicating whether to overwrite the
  existing FTS index. Defaults to false.
- **`options.verbose`**: If `true`, logs FTS index creation status. Defaults to
  `false`.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Load a dataset and create an FTS index for later searches
await table
  .loadData("recipes.parquet")
  .createFtsIndex("Dish", "Recipe").log();
```

```ts
// Create an index with a specific language stemmer
await table.createFtsIndex("Dish", "Recipe", {
  stemmer: "french",
}).log();
```

```ts
// Recreate an existing index with different settings
await table.createFtsIndex("Dish", "Recipe", {
  stemmer: "english",
  overwrite: true,
}).log();
```

```ts
// Create index with verbose logging
await table.createFtsIndex("Dish", "Recipe", {
  verbose: true,
}).log();
// Logs: 'Creating FTS index on "Recipe" column...'
// Logs: "FTS index created successfully."
```

#### `createVssIndex`

Creates a vector similarity search (VSS) index on a specified column using
DuckDB's [VSS extension](https://duckdb.org/docs/stable/extensions/vss).

If a VSS index already exists on the table, this method will skip creation and
log a message (when verbose is enabled), unless the `overwrite` option is set to
`true`. The index definition is recorded in {@link indexes}.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
createVssIndex(column: string, options?: { overwrite?: boolean; verbose?: boolean; efConstruction?: number; efSearch?: number; M?: number }): this;
```

##### Parameters

- **`column`**: The name of the column containing vector embeddings (must be
  FLOAT array type).
- **`options`**: An optional object with configuration options:
- **`options.overwrite`**: If `true`, drops and recreates the index even if it
  already exists. Defaults to `false`.
- **`options.verbose`**: If `true`, logs VSS index creation status. Defaults to
  `false`.
- **`options.efConstruction`**: The number of candidate vertices to consider
  during index construction. Higher values result in more accurate indexes but
  increase build time. Defaults to 128.
- **`options.efSearch`**: The number of candidate vertices to consider during
  search. Higher values result in more accurate searches but increase search
  time. Defaults to 64.
- **`options.M`**: The maximum number of neighbors to keep for each vertex in
  the graph. Higher values result in more accurate indexes but increase build
  time and memory usage. Defaults to 16.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Load data that already contains an embedding column
await table
  .loadData("data.csv")
  .createVssIndex("embedding_column").log();
```

```ts
// Recreate an existing index
await table.createVssIndex("embedding_column", {
  overwrite: true,
}).log();
```

```ts
// Create index with verbose logging
await table.createVssIndex("embedding_column", {
  verbose: true,
}).log();
// Logs: 'Creating VSS index on "embedding_column" column...'
// Logs: "VSS index created successfully."
```

```ts
// Create index with custom HNSW parameters for higher accuracy
await table.createVssIndex("embedding_column", {
  efConstruction: 256,
  efSearch: 128,
  M: 32,
}).log();
```

#### `bm25`

Searches a text column using DuckDB's BM25 ranking function, which scores
matches using factors including term frequency and document length.

This method creates the required index with DuckDB's
[FTS extension](https://duckdb.org/docs/stable/core_extensions/full_text_search).
It reuses the table's existing FTS index unless `overwriteIndex` is `true`.
DuckDB FTS indexes do not update automatically when the source table changes;
use `overwriteIndex: true` to rebuild the index after modifying the table.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
bm25(text: string, idColumn: string, textColumn: string, count: number, options?: { outputTable?: string; verbose?: boolean; k?: number; b?: number; stemmer?: "arabic" | "basque" | "catalan" | "danish" | "dutch" | "english" | "finnish" | "french" | "german" | "greek" | "hindi" | "hungarian" | "indonesian" | "irish" | "italian" | "lithuanian" | "nepali" | "norwegian" | "porter" | "portuguese" | "romanian" | "russian" | "serbian" | "spanish" | "swedish" | "tamil" | "turkish" | "none"; stopwords?: string; ignore?: string; stripAccents?: boolean; lower?: boolean; overwriteIndex?: boolean; conjunctive?: boolean; minScore?: number; scoreColumn?: string }): this;
```

##### Parameters

- **`text`**: The search query text to match against the text column.
- **`idColumn`**: The name of the column containing unique identifiers for each
  row.
- **`textColumn`**: The name of the column containing the text to search.
- **`count`**: The number of top-ranked results to return.
- **`options`**: An optional object with configuration options:
- **`options.outputTable`**: The name of a new table where the results will be
  stored. If not provided, the current table will be replaced with the search
  results.
- **`options.verbose`**: If `true`, logs FTS index creation status. Defaults to
  `false`.
- **`options.k`**: The BM25 k parameter controlling term frequency saturation.
  Defaults to 1.2.
- **`options.b`**: The BM25 b parameter controlling document length
  normalization (0-1 range). Defaults to 0.75.
- **`options.stemmer`**: The language stemmer to apply for word normalization.
  Supports multiple languages or "none" to disable stemming. Defaults to
  'porter'.
- **`options.stopwords`**: The table containing the stopwords to use for the FTS
  index. Supports multiple languages or "none" to disable stopwords. Defaults to
  "english".
- **`options.ignore`**: The regular expression of patterns to be ignored.
  Defaults to "(\\.|[^a-z])+".
- **`options.stripAccents`**: A boolean indicating whether to remove accents.
  Defaults to true.
- **`options.lower`**: A boolean indicating whether to convert all text to
  lowercase. Defaults to true.
- **`options.overwriteIndex`**: If `true`, drops and recreates the FTS index
  even if it already exists. Defaults to `false`.
- **`options.conjunctive`**: If `true`, all terms in the query string must be
  present in order for a document to be retrieved. Defaults to `false`.
- **`options.minScore`**: A threshold to filter out results with a BM25 score
  below this value.
- **`options.scoreColumn`**: If provided, the BM25 score will be included in the
  output table under this column name.

##### Returns

A table instance containing the search results, ordered by relevance (best
matches first), so methods can be chained.

##### Examples

```ts
// Load a dataset of recipes
const dishes = await table
  .loadData("recipes.parquet")
  .bm25("italian food", "Dish", "Recipe", 5)
  .log();
// Logs the five most relevant dishes.
```

```ts
// Search with a specific language stemmer
await table.bm25("french food", "Dish", "Recipe", 5, {
  stemmer: "french",
}).log();
```

```ts
// Recreate the index with different settings and perform search
await table.bm25("italian food", "Dish", "Recipe", 5, {
  stemmer: "english",
  overwriteIndex: true,
}).log();
```

```ts
// Save results to a new table without modifying the original
const italianDishes = await table.bm25("italian food", "Dish", "Recipe", 5, {
  outputTable: "italian_results",
}).log();

// Original table remains unchanged
const allDishes = await table.getValues("Dish");
console.log(allDishes.length); // 336 (all dishes)

// New table contains only search results
const italianOnly = await italianDishes.getValues("Dish");
console.log(italianOnly.length); // 5 (top results)
```

```ts
// Multiple searches reuse the same index for better performance
// The first search creates the index
const italian = await table.bm25("italian food", "Dish", "Recipe", 5, {
  outputTable: "italian",
}).log();

// The second search reuses the existing index, so it's faster
const french = await table.bm25("french food", "Dish", "Recipe", 5, {
  outputTable: "french",
}).log();
```

```ts
// Filter results by a minimum BM25 score and include the score in the output
await table.bm25("spicy noodles", "Dish", "Recipe", 10, {
  minScore: 5.5,
  scoreColumn: "bm25_score",
}).log();
```

```ts
// Use the conjunctive option to require all terms
await table.bm25("italian sauce", "Dish", "Recipe", 5, {
  conjunctive: true,
}).log();
```

#### `insertRows`

Inserts rows, provided as an array of JavaScript objects, into the table.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
insertRows(rows: Record<string, unknown>[]): this;
```

##### Parameters

- **`rows`**: An array of objects, where each object represents a row to be
  inserted and its properties correspond to column names.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Insert new rows into the table
const newRows = [
  { letter: "c", number: 3 },
  { letter: "d", number: 4 },
];
await table.insertRows(newRows).log();
```

#### `insertTables`

Inserts all rows from one or more other tables into this table. If tables do not
have the same columns, an error will be thrown unless the `unifyColumns` option
is set to `true`. This method queues the operation; it runs when an async
observer method (like `getData()` or `log()`) is awaited, or when `run()` is
called.

##### Signature

```typescript
insertTables(tables: SimpleTable | SimpleTable[], options?: { unifyColumns?: boolean }): this;
```

##### Parameters

- **`tables`**: The name(s) of the table(s) or SimpleTable instance(s) from
  which rows will be inserted.
- **`options`**: An optional object with configuration options:
- **`options.unifyColumns`**: A boolean indicating whether to unify the columns
  of the tables. If `true`, missing columns in a table will be filled with
  `NULL` values. Defaults to `false`.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Insert all rows from 'tableB' into 'tableA'.
await tableA.insertTables("tableB").log();
```

```ts
// Insert all rows from 'tableB' and 'tableC' into 'tableA'.
await tableA.insertTables(["tableB", "tableC"]).log();
```

```ts
// Insert rows from multiple tables, unifying columns. Missing columns will be filled with NULL.
await tableA.insertTables(["tableB", "tableC"], { unifyColumns: true }).log();
```

#### `loadSample`

Fetches sample data from the simple-data-analysis-core GitHub repository.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
loadSample(sample: "fires" | "recipes" | "temperatures" | "temperaturesCities" | "canada" | "firesGeo"): this;
```

##### Parameters

- **`sample`**: The name of the sample to load. Tabular data: - "fires":
  [firesCanada2023.csv](https://raw.githubusercontent.com/nshiab/simple-data-analysis-core/refs/heads/main/test/geodata/files/firesCanada2023.csv) -
  "recipes":
  [recipes.parquet](https://github.com/nshiab/simple-data-analysis-core/raw/refs/heads/main/test/data/files/recipes.parquet) -
  "temperatures":
  [dailyTemperatures.csv](https://raw.githubusercontent.com/nshiab/simple-data-analysis-core/refs/heads/main/test/data/files/dailyTemperatures.csv) -
  "temperaturesCities":
  [cities.csv](https://raw.githubusercontent.com/nshiab/simple-data-analysis-core/refs/heads/main/test/data/files/cities.csv)
  Geospatial data: - "canada":
  [CanadianProvincesAndTerritories.json](https://raw.githubusercontent.com/nshiab/simple-data-analysis-core/refs/heads/main/test/geodata/files/CanadianProvincesAndTerritories.json) -
  "firesGeo":
  [firesCanada2023.geojson](https://raw.githubusercontent.com/nshiab/simple-data-analysis-core/refs/heads/main/test/geodata/files/firesCanada2023.geojson)

##### Examples

```ts
// Load the fires sample data
await table.loadSample("fires").log();
```

#### `clone`

Returns a new table with the same structure and data as this table. The data can
be optionally filtered, limited to a specific number of rows, and offset.

If `conditions`, `limit`, and `offset` are all used, they are applied in this
order: `conditions` (WHERE clause) first, then `offset`, and finally `limit`
(LIMIT).

Note that cloning large tables can be a slow operation.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
clone(nameOrOptions?: string | { name?: string; conditions?: string; columns?: string | string[]; limit?: number; offset?: number }): this;
```

##### Parameters

- **`nameOrOptions`**: Either a string specifying the name of the new table, or
  an optional object with configuration options. If not provided, a default name
  (e.g., "table1", "table2") will be generated.
- **`nameOrOptions.name`**: The name of the new table to be created in the
  database. If not provided, a default name (e.g., "table1", "table2") will be
  generated.
- **`nameOrOptions.conditions`**: A SQL `WHERE` clause condition to filter the
  data during cloning. Defaults to no condition (clones all rows).
- **`nameOrOptions.columns`**: An array of column names to include in the cloned
  table. If not provided, all columns will be included.
- **`nameOrOptions.limit`**: The number of rows to include in the cloned table.
  If provided, only the first X rows (potentially after filtering and offset)
  will be cloned.
- **`nameOrOptions.offset`**: The number of rows to skip before starting to
  clone rows.

##### Returns

A new table instance containing the cloned data, so methods can be chained.

##### Examples

```ts
// Clone tableA to a new table with a default generated name (e.g., "table1")
const tableB = await tableA.clone().log();
```

```ts
// Clone tableA to a new table named "my_cloned_table" using string parameter
const tableB = await tableA.clone("my_cloned_table").log();
```

```ts
// Clone tableA to a new table named "my_cloned_table" using options object
const tableB = await tableA.clone({ name: "my_cloned_table" }).log();
```

```ts
// Clone tableA, including only rows where 'column1' is greater than 10
const tableB = await tableA.clone({ conditions: `column1 > 10` }).log();
```

```ts
// Clone tableA with only specific columns
const tableB = await tableA.clone({ columns: ["name", "age", "city"] }).log();
```

```ts
// Clone only the first 10 rows of tableA
const tableB = await tableA.clone({ limit: 10 }).log();
```

```ts
// Clone 10 rows after skipping the first 5 rows
const tableB = await tableA.clone({ limit: 10, offset: 5 }).log();
```

```ts
// Clone tableA to a specific table name with filtered data, specific columns, and limited rows
const tableB = await tableA.clone({
  name: "filtered_data",
  conditions: `status = 'active' AND created_date >= '2023-01-01'`,
  columns: ["name", "status", "created_date"],
  limit: 100,
}).log();
```

#### `cloneColumn`

Clones an existing column in this table, creating a new column with identical
values.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
cloneColumn(column: string, newColumn: string): this;
```

##### Parameters

- **`column`**: The name of the original column to clone.
- **`newColumn`**: The name of the new column to be created.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Clone 'firstName' column as 'contactName'
await table.cloneColumn("firstName", "contactName").log();
```

#### `cloneColumnWithOffset`

Clones a column in the table and offsets its values by a specified number of
rows. This is useful for time-series analysis or comparing values across
different time points.

**Important:** The offset is applied based on the current row order in the
table. For meaningful results, ensure your data is sorted appropriately (e.g.,
by date/time for time-series analysis) before calling this method.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
cloneColumnWithOffset(column: string, newColumn: string, options?: { offset?: number; by?: string | string[] }): this;
```

##### Parameters

- **`column`**: The name of the original column.
- **`newColumn`**: The name of the new column to be created with offset values.
- **`options`**: An optional object with configuration options:
- **`options.offset`**: The number of rows to offset the values. A positive
  number shifts values downwards (later rows), a negative number shifts values
  upwards (earlier rows). Defaults to `1`.
- **`options.by`**: A column name or an array of column names to partition by.
  The offset is applied independently within each group.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Clone 'value' as 'previous_value', offsetting by 1 row (value of row N-1 goes to row N)
await table.cloneColumnWithOffset("value", "previous_value").log();
```

```ts
// Clone 'sales' as 'sales_2_days_ago', offsetting by 2 rows
await table.cloneColumnWithOffset("sales", "sales_2_days_ago", { offset: 2 })
  .log();
```

```ts
// Clone 'temperature' as 'prev_temp_by_city', offsetting by 1 row within each 'city' category
await table.cloneColumnWithOffset("temperature", "prev_temp_by_city", {
  offset: 1,
  by: "city",
}).log();
```

```ts
// Clone 'stock_price' as 'prev_price_by_stock_and_exchange', offsetting by 1 row within each 'stock_symbol' and 'exchange' category
await table.cloneColumnWithOffset(
  "stock_price",
  "prev_price_by_stock_and_exchange",
  {
    offset: 1,
    by: ["stock_symbol", "exchange"],
  },
).log();
```

#### `fill`

Fills `NULL` values in specified columns. By default, each `NULL` is replaced
with the last non-`NULL` value from the preceding row. When `interpolate` is
`true`, `NULL` values are replaced using linear interpolation (or extrapolation
at the ends). Pass `interpolateBy` with a real numeric or date column name to
use it as the X-axis, so that interpolated values are proportional to the actual
distances between X-axis values rather than treating every row as equidistant.
When `interpolateBy` is set, `interpolate` is automatically assumed `true`.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
fill(columns: string | string[], options?: { by?: string | string[]; interpolate?: boolean; interpolateBy?: string }): this;
```

##### Parameters

- **`columns`**: The column(s) for which to fill `NULL` values.
- **`options`**: An optional object with configuration options:
- **`options.by`**: A column name or an array of column names to partition by.
  The fill is applied independently within each group.
- **`options.interpolate`**: If `true`, replaces `NULL` values with linearly
  interpolated values using DuckDB's `fill()` window function. When
  `interpolateBy` is not set, row positions are used as the X-axis, treating
  rows as equidistant. For `NULL` values at the ends, linear extrapolation is
  used. Both the column values and the X-axis values must support arithmetic. If
  `false` or omitted, the previous non-`NULL` value is used instead.
  Automatically assumed `true` when `interpolateBy` is set.
- **`options.interpolateBy`**: A column name to use as the X-axis for
  interpolation instead of equidistant row positions. When provided,
  `interpolate` is automatically assumed `true`. Use this when rows are not
  evenly spaced (e.g., timestamps or non-uniform numeric indices) so that
  interpolated values are proportional to the actual distance between X-axis
  values.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Fill NULL values in 'column1' with the previous non-NULL value
await table.fill("column1").log();
```

```ts
// Fill NULL values in multiple columns
await table.fill(["columnA", "columnB"]).log();
```

```ts
// Fill NULL values in 'value' independently within each 'group'
await table.fill("value", { by: "group" }).log();
```

```ts
// Fill NULL values in 'value' using linear interpolation
await table.fill("value", { interpolate: true }).log();
```

```ts
// Fill NULL values in 'value' using linear interpolation, independently within each 'group'
await table.fill("value", { by: "group", interpolate: true }).log();
```

```ts
// Fill NULL values in 'value' using linear interpolation proportional to 'x' distances
await table.fill("value", { interpolate: true, interpolateBy: "x" }).log();
```

```ts
// interpolateBy implies interpolate: true, so this is equivalent to the previous example
await table.fill("value", { interpolateBy: "x" }).log();
```

#### `sort`

Sorts the rows of the table based on specified column(s) and order(s). If no
columns are specified, all columns are sorted from left to right in ascending
order.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called. Order-preserving
transformations queued after a sort retain that order. Operations such as joins,
grouping, aggregation, and sampling do not guarantee input order; chain `sort()`
after them when deterministic output order matters.

##### Signature

```typescript
sort(order?: Record<string, "asc" | "desc"> | null, options?: { lang?: Record<string, string> }): this;
```

##### Parameters

- **`order`**: An object mapping column names to their sorting order: `"asc"`
  for ascending or `"desc"` for descending. If `null`, all columns are sorted
  ascendingly.
- **`options`**: An optional object with configuration options:
- **`options.lang`**: An object mapping column names to language codes for
  collation (e.g., `{ column1: "fr" }`). See DuckDB Collations documentation for
  more details: https://duckdb.org/docs/sql/expressions/collations.

##### Returns

The table, so methods can be chained.

##### Examples

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

#### `selectColumns`

Selects specific columns in the table, removing all others. This method queues
the operation; it runs when an async observer method (like `getData()` or
`log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
selectColumns(columns: string | string[]): this;
```

##### Parameters

- **`columns`**: The name or an array of names of the columns to be selected.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Select only the 'firstName' and 'lastName' columns, removing all other columns.
await table.selectColumns(["firstName", "lastName"]).log();
```

```ts
// Select only the 'productName' column.
await table.selectColumns("productName").log();
```

#### `skip`

Skips the first `n` rows of the table, effectively removing them.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
skip(count: number): this;
```

##### Parameters

- **`count`**: The number of rows to skip from the beginning of the table.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Skip the first 10 rows of the table
await table.skip(10).log();
```

#### `hasColumn`

Checks if a column with the specified name exists in the table.

##### Signature

```typescript
async hasColumn(column: string): Promise<boolean>;
```

##### Parameters

- **`column`**: The name of the column to check.

##### Returns

A promise that resolves to `true` if the column exists, `false` otherwise.

##### Examples

```ts
// Check if the table has a column named "age"
const hasAgeColumn = await table.hasColumn("age");
console.log(hasAgeColumn); // Output: true or false
```

#### `sample`

Selects random rows from the table, removing all others. You can optionally
specify a seed to ensure repeatable sampling.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
sample(count: number | string, options?: { seed?: number }): this;
```

##### Parameters

- **`count`**: The number of rows to select (e.g., `100`) or a percentage string
  (e.g., `"10%"`) specifying the sampling size.
- **`options`**: An optional object with configuration options:
- **`options.seed`**: A number specifying the seed for repeatable sampling.
  Using the same seed will always yield the same random rows. Defaults to a
  random seed.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Select 100 random rows from the table
await table.sample(100).log();
```

```ts
// Select 10% of the rows randomly
await table.sample("10%").log();
```

```ts
// Select random rows with a specific seed for repeatable results
await table.sample("10%", { seed: 123 }).log();
```

#### `selectRows`

Selects a specified number of rows from this table. An offset can be applied to
skip initial rows, and the results can be output to a new table.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
selectRows(count: number | string, options?: { offset?: number; outputTable?: string | boolean }): this;
```

##### Parameters

- **`count`**: The number of rows to select.
- **`options`**: An optional object with configuration options:
- **`options.offset`**: The number of rows to skip from the beginning of the
  table before selecting. Defaults to `0`.
- **`options.outputTable`**: If `true`, the selected rows will be stored in a
  new table with a generated name. If a string, it will be used as the name for
  the new table. If `false` or omitted, the current table will be modified.
  Defaults to `false`.

##### Returns

A table instance containing the selected rows (either the current table or a new
table), so methods can be chained.

##### Examples

```ts
// Select the first 100 rows of the current table
await table.selectRows(100).log();
```

```ts
// Select 100 rows after skipping the first 50 rows
await table.selectRows(100, { offset: 50 }).log();
```

```ts
// Select 50 rows and store them in a new table with a generated name
const newTable = await table.selectRows(50, { outputTable: true }).log();
```

```ts
// Select 75 rows and store them in a new table named "top_customers"
const topCustomersTable = await table.selectRows(75, {
  outputTable: "top_customers",
}).log();
```

#### `removeDuplicates`

Removes duplicate rows from this table, keeping only unique rows. Note that the
resulting data order might differ from the original.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
removeDuplicates(options?: { on?: string | string[] }): this;
```

##### Parameters

- **`options`**: An optional object with configuration options:
- **`options.on`**: A column name or an array of column names to consider when
  identifying duplicates. If specified, duplicates are determined based only on
  the values in these columns. If omitted, all columns are considered.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Remove duplicate rows based on all columns
await table.removeDuplicates().log();
```

```ts
// Remove duplicate rows based only on the 'email' column
await table.removeDuplicates({ on: "email" }).log();
```

```ts
// Remove duplicate rows based on 'firstName' and 'lastName' columns
await table.removeDuplicates({ on: ["firstName", "lastName"] }).log();
```

#### `removeMissing`

Removes rows with missing values from this table. By default, missing values
include SQL `NULL`, as well as string representations like `"NULL"`, `"null"`,
`"NaN"`, `"undefined"`, and empty strings `""`. This method queues the
operation; it runs when an async observer method (like `getData()` or `log()`)
is awaited, or when `run()` is called.

##### Signature

```typescript
removeMissing(options?: { columns?: string | string[]; missingValues?: (string | number)[]; invert?: boolean }): this;
```

##### Parameters

- **`options`**: An optional object with configuration options:
- **`options.columns`**: A string or an array of strings specifying the columns
  to consider for missing values. If omitted, all columns are considered.
- **`options.missingValues`**: An array of values to be treated as missing
  values instead of the default ones. Defaults to
  `["undefined", "NaN", "null", "NULL", ""]`.
- **`options.invert`**: A boolean indicating whether to invert the condition. If
  `true`, only rows containing missing values will be kept. Defaults to `false`.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Remove rows with missing values in any column
await table.removeMissing().log();
```

```ts
// Remove rows with missing values only in 'firstName' or 'lastName' columns
await table.removeMissing({ columns: ["firstName", "lastName"] }).log();
```

```ts
// Keep only rows with missing values in any column
await table.removeMissing({ invert: true }).log();
```

```ts
// Remove rows where 'age' is missing or is equal to -1
await table.removeMissing({ columns: "age", missingValues: [-1] }).log();
```

#### `trim`

Trims specified characters from the beginning, end, or both sides of string
values in the given columns. This method queues the operation; it runs when an
async observer method (like `getData()` or `log()`) is awaited, or when `run()`
is called.

##### Signature

```typescript
trim(columns: string | string[], options?: { character?: string; side?: "left" | "right" | "both" }): this;
```

##### Parameters

- **`columns`**: The column name or an array of column names to trim.
- **`options`**: An optional object with configuration options:
- **`options.character`**: The string to trim. Defaults to whitespace
  characters.
- **`options.side`**: The side to trim: `"left"` (removes from the beginning),
  `"right"` (removes from the end), or `"both"` (removes from both sides).
  Defaults to `"both"`.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Trim whitespace from 'column1'
await table.trim("column1").log();
```

```ts
// Trim leading and trailing asterisks from 'productCode'
await table.trim("productCode", { character: "*" }).log();
```

```ts
// Right-trim whitespace from 'description' and 'notes' columns
await table.trim(["description", "notes"], { side: "right" }).log();
```

#### `filter`

Filters rows from this table based on SQL conditions. Note that it's often
faster to use the `removeRows` method for simple removals. You can also use
JavaScript syntax for conditions (e.g., `&&`, `||`, `===`, `!==`). This method
queues the operation; it runs when an async observer method (like `getData()` or
`log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
filter(conditions: string): this;
```

##### Parameters

- **`conditions`**: The filtering conditions specified as a SQL `WHERE` clause
  (e.g., `"column1 > 10 AND column2 = 'value'"`).

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Keep only rows where the 'fruit' column is not 'apple'
await table.filter(`fruit != 'apple'`).log();
```

```ts
// Keep rows where 'price' is greater than 100 AND 'quantity' is greater than 0
await table.filter(`price > 100 && quantity > 0`).log(); // Using JS syntax
```

```ts
// Keep rows where 'category' is 'Electronics' OR 'Appliances'
await table.filter(`category === 'Electronics' || category === 'Appliances'`)
  .log(); // Using JS syntax
```

```ts
// Keep rows where 'lastPurchaseDate' is on or after '2023-01-01'
await table.filter(`lastPurchaseDate >= '2023-01-01'`).log();
```

#### `keepValues`

Keeps rows in this table that have specific values in specified columns,
removing all other rows.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
keepValues(columnsAndValues: Record<string, unknown>): this;
```

##### Parameters

- **`columnsAndValues`**: An object where keys are column names and values are
  the specific values (or an array of values) to keep in those columns. Use
  `null` to keep rows where a column is `NULL`.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Keep only rows where 'job' is 'accountant' or 'developer', AND 'city' is 'Montreal'
await table.keepValues({ job: ["accountant", "developer"], city: "Montreal" })
  .log();
```

```ts
// Keep only rows where 'status' is 'active'
await table.keepValues({ status: "active" }).log();
```

```ts
// Keep only rows where 'status' is NULL
await table.keepValues({ status: null }).log();
```

#### `removeValues`

Removes rows from this table that have specific values in specified columns.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
removeValues(columnsAndValues: Record<string, unknown>): this;
```

##### Parameters

- **`columnsAndValues`**: An object where keys are column names and values are
  the specific values (or an array of values) to remove from those columns. Use
  `null` to remove rows where a column is `NULL`; otherwise, `NULL` rows are
  retained.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Remove rows where 'job' is 'accountant' or 'developer', AND 'city' is 'Montreal'
await table.removeValues({ job: ["accountant", "developer"], city: "Montreal" })
  .log();
```

```ts
// Remove rows where 'status' is 'inactive'
await table.removeValues({ status: "inactive" }).log();
```

```ts
// Remove rows where 'status' is NULL
await table.removeValues({ status: null }).log();
```

#### `removeRows`

Removes rows from this table based on SQL conditions. This method is similar to
`filter()`, but removes rows instead of keeping them. You can also use
JavaScript syntax for conditions (e.g., `&&`, `||`, `===`, `!==`).

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
removeRows(conditions: string): this;
```

##### Parameters

- **`conditions`**: The filtering conditions specified as a SQL `WHERE` clause
  (e.g., `"fruit = 'apple'"`).

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Remove rows where the 'fruit' column is 'apple'
await table.removeRows(`fruit = 'apple'`).log();
```

```ts
// Remove rows where 'quantity' is less than 5
await table.removeRows(`quantity < 5`).log();
```

```ts
// Remove rows where 'price' is less than 100 AND 'quantity' is 0
await table.removeRows(`price < 100 && quantity === 0`).log(); // Using JS syntax
```

```ts
// Remove rows where 'category' is 'Electronics' OR 'Appliances'
await table.removeRows(
  `category === 'Electronics' || category === 'Appliances'`,
).log(); // Using JS syntax
```

#### `renameColumns`

Renames one or more columns in the table. Throws if a source column does not
exist, so a typo fails loudly instead of being silently ignored.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
renameColumns(names: Record<string, string>, options?: { strict?: boolean }): this;
```

##### Parameters

- **`names`**: An object mapping old column names to their new column names
  (e.g., `{ "oldName": "newName", "anotherOld": "anotherNew" }`).
- **`options`**: Configuration options.
- **`options.strict`**: Whether to verify the source columns exist before
  renaming. Defaults to `true`. Set to `false` to skip the check and its schema
  lookup when you know the columns exist and are renaming across many tables
  where the extra round-trip adds up.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Rename "How old?" to "age" and "Man or woman?" to "sex"
await table.renameColumns({ "How old?": "age", "Man or woman?": "sex" }).log();
```

```ts
// Rename a single column
await table.renameColumns({ "product_id": "productId" }).log();
```

```ts
// Skip the existence check when renaming across many tables
await table.renameColumns({ "product_id": "productId" }, { strict: false })
  .log();
```

#### `cleanColumnNames`

Cleans column names by removing non-alphanumeric characters and formatting them
to camel case.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
cleanColumnNames(): this;
```

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Clean all column names in the table
// e.g., "First Name" becomes "firstName", "Product ID" becomes "productId"
await table.cleanColumnNames().log();
```

#### `longer`

Restructures this table by stacking (unpivoting) columns. This is useful for
tidying up data from a wide format to a long format.

For example, given a table showing employee counts per department per year:

| Department | 2021 | 2022 | 2023 |
| :--------- | :--- | :--- | :--- |
| Accounting | 10   | 9    | 15   |
| Sales      | 52   | 75   | 98   |

We can restructure it by putting all year columns into a new column named `Year`
and their corresponding employee counts into a new column named `Employees`.

##### Signature

```typescript
longer(columns: string[], namesTo: string, valuesTo: string): this;
```

##### Parameters

- **`columns`**: An array of strings representing the names of the columns to be
  stacked (unpivoted).
- **`namesTo`**: The name of the new column that will contain the original
  column names (e.g., "Year").
- **`valuesTo`**: The name of the new column that will contain the values from
  the stacked columns (e.g., "Employees").

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Restructure the table by stacking year columns into 'year' and 'employees'
await table.longer(["2021", "2022", "2023"], "year", "employees").log();
```

The table will then look like this:

| Department | Year | Employees |
| :--------- | :--- | :-------- |
| Accounting | 2021 | 10        |
| Accounting | 2022 | 9         |
| Accounting | 2023 | 15        |
| Sales      | 2021 | 52        |
| Sales      | 2022 | 75        |
| Sales      | 2023 | 98        |

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

#### `wider`

Restructures this table by unstacking (pivoting) values, transforming data from
a long format to a wide format.

For example, given a table showing employee counts per department per year:

| Department | Year | Employees |
| :--------- | :--- | :-------- |
| Accounting | 2021 | 10        |
| Accounting | 2022 | 9         |
| Accounting | 2023 | 15        |
| Sales      | 2021 | 52        |
| Sales      | 2022 | 75        |
| Sales      | 2023 | 98        |

We can restructure it by creating new columns for each year, with the associated
employee counts as values.

##### Signature

```typescript
wider(namesFrom: string, valuesFrom: string, options?: { stat?: "sum" | "count" | "min" | "max" | "mean" | "median" | "first" }): this;
```

##### Parameters

- **`namesFrom`**: The name of the column containing the values that will be
  transformed into new column headers (e.g., "Year").
- **`valuesFrom`**: The name of the column containing the values to be spread
  across the new columns (e.g., "Employees").
- **`options`**: An optional object with configuration options:
- **`options.stat`**: The stat function applied when multiple rows share the
  same `namesFrom`/grouping combination: `"sum"`, `"count"`, `"min"`, `"max"`,
  `"mean"`, `"median"`, or `"first"`. Defaults to `"sum"`.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Restructure the table by pivoting 'Year' into new columns with 'Employees' as values
await table.wider("Year", "Employees").log();
```

The table will then look like this:

| Department | 2021 | 2022 | 2023 |
| :--------- | :--- | :--- | :--- |
| Accounting | 10   | 9    | 15   |
| Sales      | 52   | 75   | 98   |

When multiple rows share the same `namesFrom`/grouping combination, their
`valuesFrom` values are combined with the `options.stat` function (`"sum"` by
default).

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

#### `convert`

Converts data types of specified columns to target types (JavaScript or SQL
types).

When converting non-standard timestamp, date, or time strings, provide a
`datetimeFormat` option using
[DuckDB's format specifiers](https://duckdb.org/docs/sql/functions/dateformat).
Strings converted to `datetimeTz` or `timestamp with time zone` use an explicit
`Z` or numeric offset when present; strings without an offset are interpreted as
UTC. Returned `TIMESTAMP WITH TIME ZONE` values are rendered as UTC strings.

When converting timestamps, dates, or times to/from numbers, the numerical
representation will be in milliseconds since the Unix epoch (1970-01-01 00:00:00
UTC).

When converting strings to numbers, commas (often used as thousand separators)
will be automatically removed before conversion.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called. If a column
doesn't exist, the error is thrown at that point too.

##### Signature

```typescript
convert(types: Record<string, "integer" | "float" | "number" | "string" | "date" | "time" | "datetime" | "datetimeTz" | "bigint" | "double" | "varchar" | "timestamp" | "timestamp with time zone" | "boolean">, options?: { strict?: boolean; datetimeFormat?: string }): this;
```

##### Parameters

- **`types`**: An object mapping column names to their target data types for
  conversion.
- **`options`**: An optional object with configuration options:
- **`options.strict`**: If `false`, values that cannot be converted will be
  replaced by `NULL` instead of throwing an error. Defaults to `true`.
- **`options.datetimeFormat`**: A string specifying the format for date and time
  conversions. Uses `strftime` and `strptime` functions from DuckDB. For format
  specifiers, see
  [DuckDB's documentation](https://duckdb.org/docs/sql/functions/dateformat).

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Convert 'column1' to string and 'column2' to integer (JavaScript types)
await table.convert({ column1: "string", column2: "integer" }).log();
```

```ts
// Convert 'column1' to VARCHAR and 'column2' to BIGINT (SQL types)
await table.convert({ column1: "varchar", column2: "bigint" }).log();
```

```ts
// Convert strings in 'column3' to datetime using a specific format
await table.convert({ column3: "datetime" }, { datetimeFormat: "%Y-%m-%d" })
  .log();
```

```ts
// Both values identify instants and are rendered in UTC.
await table
  .loadArray([
    { observedAt: "2024-04-07T13:00:00-04:00" },
    { observedAt: "2024-04-07T17:00:00Z" },
  ])
  .convert({ observedAt: "datetimeTz" }).log();
```

```ts
// Convert datetime values in 'column3' to strings using a specific format
await table.convert({ column3: "string" }, {
  datetimeFormat: "%Y-%m-%d %H:%M:%S",
}).log();
```

```ts
// Convert 'amount' to float, replacing unconvertible values with NULL
await table.convert({ amount: "float" }, { strict: false }).log();
```

#### `removeTable`

Removes the table from the database. After this operation, invoking methods on
this SimpleTable instance will result in an error.

##### Signature

```typescript
async removeTable(): Promise<this>;
```

##### Returns

A promise that resolves after the table is removed.

##### Examples

```ts
// Remove the current table from the database
await table.removeTable();
```

#### `removeColumns`

Removes one or more columns from this table. This method queues the operation;
it runs when an async observer method (like `getData()` or `log()`) is awaited,
or when `run()` is called.

##### Signature

```typescript
removeColumns(columns: string | string[]): this;
```

##### Parameters

- **`columns`**: The name or an array of names of the columns to be removed.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Remove 'column1' and 'column2' from the table
await table.removeColumns(["column1", "column2"]).log();
```

```ts
// Remove a single column named 'tempColumn'
await table.removeColumns("tempColumn").log();
```

#### `addColumn`

Adds a new column to the table based on a specified data type (JavaScript or SQL
types) and a SQL definition. This method queues the operation; it runs when an
async observer method (like `getData()` or `log()`) is awaited, or when `run()`
is called.

##### Signature

```typescript
addColumn(newColumn: string, type: "integer" | "float" | "number" | "string" | "date" | "time" | "datetime" | "datetimeTz" | "bigint" | "double" | "varchar" | "timestamp" | "timestamp with time zone" | "boolean" | geometry('${string}') | GEOMETRY('${string}'), definition: string): this;
```

##### Parameters

- **`newColumn`**: The name of the new column to be added.
- **`type`**: The data type for the new column. Can be a JavaScript type (e.g.,
  `"number"`, `"string"`) or a SQL type (e.g., `"integer"`, `"varchar"`).
- **`definition`**: A SQL expression defining how the values for the new column
  should be computed (e.g., `"column1 + column2"`,
  `"ST_Centroid(geom_column)"`).

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Add a new column 'total' as a float, calculated from 'column1' and 'column2'
await table.addColumn("total", "float", "column1 + column2").log();
```

```ts
// Add a new geometry column 'centroid' using the centroid of an existing 'country' geometry column
await table.addColumn(
  "centroid",
  "geometry('EPSG:4326')",
  `ST_Centroid("country")`,
).log();
```

#### `extractDatePart`

Extracts one or more components from a temporal column into new columns. Pass a
single part to create a column with that part's name, or pass an object mapping
custom new-column names to parts. Existing columns are not overwritten.

`dayOfWeek` uses Sunday as `0` through Saturday as `6`. `week` follows ISO week
numbering, and `dayOfYear` starts at `1`. DuckDB `DATE`, `TIME`, `TIMESTAMP`,
and `TIMESTAMP WITH TIME ZONE` columns are supported when the requested
component applies to that type: date parts apply to dates and timestamps, while
time parts apply to times and timestamps. `NULL` input values produce `NULL`
extracted values. Parts extracted from `TIMESTAMP WITH TIME ZONE` values use
UTC.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
extractDatePart(column: string, parts: "year" | "quarter" | "month" | "week" | "day" | "dayOfWeek" | "dayOfYear" | "hour" | "minute" | "second" | Record<string, "year" | "quarter" | "month" | "week" | "day" | "dayOfWeek" | "dayOfYear" | "hour" | "minute" | "second">): this;
```

##### Parameters

- **`column`**: The temporal column from which to extract components.
- **`parts`**: A part to extract using its name as the new column, or an object
  mapping each custom new-column name to the part it should contain.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Add a column named 'year' from the 'publishedAt' timestamp
await table.extractDatePart("publishedAt", "year").log();
```

```ts
// Extract multiple components with custom column names
await table.extractDatePart("publishedAt", {
  publicationYear: "year",
  publicationMonth: "month",
}).log();
```

#### `addRowNumber`

Adds a new column to the table containing the row number, starting at 0 (like an
index).

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
addRowNumber(newColumn: string, options?: { by?: string | string[] }): this;
```

##### Parameters

- **`newColumn`**: The name of the new column that will store the row number.
- **`options`**: An optional object with configuration options:
- **`options.by`**: A column name or an array of column names to partition by.
  The row number restarts at 0 within each group.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Add a new column named 'rowNumber' with the row number for each row
await table.addRowNumber("rowNumber").log();
```

```ts
// Add a new column named 'rowNumber' with the row number for each 'category'
await table.addRowNumber("rowNumber", { by: "category" }).log();
```

#### `crossJoin`

Performs a cross join operation with another table. A cross join returns the
Cartesian product of the rows from both tables, meaning all possible pairs of
rows will be in the resulting table. This means that if the left table has `n`
rows and the right table has `m` rows, the result will have `n * m` rows.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
crossJoin(rightTable: SimpleTable, options?: { outputTable?: string | boolean }): this;
```

##### Parameters

- **`rightTable`**: The SimpleTable instance to cross join with.
- **`options`**: An optional object with configuration options:
- **`options.outputTable`**: If `true`, the results will be stored in a new
  table with a generated name. If a string, it will be used as the name for the
  new table. If `false` or omitted, the current table will be overwritten.
  Defaults to `false`.

##### Returns

A table instance containing the cross-joined data (either the current table or a
new table), so methods can be chained.

##### Examples

```ts
// Perform a cross join with 'tableB', overwriting the current table (tableA)
await tableA.crossJoin(tableB).log();
```

```ts
// Perform a cross join with 'tableB' and store the results in a new table with a generated name
const tableC = await tableA.crossJoin(tableB, { outputTable: true }).log();
```

```ts
// Perform a cross join with 'tableB' and store the results in a new table named 'tableC'
const tableC = await tableA.crossJoin(tableB, { outputTable: "tableC" }).log();
```

#### `join`

Merges the data of this table (considered the left table) with another table
(the right table) based on a common column or multiple columns. Note that the
order of rows in the returned data is not guaranteed to be the same as in the
original tables. This operation might create temporary files in a `.tmp` folder;
consider adding `.tmp` to your `.gitignore`. This method queues the operation;
it runs when an async observer method (like `getData()` or `log()`) is awaited,
or when `run()` is called. The join uses the other table's state as of this
call: operations queued on it afterwards run after the join.

##### Signature

```typescript
join(rightTable: SimpleTable, options?: { on?: string | string[]; type?: "inner" | "left" | "right" | "full"; outputTable?: string | boolean }): this;
```

##### Parameters

- **`rightTable`**: The SimpleTable instance to be joined with this table.
- **`options`**: An optional object with configuration options:
- **`options.on`**: The column(s) to join on. If omitted, the method
  automatically searches for a column name that exists in both tables. Can be a
  single string or an array of strings for multiple join keys.
- **`options.type`**: The type of join operation to perform. Possible values are
  `"inner"`, `"left"` (default), `"right"`, or `"full"`.
- **`options.outputTable`**: If `true`, the results will be stored in a new
  table with a generated name. If a string, it will be used as the name for the
  new table. If `false` or omitted, the current table will be overwritten.
  Defaults to `false`.

##### Returns

A table instance containing the joined data (either the current table or a new
table), so methods can be chained.

##### Examples

```ts
// Perform a left join with 'tableB' on a common column (auto-detected), overwriting tableA
await tableA.join(tableB).log();
```

```ts
// Perform an inner join with 'tableB' on the 'id' column, storing results in a new table named 'tableC'
const tableC = await tableA.join(tableB, {
  on: "id",
  type: "inner",
  outputTable: "tableC",
}).log();
```

```ts
// Perform a join on multiple columns ('name' and 'category')
await tableA.join(tableB, { on: ["name", "category"] }).log();
```

#### `fuzzyJoin`

Performs a fuzzy left join between this table (considered the left table) and
another table (the right table) based on string similarity between two text
columns. Uses the [rapidfuzz](https://query.farm/duckdb_extension_rapidfuzz)
DuckDB community extension.

If a similarity score column is added to the results, the rows will be ordered
alphabetically by the left column, and then by descending similarity score
within each group of identical left column values. Otherwise, the rows will be
order alphabetically by the left column and then by the right column.

This operation might create temporary files in a `.tmp` folder; consider adding
`.tmp` to your `.gitignore`.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called. The join uses the
other table's state as of this call: operations queued on it afterwards run
after the join.

##### Signature

```typescript
fuzzyJoin(rightTable: SimpleTable, leftColumn: string, rightColumn: string, threshold: number, options?: { method?: "ratio" | "partial_ratio" | "token_sort_ratio" | "token_set_ratio"; similarityColumn?: string; outputTable?: string | boolean; prefilterPrefixLength?: number }): this;
```

##### Parameters

- **`rightTable`**: The SimpleTable instance to be joined with this table.
- **`leftColumn`**: The name of the column in this (left) table containing the
  text to compare.
- **`rightColumn`**: The name of the column in the right table containing the
  text to compare.
- **`threshold`**: The minimum similarity score (0–100) required for two rows to
  be joined. For `method: "ratio"`, a length-based pre-filter is automatically
  applied based on the threshold to improve performance without losing accuracy.
- **`options`**: An optional object with configuration options:
- **`options.method`**: The rapidfuzz similarity algorithm to use. Defaults to
  `"ratio"`. - `"ratio"`: Overall similarity (Levenshtein-based). -
  `"partial_ratio"`: Best partial/substring similarity. - `"token_sort_ratio"`:
  Similarity after sorting tokens (words), useful for reordered words. -
  `"token_set_ratio"`: Similarity based on sets of tokens, ignoring duplicates
  and word order.
- **`options.similarityColumn`**: If provided, a column with this name is added
  to the result containing the similarity score (0–100). If omitted, the score
  is not included in the output.
- **`options.outputTable`**: If `true`, the results will be stored in a new
  table with a generated name. If a string, it will be used as the name for the
  new table. If `false` or omitted, the current table will be overwritten.
  Defaults to `false`.
- **`options.prefilterPrefixLength`**: An optional prefix length. Only strings
  sharing the same first N characters are compared. Note that prefix filtering
  is lossy (e.g. "John" vs. "Phon" will not match despite high similarity).

##### Returns

A table instance containing the fuzzy-joined data (either the current table or a
new table), so methods can be chained.

##### Examples

```ts
// Fuzzy left join tableA with tableB on 'name' (left) and 'standardName' (right) with a threshold of 80
// A length-based pre-filter is automatically applied.
await tableA.fuzzyJoin(tableB, "name", "standardName", 80).log();
```

```ts
// Fuzzy join with a prefix-based pre-filter and a threshold of 80
await tableA.fuzzyJoin(tableB, "name", "standardName", 80, {
  prefilterPrefixLength: 3, // Must share the same first 3 characters
}).log();
```

```ts
// Fuzzy join with a custom threshold and method, storing results in a new table
const tableC = await tableA.fuzzyJoin(tableB, "name", "standardName", 90, {
  method: "token_sort_ratio",
  outputTable: "tableC",
}).log();
```

```ts
// Fuzzy join with a custom similarity column name and a threshold of 80
await tableA.fuzzyJoin(tableB, "name", "standardName", 80, {
  similarityColumn: "matchScore",
}).log();
```

#### `fuzzyClean`

Normalizes string values in a column by detecting fuzzy duplicates and replacing
them with a single canonical value.

Similar strings are grouped into clusters. Matching is transitive: if
`"New York"` is similar to `"New Yorke"` and `"New Yorke"` is similar to
`"New Yorkk"`, all three land in the same cluster even if `"New York"` and
`"New Yorkk"` would not match directly. Each cluster is then collapsed to one
representative value based on the `strategy` option.

Similarity is computed using the
[rapidfuzz](https://query.farm/duckdb_extension_rapidfuzz) DuckDB community
extension, which is installed and loaded automatically.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
fuzzyClean(column: string, newColumn: string, threshold: number, options?: { method?: "ratio" | "partial_ratio" | "token_sort_ratio" | "token_set_ratio"; strategy?: "mostCommon" | "longestString" | "shortestString" | "mostCentral" | "maxScore"; prefilterPrefixLength?: number }): this;
```

##### Parameters

- **`column`**: The name of the column containing the strings to normalize.
- **`newColumn`**: The name of the column to write the normalized values to. Use
  the same name as `column` to normalize in-place.
- **`threshold`**: The minimum similarity score (0–100) for two strings to be
  considered duplicates. For `method: "ratio"`, a length-based pre-filter is
  automatically applied based on the threshold to improve performance without
  losing accuracy.
- **`options`**: An optional object with configuration options:
- **`options.method`**: The rapidfuzz similarity algorithm to use. Defaults to
  `"ratio"`. - `"ratio"`: Overall similarity. - `"partial_ratio"`: Best
  partial/substring similarity. - `"token_sort_ratio"`: Similarity after sorting
  tokens (words), useful for reordered words. - `"token_set_ratio"`: Similarity
  based on sets of tokens, ignoring duplicates and word order.
- **`options.strategy`**: The strategy for choosing the canonical value within
  each cluster of similar strings. Defaults to `"mostCommon"`. - `"mostCommon"`:
  Keep the value that appears most frequently in the original column. -
  `"longestString"`: Keep the longest string in the cluster. -
  `"shortestString"`: Keep the shortest string in the cluster. -
  `"mostCentral"`: Keep the string with the highest total similarity score to
  all other cluster members (the most "central" string). - `"maxScore"`: Keep
  the string that participates in the single highest-scoring pairwise match
  within the cluster.
- **`options.prefilterPrefixLength`**: An optional prefix length. Only strings
  sharing the same first N characters are compared. Note that prefix filtering
  is lossy (e.g. "John" vs. "Phon" will not match despite high similarity).

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Normalize 'city' into a new 'cityClean' column, keeping the most common string per cluster with a threshold of 80
// A length-based pre-filter is automatically applied.
await table.fuzzyClean("city", "cityClean", 80).log();
```

```ts
// Normalize with a prefix-based pre-filter and a threshold of 80
await table.fuzzyClean("city", "cityClean", 80, {
  prefilterPrefixLength: 5, // Must share the same first 5 characters
}).log();
```

```ts
// Normalize 'companyName' into a new column using token_sort_ratio and a threshold of 90
await table.fuzzyClean("companyName", "companyNameClean", 90, {
  method: "token_sort_ratio",
}).log();
```

```ts
// Normalize 'category' in-place, keeping the longest string in each cluster and a threshold of 80
await table.fuzzyClean("category", "category", 80, {
  strategy: "longestString",
}).log();
```

#### `replace`

Replaces specified strings in the selected columns.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
replace(columns: "all" | string | string[], replacements: Record<string, string>, options?: { entireString?: boolean; regex?: boolean }): this;
```

##### Parameters

- **`columns`**: The column name, an array of column names, or `"all"` to apply
  the replacement to every column in the table.
- **`replacements`**: An object mapping old strings to new strings (e.g.,
  `{ "oldValue": "newValue" }`).
- **`options`**: An optional object with configuration options:
- **`options.entireString`**: A boolean indicating whether the entire cell
  content must match the `oldString` for replacement to occur. Defaults to
  `false` (replaces substrings).
- **`options.regex`**: A boolean indicating whether the `oldString` should be
  treated as a regular expression for global replacement. Cannot be used with
  `entireString: true`. Defaults to `false`.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Replace all occurrences of "kilograms" with "kg" in 'column1'
await table.replace("column1", { "kilograms": "kg" }).log();
```

```ts
// Replace "kilograms" with "kg" and "liters" with "l" in 'column1' and 'column2'
await table.replace(["column1", "column2"], {
  "kilograms": "kg",
  "liters": "l",
}).log();
```

```ts
// Replace only if the entire string in 'column1' is "kilograms"
await table.replace("column1", { "kilograms": "kg" }, { entireString: true })
  .log();
```

```ts
// Replace any sequence of one or more digits with a hyphen in 'column1' using regex
await table.replace("column1", { "\d+": "-" }, { regex: true }).log();
```

```ts
// Replace "%" with "" in all columns
await table.replace("all", { "%": "" }).log();
```

#### `lower`

Converts string values in the specified columns to lowercase. This method queues
the operation; it runs when an async observer method (like `getData()` or
`log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
lower(columns: string | string[]): this;
```

##### Parameters

- **`columns`**: The column name or an array of column names to be converted to
  lowercase.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Convert strings in 'column1' to lowercase
await table.lower("column1").log();
```

```ts
// Convert strings in 'column1' and 'column2' to lowercase
await table.lower(["column1", "column2"]).log();
```

#### `upper`

Converts string values in the specified columns to uppercase. This method queues
the operation; it runs when an async observer method (like `getData()` or
`log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
upper(columns: string | string[]): this;
```

##### Parameters

- **`columns`**: The column name or an array of column names to be converted to
  uppercase.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Convert strings in 'column1' to uppercase
await table.upper("column1").log();
```

```ts
// Convert strings in 'column1' and 'column2' to uppercase
await table.upper(["column1", "column2"]).log();
```

#### `capitalize`

Capitalizes the first letter of each string in the specified columns and
converts the rest of the string to lowercase. This method queues the operation;
it runs when an async observer method (like `getData()` or `log()`) is awaited,
or when `run()` is called.

##### Signature

```typescript
capitalize(columns: string | string[]): this;
```

##### Parameters

- **`columns`**: The column name or an array of column names to be capitalized.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Capitalize strings in 'column1' (e.g., "hello world" becomes "Hello world")
await table.capitalize("column1").log();
```

```ts
// Capitalize strings in 'column1' and 'column2'
await table.capitalize(["column1", "column2"]).log();
```

#### `truncate`

Truncates string values in a specified column to a maximum number of characters.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
truncate(column: string, length: number): this;
```

##### Parameters

- **`column`**: The column name containing strings to be truncated.
- **`length`**: The maximum number of characters to keep.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Truncate strings in 'description' column to 50 characters
await table.truncate("description", 50).log();
```

```ts
// Truncate strings in 'name' column to 10 characters
await table.truncate("name", 10).log();
```

#### `pad`

Pads the strings in the specified columns to a target length.

The columns must contain string (VARCHAR) values. An error is thrown if any
column is of a different type. `null` values remain `null`. If any string
already exceeds the target length, an error is thrown (no silent truncation).

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
pad(columns: string | string[], length: number, options?: { side?: "left" | "right"; character?: string }): this;
```

##### Parameters

- **`columns`**: The column name(s) containing strings to be padded.
- **`length`**: The target length of the padded strings.
- **`options`**: An optional object with configuration options:
- **`options.side`**: Which side to pad. `'left'` (default) or `'right'`.
- **`options.character`**: The character to use for padding. Defaults to `'0'`.

##### Returns

The table, so methods can be chained.

##### Throws

- **`Error`**: If any column is not of string (VARCHAR) type.
- **`Error`**: If any string value exceeds the target length.

##### Examples

```ts
// Left-pad 'id' column to 3 characters with zeros (default)
await table.pad("id", 3).log();
// Result: '1' -> '001', '23' -> '023', null -> null
```

```ts
// Right-pad 'code' column to 5 characters with spaces
await table.pad("code", 5, { side: "right", character: " " }).log();
// Result: '123' -> '123  ', '45' -> '45   ', null -> null
```

```ts
// Left-pad multiple columns to 5 characters with dashes
await table.pad(["id", "code"], 5, { side: "left", character: "-" }).log();
// Result: '1' -> '----1', '23' -> '---23'
```

#### `splitExtract`

Splits strings in a specified column by a separator and extracts a substring at
a given index, storing the result in a new or existing column. If the index is
out of bounds, an empty string will be returned for that row.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
splitExtract(column: string, separator: string, index: number, newColumn: string): this;
```

##### Parameters

- **`column`**: The name of the column containing the strings to be split.
- **`separator`**: The substring to use as a delimiter for splitting the
  strings.
- **`index`**: The zero-based index of the substring to extract after splitting.
  For example, `0` for the first part, `1` for the second, etc.
- **`newColumn`**: The name of the column where the extracted substrings will be
  stored. To overwrite the original column, use the same name as `column`.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Split 'address' by comma and extract the second part (index 1) into a new 'city' column
// e.g., "123 Main St, Anytown, USA" -> "Anytown"
await table.splitExtract("address", ",", 1, "city").log();
```

```ts
// Split 'filename' by dot and extract the first part (index 0), overwriting 'filename'
// e.g., "document.pdf" -> "document"
await table.splitExtract("filename", ".", 0, "filename").log();
```

#### `splitSpread`

Splits strings in a specified column by a separator and spreads the resulting
parts into multiple new columns.

Each part of the split string will be stored in a separate column. The number of
columns created is determined by the length of the `newColumns` array. If a row
has fewer parts than the number of new columns, a warning will be logged and the
extra columns will contain empty strings (unless `strict` is set to `false`). If
a row has more parts than the number of new columns, an error will be thrown
unless `strict` is set to `false`.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
splitSpread(column: string, separator: string, newColumns: string[], options?: { strict?: boolean }): this;
```

##### Parameters

- **`column`**: The name of the column containing the strings to be split.
- **`separator`**: The substring to use as a delimiter for splitting the
  strings.
- **`newColumns`**: An array of column names for the extracted parts.
- **`options`**: Optional configuration.
- **`options.strict`**: If `false`, skips all validation checks (both max and
  min parts). Defaults to `true`.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Split 'fullName' by comma and spread into 'lastName' and 'firstName'
// e.g., "Shiab, Nael" -> lastName: "Shiab", firstName: "Nael"
await table.splitSpread("fullName", ",", ["lastName", "firstName"]).log();
```

```ts
// Split 'address' by comma and spread into three columns
// e.g., "123 Main St, Anytown, USA" -> street: "123 Main St", city: "Anytown", country: "USA"
await table.splitSpread("address", ",", ["street", "city", "country"]).log();
```

```ts
// Skip validation for performance
await table.splitSpread("data", "|", ["col1", "col2"], { strict: false }).log();
```

#### `firstChars`

Extracts a specific number of characters from the beginning (left side) of
string values in the specified column.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
firstChars(column: string, count: number): this;
```

##### Parameters

- **`column`**: The name of the column containing the strings to be modified.
- **`count`**: The number of characters to extract from the left side of each
  string.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Replace strings in 'productCode' with their first two characters
// e.g., "ABC-123" becomes "AB"
await table.firstChars("productCode", 2).log();
```

#### `lastChars`

Extracts a specific number of characters from the end (right side) of string
values in the specified column.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
lastChars(column: string, count: number): this;
```

##### Parameters

- **`column`**: The name of the column containing the strings to be modified.
- **`count`**: The number of characters to extract from the right side of each
  string.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Replace strings in 'productCode' with their last two characters
// e.g., "ABC-123" becomes "23"
await table.lastChars("productCode", 2).log();
```

#### `replaceNulls`

Replaces `NULL` values in the specified columns with a given value.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
replaceNulls(columns: "all" | string | string[], value: unknown): this;
```

##### Parameters

- **`columns`**: The column name, an array of column names, or `"all"` to apply
  the replacement to every column in the table.
- **`value`**: The value to replace `NULL` occurrences with.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Replace NULL values in 'column1' with 0
await table.replaceNulls("column1", 0).log();
```

```ts
// Replace NULL values in 'columnA' and 'columnB' with the string "N/A"
await table.replaceNulls(["columnA", "columnB"], "N/A").log();
```

```ts
// Replace NULL values in 'dateColumn' with a specific date
await table.replaceNulls("dateColumn", new Date("2023-01-01")).log();
```

```ts
// Replace NULL values in all columns with 0
await table.replaceNulls("all", 0).log();
```

#### `concatenate`

Concatenates values from specified columns into a new column.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
concatenate(columns: string[], newColumn: string, options?: { separator?: string }): this;
```

##### Parameters

- **`columns`**: An array of column names whose values will be concatenated.
- **`newColumn`**: The name of the new column to store the concatenated values.
- **`options`**: An optional object with configuration options:
- **`options.separator`**: The string used to separate concatenated values.
  Defaults to an empty string (`""`).

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Concatenate 'firstName' and 'lastName' into a new 'fullName' column
await table.concatenate(["firstName", "lastName"], "fullName").log();
```

```ts
// Concatenate 'city' and 'country' into 'location', separated by a comma and space
await table.concatenate(["city", "country"], "location", { separator: ", " })
  .log();
```

#### `rowToText`

Concatenates values from multiple columns into a new column with labeled rows.

This method creates a new column where each value is a concatenation of the
specified columns, with each column value prefixed by its column name and a
colon, followed by a newline. Column entries are separated by double newlines
("\n\n").

All values must be string, otherwise an error will be thrown. Use the
`convert()` method first to convert non-string columns to string.

If a column value is `NULL`, it will be replaced by `'Unknown'` in the
concatenated result.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
rowToText(columns: string[], newColumn: string): this;
```

##### Parameters

- **`columns`**: An array of column names whose values will be concatenated with
  labels.
- **`newColumn`**: The name of the new column to create with the concatenated
  values.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Concatenate multiple string columns into a labeled text field
await table.rowToText(
  ["summary", "findings", "context", "date", "quote"],
  "fullText",
).log();
// Result in "fullText" will look like:
// summary:
// [value]
//
// findings:
// [value]
//
// context:
// [value]
//
// date:
// [value]
//
// quote:
// [value]
```

```ts
// Convert numeric columns to strings first, then concatenate
// NULL values will appear as 'Unknown'
await table
  .convert({ age: "string", salary: "string" })
  .rowToText(["name", "age", "salary"], "profile").log();
```

#### `unnest`

Unnests (expands) rows by splitting a column's string values into multiple rows
based on a separator.

Each value in the specified column is split using the provided separator, and a
new row is created for each resulting substring. All other column values are
duplicated across the newly created rows.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
unnest(column: string, separator: string): this;
```

##### Parameters

- **`column`**: The name of the column containing string values to be split and
  unnested.
- **`separator`**: The delimiter string used to split the column values.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Unnest 'tags' column separated by commas
// Before: [{ id: 1, tags: "red,blue,green" }]
// After:  [{ id: 1, tags: "red" }, { id: 1, tags: "blue" }, { id: 1, tags: "green" }]
await table.unnest("tags", ",").log();
```

```ts
// Unnest 'neighborhoods' column separated by " / "
// Before: [{ city: "Montreal", neighborhoods: "Old Montreal / Chinatown / Griffintown" }]
// After:  [{ city: "Montreal", neighborhoods: "Old Montreal" },
//         { city: "Montreal", neighborhoods: "Chinatown" },
//         { city: "Montreal", neighborhoods: "Griffintown" }]
await table.unnest("neighborhoods", " / ").log();
```

#### `repeatRows`

Repeats rows based on the values in a column.

If a row has a value of 3 in the specified column, it will be repeated 3 times.
If the value is 0 or negative, the row will be removed.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
repeatRows(column: string, options?: { index?: string }): this;
```

##### Parameters

- **`column`**: The name of the column containing the number of times each row
  should be repeated.
- **`options`**: An optional object with configuration options:
- **`options.index`**: The name of a new column to store the index of the
  repeated row (starting at 0).

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Before: [{ id: 1, count: 2, category: "A" }, { id: 2, count: 3, category: "B" }]
await table.repeatRows("count").log();
// After:  [{ id: 1, count: 2, category: "A" }, { id: 1, count: 2, category: "A" },
//          { id: 2, count: 3, category: "B" }, { id: 2, count: 3, category: "B" }, { id: 2, count: 3, category: "B" }]
```

```ts
// With an index column
await table.repeatRows("count", { index: "copyId" }).log();
// After:  [{ id: 1, count: 2, category: "A", copyId: 0 }, { id: 1, count: 2, category: "A", copyId: 1 },
//          { id: 2, count: 3, category: "B", copyId: 0 }, { id: 2, count: 3, category: "B", copyId: 1 }, { id: 2, count: 3, category: "B", copyId: 2 }]
```

#### `nest`

Nests (collapses) rows by aggregating a column's values into a single string per
group, separated by a delimiter.

This is the inverse operation of `unnest()`. Multiple rows are combined into
fewer rows by grouping on specified category columns and concatenating the
target column values with a separator.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
nest(column: string, separator: string, by: string | string[]): this;
```

##### Parameters

- **`column`**: The name of the column whose values will be aggregated and
  concatenated.
- **`separator`**: The delimiter string used to join the column values.
- **`by`**: The column name or an array of column names to group by.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Nest 'neighborhoods' column separated by " / " for each city
// Before: [{ city: "Montreal", neighborhoods: "Old Montreal" },
//         { city: "Montreal", neighborhoods: "Chinatown" },
//         { city: "Montreal", neighborhoods: "Griffintown" }]
// After:  [{ city: "Montreal", neighborhoods: "Old Montreal / Chinatown / Griffintown" }]
await table.nest("neighborhoods", " / ", "city").log();
```

```ts
// Nest with multiple category columns
// Before: [{ country: "Canada", city: "Montreal", tags: "red" },
//         { country: "Canada", city: "Montreal", tags: "blue" }]
// After:  [{ country: "Canada", city: "Montreal", tags: "red,blue" }]
await table.nest("tags", ",", ["country", "city"]).log();
```

#### `round`

Rounds numeric values in specified columns.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
round(columns: string | string[], options?: number | { decimals?: number; method?: "round" | "ceiling" | "floor" }): this;
```

##### Parameters

- **`columns`**: The column name or an array of column names containing numeric
  values to be rounded.
- **`options`**: An optional integer specifying the number of decimal places, or
  an object with configuration options:
- **`options.decimals`**: The number of decimal places to round to. Defaults to
  `0` (rounds to the nearest integer).
- **`options.method`**: The rounding method to use: `"round"` (rounds to the
  nearest integer, with halves rounding up), `"ceiling"` (rounds up to the
  nearest integer), or `"floor"` (rounds down to the nearest integer). Defaults
  to `"round"`.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Round 'column1' values to the nearest integer
await table.round("column1").log();
```

```ts
// Round 'column1' values to 2 decimal places
await table.round("column1", { decimals: 2 }).log();
```

```ts
// Round 'column1' values down to the nearest integer (floor)
await table.round("column1", { method: "floor" }).log();
```

```ts
// Round 'columnA' and 'columnB' values to 1 decimal place using ceiling method
await table.round(["columnA", "columnB"], { decimals: 1, method: "ceiling" })
  .log();
```

```ts
// Round 'column1' values to 2 decimal places using the shorthand
await table.round("column1", 2).log();
```

#### `updateColumn`

Updates values in a specified column using a SQL expression.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
updateColumn(column: string, definition: string): this;
```

##### Parameters

- **`column`**: The name of the column to be updated.
- **`definition`**: The SQL expression used to set the new values in the column
  (e.g., `"column1 * 2"`, `"UPPER(column_name)"`).

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Update 'column1' with the left 5 characters of 'column2'
await table.updateColumn("column1", `LEFT(column2, 5)`).log();
```

```ts
// Double the values in 'price' column
await table.updateColumn("price", `price * 2`).log();
```

```ts
// Set 'status' to 'active' where 'isActive' is true
await table.updateColumn(
  "status",
  `CASE WHEN isActive THEN 'active' ELSE 'inactive' END`,
).log();
```

#### `ranks`

Assigns ranks to rows in a new column based on the values of a specified column.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
ranks(column: string, newColumn: string, options?: { order?: "asc" | "desc"; by?: string | string[]; dense?: boolean }): this;
```

##### Parameters

- **`column`**: The column containing the values to be used for ranking.
- **`newColumn`**: The name of the new column where the ranks will be stored.
- **`options`**: An optional object with configuration options:
- **`options.order`**: The order of values for ranking: `"asc"` for ascending
  (default) or `"desc"` for descending.
- **`options.by`**: The column name or an array of column names to rank by.
  Ranks are assigned independently within each group.
- **`options.dense`**: A boolean indicating whether to use dense ranking (no
  gaps). If `true`, ranks will be consecutive integers (e.g., 1, 2, 2, 3). If
  `false` (default), ranks might have gaps (e.g., 1, 2, 2, 4).

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Compute ranks in a new 'rank' column based on 'score' values (ascending)
await table.ranks("score", "rank").log();
```

```ts
// Compute ranks in a new 'descRank' column based on 'score' values (descending)
await table.ranks("score", "descRank", { order: "desc" }).log();
```

```ts
// Compute ranks by 'department', based on 'salary' values, without gaps
await table.ranks("salary", "salaryRank", { by: "department", dense: true })
  .log();
```

```ts
// Compute ranks by both 'department' and 'city'
await table.ranks("sales", "salesRank", { by: ["department", "city"] }).log();
```

#### `quantiles`

Assigns quantiles to rows in a new column based on specified column values.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
quantiles(column: string, count: number, newColumn: string, options?: { by?: string | string[] }): this;
```

##### Parameters

- **`column`**: The column containing values from which quantiles will be
  assigned.
- **`count`**: The number of quantiles to divide the data into (e.g., `4` for
  quartiles, `10` for deciles).
- **`newColumn`**: The name of the new column where the assigned quantiles will
  be stored.
- **`options`**: An optional object with configuration options:
- **`options.by`**: The column name or an array of column names to partition by.
  Quantiles are assigned independently within each group.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Assigns a quantile from 1 to 10 for each row in a new 'quantiles' column, based on 'column1' values.
await table.quantiles("column1", 10, "quantiles").log();
```

```ts
// Assign quantiles by 'column2', based on 'column1' values.
await table.quantiles("column1", 10, "quantiles", { by: "column2" }).log();
```

```ts
// Assigns quartiles (4 quantiles) to 'sales' data, storing results in 'salesQuartile'
await table.quantiles("sales", 4, "salesQuartile").log();
```

#### `bins`

Assigns bins for specified column values based on an interval size.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
bins(column: string, interval: number, newColumn: string, options?: { startValue?: number }): this;
```

##### Parameters

- **`column`**: The column containing values from which bins will be computed.
- **`interval`**: The interval size for binning the values.
- **`newColumn`**: The name of the new column where the bins will be stored.
- **`options`**: An optional object with configuration options:
- **`options.startValue`**: The starting value for binning. Defaults to the
  minimum value in the specified column.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Assigns a bin for each row in a new 'bins' column based on 'column1' values, with an interval of 10.
// If the minimum value in 'column1' is 5, the bins will follow this pattern: "[5-14]", "[15-24]", etc.
await table.bins("column1", 10, "bins").log();
```

```ts
// Assigns bins starting at a specific value (0) with an interval of 10.
// The bins will follow this pattern: "[0-9]", "[10-19]", "[20-29]", etc.
await table.bins("column1", 10, "bins", { startValue: 0 }).log();
```

#### `rowProportions`

Computes proportions horizontally across specified columns for each row.

For example, given a table showing counts of men, women, and non-binary
individuals per year:

| Year | Men | Women | NonBinary |
| :--- | :-- | :---- | :-------- |
| 2021 | 564 | 685   | 145       |
| 2022 | 354 | 278   | 56        |
| 2023 | 856 | 321   | 221       |

This method computes the proportion of men, women, and non-binary individuals on
each row, adding new columns for these proportions.

##### Signature

```typescript
rowProportions(columns: string[], options?: { suffix?: string; decimals?: number }): this;
```

##### Parameters

- **`columns`**: An array of column names for which proportions will be computed
  on each row.
- **`options`**: An optional object with configuration options:
- **`options.suffix`**: A string suffix to append to the names of the new
  columns storing the computed proportions. Defaults to `"Perc"`.
- **`options.decimals`**: The number of decimal places to round the computed
  proportions. Defaults to `undefined` (no rounding).

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Compute horizontal proportions for 'Men', 'Women', and 'NonBinary' columns, rounded to 2 decimal places
await table.rowProportions(["Men", "Women", "NonBinary"], { decimals: 2 })
  .log();
```

The table will then look like this:

| Year | Men | Women | NonBinary | MenPerc | WomenPerc | NonBinaryPerc |
| :--- | :-- | :---- | :-------- | :------ | :-------- | :------------ |
| 2021 | 564 | 685   | 145       | 0.4     | 0.49      | 0.10          |
| 2022 | 354 | 278   | 56        | 0.51    | 0.4       | 0.08          |
| 2023 | 856 | 321   | 221       | 0.61    | 0.23      | 0.16          |

By default, the new columns will be named with a suffix of `"Perc"`. You can
customize this suffix using the `suffix` option.

```ts
// Compute horizontal proportions with a custom suffix "Prop"
await table.rowProportions(["Men", "Women", "NonBinary"], {
  suffix: "Prop",
  decimals: 2,
}).log();
```

The table will then look like this:

| Year | Men | Women | NonBinary | MenProp | WomenProp | NonBinaryProp |
| :--- | :-- | :---- | :-------- | :------ | :-------- | :------------ |
| 2021 | 564 | 685   | 145       | 0.4     | 0.49      | 0.10          |
| 2022 | 354 | 278   | 56        | 0.51    | 0.4       | 0.08          |
| 2023 | 856 | 321   | 221       | 0.61    | 0.23      | 0.16          |

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

#### `rowRanks`

Selects a ranked numeric value within each row and adds its source column name,
its value, or both as new columns.

Values are ranked from highest to lowest by default. Null values are ignored. By
default, a tie at the requested rank throws an error. Set `options.ties` to
`"first"` to select the first tied column in the supplied order, or to `"all"`
to produce one row for each tied column. The `"all"` option can therefore
increase the table's row count. If null values leave a row without the requested
rank, the new columns contain null.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
rowRanks(columns: string[], options: ({ nameColumn: string; valueColumn?: string } | { nameColumn?: string; valueColumn: string }) & { rank?: number; order?: "asc" | "desc"; ties?: "strict" | "first" | "all" }): this;
```

##### Parameters

- **`columns`**: The numeric columns to rank within each row.
- **`options`**: The output columns and ranking configuration. At least one of
  `nameColumn` or `valueColumn` is required.
- **`options.nameColumn`**: The name of a new column containing the selected
  source column's name.
- **`options.valueColumn`**: The name of a new column containing the selected
  source column's value.
- **`options.rank`**: The one-based rank to select. Must not exceed the number
  of supplied columns. Defaults to `1`.
- **`options.order`**: The ranking order: `"desc"` ranks the highest value first
  and `"asc"` ranks the lowest value first. Defaults to `"desc"`.
- **`options.ties`**: How to handle a tie at the requested rank: `"strict"`
  throws, `"first"` selects the first supplied column, and `"all"` produces one
  row per tied column. Defaults to `"strict"`.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Add the name and value of the highest-scoring party on each row.
await table.rowRanks(["CAQ", "PLQ", "PQ"], {
  nameColumn: "winner",
  valueColumn: "winningVotes",
}).log();
```

```ts
// Add only the second-lowest value on each row.
await table.rowRanks(["CAQ", "PLQ", "PQ"], {
  valueColumn: "secondLowestVotes",
  rank: 2,
  order: "asc",
}).log();
```

#### `columnProportions`

Computes proportions vertically over a column's values, relative to the sum of
all values in that column or group.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
columnProportions(column: string, newColumn: string, options?: { by?: string | string[]; decimals?: number }): this;
```

##### Parameters

- **`column`**: The column containing values for which proportions will be
  computed. The proportions are calculated based on the sum of values in the
  specified column.
- **`newColumn`**: The name of the new column where the proportions will be
  stored.
- **`options`**: An optional object with configuration options:
- **`options.by`**: The column name or an array of column names to partition by.
  Proportions are calculated independently within each group.
- **`options.decimals`**: The number of decimal places to round the computed
  proportions. Defaults to `undefined` (no rounding).

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Add a new column 'perc' with each 'column1' value divided by the sum of all 'column1' values
await table.columnProportions("column1", "perc").log();
```

```ts
// Compute proportions for 'column1' by 'column2', rounded to two decimal places
await table.columnProportions("column1", "perc", { by: "column2", decimals: 2 })
  .log();
```

```ts
// Compute proportions for 'sales' by 'region' and 'product_type'
await table.columnProportions("sales", "sales_proportion", {
  by: ["region", "product_type"],
}).log();
```

#### `summarize`

Creates a summary table from selected columns, optionally grouped by other
columns. This method allows you to aggregate data, calculate statistics (e.g.,
count, mean, sum), and group results by categorical columns.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
summarize(options?: { columns?: string | string[]; by?: string | string[]; stats?: ("count" | "countDistinct" | "countNull" | "min" | "max" | "mean" | "median" | "sum" | "skew" | "stdDev" | "variance") | ("count" | "countDistinct" | "countNull" | "min" | "max" | "mean" | "median" | "sum" | "skew" | "stdDev" | "variance")[] | Record<string, "count" | "countDistinct" | "countNull" | "min" | "max" | "mean" | "median" | "sum" | "skew" | "stdDev" | "variance">; decimals?: number; outputTable?: string | boolean; datesToMs?: boolean }): this;
```

##### Parameters

- **`options`**: An object with configuration options for summarization:
- **`options.columns`**: The column name or an array of column names to
  summarize. If omitted, only the row count is returned.
- **`options.by`**: The column name or an array of column names to group by.
- **`options.stats`**: The statistics to compute. Can be a single statistic
  (e.g., `"mean"`), an array (e.g., `["min", "max"]`), or an object mapping
  output column names to statistics (e.g., `{ avgSalary: "mean" }`). Supported
  statistics are `"count"`, `"countDistinct"`, `"countNull"`, `"min"`, `"max"`,
  `"mean"`, `"median"`, `"sum"`, `"skew"`, `"stdDev"`, and `"variance"`.
- **`options.decimals`**: The number of decimal places to round the summarized
  columns. Defaults to `undefined` (no rounding).
- **`options.outputTable`**: If `true`, the results will be stored in a new
  table with a generated name. If a string, it will be used as the name for the
  new table. If `false` or omitted, the current table will be overwritten.
  Defaults to `false`.
- **`options.datesToMs`**: If `true`, timestamps, dates, and times will be
  converted to milliseconds before summarizing. This is useful when summarizing
  mixed data types (numbers and dates) as columns must be of the same type for
  aggregation.

##### Returns

A table instance containing the summarized data (either the current table or a
new table), so methods can be chained. When summarizing more than one column, a
`column` column identifies which input column each row summarizes.

##### Examples

```ts
// Summarize all columns with all available statistics, overwriting the current table
const columns = await table.getColumns();
await table.summarize({ columns }).log();
```

```ts
// Summarize all columns and store the results in a new table with a generated name
const columns = await table.getColumns();
const summaryTable = await table.summarize({ columns, outputTable: true })
  .log();
```

```ts
// Summarize all columns and store the results in a new table named 'mySummary'
const columns = await table.getColumns();
const mySummaryTable = await table.summarize({
  columns,
  outputTable: "mySummary",
}).log();
```

```ts
// Summarize a single column ('sales') with all available statistics
await table.summarize({ columns: "sales" }).log();
```

```ts
// Summarize multiple columns ('sales' and 'profit') with all available statistics
await table.summarize({ columns: ["sales", "profit"] }).log();
```

```ts
// Summarize 'sales' by 'region' (single category)
await table.summarize({ columns: "sales", by: "region" }).log();
```

```ts
// Summarize 'sales' by 'region' and 'product_type'
await table.summarize({ columns: "sales", by: ["region", "product_type"] })
  .log();
```

```ts
// Summarize 'sales' by 'region' with a specific statistic (mean)
await table.summarize({ columns: "sales", by: "region", stats: "mean" }).log();
```

```ts
// Summarize 'sales' by 'region' with specific statistics (mean and sum)
await table.summarize({
  columns: "sales",
  by: "region",
  stats: ["mean", "sum"],
}).log();
```

```ts
// Summarize 'sales' by 'region' with custom named statistics
await table.summarize({
  columns: "sales",
  by: "region",
  stats: { averageSales: "mean", totalSales: "sum" },
}).log();
```

```ts
// Summarize 'price' and 'cost', rounding aggregated columns to 2 decimal places
await table.summarize({ columns: ["price", "cost"], decimals: 2 }).log();
```

```ts
// Summarize 'timestamp_column' by converting to milliseconds first
await table.summarize({
  columns: "timestamp_column",
  datesToMs: true,
  stats: "mean",
}).log();
```

#### `addSummaryRows`

Adds one or more summary rows to the table. Each row is calculated from the
original rows before any summary rows are added. This is useful for preparing
totals and other statistics before exporting tabular data.

Passing `"all"` selects every numeric column. Columns that are neither
summarized nor used for labels contain `NULL` in the added rows. A stat string
is also used as its row label; pass an object to customize that label. If
`options.stats` is omitted, every supported stat is added.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
addSummaryRows(columns: "all" | string | string[], labelColumn: string, options?: { stats?: "countDistinct" | "countNull" | "min" | "max" | "mean" | "median" | "sum" | "skew" | "stdDev" | "variance" | { stat: "countDistinct" | "countNull" | "min" | "max" | "mean" | "median" | "sum" | "skew" | "stdDev" | "variance"; label?: string } | ("countDistinct" | "countNull" | "min" | "max" | "mean" | "median" | "sum" | "skew" | "stdDev" | "variance" | { stat: "countDistinct" | "countNull" | "min" | "max" | "mean" | "median" | "sum" | "skew" | "stdDev" | "variance"; label?: string })[]; position?: "top" | "bottom" }): this;
```

##### Parameters

- **`columns`**: The numeric column name, an array of numeric column names, or
  `"all"` to summarize every numeric column.
- **`labelColumn`**: The existing string column in which stat row labels will be
  written.
- **`options`**: An optional object with configuration options:
- **`options.stats`**: A stat, stat configuration, or array of either. Supported
  stats are `"countDistinct"`, `"countNull"`, `"min"`, `"max"`, `"mean"`,
  `"median"`, `"sum"`, `"skew"`, `"stdDev"`, and `"variance"`. An object's
  `label` defaults to its `stat`. If omitted, all supported stats are added.
- **`options.position`**: Whether to add the summary rows at the `"top"` or
  `"bottom"` of the table. Defaults to `"bottom"`.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Add a total row for every numeric column, labelled "sum" in "region".
await table.addSummaryRows("all", "region", { stats: "sum" }).log();
```

```ts
// Add two summary rows with default labels.
await table.addSummaryRows(["sales", "expenses"], "region", {
  stats: ["sum", "mean"],
  position: "top",
}).log();
```

```ts
// Customize the labels written to the label column.
await table.addSummaryRows("all", "region", {
  stats: [
    { stat: "sum", label: "Total" },
    { stat: "mean", label: "Average" },
  ],
}).log();
```

#### `accumulate`

Computes the cumulative sum of values in a column. For this method to work
properly, ensure your data is sorted first.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
accumulate(column: string, newColumn: string, options?: { by?: string | string[] }): this;
```

##### Parameters

- **`column`**: The name of the column storing the values to be accumulated.
- **`newColumn`**: The name of the new column in which the computed cumulative
  values will be stored.
- **`options`**: An optional object with configuration options:
- **`options.by`**: The column name or an array of column names to partition by.
  Accumulation is performed independently within each group.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Compute the cumulative sum of 'sales' in a new 'cumulativeSales' column
// Ensure the table is sorted by a relevant column (e.g., date) before calling this method.
await table.accumulate("sales", "cumulativeSales").log();
```

```ts
// Compute the cumulative sum of 'orders' by 'customer_id'
// Ensure the table is sorted by 'customer_id' and then by a relevant order column (e.g., order_date).
await table.accumulate("orders", "cumulativeOrders", { by: "customer_id" })
  .log();
```

```ts
// Compute the cumulative sum of 'revenue' by 'region' and 'product_category'
await table.accumulate("revenue", "cumulativeRevenue", {
  by: ["region", "product_category"],
}).log();
```

#### `rolling`

Computes rolling aggregations (e.g., rolling average, min, max) over a specified
column. For rows without enough preceding or following rows to form a complete
window, `NULL` will be returned. For this method to work properly, ensure your
data is sorted by the relevant column(s) first.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
rolling(column: string, newColumn: string, stat: "min" | "max" | "mean" | "median" | "sum", preceding: number, following: number, options?: { by?: string | string[]; decimals?: number }): this;
```

##### Parameters

- **`column`**: The name of the column storing the values to be aggregated.
- **`newColumn`**: The name of the new column in which the computed rolling
  values will be stored.
- **`stat`**: The aggregation function to apply: `"min"`, `"max"`, `"mean"`,
  `"median"`, or `"sum"`.
- **`preceding`**: The number of preceding rows to include in the rolling
  window.
- **`following`**: The number of following rows to include in the rolling
  window.
- **`options`**: An optional object with configuration options:
- **`options.by`**: The column name or an array of column names to partition by.
  Rolling statistics are computed independently within each group.
- **`options.decimals`**: The number of decimal places to round the aggregated
  values. Defaults to `undefined` (no rounding).

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Compute a 7-day rolling average of 'sales' with 3 preceding and 3 following rows
// (total window size of 7: 3 preceding + current + 3 following)
await table.rolling("sales", "rollingAvgSales", "mean", 3, 3).log();
```

```ts
// Compute a rolling sum of 'transactions' by 'customer_id'
await table.rolling("transactions", "rollingSumTransactions", "sum", 5, 0, {
  by: "customer_id",
}).log();
```

```ts
// Compute a rolling maximum of 'temperature' rounded to 1 decimal place
await table.rolling("temperature", "rollingMaxTemp", "max", 2, 2, {
  decimals: 1,
}).log();
```

#### `correlations`

Calculates correlations between columns. If no `x` and `y` columns are
specified, the method computes the correlations for all numeric column
combinations. Note that correlation is symmetrical: the correlation of `x` with
`y` is the same as `y` with `x`.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
correlations(options?: { x?: string; y?: string; by?: string | string[]; decimals?: number; outputTable?: string | boolean }): this;
```

##### Parameters

- **`options`**: An optional object with configuration options:
- **`options.x`**: The name of the column for the x-values. If omitted,
  correlations will be computed for all numeric columns.
- **`options.y`**: The name of the column for the y-values. It can be provided
  only when `options.x` is also set. If both are omitted, correlations will be
  computed for all numeric column pairs.
- **`options.by`**: The column name or an array of column names to group by.
  Correlations are calculated independently within each group.
- **`options.decimals`**: The number of decimal places to round the correlation
  values. Defaults to `undefined` (no rounding).
- **`options.outputTable`**: If `true`, the results will be stored in a new
  table with a generated name. If a string, it will be used as the name for the
  new table. If `false` or omitted, the current table will be overwritten.
  Defaults to `false`.

##### Returns

A table instance containing the correlation results (either the current table or
a new table), so methods can be chained.

##### Examples

```ts
// Compute correlations between all numeric columns, overwriting the current table
await table.correlations().log();
```

```ts
// Compute correlations between 'column1' and all other numeric columns
await table.correlations({ x: "column1" }).log();
```

```ts
// Compute the correlation between 'column1' and 'column2'
await table.correlations({ x: "column1", y: "column2" }).log();
```

```ts
// Compute correlations within 'categoryColumn' and store results in a new table
const correlationTable = await table.correlations({
  by: "categoryColumn",
  outputTable: true,
}).log();
```

```ts
// Compute correlations, rounded to 2 decimal places
await table.correlations({ decimals: 2 }).log();
```

#### `linearRegressions`

Performs linear regression analysis. The results include the slope, the
y-intercept, and the R-squared value. If no `x` and `y` columns are specified,
the method computes linear regression analysis for all numeric column
permutations. Note that linear regression analysis is asymmetrical: the linear
regression of `x` over `y` is not the same as `y` over `x`.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
linearRegressions(options?: { x?: string; y?: string; by?: string | string[]; decimals?: number; outputTable?: string | boolean }): this;
```

##### Parameters

- **`options`**: An optional object with configuration options:
- **`options.x`**: The name of the column for the independent variable
  (x-values). If omitted, linear regressions will be computed for all numeric
  columns as x.
- **`options.y`**: The name of the column for the dependent variable (y-values).
  It can be provided only when `options.x` is also set. If both are omitted,
  linear regressions will be computed for all numeric column permutations.
- **`options.by`**: The column name or an array of column names to group by.
  Linear regressions are calculated independently within each group.
- **`options.decimals`**: The number of decimal places to round the regression
  values (slope, intercept, r-squared). Defaults to `undefined` (no rounding).
- **`options.outputTable`**: If `true`, the results will be stored in a new
  table with a generated name. If a string, it will be used as the name for the
  new table. If `false` or omitted, the current table will be overwritten.
  Defaults to `false`.

##### Returns

A table instance containing the linear regression results (either the current
table or a new table), so methods can be chained.

##### Examples

```ts
// Compute all linear regressions between all numeric columns, overwriting the current table
await table.linearRegressions().log();
```

```ts
// Compute linear regressions with 'column1' as the independent variable and all other numeric columns as dependent variables
await table.linearRegressions({ x: "column1" }).log();
```

```ts
// Compute the linear regression of 'sales' (y) over 'advertising' (x)
await table.linearRegressions({ x: "advertising", y: "sales" }).log();
```

```ts
// Compute linear regressions by 'region' and store results in a new table
const regressionTable = await table.linearRegressions({
  by: "region",
  outputTable: true,
}).log();
```

```ts
// Compute linear regressions, rounded to 3 decimal places
await table.linearRegressions({ decimals: 3 }).log();
```

#### `outliersIQR`

Identifies outliers in a specified column using the Interquartile Range (IQR)
method.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
outliersIQR(column: string, newColumn: string, options?: { by?: string | string[] }): this;
```

##### Parameters

- **`column`**: The name of the column in which outliers will be identified.
- **`newColumn`**: The name of the new column where the boolean results (`TRUE`
  for outlier, `FALSE` otherwise) will be stored.
- **`options`**: An optional object with configuration options:
- **`options.by`**: The column name or an array of column names to partition by.
  Outliers are detected independently within each group.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Look for outliers in the 'age' column and store results in a new 'isOutlier' column
await table.outliersIQR("age", "isOutlier").log();
```

```ts
// Look for outliers in 'salary' by 'gender'
await table.outliersIQR("salary", "salaryOutlier", { by: "gender" }).log();
```

#### `zScore`

Computes the Z-score for values in a specified column.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
zScore(column: string, newColumn: string, options?: { by?: string | string[]; decimals?: number }): this;
```

##### Parameters

- **`column`**: The name of the column for which Z-scores will be calculated.
- **`newColumn`**: The name of the new column where the computed Z-scores will
  be stored.
- **`options`**: An optional object with configuration options:
- **`options.by`**: The column name or an array of column names to partition by.
  Z-scores are calculated independently within each group.
- **`options.decimals`**: The number of decimal places to round the Z-score
  values. Defaults to `undefined` (no rounding).

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Calculate the Z-score for 'age' values and store results in a new 'ageZScore' column
await table.zScore("age", "ageZScore").log();
```

```ts
// Calculate Z-scores for 'salary' by 'department'
await table.zScore("salary", "salaryZScore", { by: "department" }).log();
```

```ts
// Calculate Z-scores for 'score', rounded to 2 decimal places
await table.zScore("score", "scoreZScore", { decimals: 2 }).log();
```

#### `normalize`

Normalizes the values in a column using min-max normalization.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
normalize(column: string, newColumn: string, options?: { by?: string | string[]; decimals?: number; range?: [number, number] }): this;
```

##### Parameters

- **`column`**: The name of the column in which values will be normalized.
- **`newColumn`**: The name of the new column where normalized values will be
  stored.
- **`options`**: An optional object with configuration options:
- **`options.by`**: The column name or an array of column names to partition by.
  Normalization is performed independently within each group.
- **`options.decimals`**: The number of decimal places to round the normalized
  values. Defaults to `undefined` (no rounding).
- **`options.range`**: The inclusive range to scale normalized values to, as
  `[minimum, maximum]`. Both values must be finite and the minimum must be less
  than the maximum. Defaults to `[0, 1]`.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Normalize the values in 'column1' and store them in a new 'normalizedColumn1' column
await table.normalize("column1", "normalizedColumn1").log();
```

```ts
// Normalize 'value' by 'group'
await table.normalize("value", "normalizedValue", { by: "group" }).log();
```

```ts
// Normalize 'data' values, rounded to 2 decimal places
await table.normalize("data", "normalizedData", { decimals: 2 }).log();
```

```ts
// Normalize 'score' values to a range from 0 to 10
await table.normalize("score", "scaledScore", { range: [0, 10] }).log();
```

#### `indexValues`

Indexes a numeric column by dividing each value by a reference value and
multiplying the result by a base value.

The reference can be calculated from the indexed column with a statistic, read
from exactly one row selected by another column's value, or read from the unique
row where another column reaches its minimum or maximum. With `options.by`,
references are calculated or selected independently within each group. Null
values in the indexed column remain null when their group has a valid reference.
The operation throws when a group has no unique selected row or its reference
value is null or zero.

Exact temporal references are compared at their full DuckDB precision.
JavaScript `Date` objects only have millisecond precision and always represent
an instant. Construct them with an explicit timezone, such as
`new Date("2001-01-01T00:00:00Z")`; date-time strings without `Z` or an offset
use the user's local timezone.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
indexValues(column: string, newColumn: string, reference: { stat: "min" | "max" | "mean" | "median"; column?: never; equals?: never; at?: never } | { column: string; equals: string | number | bigint | boolean | Date; stat?: never; at?: never } | { column: string; at: "min" | "max"; stat?: never; equals?: never }, options?: { by?: string | string[]; base?: number; decimals?: number }): this;
```

##### Parameters

- **`column`**: The numeric column containing the values to index.
- **`newColumn`**: The name of the new column where indexed values will be
  stored.
- **`reference`**: A statistic calculated from `column`, a column and exact
  non-null `equals` value selecting a row, or a column and `at` set to `min` or
  `max` selecting its unique extreme row. The selected row's `column` value
  becomes the reference.
- **`reference.stat`**: The statistic used to calculate the reference directly
  from the indexed column.
- **`reference.column`**: The column used to select an exact reference row or
  its unique minimum or maximum row.
- **`reference.equals`**: The non-null value used to select an exact reference
  row. Its JavaScript type must be compatible with the reference column's DuckDB
  type; string, numeric, boolean, and temporal values are not coerced across
  type families. Date values should be constructed with an explicit timezone.
- **`reference.at`**: Selects the unique row where `reference.column` reaches
  its minimum or maximum.
- **`options`**: An optional object with configuration options.
- **`options.by`**: A column name or an array of column names to partition by.
  The reference is calculated independently within each group.
- **`options.base`**: The finite positive value assigned to the reference.
  Defaults to `100`.
- **`options.decimals`**: A finite non-negative integer specifying the number of
  decimal places to retain. By default, values are not rounded.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Index each country's average home price to its January 2001 value.
await table.indexValues(
  "homePrice",
  "homePriceIndexed",
  {
    column: "date",
    equals: new Date("2001-01-01T00:00:00Z"),
  },
  {
    by: "country",
    base: 100,
    decimals: 1,
  },
).log();
```

```ts
// Index each value against the mean of its group.
await table.indexValues("homePrice", "homePriceIndexed", { stat: "mean" }, {
  by: "country",
}).log();
```

```ts
// Index each country's average home price to its earliest value.
// This throws if multiple rows share the earliest date in a country.
await table.indexValues("homePrice", "homePriceIndexed", {
  column: "date",
  at: "min",
}, { by: "country" }).log();
```

#### `updateWithJS`

Updates data in the table using a JavaScript function. The function receives the
existing rows as an array of objects and must return the modified rows as an
array of objects. This method offers high flexibility for data manipulation but
can be slow for large tables as it involves transferring data between DuckDB and
JavaScript. This method does not work with tables containing geometries.

This method queues the update; the dataModifier function runs when an async
observer method (like `getData()` or `log()`) is awaited, or when `run()` is
called.

##### Signature

```typescript
updateWithJS(dataModifier: ((rows: Record<string, unknown>[]) => Promise<Record<string, unknown>[]>) | ((rows: Record<string, unknown>[]) => Record<string, unknown>[]), options?: { batchSize?: number }): this;
```

##### Parameters

- **`dataModifier`**: A synchronous or asynchronous function that takes the
  existing rows (as an array of objects) and returns the modified rows (as an
  array of objects).
- **`options`**: An optional object with configuration options:
- **`options.batchSize`**: If provided, rows are processed in batches of this
  size instead of all at once, so large tables don't have to be materialized
  entirely in memory. The modifier function is called once per batch.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Count words correctly across multilingual article text.
const segmenter = new Intl.Segmenter(undefined, { granularity: "word" });
const table = await sdb
  .newTable()
  .loadData("articles.csv")
  .updateWithJS((rows) => {
    return rows.map((row) => ({
      ...row,
      wordCount: typeof row.text === "string"
        ? [...segmenter.segment(row.text)].filter((part) => part.isWordLike)
          .length
        : null,
    }));
  })
  .log();
```

```ts
// Enrich reviews with scores from an external service, 100 at a time.
const reviews = await table
  .updateWithJS(async (rows) => {
    const response = await fetch("https://api.example.com/score", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(rows.map((row) => row.review)),
    });
    const scores = await response.json() as number[];
    return rows.map((row, index) => ({ ...row, score: scores[index] }));
  }, { batchSize: 100 })
  .log();
```

#### `getSchema`

Returns the schema of the table, including column names and their data types.

##### Signature

```typescript
async getSchema(): Promise<Record<string, string | null>[]>;
```

##### Returns

A promise that resolves to an array of objects, where each object represents a
column with its name and data type.

##### Examples

```ts
// Get the schema of the table
const schema = await table.getSchema();
console.table(schema); // Log the schema in a readable table format
```

#### `getDescription`

Returns descriptive statistical information about the columns, including details
like data types, number of null values, and distinct values.

##### Signature

```typescript
async getDescription(): Promise<Record<string, unknown>[]>;
```

##### Returns

A promise that resolves to an array of objects, each representing descriptive
statistics for a column.

##### Examples

```ts
// Get and log descriptive information about the table's columns
const description = await table.getDescription();
console.table(description);
```

#### `getName`

Returns the name of the table.

##### Signature

```typescript
getName(): string;
```

##### Returns

The name of the table as a string.

##### Examples

```ts
// Get the table name
const tableName = table.getName();
console.log(tableName); // e.g., "employees"
```

#### `getColumns`

Returns a list of all column names in the table.

##### Signature

```typescript
async getColumns(): Promise<string[]>;
```

##### Returns

A promise that resolves to an array of strings, where each string is a column
name.

##### Examples

```ts
// Get all column names from the table
const columns = await table.getColumns();
console.log(columns); // e.g., ["id", "name", "age"]
```

#### `normalizeString`

Normalizes string values in a column by:

1. Stripping accents
2. Optionally stripping punctuation (default: true)
3. Converting to lowercase
4. Normalizing whitespace (multiple spaces/tabs/newlines → single space)
5. Trimming leading/trailing whitespace

Produces identical output to `journalism-format`'s `normalizeString()` function
for all common cases including accented Latin characters.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
normalizeString(column: string, newColumn: string, options?: { stripPunctuation?: boolean }): this;
```

##### Parameters

- **`column`**: The column containing the text to normalize
- **`newColumn`**: The column to store the normalized results
- **`options`**: Configuration options
- **`options.stripPunctuation`**: Strip punctuation and underscores (default:
  true)

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Normalize text column and store in new column
await table.normalizeString("recipeName", "recipeNameNormalized").log();
// "Épicerie Parisienne!" → "epicerie parisienne"
```

```ts
// Keep punctuation for emails and URLs
await table.normalizeString("email", "emailNormalized", {
  stripPunctuation: false,
}).log();
// "User@Example.com" → "user@example.com"
await table.normalizeString("url", "urlNormalized", { stripPunctuation: false })
  .log();
// "https://Example.com/path" → "https://example.com/path"
```

#### `getColumnCount`

Returns the number of columns in the table.

##### Signature

```typescript
async getColumnCount(): Promise<number>;
```

##### Returns

A promise that resolves to a number representing the total count of columns.

##### Examples

```ts
// Get the number of columns in the table
const columnCount = await table.getColumnCount();
console.log(columnCount); // e.g., 3
```

#### `getCharacterCount`

Returns the total number of characters in a column storing strings.

##### Signature

```typescript
async getCharacterCount(column: string): Promise<number>;
```

##### Parameters

- **`column`**: The name of the string column to count characters from.

##### Returns

A promise that resolves to the total number of characters across all rows in the
specified column.

##### Examples

```ts
// Get the total number of characters in the 'name' column
const totalChars = await table.getCharacterCount("name");
console.log(totalChars); // e.g., 523
```

#### `getRowCount`

Returns the number of rows in the table.

##### Signature

```typescript
async getRowCount(options?: { conditions?: string }): Promise<number>;
```

##### Parameters

- **`options`**: An optional object with configuration options:
- **`options.conditions`**: The filtering conditions specified as a SQL `WHERE`
  clause (e.g., `"category = 'Book'"`).

##### Returns

A promise that resolves to a number representing the total count of rows.

##### Examples

```ts
// Get the number of rows in the table
const rowCount = await table.getRowCount();
console.log(rowCount); // e.g., 100
```

```ts
// Get the number of rows where 'category' is 'Book'
const bookCount = await table.getRowCount({ conditions: "category = 'Book'" });
console.log(bookCount);
```

#### `getValueCount`

Returns the total number of values in the table (number of columns multiplied by
the number of rows).

##### Signature

```typescript
async getValueCount(): Promise<number>;
```

##### Returns

A promise that resolves to a number representing the total count of values.

##### Examples

```ts
// Get the total number of values in the table
const valueCount = await table.getValueCount();
console.log(valueCount); // e.g., 300 (if 3 columns and 100 rows)
```

#### `getTypes`

Returns the data types of all columns in the table.

##### Signature

```typescript
async getTypes(): Promise<Record<string, string>>;
```

##### Returns

A promise that resolves to an object where keys are column names and values are
their corresponding data types (e.g., `{ "id": "BIGINT", "name": "VARCHAR" }`).

##### Examples

```ts
// Get the data types of all columns
const dataTypes = await table.getTypes();
console.log(dataTypes);
```

#### `getHash`

Returns a deterministic hash of the table's ordered schema and contents. Pending
operations are executed before the hash is calculated. Computing the hash scans
the complete table inside DuckDB without transferring its rows to JavaScript.

##### Signature

```typescript
async getHash(): Promise<string>;
```

##### Returns

A promise that resolves to a SHA-256 hash string.

##### Examples

```ts
const hash = await table.getHash();
console.log(hash); // e.g., "8f14e45fceea..."
```

#### `getValues`

Returns all values from a specific column. Temporal values use the same
JavaScript representations as `getData()`.

##### Signature

```typescript
async getValues(column: string): Promise<unknown[]>;
```

##### Parameters

- **`column`**: The name of the column from which to retrieve values.

##### Returns

A promise that resolves to an array containing all values from the specified
column.

##### Examples

```ts
// Get all values from the 'productName' column
const productNames = await table.getValues("productName");
console.log(productNames); // e.g., ["Laptop", "Mouse", "Keyboard"]
```

#### `getMin`

Returns the minimum value from a specific column. Temporal values use the same
JavaScript representations as `getData()`.

##### Signature

```typescript
async getMin(column: string): Promise<unknown>;
```

##### Parameters

- **`column`**: The name of the column from which to retrieve the minimum value.

##### Returns

A promise that resolves to the minimum value of the specified column.

##### Examples

```ts
// Get the minimum value from the 'price' column
const minPrice = await table.getMin("price");
console.log(minPrice); // e.g., 10.50
```

#### `getMax`

Returns the maximum value from a specific column. Temporal values use the same
JavaScript representations as `getData()`.

##### Signature

```typescript
async getMax(column: string): Promise<unknown>;
```

##### Parameters

- **`column`**: The name of the column from which to retrieve the maximum value.

##### Returns

A promise that resolves to the maximum value of the specified column.

##### Examples

```ts
// Get the maximum value from the 'price' column
const maxPrice = await table.getMax("price");
console.log(maxPrice); // e.g., 99.99
```

#### `getExtent`

Returns the extent (minimum and maximum values) of a specific column as an
array. Temporal values use the same JavaScript representations as `getData()`.

##### Signature

```typescript
async getExtent(column: string): Promise<[unknown, unknown]>;
```

##### Parameters

- **`column`**: The name of the column from which to retrieve the extent.

##### Returns

A promise that resolves to an array `[min, max]` containing the minimum and
maximum values of the specified column.

##### Examples

```ts
// Get the extent of the 'temperature' column
const tempExtent = await table.getExtent("temperature");
console.log(tempExtent); // e.g., [15.2, 30.1]
```

#### `getMean`

Returns the mean (average) value from a specific numeric column.

##### Signature

```typescript
async getMean(column: string, options?: { decimals?: number }): Promise<number>;
```

##### Parameters

- **`column`**: The name of the numeric column from which to retrieve the mean
  value.
- **`options`**: An optional object with configuration options:
- **`options.decimals`**: The number of decimal places to round the result to.
  Defaults to `undefined` (no rounding).

##### Returns

A promise that resolves to the mean value of the specified column.

##### Examples

```ts
// Get the mean of the 'age' column
const meanAge = await table.getMean("age");
console.log(meanAge); // e.g., 35.75
```

```ts
// Get the mean of the 'salary' column, rounded to 2 decimal places
const meanSalary = await table.getMean("salary", { decimals: 2 });
console.log(meanSalary); // e.g., 55000.23
```

#### `getMedian`

Returns the median value from a specific numeric column.

##### Signature

```typescript
async getMedian(column: string, options?: { decimals?: number }): Promise<number>;
```

##### Parameters

- **`column`**: The name of the numeric column from which to retrieve the median
  value.
- **`options`**: An optional object with configuration options:
- **`options.decimals`**: The number of decimal places to round the result to.
  Defaults to `undefined` (no rounding).

##### Returns

A promise that resolves to the median value of the specified column.

##### Examples

```ts
// Get the median of the 'age' column
const medianAge = await table.getMedian("age");
console.log(medianAge); // e.g., 30
```

```ts
// Get the median of the 'salary' column, rounded to 2 decimal places
const medianSalary = await table.getMedian("salary", { decimals: 2 });
console.log(medianSalary); // e.g., 50000.00
```

#### `getSum`

Returns the sum of values from a specific numeric column.

##### Signature

```typescript
async getSum(column: string): Promise<number>;
```

##### Parameters

- **`column`**: The name of the numeric column from which to retrieve the sum.

##### Returns

A promise that resolves to the sum of values in the specified column.

##### Examples

```ts
// Get the sum of the 'quantity' column
const totalQuantity = await table.getSum("quantity");
console.log(totalQuantity); // e.g., 1250
```

#### `getSkew`

Returns the skewness of values from a specific numeric column.

##### Signature

```typescript
async getSkew(column: string, options?: { decimals?: number }): Promise<number>;
```

##### Parameters

- **`column`**: The name of the numeric column from which to retrieve the
  skewness.
- **`options`**: An optional object with configuration options:
- **`options.decimals`**: The number of decimal places to round the result to.
  Defaults to `undefined` (no rounding).

##### Returns

A promise that resolves to the skewness value of the specified column.

##### Examples

```ts
// Get the skewness of the 'data' column
const dataSkew = await table.getSkew("data");
console.log(dataSkew); // e.g., 0.5
```

```ts
// Get the skewness of the 'values' column, rounded to 2 decimal places
const valuesSkew = await table.getSkew("values", { decimals: 2 });
console.log(valuesSkew); // e.g., -0.25
```

#### `getStdDev`

Returns the standard deviation of values from a specific numeric column.

##### Signature

```typescript
async getStdDev(column: string, options?: { decimals?: number }): Promise<number>;
```

##### Parameters

- **`column`**: The name of the numeric column from which to retrieve the
  standard deviation.
- **`options`**: An optional object with configuration options:
- **`options.decimals`**: The number of decimal places to round the result to.
  Defaults to `undefined` (no rounding).

##### Returns

A promise that resolves to the standard deviation value of the specified column.

##### Examples

```ts
// Get the standard deviation of the 'height' column
const heightStdDev = await table.getStdDev("height");
console.log(heightStdDev); // e.g., 5.2
```

```ts
// Get the standard deviation of the 'score' column, rounded to 3 decimal places
const scoreStdDev = await table.getStdDev("score", { decimals: 3 });
console.log(scoreStdDev); // e.g., 12.345
```

#### `getVariance`

Returns the variance of values from a specific numeric column.

##### Signature

```typescript
async getVariance(column: string, options?: { decimals?: number }): Promise<number>;
```

##### Parameters

- **`column`**: The name of the numeric column from which to retrieve the
  variance.
- **`options`**: An optional object with configuration options:
- **`options.decimals`**: The number of decimal places to round the result to.
  Defaults to `undefined` (no rounding).

##### Returns

A promise that resolves to the variance value of the specified column.

##### Examples

```ts
// Get the variance of the 'data' column
const dataVariance = await table.getVariance("data");
console.log(dataVariance); // e.g., 25.5
```

```ts
// Get the variance of the 'values' column, rounded to 2 decimal places
const valuesVariance = await table.getVariance("values", { decimals: 2 });
console.log(valuesVariance); // e.g., 10.23
```

#### `getQuantile`

Returns the value of a specific quantile from the values in a given numeric
column.

##### Signature

```typescript
async getQuantile(column: string, quantile: number, options?: { decimals?: number }): Promise<number>;
```

##### Parameters

- **`column`**: The name of the numeric column from which to calculate the
  quantile.
- **`quantile`**: The quantile to calculate, expressed as a number between 0 and
  1 (e.g., `0.25` for the first quartile, `0.5` for the median, `0.75` for the
  third quartile).
- **`options`**: An optional object with configuration options:
- **`options.decimals`**: The number of decimal places to round the result to.
  Defaults to `undefined` (no rounding).

##### Returns

A promise that resolves to the quantile value of the specified column.

##### Examples

```ts
// Get the first quartile (25th percentile) of 'column1'
const firstQuartile = await table.getQuantile("column1", 0.25);
console.log(firstQuartile); // e.g., 15.7
```

```ts
// Get the 90th percentile of 'score' values, rounded to 2 decimal places
const ninetiethPercentile = await table.getQuantile("score", 0.9, {
  decimals: 2,
});
console.log(ninetiethPercentile); // e.g., 88.55
```

#### `getUniques`

Returns unique values from a specific column. The values are returned in
ascending order. Temporal values use the same JavaScript representations as
`getData()`.

##### Signature

```typescript
async getUniques(column: string): Promise<unknown[]>;
```

##### Parameters

- **`column`**: The name of the column from which to retrieve unique values.

##### Returns

A promise that resolves to an array containing the unique values from the
specified column, sorted in ascending order.

##### Examples

```ts
// Get unique values from the 'category' column
const uniqueCategories = await table.getUniques("category");
console.log(uniqueCategories); // e.g., ["Books", "Clothing", "Electronics"]
```

#### `getFirstRow`

Returns the first row of the table, optionally filtered by SQL conditions. You
can also use JavaScript syntax for conditions (e.g., `&&`, `||`, `===`, `!==`).
Temporal values use the same JavaScript representations as `getData()`.

##### Signature

```typescript
async getFirstRow(options?: { conditions?: string }): Promise<Record<string, unknown> | null>;
```

##### Parameters

- **`options`**: An optional object with configuration options:
- **`options.conditions`**: The filtering conditions specified as a SQL `WHERE`
  clause (e.g., `"category = 'Book'"`).

##### Returns

A promise that resolves to an object representing the first row, or `null` if no
rows match the conditions.

##### Examples

```ts
// Get the very first row of the table
const firstRow = await table.getFirstRow();
console.log(firstRow);
```

```ts
// Get the first row where the 'category' is 'Book'
const firstRowBooks = await table.getFirstRow({
  conditions: `category === 'Book'`,
}); // Using JS syntax
console.log(firstRowBooks);
```

#### `getLastRow`

Returns the last row of the table, optionally filtered by SQL conditions. You
can also use JavaScript syntax for conditions (e.g., `&&`, `||`, `===`, `!==`).
Temporal values use the same JavaScript representations as `getData()`.

##### Signature

```typescript
async getLastRow(options?: { conditions?: string }): Promise<Record<string, unknown> | null>;
```

##### Parameters

- **`options`**: An optional object with configuration options:
- **`options.conditions`**: The filtering conditions specified as a SQL `WHERE`
  clause (e.g., `"category = 'Book'"`).

##### Returns

A promise that resolves to an object representing the last row, or `null` if no
rows match the conditions.

##### Examples

```ts
// Get the very last row of the table
const lastRow = await table.getLastRow();
console.log(lastRow);
```

```ts
// Get the last row where the 'category' is 'Book'
const lastRowBooks = await table.getLastRow({
  conditions: `category === 'Book'`,
}); // Using JS syntax
console.log(lastRowBooks);
```

#### `getTop`

Returns the top `n` rows of the table, optionally filtered by SQL conditions.
You can also use JavaScript syntax for conditions (e.g., `&&`, `||`, `===`,
`!==`). Temporal values use the same JavaScript representations as `getData()`.

##### Signature

```typescript
async getTop(count: number, options?: { conditions?: string }): Promise<Record<string, unknown>[]>;
```

##### Parameters

- **`count`**: The number of rows to return from the top of the table.
- **`options`**: An optional object with configuration options:
- **`options.conditions`**: The filtering conditions specified as a SQL `WHERE`
  clause (e.g., `"category = 'Books'"`).

##### Returns

A promise that resolves to an array of objects representing the top `n` rows.

##### Examples

```ts
// Get the first 10 rows of the table
const top10 = await table.getTop(10);
console.log(top10);
```

```ts
// Get the first 5 rows where the 'category' is 'Books'
const top5Books = await table.getTop(5, { conditions: `category === 'Books'` }); // Using JS syntax
console.log(top5Books);
```

#### `getBottom`

Returns the bottom `n` rows of the table, optionally filtered by SQL conditions.
By default, the last row will be returned first. To preserve the original order,
use the `originalOrder` option. You can also use JavaScript syntax for
conditions (e.g., `&&`, `||`, `===`, `!==`). Temporal values use the same
JavaScript representations as `getData()`.

##### Signature

```typescript
async getBottom(count: number, options?: { originalOrder?: boolean; conditions?: string }): Promise<Record<string, unknown>[]>;
```

##### Parameters

- **`count`**: The number of rows to return from the bottom of the table.
- **`options`**: An optional object with configuration options:
- **`options.originalOrder`**: A boolean indicating whether the rows should be
  returned in their original order (`true`) or in reverse order (last row first,
  `false`). Defaults to `false`.
- **`options.conditions`**: The filtering conditions specified as a SQL `WHERE`
  clause (e.g., `"category = 'Books'"`).

##### Returns

A promise that resolves to an array of objects representing the bottom `n` rows.

##### Examples

```ts
// Get the last 10 rows (last row first)
const bottom10 = await table.getBottom(10);
console.log(bottom10);
```

```ts
// Get the last 10 rows in their original order
const bottom10OriginalOrder = await table.getBottom(10, {
  originalOrder: true,
});
console.log(bottom10OriginalOrder);
```

```ts
// Get the last 5 rows where the 'category' is 'Books' (using JS syntax)
const bottom5Books = await table.getBottom(5, {
  conditions: `category === 'Books'`,
});
console.log(bottom5Books);
```

#### `getRow`

Returns a single row that matches the specified conditions. If no row matches or
if more than one row matches, an error is thrown by default. You can also use
JavaScript syntax for conditions (e.g., `AND`, `||`, `===`, `!==`). Temporal
values use the same JavaScript representations as `getData()`.

##### Signature

```typescript
async getRow(conditions: string, options?: { strict?: boolean }): Promise<Record<string, unknown> | null>;
```

##### Parameters

- **`conditions`**: The conditions to match, specified as a SQL `WHERE` clause.
- **`options`**: Optional settings:
- **`options.strict`**: If `false`, no error will be thrown when no row or more
  than one row match the condition. With no match, `null` is returned; with
  multiple matches, the first row is returned. Defaults to `true`.

##### Returns

A promise that resolves to an object representing the matched row, or `null` if
`strict` is `false` and no row matches.

##### Throws

- **`Error`**: If `strict` is `true` and no row or more than one row matches the
  conditions.

##### Examples

```ts
// Get a row where 'name' is 'John'
const johnsRow = await table.getRow(`name = 'John'`);
console.log(johnsRow);
```

```ts
// Get a row where 'id' is 123 (using JS syntax)
const rowById = await table.getRow(`id === 123`);
console.log(rowById);
```

```ts
// Get a row without throwing an error if multiple matches or no match
const flexibleRow = await table.getRow(`status = 'pending'`, { strict: false });
console.log(flexibleRow);
```

#### `getData`

Returns the data from the table as an array of objects, optionally filtered by
SQL conditions. You can also use JavaScript syntax for conditions (e.g., `&&`,
`||`, `===`, `!==`).

Top-level DuckDB `DATE` and `TIMESTAMP` columns are returned as JavaScript
`Date` objects interpreted in UTC. `TIMESTAMP WITH TIME ZONE` values are
returned as UTC strings, preserving DuckDB's microsecond precision; JavaScript
`Date` supports only milliseconds.

##### Signature

```typescript
async getData(options?: { columns?: string | string[]; conditions?: string; limit?: number }): Promise<Record<string, unknown>[]>;
```

##### Parameters

- **`options`**: An optional object with configuration options:
- **`options.columns`**: An array of column names to include in the result. If
  omitted, all columns will be included.
- **`options.conditions`**: The filtering conditions specified as a SQL `WHERE`
  clause (e.g., `"category = 'Book'"`).
- **`options.limit`**: The maximum number of rows to return. Must be an integer
  greater than or equal to `0`.

##### Returns

A promise that resolves to an array of objects, where each object represents a
row in the table.

##### Examples

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
const booksData = await table.getData({
  columns: ["title", "author"],
  conditions: `category === 'Book'`,
});
console.log(booksData);
```

```ts
// Return at most two rows.
const preview = await table.getData({ limit: 2 });
```

#### `stream`

Streams the table rows one by one as an async iterator, without materializing
the whole table in memory. Values are converted to JavaScript types the same way
as `getData()`.

The underlying DuckDB result is streamed chunk by chunk, so tables larger than
the available memory can be iterated. Avoid running other queries on the same
database while iterating.

##### Signature

```typescript
stream(options?: { columns?: string | string[]; conditions?: string }): AsyncGenerator<Record<string, unknown>, void, undefined>;
```

##### Parameters

- **`options`**: An optional object with configuration options:
- **`options.columns`**: The column name or an array of column names to include.
  If omitted, all columns are streamed.
- **`options.conditions`**: A SQL `WHERE` clause condition to filter the rows.

##### Returns

An async generator yielding one row object at a time.

##### Examples

```ts
// Stream all rows
for await (const row of table.stream()) {
  console.log(row);
}
```

```ts
// Stream specific columns and rows
for await (
  const row of table.stream({
    columns: "temperature",
    conditions: `temperature > 20`,
  })
) {
  console.log(row);
}
```

#### `getDataAsCSV`

Returns the data from the table as a CSV string, optionally filtered by SQL
conditions. You can also use JavaScript syntax for conditions (e.g., `&&`, `||`,
`===`, `!==`). Temporal values are first converted as they are in `getData()`,
then serialized using UTC date and timestamp text.

##### Signature

```typescript
async getDataAsCSV(options?: { columns?: string | string[]; conditions?: string }): Promise<string>;
```

##### Parameters

- **`options`**: An optional object with configuration options:
- **`options.columns`**: An array of column names to include in the CSV. If
  omitted, all columns will be included.
- **`options.conditions`**: The filtering conditions specified as a SQL `WHERE`
  clause (e.g., `"category = 'Book'"`).

##### Returns

A promise that resolves to a CSV-formatted string representation of the table
data.

##### Examples

```ts
// Get all data from the table as CSV
const allDataCSV = await table.getDataAsCSV();
console.log(allDataCSV);
```

```ts
// Get data filtered by a condition (using JS syntax or SQL syntax) as CSV
const booksDataCSV = await table.getDataAsCSV({
  conditions: `category === 'Book'`,
});
console.log(booksDataCSV);
```

```ts
// Get data filtered by a condition and specific columns as CSV
const booksDataCSV = await table.getDataAsCSV({
  columns: ["title", "author"],
  conditions: `category === 'Book'`,
});
console.log(booksDataCSV);
```

#### `createPoints`

Creates point geometries from latitude (y) and longitude (x) columns.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
createPoints(latColumn: string, lonColumn: string, newColumn: string, options?: { projection?: string }): this;
```

##### Parameters

- **`latColumn`**: The name of the column storing the latitude (y-coordinate)
  values.
- **`lonColumn`**: The name of the column storing the longitude (x-coordinate)
  values.
- **`newColumn`**: The name of the new column where the point geometries will be
  stored.
- **`options`**: An optional object with configuration options:
- **`options.projection`**: The projection of the coordinates. Defaults to
  EPSG:4326 (WGS84), passed as `"EPSG:4326"`.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Create point geometries in a new 'geom' column using latitude (y) and longitude (x) columns.
// The resulting coordinates are ordered as [longitude, latitude], or [x, y].
// The projection is assumed to be EPSG:4326 (WGS84).
await table.createPoints("lat", "lon", "geom").log();
```

```ts
// Create point geometries from coordinates in a projected coordinate system
await table.createPoints("y", "x", "geom", { projection: "EPSG:3347" }).log();
```

#### `addGeoValidity`

Adds a column with boolean values indicating the validity of geometries.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
addGeoValidity(newColumn: string, options?: { column?: string }): this;
```

##### Parameters

- **`newColumn`**: The name of the new column where the boolean results (`TRUE`
  for valid, `FALSE` for invalid) will be stored.
- **`options`**: An optional object with configuration options:
- **`options.column`**: The name of the column storing the geometries to be
  checked. If omitted, the method will automatically attempt to find a geometry
  column.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Check if geometries are valid and store results in a new 'isValid' column
// The method will automatically detect the geometry column.
await table.addGeoValidity("isValid").log();
```

```ts
// Check validity of geometries in a specific column named 'myGeom'
await table.addGeoValidity("isValidMyGeom", { column: "myGeom" }).log();
```

#### `addVertexCount`

Adds a column with the number of vertices (points) in each geometry.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
addVertexCount(newColumn: string, options?: { column?: string }): this;
```

##### Parameters

- **`newColumn`**: The name of the new column where the vertex counts will be
  stored.
- **`options`**: An optional object with configuration options:
- **`options.column`**: The name of the column storing the geometries. If
  omitted, the method will automatically attempt to find a geometry column.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Add a new column 'vertexCount' with the number of vertices for each geometry
// The method will automatically detect the geometry column.
await table.addVertexCount("vertexCount").log();
```

```ts
// Add vertex counts for geometries in a specific column named 'myGeom'
await table.addVertexCount("myGeomVertices", { column: "myGeom" }).log();
```

#### `fixGeo`

Attempts to make invalid geometries valid without removing any vertices.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
fixGeo(column?: string): this;
```

##### Parameters

- **`column`**: The name of the column storing the geometries to be fixed. If
  omitted, the method will automatically attempt to find a geometry column.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Fix invalid geometries in the default geometry column
await table.fixGeo().log();
```

```ts
// Fix invalid geometries in a specific column named 'myGeom'
await table.fixGeo("myGeom").log();
```

#### `addGeoClosedStatus`

Adds a column with boolean values indicating whether geometries are closed
(e.g., polygons) or open (e.g., linestrings).

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
addGeoClosedStatus(newColumn: string, options?: { column?: string }): this;
```

##### Parameters

- **`newColumn`**: The name of the new column where the boolean results (`TRUE`
  for closed, `FALSE` for open) will be stored.
- **`options`**: An optional object with configuration options:
- **`options.column`**: The name of the column storing the geometries. If
  omitted, the method will automatically attempt to find a geometry column.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Check if geometries are closed and store results in a new 'isClosed' column
await table.addGeoClosedStatus("isClosed").log();
```

```ts
// Check closed status of geometries in a specific column named 'boundaryGeom'
await table.addGeoClosedStatus("boundaryClosed", { column: "boundaryGeom" })
  .log();
```

#### `addGeoType`

Adds a column with the geometry type (e.g., `"POINT"`, `"LINESTRING"`,
`"POLYGON"`) for each geometry.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
addGeoType(newColumn: string, options?: { column?: string }): this;
```

##### Parameters

- **`newColumn`**: The name of the new column where the geometry types will be
  stored.
- **`options`**: An optional object with configuration options:
- **`options.column`**: The name of the column storing the geometries. If
  omitted, the method will automatically attempt to find a geometry column.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Add a new column 'geometryType' with the type of each geometry
await table.addGeoType("geometryType").log();
```

```ts
// Get the geometry type for geometries in a specific column named 'featureGeom'
await table.addGeoType("featureType", { column: "featureGeom" }).log();
```

#### `flipCoordinates`

Flips the coordinate order of geometries in a specified column (e.g., from
`[longitude (x), latitude (y)]` to `[latitude (y), longitude (x)]` or
vice-versa). **Warning:** This method should be used with caution as it directly
manipulates coordinate order and can affect the accuracy of geospatial
operations if not used correctly.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
flipCoordinates(column?: string): this;
```

##### Parameters

- **`column`**: The name of the column storing the geometries. If omitted, the
  method will automatically attempt to find a geometry column.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Flip coordinates in the default geometry column
await table.flipCoordinates().log();
```

```ts
// Flip coordinates in a specific column named 'myGeom'
await table.flipCoordinates("myGeom").log();
```

#### `reducePrecision`

Reduces the precision of geometries in a specified column to a given number of
decimal places.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
reducePrecision(decimals: number, options?: { column?: string }): this;
```

##### Parameters

- **`decimals`**: The number of decimal places to keep in the coordinates of the
  geometries.
- **`options`**: An optional object with configuration options:
- **`options.column`**: The name of the column storing the geometries. If
  omitted, the method will automatically attempt to find a geometry column.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Reduce the precision of geometries in the default column to 3 decimal places
await table.reducePrecision(3).log();
```

```ts
// Reduce the precision of geometries in a specific column named 'myGeom' to 2 decimal places
await table.reducePrecision(2, { column: "myGeom" }).log();
```

#### `reproject`

Reprojects the geometries in a specified column to another Spatial Reference
System (SRS).

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
reproject(crs: string, options?: { column?: string }): this;
```

##### Parameters

- **`crs`**: The target SRS (e.g., `"EPSG:3347"`, or `"EPSG:4326"` for EPSG:4326
  (WGS84)).
- **`options`**: An optional object with configuration options:
- **`options.column`**: The name of the column storing the geometries. If
  omitted, the method will automatically attempt to find a geometry column.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Reproject geometries in the default column to EPSG:3347 (NAD83/Statistics Canada Lambert)
await table.reproject("EPSG:3347").log();
```

```ts
// Reproject geometries in a specific column named 'myGeom' to EPSG:3347
await table.reproject("EPSG:3347", { column: "myGeom" }).log();
```

#### `area`

Computes the area of geometries in square meters (`"m2"`) or optionally square
kilometers (`"km2"`). The input geometry is assumed to be in EPSG:4326 (WGS84).

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
area(newColumn: string, options?: { unit?: "m2" | "km2"; column?: string; decimals?: number }): this;
```

##### Parameters

- **`newColumn`**: The name of the new column where the computed areas will be
  stored.
- **`options`**: An optional object with configuration options:
- **`options.unit`**: The unit for the computed area: `"m2"` (square meters) or
  `"km2"` (square kilometers). Defaults to `"m2"`.
- **`options.column`**: The name of the column storing the geometries. If
  omitted, the method will automatically attempt to find a geometry column.
- **`options.decimals`**: The number of decimal places to round the computed
  areas. Defaults to `undefined` (no rounding).

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Compute the area of geometries in square meters and store in 'area_m2'
await table.area("area_m2").log();
```

```ts
// Compute the area of geometries in square kilometers and store in 'area_km2'
await table.area("area_km2", { unit: "km2" }).log();
```

```ts
// Compute areas in square kilometers rounded to two decimal places
await table.area("area_km2", { unit: "km2", decimals: 2 }).log();
```

```ts
// Compute the area of geometries in a specific column named 'myGeom'
await table.area("myGeomArea", { column: "myGeom" }).log();
```

#### `length`

Computes the length of line geometries in meters (`"m"`) or optionally
kilometers (`"km"`). The input geometry is assumed to be in EPSG:4326 (WGS84).

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
length(newColumn: string, options?: { unit?: "m" | "km"; column?: string; decimals?: number }): this;
```

##### Parameters

- **`newColumn`**: The name of the new column where the computed lengths will be
  stored.
- **`options`**: An optional object with configuration options:
- **`options.unit`**: The unit for the computed length: `"m"` (meters) or `"km"`
  (kilometers). Defaults to `"m"`.
- **`options.column`**: The name of the column storing the geometries. If
  omitted, the method will automatically attempt to find a geometry column.
- **`options.decimals`**: The number of decimal places to round the computed
  lengths. Defaults to `undefined` (no rounding).

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Compute the length of line geometries in meters and store in 'length_m'
await table.length("length_m").log();
```

```ts
// Compute the length of line geometries in kilometers and store in 'length_km'
await table.length("length_km", { unit: "km" }).log();
```

```ts
// Compute lengths in kilometers rounded to two decimal places
await table.length("length_km", { unit: "km", decimals: 2 }).log();
```

```ts
// Compute the length of geometries in a specific column named 'routeGeom'
await table.length("routeLength", { column: "routeGeom" }).log();
```

#### `perimeter`

Computes the perimeter of polygon geometries in meters (`"m"`) or optionally
kilometers (`"km"`). The input geometry is assumed to be in EPSG:4326 (WGS84).

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
perimeter(newColumn: string, options?: { unit?: "m" | "km"; column?: string; decimals?: number }): this;
```

##### Parameters

- **`newColumn`**: The name of the new column where the computed perimeters will
  be stored.
- **`options`**: An optional object with configuration options:
- **`options.unit`**: The unit for the computed perimeter: `"m"` (meters) or
  `"km"` (kilometers). Defaults to `"m"`.
- **`options.column`**: The name of the column storing the geometries. If
  omitted, the method will automatically attempt to find a geometry column.
- **`options.decimals`**: The number of decimal places to round the computed
  perimeters. Defaults to `undefined` (no rounding).

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Compute the perimeter of polygon geometries in meters and store in 'perimeter_m'
await table.perimeter("perimeter_m").log();
```

```ts
// Compute the perimeter of polygon geometries in kilometers and store in 'perimeter_km'
await table.perimeter("perimeter_km", { unit: "km" }).log();
```

```ts
// Compute perimeters in kilometers rounded to two decimal places
await table.perimeter("perimeter_km", { unit: "km", decimals: 2 }).log();
```

```ts
// Compute the perimeter of geometries in a specific column named 'landParcelGeom'
await table.perimeter("landParcelPerimeter", { column: "landParcelGeom" })
  .log();
```

#### `buffer`

Computes a buffer (a polygon representing a specified distance around a
geometry) for geometries in a specified column. The distance is in the Spatial
Reference System (SRS) unit of the input geometries.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
buffer(newColumn: string, distance: number, options?: { column?: string }): this;
```

##### Parameters

- **`newColumn`**: The name of the new column where the buffered geometries will
  be stored.
- **`distance`**: The distance for the buffer. This value is in the units of the
  geometry's SRS.
- **`options`**: An optional object with configuration options:
- **`options.column`**: The name of the column storing the geometries. If
  omitted, the method will automatically attempt to find a geometry column.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Create a buffer of 1 unit around geometries in the default column, storing results in 'bufferedGeom'
await table.buffer("bufferedGeom", 1).log();
```

```ts
// Create a buffer of 10 units around geometries in a specific column named 'pointsGeom'
await table.buffer("pointsBuffer", 10, { column: "pointsGeom" }).log();
```

#### `joinGeo`

Merges the data of this table (considered the left table) with another table
(the right table) based on a spatial relationship. Note that the order of rows
in the returned data is not guaranteed to be the same as in the original tables.
This operation might create temporary files in a `.tmp` folder; consider adding
`.tmp` to your `.gitignore`. This method queues the operation; it runs when an
async observer method (like `getData()` or `log()`) is awaited, or when `run()`
is called. The join uses the other table's state as of this call: operations
queued on it afterwards run after the join.

##### Signature

```typescript
joinGeo(rightTable: SimpleTable, method: "intersect" | "inside" | "withinDistance", options?: { leftColumn?: string; rightColumn?: string; type?: "inner" | "left" | "right" | "full"; distance?: number; distanceMethod?: "srs" | "haversine" | "spheroid"; excludeLeftGeometry?: boolean; excludeRightGeometry?: boolean; outputTable?: string | boolean }): this;
```

##### Parameters

- **`rightTable`**: The SimpleTable instance to be joined with this table.
- **`method`**: The spatial join method to use: `"intersect"` (geometries
  overlap), `"inside"` (geometries of the left table are entirely within
  geometries of the right table), or `"withinDistance"` (geometries of the left
  table are within a specified distance of geometries in the right table).
- **`options`**: An optional object with configuration options:
- **`options.leftColumn`**: The name of the column storing geometries in the
  left table (this table). If omitted, the method attempts to find one.
- **`options.rightColumn`**: The name of the column storing geometries in the
  right table. If omitted, the method attempts to find one.
- **`options.type`**: The type of join operation to perform: `"inner"`, `"left"`
  (default), `"right"`, or `"full"`. For some types (like `"inside"`), the table
  order is important.
- **`options.distance`**: Required if `method` is `"withinDistance"`. The target
  distance for the spatial join. The unit depends on `distanceMethod`.
- **`options.distanceMethod`**: The method for distance calculations: `"srs"`
  (default, uses the SRS unit), `"haversine"` (uses meters, requires EPSG:4326
  (WGS84) input), or `"spheroid"` (uses meters, requires EPSG:4326 (WGS84)
  input, most accurate but slowest).
- **`options.excludeLeftGeometry`**: Whether to exclude the selected
  `leftColumn` geometry from the result. Defaults to `false`.
- **`options.excludeRightGeometry`**: Whether to exclude the selected
  `rightColumn` geometry from the result. Defaults to `false`.
- **`options.outputTable`**: If `true`, the results will be stored in a new
  table with a generated name. If a string, it will be used as the name for the
  new table. If `false` or omitted, the current table will be overwritten.
  Defaults to `false`.

##### Returns

A table instance containing the spatially joined data (either the current table
or a new table), so methods can be chained.

##### Examples

```ts
// Merge data based on intersecting geometries, overwriting tableA
await tableA.joinGeo(tableB, "intersect").log();
```

```ts
// Merge data where geometries in tableA are inside geometries in tableB
await tableA.joinGeo(tableB, "inside").log();
```

```ts
// Join using both geometries without copying them into the result
await tableA.joinGeo(tableB, "intersect", {
  excludeLeftGeometry: true,
  excludeRightGeometry: true,
}).log();
```

```ts
// Merge data where geometries in tableA are within 10 units (SRS) of geometries in tableB
await tableA.joinGeo(tableB, "withinDistance", { distance: 10 }).log();
```

```ts
// Merge data where geometries in tableA are within 10 kilometers (Haversine) of geometries in tableB
// Input geometries must be in EPSG:4326 (WGS84).
await tableA.joinGeo(tableB, "withinDistance", {
  distance: 10,
  distanceMethod: "haversine",
  unit: "km",
}).log();
```

```ts
// Merge data with specific geometry columns and an inner join type, storing results in a new table
const tableC = await tableA.joinGeo(tableB, "intersect", {
  leftColumn: "geometriesA",
  rightColumn: "geometriesB",
  type: "inner",
  outputTable: true,
}).log();
```

#### `intersection`

Computes the intersection of two sets of geometries, creating new geometries
where they overlap.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
intersection(column1: string, column2: string, newColumn: string): this;
```

##### Parameters

- **`column1`**: The name of the first column storing geometries.
- **`column2`**: The name of the second column storing geometries. Both columns
  must have the same projection.
- **`newColumn`**: The name of the new column where the computed intersection
  geometries will be stored.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Compute the intersection of geometries in 'geomA' and 'geomB' columns, storing results in 'intersectGeom'
await table.intersection("geomA", "geomB", "intersectGeom").log();
```

#### `difference`

Computes the geometric difference between two geometries, returning the portion
of the first geometry that does not intersect the second.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
difference(column1: string, column2: string, newColumn: string): this;
```

##### Parameters

- **`column1`**: The name of the column storing the geometries from which the
  second geometries will be subtracted.
- **`column2`**: The name of the column storing the geometries to subtract. Both
  columns must have the same projection.
- **`newColumn`**: The name of the new column where the geometric differences
  will be stored.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Subtract 'geomB' from 'geomA', storing the result in 'geomA_minus_geomB'
await table.difference("geomA", "geomB", "geomA_minus_geomB").log();
```

#### `fillHoles`

Fills holes in polygon geometries.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
fillHoles(column?: string): this;
```

##### Parameters

- **`column`**: The name of the column storing the geometries. If omitted, the
  method will automatically attempt to find a geometry column.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Fill holes in geometries in the default geometry column
await table.fillHoles().log();
```

```ts
// Fill holes in geometries in a specific column named 'polygonGeom'
await table.fillHoles("polygonGeom").log();
```

#### `intersects`

Returns `TRUE` if two geometries intersect (overlap in any way), and `FALSE`
otherwise.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
intersects(column1: string, column2: string, newColumn: string): this;
```

##### Parameters

- **`column1`**: The name of the first column storing geometries.
- **`column2`**: The name of the second column storing geometries. Both columns
  must have the same projection.
- **`newColumn`**: The name of the new column where the boolean results (`TRUE`
  for intersection, `FALSE` otherwise) will be stored.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Check if geometries in 'geomA' and 'geomB' intersect, storing results in 'doIntersect'
await table.intersects("geomA", "geomB", "doIntersect").log();
```

#### `coveredBy`

Returns `TRUE` if every point of a geometry in `column` is covered by a geometry
in `containerColumn`, including their boundaries, and `FALSE` otherwise.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
coveredBy(column: string, containerColumn: string, newColumn: string): this;
```

##### Parameters

- **`column`**: The name of the column storing the geometries to be tested for
  containment.
- **`containerColumn`**: The name of the column storing the geometries to be
  tested as containers. Both columns must have the same projection.
- **`newColumn`**: The name of the new column where the boolean results (`TRUE`
  when covered, `FALSE` otherwise) will be stored.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Check if geometries in 'pointGeom' are covered by 'polygonGeom', storing results in 'isCovered'
await table.coveredBy("pointGeom", "polygonGeom", "isCovered").log();
```

#### `union`

Computes the union of two geometries, creating a new geometry that represents
the merged area of both.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
union(column1: string, column2: string, newColumn: string): this;
```

##### Parameters

- **`column1`**: The name of the first column storing geometries.
- **`column2`**: The name of the second column storing geometries. Both columns
  must have the same projection.
- **`newColumn`**: The name of the new column where the computed union
  geometries will be stored.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Compute the union of geometries in 'geomA' and 'geomB', storing results in 'unionGeom'
await table.union("geomA", "geomB", "unionGeom").log();
```

#### `extractLatLon`

Extracts the latitude (y) and longitude (x) coordinates from point geometries.
The input geometry is assumed to be in EPSG:4326 (WGS84).

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
extractLatLon(column: string, latColumn: string, lonColumn: string): this;
```

##### Parameters

- **`column`**: The name of the column storing the point geometries.
- **`latColumn`**: The name of the new column where the extracted latitude
  (y-coordinate) values will be stored.
- **`lonColumn`**: The name of the new column where the extracted longitude
  (x-coordinate) values will be stored.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Extract latitude (y) and longitude (x) from 'geom' into new 'lat' and 'lon' columns.
await table.extractLatLon("geom", "lat", "lon").log();
```

#### `simplify`

Simplifies geometries while preserving their overall coverage. A higher
tolerance results in more significant simplification.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
simplify(tolerance: number, options?: { column?: string; simplifyBoundary?: boolean }): this;
```

##### Parameters

- **`tolerance`**: A numeric value representing the simplification tolerance. A
  higher value leads to greater simplification.
- **`options`**: An optional object with configuration options:
- **`options.column`**: The name of the column storing the geometries. If
  omitted, the method will automatically attempt to find a geometry column.
- **`options.simplifyBoundary`**: If `true` (default), the boundary of the
  geometries will also be simplified. If `false`, only the interior of the
  geometries will be simplified, preserving the original boundary.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Simplify geometries in the default column with a tolerance of 0.1
await table.simplify(0.1).log();
```

```ts
// Simplify geometries in 'myGeom' column, preserving the boundary
await table.simplify(0.05, { column: "myGeom", simplifyBoundary: false }).log();
```

#### `centroid`

Computes the centroid of geometries. The values are returned in the SRS unit of
the input geometries.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
centroid(newColumn: string, options?: { column?: string }): this;
```

##### Parameters

- **`newColumn`**: The name of the new column where the computed centroid
  geometries will be stored.
- **`options`**: An optional object with configuration options:
- **`options.column`**: The name of the column storing the geometries. If
  omitted, the method will automatically attempt to find a geometry column.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Compute the centroid of geometries in the default column, storing results in 'centerPoint'
await table.centroid("centerPoint").log();
```

```ts
// Compute the centroid of geometries in a specific column named 'areaGeom'
await table.centroid("areaCentroid", { column: "areaGeom" }).log();
```

#### `randomPoint`

Generates a random point within the geometries of a specified column.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
randomPoint(newColumn: string, tries: number, options?: { column?: string; strict?: boolean }): this;
```

##### Parameters

- **`newColumn`**: The name of the new column where the random points will be
  stored.
- **`tries`**: The number of points to generate within the bounding box of each
  geometry to find one that is within the geometry itself.
- **`options`**: An optional object with configuration options:
- **`options.column`**: The name of the column storing the geometries within
  which the random points will be generated. If omitted, the method will
  automatically attempt to find a geometry column.
- **`options.strict`**: If `false`, the method will not throw an error if some
  points cannot be generated. Corresponding rows will have `NULL` in the new
  column. Defaults to `true`.

##### Examples

```ts
// Generate a random point for each geometry in the default column, trying 100 points
await table.randomPoint("randomPoint", 100).log();
```

```ts
// Generate a random point for each geometry in a specific column named 'areaGeom', trying 50 points
await table.randomPoint("pointInArea", 50, { column: "areaGeom" }).log();
```

```ts
// Generate a random point for each geometry, but don't throw if some points cannot be generated
await table.randomPoint("pointInArea", 1, { strict: false }).log();
```

#### `distance`

Computes the distance between geometries in two specified columns. By default,
the distance is calculated in the Spatial Reference System (SRS) unit of the
input geometries. You can optionally specify `"spheroid"` or `"haversine"`
methods to get results in meters or kilometers. If using `"spheroid"` or
`"haversine"`, the input geometries must be in EPSG:4326 (WGS84).

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
distance(column1: string, column2: string, newColumn: string, options?: { unit?: "m" | "km"; method?: "srs" | "haversine" | "spheroid"; decimals?: number }): this;
```

##### Parameters

- **`column1`**: The name of the first column storing geometries.
- **`column2`**: The name of the second column storing geometries.
- **`newColumn`**: The name of the new column where the computed distances will
  be stored.
- **`options`**: An optional object with configuration options:
- **`options.method`**: The method to use for distance calculations: `"srs"`
  (default, uses SRS unit), `"haversine"` (meters, requires EPSG:4326 (WGS84)),
  or `"spheroid"` (meters, requires EPSG:4326 (WGS84), most accurate but
  slowest).
- **`options.unit`**: If `method` is `"spheroid"` or `"haversine"`, you can
  choose between `"m"` (meters, default) or `"km"` (kilometers).
- **`options.decimals`**: The number of decimal places to round the distance
  values. Defaults to `undefined` (no rounding).

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Compute distance between 'geomA' and 'geomB' in SRS units, store in 'distance_srs'
await table.distance("geomA", "geomB", "distance_srs").log();
```

```ts
// Compute Haversine distance in meters between 'point1' and 'point2', store in 'distance_m'
// Input geometries must be in EPSG:4326 (WGS84).
await table.distance("point1", "point2", "distance_m", { method: "haversine" })
  .log();
```

```ts
// Compute Haversine distance in kilometers, rounded to 2 decimal places
// Input geometries must be in EPSG:4326 (WGS84).
await table.distance("point1", "point2", "distance_km", {
  method: "haversine",
  unit: "km",
  decimals: 2,
}).log();
```

```ts
// Compute Spheroid distance in kilometers
// Input geometries must be in EPSG:4326 (WGS84).
await table.distance("area1", "area2", "distance_spheroid_km", {
  method: "spheroid",
  unit: "km",
}).log();
```

#### `unnestGeo`

Unnests geometries recursively, transforming multi-part geometries (e.g.,
MultiPolygon) into individual single-part geometries (e.g., Polygon).

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
unnestGeo(column?: string): this;
```

##### Parameters

- **`column`**: The name of the column storing the geometries to be unnested. If
  omitted, the method will automatically attempt to find a geometry column.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Unnest geometries in the default column
await table.unnestGeo().log();
```

```ts
// Unnest geometries in a specific column named 'multiGeom'
await table.unnestGeo("multiGeom").log();
```

#### `addBoundingBox`

Adds the bounding box coordinates of geometries in a specified column as four
new columns: `minLon`, `minLat`, `maxLon`, and `maxLat`.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
addBoundingBox(options?: { column?: string; decimals?: number }): this;
```

##### Parameters

- **`options`**: An optional object with configuration options:
- **`options.column`**: The name of the column storing the geometries for which
  the bounding box will be computed. If omitted, the method will automatically
  attempt to find a geometry column.
- **`options.decimals`**: The number of decimal places to round the bounding box
  coordinates. Defaults to `undefined` (no rounding).

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Compute the bounding box for geometries in the default column
await table.addBoundingBox().log();
// The table now has minLon, minLat, maxLon, and maxLat columns.
```

```ts
// Compute the bounding box for geometries in 'geom' column and round coordinates to 2 decimal places
await table.addBoundingBox({ column: "geom", decimals: 2 }).log();
// The table now has minLon, minLat, maxLon, and maxLat columns with values rounded to 2 decimal places.
```

#### `aggregateGeo`

Aggregates geometries in a specified column based on a chosen aggregation
method.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
aggregateGeo(method: "union" | "intersection", options?: { column?: string; by?: string | string[]; outputTable?: string | boolean }): this;
```

##### Parameters

- **`method`**: The aggregation method to apply: `"union"` (combines all
  geometries into a single multi-geometry) or `"intersection"` (computes the
  intersection of all geometries).
- **`options`**: An optional object with configuration options:
- **`options.column`**: The name of the column storing the geometries to be
  aggregated. If omitted, the method will automatically attempt to find a
  geometry column.
- **`options.by`**: The column name or an array of column names to group by.
  Geometries are aggregated independently within each group.
- **`options.outputTable`**: If `true`, the results will be stored in a new
  table with a generated name. If a string, it will be used as the name for the
  new table. If `false` or omitted, the current table will be overwritten.
  Defaults to `false`.

##### Returns

A table instance containing the aggregated geometries (either the current table
or a new table), so methods can be chained.

##### Examples

```ts
// Aggregate all geometries in the default column into a single union geometry
await table.aggregateGeo("union").log();
```

```ts
// Aggregate geometries by 'country' and compute their union
await table.aggregateGeo("union", { by: "country" }).log();
```

```ts
// Aggregate geometries in 'regions' column into their intersection, storing results in a new table
const intersectionTable = await table.aggregateGeo("intersection", {
  column: "regions",
  outputTable: true,
}).log();
```

#### `linesToPolygons`

Transforms closed linestring geometries into polygon geometries.

This method queues the operation; it runs when an async observer method (like
`getData()` or `log()`) is awaited, or when `run()` is called.

##### Signature

```typescript
linesToPolygons(column?: string): this;
```

##### Parameters

- **`column`**: The name of the column storing the linestring geometries. If
  omitted, the method will automatically attempt to find a geometry column.

##### Returns

The table, so methods can be chained.

##### Examples

```ts
// Transform closed linestrings in the default geometry column into polygons
await table.linesToPolygons().log();
```

```ts
// Transform closed linestrings in a specific column named 'routeLines' into polygons
await table.linesToPolygons("routeLines").log();
```

#### `getBoundingBox`

Returns the bounding box of geometries in `[minLon, minLat, maxLon, maxLat]`
order. By default, the method will try to find the column with the geometries.
The input geometry is assumed to be in EPSG:4326 (WGS84).

##### Signature

```typescript
async getBoundingBox(column?: string): Promise<[number, number, number, number]>;
```

##### Parameters

- **`column`**: The name of the column storing geometries. If omitted, the
  method will automatically attempt to find a geometry column.

##### Returns

A promise that resolves to an array `[minLon, minLat, maxLon, maxLat]`
representing the bounding box.

##### Examples

```ts
// Get the bounding box of geometries in the default column
const bbox = await table.getBoundingBox();
console.log(bbox); // e.g., [-75.0, 45.0, -73.0, 46.0]
```

```ts
// Get the bounding box of geometries in a specific column named 'areaGeom'
const areaBbox = await table.getBoundingBox("areaGeom");
console.log(areaBbox);
```

#### `getGeoData`

Returns the table's geospatial data as a GeoJSON object. If the table has
multiple geometry columns, you must specify which one to use.

##### Signature

```typescript
async getGeoData(column?: string, options?: { rewind?: boolean }): Promise<{ type: string; features: unknown[] }>;
```

##### Parameters

- **`column`**: The name of the column storing the geometries. If omitted, the
  method will automatically attempt to find a geometry column.
- **`options`**: An optional object with configuration options:
- **`options.rewind`**: If `true`, rewinds the coordinates of polygons to follow
  the spherical winding order (important for D3.js). Defaults to `false`.

##### Returns

A promise that resolves to a GeoJSON object representing the table's geospatial
data.

##### Examples

```ts
// Get GeoJSON data from the default geometry column
const geojson = await table.getGeoData();
console.log(geojson);
```

```ts
// Get GeoJSON data from a specific geometry column named 'myGeometries'
const myGeomJson = await table.getGeoData("myGeometries");
console.log(myGeomJson);
```

```ts
// Get GeoJSON data and rewind polygon coordinates for D3.js compatibility
const rewoundGeojson = await table.getGeoData(undefined, { rewind: true });
console.log(rewoundGeojson);
```

#### `writeData`

Writes the table's data to a file in various formats (CSV, JSON, Parquet,
DuckDB, SQLite). If the specified path does not exist, it will be created.

##### Signature

```typescript
async writeData(file: string, options?: { compression?: boolean; dataAsArrays?: boolean; formatDates?: boolean }): Promise<this>;
```

##### Parameters

- **`file`**: The absolute path to the output file (e.g., `"./output.csv"`,
  `"./output.json"`).
- **`options`**: An optional object with configuration options:
- **`options.compression`**: A boolean indicating whether to compress the output
  file. If `true`, CSV and JSON files will be compressed with GZIP, while
  Parquet files will use ZSTD. Defaults to `false`.
- **`options.dataAsArrays`**: For JSON files only. If `true`, JSON files are
  written as a single object with arrays for each column (e.g.,
  `{ "col1": [v1, v2], "col2": [v3, v4] }`) instead of an array of objects. This
  can reduce file size for web projects. You can use the `arraysToData` function
  from the
  [journalism library](https://jsr.io/@nshiab/journalism/doc/~/arraysToData) to
  convert it back.
- **`options.formatDates`**: For CSV and JSON files only. If `true`, date and
  timestamp columns will be formatted as ISO 8601 strings (e.g.,
  `"2025-01-01T01:00:00.000Z"`). Defaults to `false`.

##### Returns

A promise that resolves to the table, so methods can be chained.

##### Examples

```ts
// Write data to a CSV file
await table.writeData("./output.csv");
```

```ts
// Write data to a JSON file with GZIP compression.
// The output file will be named output.json.gz.
await table.writeData("./output.json", { compression: true });
```

```ts
// Write data to a Parquet file
await table.writeData("./output.parquet");
```

```ts
// Write data to a DuckDB database file
await table.writeData("./my_database.db");
```

```ts
// Write data to a SQLite database file
await table.writeData("./my_database.sqlite");
```

```ts
// Write JSON data with dates formatted as ISO strings
await table.writeData("./output_dates.json", { formatDates: true });
```

#### `writeGeoData`

Writes the table's geospatial data to a file in GeoJSON, GeoParquet, or
Shapefile format. If the specified path does not exist, it will be created.

##### Signature

```typescript
async writeGeoData(file: string, options?: { precision?: number; compression?: boolean; rewind?: boolean; metadata?: unknown; formatDates?: boolean }): Promise<this>;
```

##### Parameters

- **`file`**: The absolute path to the output file (e.g., `"./output.geojson"`,
  `"./output.geoparquet"`, `"./shapefile-folder/output.shp"`,
  `"./output.shp.zip"`). A `.shp.zip` extension writes a ZIP archive using fast
  DEFLATE compression. Creating the archive temporarily requires enough disk
  space for both the uncompressed Shapefile and the ZIP, and ZIP archives are
  limited to 4 GB.
- **`options`**: An optional object with configuration options:
- **`options.precision`**: For GeoJSON, the maximum number of figures after the
  decimal separator to write in coordinates. Defaults to `undefined` (full
  precision).
- **`options.compression`**: For GeoParquet, if `true`, uses ZSTD compression;
  otherwise, uses DuckDB's default SNAPPY compression. SNAPPY prioritizes faster
  compression, while ZSTD typically produces smaller files but takes longer to
  write. Read performance depends on the data and storage because smaller files
  can reduce I/O. This option is not supported for GeoJSON or Shapefiles.
  Defaults to `false`.
- **`options.rewind`**: For GeoJSON, if `true`, rewinds the coordinates of
  polygons to follow the right-hand rule (RFC 7946). Defaults to `false`.
- **`options.metadata`**: For GeoJSON, an object to be added as top-level
  metadata to the GeoJSON output.
- **`options.formatDates`**: For GeoJSON, if `true`, formats date and timestamp
  columns to ISO 8601 strings. Defaults to `false`.

##### Returns

A promise that resolves to the table, so methods can be chained.

##### Examples

```ts
// Write geospatial data to a GeoJSON file
await table.writeGeoData("./output.geojson");
```

```ts
// Write geospatial data to a ZSTD-compressed GeoParquet file
await table.writeGeoData("./output.geoparquet", { compression: true });
```

```ts
// Write geospatial data to a Shapefile with all relevant files  in the same folder
await table.writeGeoData("./shapefile-folder/output.shp");
```

```ts
// Write a Shapefile and its related files to output.shp.zip
await table.writeGeoData("./output.shp.zip");
```

```ts
// Write GeoJSON with specific precision and metadata
await table.writeGeoData("./output_high_precision.geojson", {
  precision: 6,
  metadata: { source: "SimpleDataAnalysis" },
});
```

#### `cache`

Caches the results of computations in `./.sda-cache`. You should add
`./.sda-cache` to your `.gitignore` file.

Cache entries are stored as DuckDB database files. Full-text search (FTS)
indexes are persisted in the cache file and restored directly on a cache hit.
Vector similarity search (VSS/HNSW) indexes are not persisted in the cache file;
their definitions are stored as metadata and used to rebuild the indexes on
every cache hit. If loading the entry or restoring its indexes fails, the
computation runs again and replaces the cache entry.

`cache()` automatically tracks whether earlier SDA operations changed the table.
It also records every other already registered `SimpleTable` read through
`SimpleTable` methods while `compute` runs and invalidates the cached step when
any of their generations change. Tables created inside `compute` are part of the
computation itself and are not dependencies.

`SimpleDB.customQuery()` bypasses this tracking. Reading or changing a table
with `customQuery()` can therefore return stale cached data. Include a value
that identifies the custom query's dependencies in `options.inputs` (such as a
table content hash), or use tracked `SimpleTable` methods.

`compute` may modify only the table being cached. Other tables that existed
before `compute` must remain read-only. Temporary tables may be created and
modified inside `compute`, but they must be removed before it finishes because a
cache hit does not run `compute` again.

##### Signature

```typescript
async cache(compute: (table: this) => void | Promise<void>, options?: { inputs?: readonly unknown[]; ttl?: number }): Promise<this>;
```

##### Parameters

- **`compute`**: A function wrapping the computations to be cached. It receives
  the table on which `cache()` was called. This function will be executed on the
  first run or if the cached data is invalid/expired.
- **`options`**: An optional object with configuration options:
- **`options.inputs`**: An ordered array of additional values captured by
  `compute` that affect its result. Each position is compared structurally
  across runs, so adding, removing, moving, or changing an input invalidates the
  cache. Functions and class constructors are compared by source. `SimpleTable`
  dependencies read by `compute` are tracked automatically, and the table being
  cached is already tracked, so neither needs to be included here.
- **`options.ttl`**: Time to live (in seconds). If the data in the cache is
  older than this duration, the `compute` function will be executed again to
  refresh the cache. By default, there is no TTL; the cache is invalidated when
  the `compute` function, the table, or an input changes.

##### Returns

A promise that resolves to the table, so methods can be chained.

##### Examples

```ts
// Computations are re-run if the callback changes or earlier operations modify the table
const sdb = new SimpleDB();
const items = await sdb.newTable("items").cache((table) => {
  table
    .loadData("items.csv")
    .summarize({
      columns: "price",
      by: "department",
      stats: ["min", "max", "mean"],
    });
});
await items.log();

// It's important to call close() on the SimpleDB instance to clean up the cache.
// This prevents the cache from growing indefinitely.
await sdb.close();
```

```ts
// Cache with a Time-To-Live (TTL) of 60 seconds
// The computations will be re-run if the cached data is older than 1 minute, the callback changes, or the table changes.
const sdb = new SimpleDB();
const table = await sdb.newTable().cache((table) => {
  table
    .loadData("items.csv")
    .summarize({
      columns: "price",
      by: "department",
      stats: ["min", "max", "mean"],
    });
}, { ttl: 60 });
await table.log();

await sdb.close();
```

```ts
// Enable verbose logging for cache operations via SimpleDB instance
const sdb = new SimpleDB({ cacheVerbose: true });
const table = await sdb.newTable().cache((table) => {
  table
    .loadData("items.csv")
    .summarize({
      columns: "price",
      by: "department",
      stats: ["min", "max", "mean"],
    });
});
await table.log();

await sdb.close();
```

```ts
// Read-only table dependencies are tracked automatically. Other captured values go in inputs.
const year = 2026;
const summary = await sdb.newTable("summary").cache(async (table) => {
  table.loadArray(
    await fires.getData({ conditions: `year = ${year}` }),
  );
}, { inputs: [year] });
await summary.log();
```

#### `log`

Logs a specified number of rows from the table to the console. By default, the
first 10 rows are logged. You can optionally log the column types and filter the
data based on conditions. You can also use JavaScript syntax for conditions
(e.g., `&&`, `||`, `===`, `!==`).

##### Signature

```typescript
async log(options?: "all" | number | { count?: number | "all"; types?: boolean; conditions?: string }): Promise<this>;
```

##### Parameters

- **`options`**: Either the number of rows to log (a specific number or `"all"`)
  or an object with configuration options:
- **`options.count`**: The number of rows to log. Defaults to 10 or the value
  set in the SimpleDB instance. Use `"all"` to log all rows.
- **`options.types`**: Whether to log the column types along with the data.
  Defaults to the value set in the SimpleDB instance.
- **`options.conditions`**: A SQL `WHERE` clause condition to filter the data
  before logging. Defaults to no condition.

##### Returns

A promise that resolves to the table, so methods can be chained.

##### Examples

```ts
// Log the first 10 rows (default behavior)
await table.log();
```

```ts
// Log the first 50 rows
await table.log(50);
```

```ts
// Log all rows
await table.log("all");
```

```ts
// Log the first 20 rows and include column types
await table.log({ count: 20, types: true });
```

```ts
// Log rows where 'status' is 'active' (using JS syntax for conditions)
await table.log({ conditions: `status === 'active'` });
```

#### `logDescription`

Logs descriptive information about the columns in the table to the console. This
includes details such as data types, number of null values, and number of
distinct values for each column. It internally calls the `getDescription` method
to retrieve the descriptive statistics.

##### Signature

```typescript
async logDescription(): Promise<this>;
```

##### Returns

A promise that resolves to the table, so methods can be chained.

##### Examples

```ts
// Log descriptive information for all columns in the table
await table.logDescription();
```

#### `getProjection`

Retrieves the projection of a specified geospatial column.

##### Signature

```typescript
async getProjection(column: string): Promise<string>;
```

##### Parameters

- **`column`**: The name of the geospatial column for which to retrieve the
  projection.

##### Returns

A promise that resolves to the projection of the specified column.

##### Examples

```ts
// Get the projection of the 'geom' column
const projection = await table.getProjection("geom");
```

#### `logProjections`

Logs the projections of the geospatial data (if any) to the console.

##### Signature

```typescript
async logProjections(): Promise<this>;
```

##### Returns

A promise that resolves to the SimpleTable instance after logging the
projections.

##### Examples

```ts
// Log the geospatial projections of the table
await table.logProjections();
```

#### `logTypes`

Logs the types of all columns in the table to the console.

##### Signature

```typescript
async logTypes(): Promise<this>;
```

##### Returns

A promise that resolves to the SimpleTable instance after logging the column
types.

##### Examples

```ts
// Log the data types of all columns in the table
await table.logTypes();
```

#### `logUniques`

Logs unique values for a specified column to the console. By default, a maximum
of 100 values are logged (depending on your runtime). You can optionally
stringify the values to see them all.

##### Signature

```typescript
async logUniques(column: string, options?: { stringify?: boolean }): Promise<this>;
```

##### Parameters

- **`column`**: The name of the column from which to retrieve and log unique
  values.
- **`options`**: An optional object with configuration options:
- **`options.stringify`**: If `true`, converts the unique values to a JSON
  string before logging. Defaults to `false`.

##### Returns

A promise that resolves to the SimpleTable instance after logging the unique
values.

##### Examples

```ts
// Logs unique values for the column "name"
await table.logUniques("name");
```

```ts
// Logs unique values for the column "name" and stringifies them
await table.logUniques("name", { stringify: true });
```

#### `logColumns`

Logs the columns in the table to the console. You can optionally include their
data types.

##### Signature

```typescript
async logColumns(options?: { types?: boolean }): Promise<this>;
```

##### Parameters

- **`options`**: An optional object with configuration options:
- **`options.types`**: If `true`, logs the column names along with their data
  types. Defaults to `false`.

##### Returns

A promise that resolves to the SimpleTable instance after logging the columns.

##### Examples

```ts
// Log only the column names
await table.logColumns();
```

```ts
// Log column names along with their types
await table.logColumns({ types: true });
```

#### `logRowCount`

Logs the total number of rows in the table to the console.

##### Signature

```typescript
async logRowCount(): Promise<this>;
```

##### Returns

A promise that resolves to the SimpleTable instance after logging the row count.

##### Examples

```ts
// Log the total number of rows in the table
await table.logRowCount();
```

#### `logBottom`

Logs the bottom `n` rows of the table to the console. By default, the last row
will be returned first. To preserve the original order, use the `originalOrder`
option.

##### Signature

```typescript
async logBottom(count?: number, options?: { originalOrder?: boolean }): Promise<this>;
```

##### Parameters

- **`count`**: The number of rows to log from the bottom of the table. Defaults
  to the table's `rowsToLog` option if not specified.
- **`options`**: An optional object with logging preferences.
- **`options.originalOrder`**: If true, the rows are displayed in their original
  order (top to bottom). Defaults to false.

##### Returns

A promise that resolves to the table, so methods can be chained.

##### Examples

```ts
// Log bottom rows with default count (uses table's rowsToLog option)
await table.logBottom();
```

```ts
// Log the last 10 rows (displayed with last row first)
await table.logBottom(10);
```

```ts
// Log the last 5 rows in original order (top to bottom)
await table.logBottom(5, { originalOrder: true });
```

#### `logExtent`

Logs the extent (minimum and maximum values) of a numeric column to the console.

##### Signature

```typescript
async logExtent(column: string): Promise<this>;
```

##### Parameters

- **`column`**: The name of the numeric column for which to log the extent.

##### Returns

A promise that resolves to the table, so methods can be chained.

##### Examples

```ts
// Log the extent of the 'price' column
await table.logExtent("price");
```

### Examples

```ts
// Create a SimpleDB instance (in-memory by default)
const sdb = new SimpleDB();

// Create a table, load a CSV file, and log its first few rows
const employees = await sdb
  .newTable("employees")
  .loadData("./employees.csv")
  .log();

// Close the database connection and free up resources
await sdb.close();
```

```ts
// Handling geospatial data
// Create a SimpleDB instance
const sdb = new SimpleDB();

// Create a table and load geospatial data from a GeoJSON file
const boundaries = await sdb
  .newTable("boundaries")
  .loadGeoData("./boundaries.geojson")
  .log();

// Close the database connection
await sdb.close();
```
