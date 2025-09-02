# The Simple Data Analysis Library

To install the library with Deno, use:

```bash
deno add jsr:@nshiab/simple-data-analysis
```

To install the library with Node.js, use:

```bash
npx jsr add @nshiab/simple-data-analysis
```

To start, create a SimpleDB instance and then a SimpleTable from this instance:

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";

const sdb = new SimpleDB();
const table = db.createTable("myTable"); // This returns a SimpleTable instance
await table.loadData("path/to/your/data.csv");

// You can now perform various data analysis operations on the table.

await sdb.done(); // Ensure to call done when you're finished.
```

## class SimpleDB

Manages a DuckDB database instance, providing a simplified interface for
database operations.

### Constructor

Creates a new SimpleDB instance.

#### Parameters

- **`options`**: - Configuration options for the SimpleDB instance.
- **`options.file`**: - The path to the database file. If not provided, an
  in-memory database is used.
- **`options.overwrite`**: - A flag indicating whether to overwrite the database
  file if it already exists.
- **`options.logDuration`**: - A flag indicating whether to log the total
  execution duration.
- **`options.nbRowsToLog`**: - The number of rows to display when logging a
  table.
- **`options.nbCharactersToLog`**: - The maximum number of characters to display
  for text-based cells.
- **`options.types`**: - A flag indicating whether to include data types when
  logging a table.
- **`options.cacheVerbose`**: - A flag indicating whether to log verbose
  cache-related messages.
- **`options.debug`**: - A flag indicating whether to log debugging information.
- **`options.duckDbCache`**: - A flag indicating whether to use DuckDB's
  external file cache.
- **`options.progressBar`**: - A flag indicating whether to display a progress
  bar for long-running operations.

### Methods

#### `newTable`

Creates a new SimpleTable instance within the database.

##### Signature

```typescript
newTable(name?: string, projections?: Record<string, string>): SimpleTable;
```

##### Parameters

- **`name`**: - The name of the new table. If not provided, a default name is
  generated (e.g., "table1").
- **`projections`**: - An object mapping column names to their geospatial
  projections.

##### Returns

A new SimpleTable instance.

##### Examples

```ts
// Create a table with a default name (e.g., "table1", "table2", etc.)
const dataTable = sdb.newTable();
```

```ts
// Create a table with a specific name
const employees = sdb.newTable("employees");
```

#### `getTable`

Retrieves an existing SimpleTable instance from the database.

##### Signature

```typescript
async getTable(name: string): Promise<SimpleTable>;
```

##### Parameters

- **`name`**: - The name of the table to retrieve.

##### Returns

A promise that resolves to the SimpleTable instance if found.

##### Examples

```ts
// Retrieve the "employees" table
const employees = await sdb.getTable("employees");
```

#### `removeTables`

Removes one or more tables from the database.

##### Signature

```typescript
async removeTables(tables: SimpleTable | string | (SimpleTable | string)[]): Promise<void>;
```

##### Parameters

- **`tables`**: - A single table or an array of tables to remove, specified by
  name or as SimpleTable instances.

##### Returns

A promise that resolves when the tables have been removed.

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

#### `selectTables`

Selects one or more tables to keep in the database, removing all others.

##### Signature

```typescript
async selectTables(tables: SimpleTable | string | (SimpleTable | string)[]): Promise<void>;
```

##### Parameters

- **`tables`**: - A single table or an array of tables to select, specified by
  name or as SimpleTable instances.

##### Returns

A promise that resolves when the tables have been selected.

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
async logTableNames(): Promise<void>;
```

##### Returns

A promise that resolves when the table names have been logged.

##### Examples

```ts
// Log all table names to the console
await sdb.logTableNames();
// Example output: SimpleDB - Tables:  ["employees","customers"]
```

#### `getTables`

Returns an array of all SimpleTable instances in the database.

##### Signature

```typescript
async getTables(): Promise<SimpleTable[]>;
```

##### Returns

A promise that resolves to an array of SimpleTable instances.

##### Examples

```ts
// Get all SimpleTable instances
const tables = await sdb.getTables();
```

#### `hasTable`

Checks if a table exists in the database.

##### Signature

```typescript
async hasTable(table: SimpleTable | string): Promise<boolean>;
```

##### Parameters

- **`table`**: - The name of the table or a SimpleTable instance.

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
async getExtensions(): Promise<Record<string, string | number | boolean | Date | null>[]>;
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

Executes a custom SQL query directly against the DuckDB instance.

If you want to force the returned data to match the types of the columns, you
can use the `types` option.

##### Signature

```typescript
async customQuery(query: string, options?: { returnDataFrom?: "query" | "none"; table?: string; types?: Record<string, string> }): Promise<Record<string, string | number | boolean | Date | null>[] | null>;
```

##### Parameters

- **`query`**: - The SQL query string to execute.
- **`options`**: - Configuration options for the query.
- **`options.returnDataFrom`**: - Specifies whether to return data from the
  query. Can be `"query"` to return data or `"none"` (default) to not return
  data.
- **`options.table`**: - The name of the table associated with the query,
  primarily used for debugging and logging.
- **`options.types`**: - An optional object specifying data types for the query
  parameters.

##### Returns

A promise that resolves to the query result as an array of objects if
`returnDataFrom` is `"query"`, otherwise `null`.

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
  { returnDataFrom: "query" },
);
console.log(youngEmployees);
```

#### `loadDB`

Loads a database from a specified file into the current SimpleDB instance.
Supported file types are `.db` (DuckDB) and `.sqlite` (SQLite).

##### Signature

```typescript
async loadDB(file: string, options?: { name?: string; detach?: boolean }): Promise<void>;
```

##### Parameters

- **`file`**: - The absolute path to the database file (e.g.,
  "./my_database.db").
- **`options`**: - Configuration options for loading the database.
- **`options.name`**: - The name to assign to the loaded database within the
  DuckDB instance. Defaults to the file name without extension.
- **`options.detach`**: - If `true` (default), the database is detached after
  loading its contents into memory. If `false`, the database remains attached.

##### Returns

A promise that resolves when the database has been loaded.

##### Examples

```ts
// Load a DuckDB database file
await sdb.loadDB("./my_database.db");
```

```ts
// Load a SQLite database file and keep it attached
await sdb.loadDB("./my_database.sqlite", { detach: false });
```

```ts
// Load a database with a custom name
await sdb.loadDB("./archive.db", { name: "archive_db" });
```

#### `writeDB`

Writes the current state of the database to a specified file. Supported output
file types are `.db` (DuckDB) and `.sqlite` (SQLite).

##### Signature

```typescript
async writeDB(file: string, options?: { noMetaData?: boolean }): Promise<void>;
```

##### Parameters

- **`file`**: - The absolute path to the output file (e.g.,
  "./my_exported_database.db").
- **`options`**: - Configuration options for writing the database.
- **`options.noMetaData`**: - If `true`, metadata files (projections, indexes)
  are not created alongside the database file. Defaults to `false`.

##### Returns

A promise that resolves when the database has been written to the file.

##### Examples

```ts
// Write the current database to a DuckDB file
await sdb.writeDB("./my_exported_database.db");
```

```ts
// Write the current database to a SQLite file without metadata
await sdb.writeDB("./my_exported_database.sqlite", { noMetaData: true });
```

#### `done`

Frees up memory by closing the database connection and instance, and cleans up
the cache. If the database is file-based, it also compacts the database file to
optimize storage.

##### Signature

```typescript
async done(): Promise<SimpleDB>;
```

##### Returns

A promise that resolves to the SimpleDB instance after cleanup.

##### Examples

```ts
// Close the database and clean up resources
await sdb.done();
```

### Examples

```ts
// Create an in-memory database instance
const sdb = new SimpleDB();
// Create a new table named "employees"
const employees = sdb.newTable("employees");
// Load data from a CSV file into the "employees" table
await employees.loadData("./employees.csv");
// Log the first few rows of the "employees" table to the console
await employees.logTable();
// Close the database connection and clean up resources
await sdb.done();
```

```ts
// Create a persistent database instance, saving data to a file
// To load an existing database, use the `loadDB` method instead
const sdb = new SimpleDB({ file: "./my_database.db" });
// Perform database operations...
// Close the database connection, which saves changes to the specified file
await sdb.done();
```

```ts
// Create a database instance with custom options
const sdb = new SimpleDB({
  debug: true, // Enable debugging output
  nbRowsToLog: 20, // Set the number of rows to log by default
});
```

## class SimpleTable

Represents a table within a SimpleDB database, capable of handling tabular,
geospatial, and vector data. SimpleTable instances are typically created via a
SimpleDB instance.

### Constructor

Creates an instance of SimpleTable.

#### Parameters

- **`name`**: - The name of the table.
- **`projections`**: - An object mapping column names to their geospatial
  projections.
- **`simpleDB`**: - The SimpleDB instance that this table belongs to.
- **`options`**: - An optional object with configuration options:
- **`options.debug`**: - A boolean indicating whether to enable debug mode.
- **`options.nbRowsToLog`**: - The number of rows to log when displaying table
  data.
- **`options.nbCharactersToLog`**: - The maximum number of characters to log for
  strings. Useful to avoid logging large text content.
- **`options.types`**: - A boolean indicating whether to include data types when
  logging a table.

### Methods

#### `renameTable`

Renames the current table.

##### Signature

```typescript
async renameTable(name: string): Promise<void>;
```

##### Parameters

- **`name`**: - The new name for the table.

##### Returns

A promise that resolves when the table has been renamed.

##### Examples

```ts
// Rename the table to "new_employees"
await table.renameTable("new_employees");
```

#### `setTypes`

Sets the data types for columns in a new table. If the table already exists, it
will be replaced. To convert the types of an existing table, use the
`.convert()` method instead.

##### Signature

```typescript
async setTypes(types: Record<string, "integer" | "float" | "number" | "string" | "date" | "time" | "datetime" | "datetimeTz" | "bigint" | "double" | "varchar" | "timestamp" | "timestamp with time zone" | "boolean" | "geometry">): Promise<void>;
```

##### Parameters

- **`types`**: - An object specifying the column names and their target data
  types (JavaScript or SQL types).

##### Returns

A promise that resolves when the types have been set.

##### Examples

```ts
// Set types for a new table
await table.setTypes({
  name: "string",
  salary: "integer",
  raise: "float",
});
```

#### `loadArray`

Loads an array of JavaScript objects into the table.

##### Signature

```typescript
async loadArray(arrayOfObjects: Record<string, unknown>[]): Promise<SimpleTable>;
```

##### Parameters

- **`arrayOfObjects`**: - An array of objects, where each object represents a
  row and its properties represent columns.

##### Returns

A promise that resolves to the SimpleTable instance after the data has been
loaded.

##### Examples

```ts
// Load data from an array of objects
const data = [
  { letter: "a", number: 1 },
  { letter: "b", number: 2 },
];
await table.loadArray(data);
```

#### `loadData`

Loads data from one or more local or remote files into the table. Supported file
formats include CSV, JSON, Parquet, and Excel.

##### Signature

```typescript
async loadData(files: string | string[], options?: { fileType?: "csv" | "dsv" | "json" | "parquet" | "excel"; autoDetect?: boolean; limit?: number; fileName?: boolean; unifyColumns?: boolean; columnTypes?: Record<string, string>; header?: boolean; allText?: boolean; delim?: string; skip?: number; nullPadding?: boolean; ignoreErrors?: boolean; compression?: "none" | "gzip" | "zstd"; encoding?: string; strict?: boolean; jsonFormat?: "unstructured" | "newlineDelimited" | "array"; records?: boolean; sheet?: string }): Promise<SimpleTable>;
```

##### Parameters

- **`files`**: - The path(s) or URL(s) of the file(s) containing the data to be
  loaded.
- **`options`**: - An optional object with configuration options:
- **`options.fileType`**: - The type of file to load ("csv", "dsv", "json",
  "parquet", "excel"). Defaults to being inferred from the file extension.
- **`options.autoDetect`**: - A boolean indicating whether to automatically
  detect the data format. Defaults to `true`.
- **`options.limit`**: - A number indicating the maximum number of rows to load.
  Defaults to all rows.
- **`options.fileName`**: - A boolean indicating whether to include the file
  name as a new column in the loaded data. Defaults to `false`.
- **`options.unifyColumns`**: - A boolean indicating whether to unify columns
  across multiple files when their structures differ. Missing columns will be
  filled with `NULL` values. Defaults to `false`.
- **`options.columnTypes`**: - An object mapping column names to their expected
  data types. By default, types are inferred.
- **`options.header`**: - A boolean indicating whether the file has a header
  row. Applicable to CSV files. Defaults to `true`.
- **`options.allText`**: - A boolean indicating whether all columns should be
  treated as text. Applicable to CSV files. Defaults to `false`.
- **`options.delim`**: - The delimiter used in the file. Applicable to CSV and
  DSV files. By default, the delimiter is inferred.
- **`options.skip`**: - The number of lines to skip at the beginning of the
  file. Applicable to CSV files. Defaults to `0`.
- **`options.nullPadding`**: - If `true`, when a row has fewer columns than
  expected, the remaining columns on the right will be padded with `NULL`
  values. Defaults to `false`.
- **`options.ignoreErrors`**: - If `true`, parsing errors encountered will be
  ignored, and rows with errors will be skipped. Defaults to `false`.
- **`options.compression`**: - The compression type of the file. Applicable to
  CSV files. Defaults to `none`.
- **`options.strict`**: - If `true`, an error will be thrown when encountering
  any issues. If `false`, structurally incorrect files will be parsed
  tentatively. Defaults to `true`.
- **`options.encoding`**: - The encoding of the file. Applicable to CSV files.
  Defaults to `utf-8`.
- **`options.jsonFormat`**: - The format of JSON files ("unstructured",
  "newlineDelimited", "array"). By default, the format is inferred.
- **`options.records`**: - A boolean indicating whether each line in a
  newline-delimited JSON file represents a record. Applicable to JSON files. By
  default, it's inferred.
- **`options.sheet`**: - A string indicating a specific sheet to import from an
  Excel file. By default, the first sheet is imported.

##### Returns

A promise that resolves to the SimpleTable instance after the data has been
loaded.

##### Examples

```ts
// Load data from a single local CSV file
await table.loadData("./some-data.csv");
```

```ts
// Load data from a remote Parquet file
await table.loadData("https://some-website.com/some-data.parquet");
```

```ts
// Load data from multiple local JSON files
await table.loadData([
  "./some-data1.json",
  "./some-data2.json",
  "./some-data3.json",
]);
```

```ts
// Load data from multiple remote Parquet files with column unification
await table.loadData([
  "https://some-website.com/some-data1.parquet",
  "https://some-website.com/some-data2.parquet",
  "https://some-website.com/some-data3.parquet",
], { unifyColumns: true });
```

#### `loadDataFromDirectory`

Loads data from all supported files (CSV, JSON, Parquet, Excel) within a local
directory into the table.

##### Signature

```typescript
async loadDataFromDirectory(directory: string, options?: { fileType?: "csv" | "dsv" | "json" | "parquet" | "excel"; autoDetect?: boolean; limit?: number; fileName?: boolean; unifyColumns?: boolean; columnTypes?: Record<string, string>; header?: boolean; allText?: boolean; delim?: string; skip?: number; nullPadding?: boolean; ignoreErrors?: boolean; compression?: "none" | "gzip" | "zstd"; encoding?: "utf-8" | "utf-16" | "latin-1"; strict?: boolean; jsonFormat?: "unstructured" | "newlineDelimited" | "array"; records?: boolean; sheet?: string }): Promise<SimpleTable>;
```

##### Parameters

- **`directory`**: - The absolute path to the directory containing the data
  files.
- **`options`**: - An optional object with configuration options:
- **`options.fileType`**: - The type of file to load ("csv", "dsv", "json",
  "parquet", "excel"). Defaults to being inferred from the file extension.
- **`options.autoDetect`**: - A boolean indicating whether to automatically
  detect the data format. Defaults to `true`.
- **`options.limit`**: - A number indicating the maximum number of rows to load.
  Defaults to all rows.
- **`options.fileName`**: - A boolean indicating whether to include the file
  name as a new column in the loaded data. Defaults to `false`.
- **`options.unifyColumns`**: - A boolean indicating whether to unify columns
  across multiple files when their structures differ. Missing columns will be
  filled with `NULL` values. Defaults to `false`.
- **`options.columnTypes`**: - An object mapping column names to their expected
  data types. By default, types are inferred.
- **`options.header`**: - A boolean indicating whether the file has a header
  row. Applicable to CSV files. Defaults to `true`.
- **`options.allText`**: - A boolean indicating whether all columns should be
  treated as text. Applicable to CSV files. Defaults to `false`.
- **`options.delim`**: - The delimiter used in the file. Applicable to CSV and
  DSV files. By default, the delimiter is inferred.
- **`options.skip`**: - The number of lines to skip at the beginning of the
  file. Applicable to CSV files. Defaults to `0`.
- **`options.nullPadding`**: - If `true`, when a row has fewer columns than
  expected, the remaining columns on the right will be padded with `NULL`
  values. Defaults to `false`.
- **`options.ignoreErrors`**: - If `true`, parsing errors encountered will be
  ignored, and rows with errors will be skipped. Defaults to `false`.
- **`options.compression`**: - The compression type of the file. Applicable to
  CSV files. Defaults to `none`.
- **`options.strict`**: - If `true`, an error will be thrown when encountering
  any issues. If `false`, structurally incorrect files will be parsed
  tentatively. Defaults to `true`.
- **`options.encoding`**: - The encoding of the files. Applicable to CSV files.
  Defaults to `utf-8`.
- **`options.jsonFormat`**: - The format of JSON files ("unstructured",
  "newlineDelimited", "array"). By default, the format is inferred.
- **`options.records`**: - A boolean indicating whether each line in a
  newline-delimited JSON file represents a record. Applicable to JSON files. By
  default, it's inferred.
- **`options.sheet`**: - A string indicating a specific sheet to import from an
  Excel file. By default, the first sheet is imported.

##### Returns

A promise that resolves to the SimpleTable instance after the data has been
loaded.

##### Examples

```ts
// Load all supported data files from the "./data/" directory
await table.loadDataFromDirectory("./data/");
```

#### `loadGeoData`

Loads geospatial data from an external file or URL into the table. The
coordinates of files or URLs ending with `.json` or `.geojson` are automatically
flipped to `[latitude, longitude]` axis order.

##### Signature

```typescript
async loadGeoData(file: string, options?: { toWGS84?: boolean; from?: string }): Promise<SimpleTable>;
```

##### Parameters

- **`file`**: - The URL or absolute path to the external file containing the
  geospatial data.
- **`options`**: - An optional object with configuration options:
- **`options.toWGS84`**: - If `true`, the method will attempt to reproject the
  data to WGS84 with `[latitude, longitude]` axis order. If the file is `.json`
  or `.geojson`, coordinates are automatically flipped, and this option has no
  additional effect. Defaults to `false`.
- **`options.from`**: - An optional string specifying the original projection of
  the data, if the method is unable to detect it automatically.

##### Returns

A promise that resolves to the SimpleTable instance after the geospatial data
has been loaded.

##### Examples

```ts
// Load geospatial data from a URL
await table.loadGeoData("https://some-website.com/some-data.geojson");
```

```ts
// Load geospatial data from a local file
await table.loadGeoData("./some-data.geojson");
```

```ts
// Load geospatial data from a shapefile and reproject to WGS84
await table.loadGeoData("./some-data.shp.zip", { toWGS84: true });
```

#### `aiRowByRow`

Applies a prompt to the value of each row in a specified column, storing the
AI's response in a new column. This method automatically appends instructions to
your prompt; set `verbose` to `true` to see the full prompt.

This method supports Google Gemini, Vertex AI, and local models running with
Ollama. Credentials and model selection are determined by environment variables
(`AI_KEY`, `AI_PROJECT`, `AI_LOCATION`, `AI_MODEL`) or directly via `options`,
with `options` taking precedence.

For Ollama, set the `OLLAMA` environment variable to `true`, ensure Ollama is
running, and set `AI_MODEL` to your desired model name. You can also pass your
instance of Ollama to the `ollama` option.

To manage rate limits, use `batchSize` to process multiple rows per request and
`rateLimitPerMinute` to introduce delays between requests. For higher rate
limits (business/professional accounts), `concurrent` allows parallel requests.

The `cache` option enables local caching of results in `.journalism-cache` (from
the `askAI` function in the
[journalism library](https://github.com/nshiab/journalism)). Remember to add
`.journalism-cache` to your `.gitignore`.

If the AI returns fewer items than expected in a batch, or if a custom `test`
function fails, the `retry` option (a number greater than 0) will reattempt the
request.

Temperature is set to 0 for reproducibility, though consistency cannot be
guaranteed.

This method does not support tables containing geometries.

##### Signature

```typescript
async aiRowByRow(column: string, newColumn: string, prompt: string, options?: { batchSize?: number; concurrent?: number; cache?: boolean; test?: (dataPoint: unknown) => any; retry?: number; model?: string; apiKey?: string; vertex?: boolean; project?: string; location?: string; ollama?: boolean | Ollama; verbose?: boolean; rateLimitPerMinute?: number; clean?: (response: string) => any; contextWindow?: number; thinkingBudget?: number; extraInstructions?: string }): Promise<void>;
```

##### Parameters

- **`column`**: - The name of the column to be used as input for the AI prompt.
- **`newColumn`**: - The name of the new column where the AI's response will be
  stored.
- **`prompt`**: - The input string to guide the AI's response.
- **`options`**: - Configuration options for the AI request.
- **`options.batchSize`**: - The number of rows to process in each batch.
  Defaults to `1`.
- **`options.concurrent`**: - The number of concurrent requests to send.
  Defaults to `1`.
- **`options.cache`**: - If `true`, the results will be cached locally. Defaults
  to `false`.
- **`options.test`**: - A function to validate the returned data point. If it
  throws an error, the request will be retried (if `retry` is set). Defaults to
  `undefined`.
- **`options.retry`**: - The number of times to retry the request in case of
  failure. Defaults to `0`.
- **`options.rateLimitPerMinute`**: - The rate limit for AI requests in requests
  per minute. The method will wait between requests if necessary. Defaults to
  `undefined` (no limit).
- **`options.model`**: - The AI model to use. Defaults to the `AI_MODEL`
  environment variable.
- **`options.apiKey`**: - The API key for the AI service. Defaults to the
  `AI_KEY` environment variable.
- **`options.vertex`**: - If `true`, uses Vertex AI. Automatically set to `true`
  if `AI_PROJECT` and `AI_LOCATION` are set in the environment. Defaults to
  `false`.
- **`options.project`**: - The Google Cloud project ID for Vertex AI. Defaults
  to the `AI_PROJECT` environment variable.
- **`options.location`**: - The Google Cloud location for Vertex AI. Defaults to
  the `AI_LOCATION` environment variable.
- **`options.ollama`**: - If `true`, uses Ollama. Defaults to the `OLLAMA`
  environment variable. If you want your Ollama instance to be used, you can
  pass it here too.
- **`options.verbose`**: - If `true`, logs additional debugging information,
  including the full prompt sent to the AI. Defaults to `false`.
- **`options.clean`**: - A function to clean the AI's response before JSON
  parsing, testing, caching, and storing. Defaults to `undefined`.
- **`options.contextWindow`**: - An option to specify the context window size
  for Ollama models. By default, Ollama sets this depending on the model, which
  can be lower than the actual maximum context window size of the model.
- **`options.thinkingBudget`**: - Sets the reasoning token budget: 0 to disable
  (default, though some models may reason regardless), -1 for a dynamic budget,
  or > 0 for a fixed budget. For Ollama models, any non-zero value simply
  enables reasoning, ignoring the specific budget amount.
- **`options.extraInstructions`**: - Additional instructions to append to the
  prompt, providing more context or guidance for the AI.

##### Returns

A promise that resolves when the AI processing is complete.

##### Examples

```ts
// New table with a "name" column.
await table.loadArray([
  { name: "Marie" },
  { name: "John" },
  { name: "Alex" },
]);

// Ask the AI to categorize names into a new "gender" column.
await table.aiRowByRow(
  "name",
  "gender",
  `Guess whether it's a "Man" or a "Woman". If it could be both, return "Neutral".`,
  {
    cache: true, // Cache results locally
    batchSize: 10, // Process 10 rows at once
    test: (dataPoint: unknown) => { // Validate AI's response
      if (
        typeof dataPoint !== "string" ||
        !["Man", "Woman", "Neutral"].includes(dataPoint)
      ) {
        throw new Error(`Invalid response: ${dataPoint}`);
      }
    },
    retry: 3, // Retry up to 3 times on failure
    rateLimitPerMinute: 15, // Limit requests to 15 per minute
    verbose: true, // Log detailed information
  },
);

// Example results:
// [
//   { name: "Marie", gender: "Woman" },
//   { name: "John", gender: "Man" },
//   { name: "Alex", gender: "Neutral" },
// ]
```

#### `aiEmbeddings`

Generates embeddings for a specified text column and stores the results in a new
column.

This method supports Google Gemini, Vertex AI, and local models running with
Ollama. Credentials and model selection are determined by environment variables
(`AI_KEY`, `AI_PROJECT`, `AI_LOCATION`, `AI_EMBEDDINGS_MODEL`) or directly via
`options`, with `options` taking precedence.

For Ollama, set the `OLLAMA` environment variable to `true`, ensure Ollama is
running, and set `AI_EMBEDDINGS_MODEL` to your desired model name. You can also
pass your instance of Ollama to the `ollama` option.

To manage rate limits, use `rateLimitPerMinute` to introduce delays between
requests. For higher rate limits (business/professional accounts), `concurrent`
allows parallel requests.

The `cache` option enables local caching of results in `.journalism-cache` (from
the `getEmbedding` function in the
[journalism library](https://github.com/nshiab/journalism)). Remember to add
`.journalism-cache` to your `.gitignore`.

If `createIndex` is `true`, an index will be created on the new column using the
[duckdb-vss extension](https://github.com/duckdb/duckdb-vss). This is useful for
speeding up the `aiVectorSimilarity` method.

This method does not support tables containing geometries.

##### Signature

```typescript
async aiEmbeddings(column: string, newColumn: string, options?: { createIndex?: boolean; concurrent?: number; cache?: boolean; model?: string; apiKey?: string; vertex?: boolean; project?: string; location?: string; ollama?: boolean | Ollama; verbose?: boolean; rateLimitPerMinute?: number; contextWindow?: number }): Promise<void>;
```

##### Parameters

- **`column`**: - The name of the column to be used as input for generating
  embeddings.
- **`newColumn`**: - The name of the new column where the generated embeddings
  will be stored.
- **`options`**: - Configuration options for the AI request.
- **`options.createIndex`**: - If `true`, an index will be created on the new
  column. Useful for speeding up the `aiVectorSimilarity` method. Defaults to
  `false`.
- **`options.concurrent`**: - The number of concurrent requests to send.
  Defaults to `1`.
- **`options.cache`**: - If `true`, the results will be cached locally. Defaults
  to `false`.
- **`options.rateLimitPerMinute`**: - The rate limit for AI requests in requests
  per minute. The method will wait between requests if necessary. Defaults to
  `undefined` (no limit).
- **`options.model`**: - The AI model to use. Defaults to the
  `AI_EMBEDDINGS_MODEL` environment variable.
- **`options.apiKey`**: - The API key for the AI service. Defaults to the
  `AI_KEY` environment variable.
- **`options.vertex`**: - If `true`, uses Vertex AI. Automatically set to `true`
  if `AI_PROJECT` and `AI_LOCATION` are set in the environment. Defaults to
  `false`.
- **`options.project`**: - The Google Cloud project ID for Vertex AI. Defaults
  to the `AI_PROJECT` environment variable.
- **`options.location`**: - The Google Cloud location for Vertex AI. Defaults to
  the `AI_LOCATION` environment variable.
- **`options.ollama`**: - If `true`, uses Ollama. Defaults to the `OLLAMA`
  environment variable. If you want your Ollama instance to be used, you can
  pass it here too.
- **`options.contextWindow`**: - An option to specify the context window size
  for Ollama models. By default, Ollama sets this depending on the model, which
  can be lower than the actual maximum context window size of the model.
- **`options.verbose`**: - If `true`, logs additional debugging information.
  Defaults to `false`.

##### Returns

A promise that resolves when the embeddings have been generated and stored.

##### Examples

```ts
// New table with a "food" column.
await table.loadArray([
  { food: "pizza" },
  { food: "sushi" },
  { food: "burger" },
  { food: "pasta" },
  { food: "salad" },
  { food: "tacos" },
]);

// Generate embeddings for the "food" column and store them in a new "embeddings" column.
await table.aiEmbeddings("food", "embeddings", {
  cache: true, // Cache results locally
  rateLimitPerMinute: 15, // Limit requests to 15 per minute
  createIndex: true, // Create an index on the new column for faster similarity searches
  verbose: true, // Log detailed information
});
```

#### `aiVectorSimilarity`

Creates an embedding from a specified text and returns the most similar text
content based on their embeddings. This method is useful for semantic search and
text similarity tasks, computing cosine distance and sorting results by
similarity.

To create the embedding, this method supports Google Gemini, Vertex AI, and
local models running with Ollama. Credentials and model selection are determined
by environment variables (`AI_KEY`, `AI_PROJECT`, `AI_LOCATION`,
`AI_EMBEDDINGS_MODEL`) or directly via `options`, with `options` taking
precedence.

For Ollama, set the `OLLAMA` environment variable to `true`, ensure Ollama is
running, and set `AI_EMBEDDINGS_MODEL` to your desired model name. You can also
pass your instance of Ollama to the `ollama` option.

The `cache` option enables local caching of the specified text's embedding in
`.journalism-cache` (from the `getEmbedding` function in the
[journalism library](https://github.com/nshiab/journalism)). Remember to add
`.journalism-cache` to your `.gitignore`.

If `createIndex` is `true`, an index will be created on the embeddings column
using the [duckdb-vss extension](https://github.com/duckdb/duckdb-vss) to speed
up processing. If the index already exists, it will not be recreated.

##### Signature

```typescript
async aiVectorSimilarity(text: string, column: string, nbResults: number, options?: { createIndex?: boolean; outputTable?: string; cache?: boolean; model?: string; apiKey?: string; vertex?: boolean; project?: string; location?: string; ollama?: boolean | Ollama; contextWindow?: number; verbose?: boolean }): Promise<SimpleTable>;
```

##### Parameters

- **`text`**: - The text for which to generate an embedding and find similar
  content.
- **`column`**: - The name of the column containing the embeddings to be used
  for the similarity search.
- **`nbResults`**: - The number of most similar results to return.
- **`options`**: - An optional object with configuration options:
- **`options.createIndex`**: - If `true`, an index will be created on the
  embeddings column. Defaults to `false`.
- **`options.outputTable`**: - The name of the output table where the results
  will be stored. If not provided, the current table will be modified. Defaults
  to `undefined`.
- **`options.cache`**: - If `true`, the embedding of the input `text` will be
  cached locally. Defaults to `false`.
- **`options.model`**: - The AI model to use for generating the embedding.
  Defaults to the `AI_EMBEDDINGS_MODEL` environment variable.
- **`options.apiKey`**: - The API key for the AI service. Defaults to the
  `AI_KEY` environment variable.
- **`options.vertex`**: - If `true`, uses Vertex AI. Automatically set to `true`
  if `AI_PROJECT` and `AI_LOCATION` are set in the environment. Defaults to
  `false`.
- **`options.project`**: - The Google Cloud project ID for Vertex AI. Defaults
  to the `AI_PROJECT` environment variable.
- **`options.location`**: - The Google Cloud location for Vertex AI. Defaults to
  the `AI_LOCATION` environment variable.
- **`options.ollama`**: - If `true`, uses Ollama. Defaults to the `OLLAMA`
  environment variable. If you want your Ollama instance to be used, you can
  pass it here too.
- **`options.verbose`**: - If `true`, logs additional debugging information.
  Defaults to `false`.
- **`options.contextWindow`**: - An option to specify the context window size
  for Ollama models. By default, Ollama sets this depending on the model, which
  can be lower than the actual maximum context window size of the model.

##### Returns

A promise that resolves to the SimpleTable instance containing the similarity
search results.

##### Examples

```ts
// New table with a "food" column.
await table.loadArray([
  { food: "pizza" },
  { food: "sushi" },
  { food: "burger" },
  { food: "pasta" },
  { food: "salad" },
  { food: "tacos" },
]);

// Generate embeddings for the "food" column.
await table.aiEmbeddings("food", "embeddings", { cache: true });

// Find the 3 most similar foods to "italian food" based on embeddings.
const similarFoods = await table.aiVectorSimilarity(
  "italian food",
  "embeddings",
  3,
  {
    createIndex: true, // Create an index on the embeddings column for faster searches
    cache: true, // Cache the embedding of "italian food"
  },
);

// Log the results
await similarFoods.logTable();
```

#### `aiQuery`

Generates and executes a SQL query based on a prompt. Additional instructions,
such as column types, are automatically added to your prompt. Set `verbose` to
`true` to see the full prompt.

This method supports Google Gemini, Vertex AI, and local models running with
Ollama. Credentials and model selection are determined by environment variables
(`AI_KEY`, `AI_PROJECT`, `AI_LOCATION`, `AI_MODEL`) or directly via `options`,
with `options` taking precedence.

For Ollama, set the `OLLAMA` environment variable to `true`, ensure Ollama is
running, and set `AI_MODEL` to your desired model name. You can also pass your
instance of Ollama to the `ollama` option.

Temperature is set to 0 to aim for reproducible results. For future consistency,
it's recommended to copy the generated query and execute it manually using
`await sdb.customQuery(query)` or to cache the query using the `cache` option.

When `cache` is `true`, the generated query will be cached locally in
`.journalism-cache` (from the `askAI` function in the
[journalism library](https://github.com/nshiab/journalism)), saving resources
and time. Remember to add `.journalism-cache` to your `.gitignore`.

##### Signature

```typescript
async aiQuery(prompt: string, options?: { cache?: boolean; model?: string; apiKey?: string; vertex?: boolean; project?: string; location?: string; ollama?: boolean | Ollama; contextWindow?: number; thinkingBudget?: number; verbose?: boolean }): Promise<void>;
```

##### Parameters

- **`prompt`**: - The input string to guide the AI in generating the SQL query.
- **`options`**: - Configuration options for the AI request.
- **`options.cache`**: - If `true`, the generated query will be cached locally.
  Defaults to `false`.
- **`options.model`**: - The AI model to use. Defaults to the `AI_MODEL`
  environment variable.
- **`options.apiKey`**: - The API key for the AI service. Defaults to the
  `AI_KEY` environment variable.
- **`options.vertex`**: - If `true`, uses Vertex AI. Automatically set to `true`
  if `AI_PROJECT` and `AI_LOCATION` are set in the environment. Defaults to
  `false`.
- **`options.project`**: - The Google Cloud project ID for Vertex AI. Defaults
  to the `AI_PROJECT` environment variable.
- **`options.location`**: - The Google Cloud location for Vertex AI. Defaults to
  the `AI_LOCATION` environment variable.
- **`options.ollama`**: - If `true`, uses Ollama. Defaults to the `OLLAMA`
  environment variable. If you want your Ollama instance to be used, you can
  pass it here too.
- **`options.contextWindow`**: - An option to specify the context window size
  for Ollama models. By default, Ollama sets this depending on the model, which
  can be lower than the actual maximum context window size of the model.
- **`options.thinkingBudget`**: - Sets the reasoning token budget: 0 to disable
  (default, though some models may reason regardless), -1 for a dynamic budget,
  or > 0 for a fixed budget. For Ollama models, any non-zero value simply
  enables reasoning, ignoring the specific budget amount.
- **`options.verbose`**: - If `true`, logs additional debugging information,
  including the full prompt sent to the AI. Defaults to `false`.

##### Returns

A promise that resolves when the AI query has been executed.

##### Examples

```ts
// The AI will generate a query that will be executed, and
// the result will replace the existing table.
// If run again, it will use the previous query from the cache.
// Don't forget to add .journalism-cache to your .gitignore file!
await table.aiQuery(
  "Give me the average salary by department",
  { cache: true, verbose: true },
);
```

#### `insertRows`

Inserts rows, provided as an array of JavaScript objects, into the table.

##### Signature

```typescript
async insertRows(rows: Record<string, unknown>[]): Promise<void>;
```

##### Parameters

- **`rows`**: - An array of objects, where each object represents a row to be
  inserted and its properties correspond to column names.

##### Returns

A promise that resolves when the rows have been inserted.

##### Examples

```ts
// Insert new rows into the table
const newRows = [
  { letter: "c", number: 3 },
  { letter: "d", number: 4 },
];
await table.insertRows(newRows);
```

#### `insertTables`

Inserts all rows from one or more other tables into this table. If tables do not
have the same columns, an error will be thrown unless the `unifyColumns` option
is set to `true`.

##### Signature

```typescript
async insertTables(tablesToInsert: SimpleTable | SimpleTable[], options?: { unifyColumns?: boolean }): Promise<void>;
```

##### Parameters

- **`tablesToInsert`**: - The name(s) of the table(s) or SimpleTable instance(s)
  from which rows will be inserted.
- **`options`**: - An optional object with configuration options:
- **`options.unifyColumns`**: - A boolean indicating whether to unify the
  columns of the tables. If `true`, missing columns in a table will be filled
  with `NULL` values. Defaults to `false`.

##### Returns

A promise that resolves when the rows have been inserted.

##### Examples

```ts
// Insert all rows from 'tableB' into 'tableA'.
await tableA.insertTables("tableB");
```

```ts
// Insert all rows from 'tableB' and 'tableC' into 'tableA'.
await tableA.insertTables(["tableB", "tableC"]);
```

```ts
// Insert rows from multiple tables, unifying columns. Missing columns will be filled with NULL.
await tableA.insertTables(["tableB", "tableC"], { unifyColumns: true });
```

#### `cloneTable`

Returns a new table with the same structure and data as this table. The data can
be optionally filtered. Note that cloning large tables can be a slow operation.

##### Signature

```typescript
async cloneTable(nameOrOptions?: string | { outputTable?: string; conditions?: string; columns?: string | string[] }): Promise<SimpleTable>;
```

##### Parameters

- **`nameOrOptions`**: - Either a string specifying the name of the new table,
  or an optional object with configuration options. If not provided, a default
  name (e.g., "table1", "table2") will be generated.
- **`nameOrOptions.outputTable`**: - The name of the new table to be created in
  the database. If not provided, a default name (e.g., "table1", "table2") will
  be generated.
- **`nameOrOptions.conditions`**: - A SQL `WHERE` clause condition to filter the
  data during cloning. Defaults to no condition (clones all rows).
- **`nameOrOptions.columns`**: - An array of column names to include in the
  cloned table. If not provided, all columns will be included.

##### Returns

A promise that resolves to the new SimpleTable instance containing the cloned
data.

##### Examples

```ts
// Clone tableA to a new table with a default generated name (e.g., "table1")
const tableB = await tableA.cloneTable();
```

```ts
// Clone tableA to a new table named "my_cloned_table" using string parameter
const tableB = await tableA.cloneTable("my_cloned_table");
```

```ts
// Clone tableA to a new table named "my_cloned_table" using options object
const tableB = await tableA.cloneTable({ outputTable: "my_cloned_table" });
```

```ts
// Clone tableA, including only rows where 'column1' is greater than 10
const tableB = await tableA.cloneTable({ conditions: `column1 > 10` });
```

```ts
// Clone tableA with only specific columns
const tableB = await tableA.cloneTable({ columns: ["name", "age", "city"] });
```

```ts
// Clone tableA to a specific table name with filtered data and specific columns
const tableB = await tableA.cloneTable({
  outputTable: "filtered_data",
  conditions: `status = 'active' AND created_date >= '2023-01-01'`,
  columns: ["name", "status", "created_date"],
});
```

#### `cloneColumn`

Clones an existing column in this table, creating a new column with identical
values.

##### Signature

```typescript
async cloneColumn(originalColumn: string, newColumn: string): Promise<void>;
```

##### Parameters

- **`originalColumn`**: - The name of the original column to clone.
- **`newColumn`**: - The name of the new column to be created.

##### Returns

A promise that resolves when the column has been cloned.

##### Examples

```ts
// Clone 'firstName' column as 'contactName'
await table.cloneColumn("firstName", "contactName");
```

#### `cloneColumnWithOffset`

Clones a column in the table and offsets its values by a specified number of
rows. This is useful for time-series analysis or comparing values across
different time points.

##### Signature

```typescript
async cloneColumnWithOffset(originalColumn: string, newColumn: string, options?: { offset?: number; categories?: string | string[] }): Promise<void>;
```

##### Parameters

- **`originalColumn`**: - The name of the original column.
- **`newColumn`**: - The name of the new column to be created with offset
  values.
- **`options`**: - An optional object with configuration options:
- **`options.offset`**: - The number of rows to offset the values. A positive
  number shifts values downwards (later rows), a negative number shifts values
  upwards (earlier rows). Defaults to `1`.
- **`options.categories`**: - A string or an array of strings representing
  columns to partition the data by. The offset will be applied independently
  within each category.

##### Returns

A promise that resolves when the column has been cloned with offset values.

##### Examples

```ts
// Clone 'value' as 'previous_value', offsetting by 1 row (value of row N-1 goes to row N)
await table.cloneColumnWithOffset("value", "previous_value");
```

```ts
// Clone 'sales' as 'sales_2_days_ago', offsetting by 2 rows
await table.cloneColumnWithOffset("sales", "sales_2_days_ago", { offset: 2 });
```

```ts
// Clone 'temperature' as 'prev_temp_by_city', offsetting by 1 row within each 'city' category
await table.cloneColumnWithOffset("temperature", "prev_temp_by_city", {
  offset: 1,
  categories: "city",
});
```

```ts
// Clone 'stock_price' as 'prev_price_by_stock_and_exchange', offsetting by 1 row within each 'stock_symbol' and 'exchange' category
await table.cloneColumnWithOffset(
  "stock_price",
  "prev_price_by_stock_and_exchange",
  {
    offset: 1,
    categories: ["stock_symbol", "exchange"],
  },
);
```

#### `fill`

Fills `NULL` values in specified columns with the last non-`NULL` value from the
preceding row.

##### Signature

```typescript
async fill(columns: string | string[]): Promise<void>;
```

##### Parameters

- **`columns`**: - The column(s) for which to fill `NULL` values.

##### Returns

A promise that resolves when the `NULL` values have been filled.

##### Examples

```ts
// Fill NULL values in 'column1' with the previous non-NULL value
await table.fill("column1");
```

```ts
// Fill NULL values in multiple columns
await table.fill(["columnA", "columnB"]);
```

#### `sort`

Sorts the rows of the table based on specified column(s) and order(s). If no
columns are specified, all columns are sorted from left to right in ascending
order.

##### Signature

```typescript
async sort(order?: Record<string, "asc" | "desc"> | null, options?: { lang?: Record<string, string> }): Promise<void>;
```

##### Parameters

- **`order`**: - An object mapping column names to their sorting order: `"asc"`
  for ascending or `"desc"` for descending. If `null`, all columns are sorted
  ascendingly.
- **`options`**: - An optional object with configuration options:
- **`options.lang`**: - An object mapping column names to language codes for
  collation (e.g., `{ column1: "fr" }`). See DuckDB Collations documentation for
  more details: https://duckdb.org/docs/sql/expressions/collations.

##### Returns

A promise that resolves when the table has been sorted.

##### Examples

```ts
// Sort all columns from left to right in ascending order
await table.sort();
```

```ts
// Sort 'column1' in ascending order
await table.sort({ column1: "asc" });
```

```ts
// Sort 'column1' ascendingly, then 'column2' descendingly
await table.sort({ column1: "asc", column2: "desc" });
```

```ts
// Sort 'column1' considering French accents
await table.sort({ column1: "asc" }, { lang: { column1: "fr" } });
```

#### `selectColumns`

Selects specific columns in the table, removing all others.

##### Signature

```typescript
async selectColumns(columns: string | string[]): Promise<void>;
```

##### Parameters

- **`columns`**: - The name or an array of names of the columns to be selected.

##### Returns

A promise that resolves when the columns have been selected.

##### Examples

```ts
// Select only the 'firstName' and 'lastName' columns, removing all other columns.
await table.selectColumns(["firstName", "lastName"]);
```

```ts
// Select only the 'productName' column.
await table.selectColumns("productName");
```

#### `skip`

Skips the first `n` rows of the table, effectively removing them.

##### Signature

```typescript
async skip(nbRowsToSkip: number): Promise<void>;
```

##### Parameters

- **`nbRowsToSkip`**: - The number of rows to skip from the beginning of the
  table.

##### Returns

A promise that resolves when the rows have been skipped.

##### Examples

```ts
// Skip the first 10 rows of the table
await table.skip(10);
```

#### `hasColumn`

Checks if a column with the specified name exists in the table.

##### Signature

```typescript
async hasColumn(column: string): Promise<boolean>;
```

##### Parameters

- **`column`**: - The name of the column to check.

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

##### Signature

```typescript
async sample(quantity: number | string, options?: { seed?: number }): Promise<void>;
```

##### Parameters

- **`quantity`**: - The number of rows to select (e.g., `100`) or a percentage
  string (e.g., `"10%"`) specifying the sampling size.
- **`options`**: - An optional object with configuration options:
- **`options.seed`**: - A number specifying the seed for repeatable sampling.
  Using the same seed will always yield the same random rows. Defaults to a
  random seed.

##### Returns

A promise that resolves when the sampling is complete.

##### Examples

```ts
// Select 100 random rows from the table
await table.sample(100);
```

```ts
// Select 10% of the rows randomly
await table.sample("10%");
```

```ts
// Select random rows with a specific seed for repeatable results
await table.sample("10%", { seed: 123 });
```

#### `selectRows`

Selects a specified number of rows from this table. An offset can be applied to
skip initial rows, and the results can be output to a new table.

##### Signature

```typescript
async selectRows(count: number | string, options?: { offset?: number; outputTable?: string | boolean }): Promise<SimpleTable>;
```

##### Parameters

- **`count`**: - The number of rows to select.
- **`options`**: - An optional object with configuration options:
- **`options.offset`**: - The number of rows to skip from the beginning of the
  table before selecting. Defaults to `0`.
- **`options.outputTable`**: - If `true`, the selected rows will be stored in a
  new table with a generated name. If a string, it will be used as the name for
  the new table. If `false` or omitted, the current table will be modified.
  Defaults to `false`.

##### Returns

A promise that resolves to the SimpleTable instance containing the selected rows
(either the modified current table or a new table).

##### Examples

```ts
// Select the first 100 rows of the current table
await table.selectRows(100);
```

```ts
// Select 100 rows after skipping the first 50 rows
await table.selectRows(100, { offset: 50 });
```

```ts
// Select 50 rows and store them in a new table with a generated name
const newTable = await table.selectRows(50, { outputTable: true });
```

```ts
// Select 75 rows and store them in a new table named "top_customers"
const topCustomersTable = await table.selectRows(75, {
  outputTable: "top_customers",
});
```

#### `removeDuplicates`

Removes duplicate rows from this table, keeping only unique rows. Note that the
resulting data order might differ from the original.

##### Signature

```typescript
async removeDuplicates(options?: { on?: string | string[] }): Promise<void>;
```

##### Parameters

- **`options`**: - An optional object with configuration options:
- **`options.on`**: - A column name or an array of column names to consider when
  identifying duplicates. If specified, duplicates are determined based only on
  the values in these columns. If omitted, all columns are considered.

##### Returns

A promise that resolves when the duplicate rows have been removed.

##### Examples

```ts
// Remove duplicate rows based on all columns
await table.removeDuplicates();
```

```ts
// Remove duplicate rows based only on the 'email' column
await table.removeDuplicates({ on: "email" });
```

```ts
// Remove duplicate rows based on 'firstName' and 'lastName' columns
await table.removeDuplicates({ on: ["firstName", "lastName"] });
```

#### `removeMissing`

Removes rows with missing values from this table. By default, missing values
include SQL `NULL`, as well as string representations like `"NULL"`, `"null"`,
`"NaN"`, `"undefined"`, and empty strings `""`.

##### Signature

```typescript
async removeMissing(options?: { columns?: string | string[]; missingValues?: (string | number)[]; invert?: boolean }): Promise<void>;
```

##### Parameters

- **`options`**: - An optional object with configuration options:
- **`options.columns`**: - A string or an array of strings specifying the
  columns to consider for missing values. If omitted, all columns are
  considered.
- **`options.missingValues`**: - An array of values to be treated as missing
  values instead of the default ones. Defaults to
  `["undefined", "NaN", "null", "NULL", ""]`.
- **`options.invert`**: - A boolean indicating whether to invert the condition.
  If `true`, only rows containing missing values will be kept. Defaults to
  `false`.

##### Returns

A promise that resolves when the rows with missing values have been removed.

##### Examples

```ts
// Remove rows with missing values in any column
await table.removeMissing();
```

```ts
// Remove rows with missing values only in 'firstName' or 'lastName' columns
await table.removeMissing({ columns: ["firstName", "lastName"] });
```

```ts
// Keep only rows with missing values in any column
await table.removeMissing({ invert: true });
```

```ts
// Remove rows where 'age' is missing or is equal to -1
await table.removeMissing({ columns: "age", missingValues: [-1] });
```

#### `trim`

Trims specified characters from the beginning, end, or both sides of string
values in the given columns.

##### Signature

```typescript
async trim(columns: string | string[], options?: { character?: string; method?: "leftTrim" | "rightTrim" | "trim" }): Promise<void>;
```

##### Parameters

- **`columns`**: - The column name or an array of column names to trim.
- **`options`**: - An optional object with configuration options:
- **`options.character`**: - The string to trim. Defaults to whitespace
  characters.
- **`options.method`**: - The trimming method to apply: `"leftTrim"` (removes
  from the beginning), `"rightTrim"` (removes from the end), or `"trim"`
  (removes from both sides). Defaults to `"trim"`.

##### Returns

A promise that resolves when the trimming operation is complete.

##### Examples

```ts
// Trim whitespace from 'column1'
await table.trim("column1");
```

```ts
// Trim leading and trailing asterisks from 'productCode'
await table.trim("productCode", { character: "*" });
```

```ts
// Right-trim whitespace from 'description' and 'notes' columns
await table.trim(["description", "notes"], { method: "rightTrim" });
```

#### `filter`

Filters rows from this table based on SQL conditions. Note that it's often
faster to use the `removeRows` method for simple removals. You can also use
JavaScript syntax for conditions (e.g., `&&`, `||`, `===`, `!==`).

##### Signature

```typescript
async filter(conditions: string): Promise<void>;
```

##### Parameters

- **`conditions`**: - The filtering conditions specified as a SQL `WHERE` clause
  (e.g., `"column1 > 10 AND column2 = 'value'"`).

##### Returns

A promise that resolves when the rows have been filtered.

##### Examples

```ts
// Keep only rows where the 'fruit' column is not 'apple'
await table.filter(`fruit != 'apple'`);
```

```ts
// Keep rows where 'price' is greater than 100 AND 'quantity' is greater than 0
await table.filter(`price > 100 && quantity > 0`); // Using JS syntax
```

```ts
// Keep rows where 'category' is 'Electronics' OR 'Appliances'
await table.filter(`category === 'Electronics' || category === 'Appliances'`); // Using JS syntax
```

```ts
// Keep rows where 'lastPurchaseDate' is on or after '2023-01-01'
await table.filter(`lastPurchaseDate >= '2023-01-01'`);
```

#### `keep`

Keeps rows in this table that have specific values in specified columns,
removing all other rows.

##### Signature

```typescript
async keep(columnsAndValues: Record<string, (number | string | Date | boolean | null)[] | (number | string | Date | boolean | null)>): Promise<void>;
```

##### Parameters

- **`columnsAndValues`**: - An object where keys are column names and values are
  the specific values (or an array of values) to keep in those columns.

##### Returns

A promise that resolves when the rows have been filtered.

##### Examples

```ts
// Keep only rows where 'job' is 'accountant' or 'developer', AND 'city' is 'Montreal'
await table.keep({ job: ["accountant", "developer"], city: "Montreal" });
```

```ts
// Keep only rows where 'status' is 'active'
await table.keep({ status: "active" });
```

#### `remove`

Removes rows from this table that have specific values in specified columns.

##### Signature

```typescript
async remove(columnsAndValues: Record<string, (number | string | Date | boolean | null)[] | (number | string | Date | boolean | null)>): Promise<void>;
```

##### Parameters

- **`columnsAndValues`**: - An object where keys are column names and values are
  the specific values (or an array of values) to remove from those columns.

##### Returns

A promise that resolves when the rows have been removed.

##### Examples

```ts
// Remove rows where 'job' is 'accountant' or 'developer', AND 'city' is 'Montreal'
await table.remove({ job: ["accountant", "developer"], city: "Montreal" });
```

```ts
// Remove rows where 'status' is 'inactive'
await table.remove({ status: "inactive" });
```

#### `removeRows`

Removes rows from this table based on SQL conditions. This method is similar to
`filter()`, but removes rows instead of keeping them. You can also use
JavaScript syntax for conditions (e.g., `&&`, `||`, `===`, `!==`).

##### Signature

```typescript
async removeRows(conditions: string): Promise<void>;
```

##### Parameters

- **`conditions`**: - The filtering conditions specified as a SQL `WHERE` clause
  (e.g., `"fruit = 'apple'"`).

##### Returns

A promise that resolves when the rows have been removed.

##### Examples

```ts
// Remove rows where the 'fruit' column is 'apple'
await table.removeRows(`fruit = 'apple'`);
```

```ts
// Remove rows where 'quantity' is less than 5
await table.removeRows(`quantity < 5`);
```

```ts
// Remove rows where 'price' is less than 100 AND 'quantity' is 0
await table.removeRows(`price < 100 && quantity === 0`); // Using JS syntax
```

```ts
// Remove rows where 'category' is 'Electronics' OR 'Appliances'
await table.removeRows(
  `category === 'Electronics' || category === 'Appliances'`,
); // Using JS syntax
```

#### `renameColumns`

Renames one or more columns in the table.

##### Signature

```typescript
async renameColumns(names: Record<string, string>): Promise<void>;
```

##### Parameters

- **`names`**: - An object mapping old column names to their new column names
  (e.g., `{ "oldName": "newName", "anotherOld": "anotherNew" }`).

##### Returns

A promise that resolves when the columns have been renamed.

##### Examples

```ts
// Rename "How old?" to "age" and "Man or woman?" to "sex"
await table.renameColumns({ "How old?": "age", "Man or woman?": "sex" });
```

```ts
// Rename a single column
await table.renameColumns({ "product_id": "productId" });
```

#### `cleanColumnNames`

Cleans column names by removing non-alphanumeric characters and formatting them
to camel case.

##### Signature

```typescript
async cleanColumnNames(): Promise<void>;
```

##### Returns

A promise that resolves when the column names have been cleaned.

##### Examples

```ts
// Clean all column names in the table
// e.g., "First Name" becomes "firstName", "Product ID" becomes "productId"
await table.cleanColumnNames();
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
async longer(columns: string[], columnsTo: string, valuesTo: string): Promise<void>;
```

##### Parameters

- **`columns`**: - An array of strings representing the names of the columns to
  be stacked (unpivoted).
- **`columnsTo`**: - The name of the new column that will contain the original
  column names (e.g., "Year").
- **`valuesTo`**: - The name of the new column that will contain the values from
  the stacked columns (e.g., "Employees").

##### Returns

A promise that resolves when the table has been restructured.

##### Examples

```ts
// Restructure the table by stacking year columns into 'year' and 'employees'
await table.longer(["2021", "2022", "2023"], "year", "employees");
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
async wider(columnsFrom: string, valuesFrom: string): Promise<void>;
```

##### Parameters

- **`columnsFrom`**: - The name of the column containing the values that will be
  transformed into new column headers (e.g., "Year").
- **`valuesFrom`**: - The name of the column containing the values to be spread
  across the new columns (e.g., "Employees").

##### Returns

A promise that resolves when the table has been restructured.

##### Examples

```ts
// Restructure the table by pivoting 'Year' into new columns with 'Employees' as values
await table.wider("Year", "Employees");
```

The table will then look like this:

| Department | 2021 | 2022 | 2023 |
| :--------- | :--- | :--- | :--- |
| Accounting | 10   | 9    | 15   |
| Sales      | 52   | 75   | 98   |

#### `convert`

Converts data types of specified columns to target types (JavaScript or SQL
types).

When converting timestamps, dates, or times to/from strings, you must provide a
`datetimeFormat` option using
[DuckDB's format specifiers](https://duckdb.org/docs/sql/functions/dateformat).

When converting timestamps, dates, or times to/from numbers, the numerical
representation will be in milliseconds since the Unix epoch (1970-01-01 00:00:00
UTC).

When converting strings to numbers, commas (often used as thousand separators)
will be automatically removed before conversion.

##### Signature

```typescript
async convert(types: Record<string, "integer" | "float" | "number" | "string" | "date" | "time" | "datetime" | "datetimeTz" | "bigint" | "double" | "varchar" | "timestamp" | "timestamp with time zone" | "boolean">, options?: { try?: boolean; datetimeFormat?: string }): Promise<void>;
```

##### Parameters

- **`types`**: - An object mapping column names to their target data types for
  conversion.
- **`options`**: - An optional object with configuration options:
- **`options.try`**: - If `true`, values that cannot be converted will be
  replaced by `NULL` instead of throwing an error. Defaults to `false`.
- **`options.datetimeFormat`**: - A string specifying the format for date and
  time conversions. Uses `strftime` and `strptime` functions from DuckDB. For
  format specifiers, see
  [DuckDB's documentation](https://duckdb.org/docs/sql/functions/dateformat).

##### Returns

A promise that resolves when the column types have been converted.

##### Examples

```ts
// Convert 'column1' to string and 'column2' to integer (JavaScript types)
await table.convert({ column1: "string", column2: "integer" });
```

```ts
// Convert 'column1' to VARCHAR and 'column2' to BIGINT (SQL types)
await table.convert({ column1: "varchar", column2: "bigint" });
```

```ts
// Convert strings in 'column3' to datetime using a specific format
await table.convert({ column3: "datetime" }, { datetimeFormat: "%Y-%m-%d" });
```

```ts
// Convert datetime values in 'column3' to strings using a specific format
await table.convert({ column3: "string" }, {
  datetimeFormat: "%Y-%m-%d %H:%M:%S",
});
```

```ts
// Convert 'amount' to float, replacing unconvertible values with NULL
await table.convert({ amount: "float" }, { try: true });
```

#### `removeTable`

Removes the table from the database. After this operation, invoking methods on
this SimpleTable instance will result in an error.

##### Signature

```typescript
async removeTable(): Promise<void>;
```

##### Returns

A promise that resolves when the table has been removed.

##### Examples

```ts
// Remove the current table from the database
await table.removeTable();
```

#### `removeColumns`

Removes one or more columns from this table.

##### Signature

```typescript
async removeColumns(columns: string | string[]): Promise<void>;
```

##### Parameters

- **`columns`**: - The name or an array of names of the columns to be removed.

##### Returns

A promise that resolves when the columns have been removed.

##### Examples

```ts
// Remove 'column1' and 'column2' from the table
await table.removeColumns(["column1", "column2"]);
```

```ts
// Remove a single column named 'tempColumn'
await table.removeColumns("tempColumn");
```

#### `addColumn`

Adds a new column to the table based on a specified data type (JavaScript or SQL
types) and a SQL definition.

##### Signature

```typescript
async addColumn(newColumn: string, type: "integer" | "float" | "number" | "string" | "date" | "time" | "datetime" | "datetimeTz" | "bigint" | "double" | "varchar" | "timestamp" | "timestamp with time zone" | "boolean" | "geometry", definition: string, options?: { projection?: string }): Promise<void>;
```

##### Parameters

- **`newColumn`**: - The name of the new column to be added.
- **`type`**: - The data type for the new column. Can be a JavaScript type
  (e.g., `"number"`, `"string"`) or a SQL type (e.g., `"integer"`, `"varchar"`).
- **`definition`**: - A SQL expression defining how the values for the new
  column should be computed (e.g., `"column1 + column2"`,
  `"ST_Centroid(geom_column)"`).
- **`options`**: - An optional object with configuration options:
- **`options.projection`**: - Required if the new column stores geometries.
  Specifies the geospatial projection of the new geometry column. You can reuse
  the projection of an existing geometry column (available in
  `table.projections`).

##### Returns

A promise that resolves when the new column has been added.

##### Examples

```ts
// Add a new column 'total' as a float, calculated from 'column1' and 'column2'
await table.addColumn("total", "float", "column1 + column2");
```

```ts
// Add a new geometry column 'centroid' using the centroid of an existing 'country' geometry column
// The projection of the new 'centroid' column is set to be the same as 'country'.
await table.addColumn("centroid", "geometry", `ST_Centroid("country")`, {
  projection: table.projections.country,
});
```

#### `addRowNumber`

Adds a new column to the table containing the row number.

##### Signature

```typescript
async addRowNumber(newColumn: string): Promise<void>;
```

##### Parameters

- **`newColumn`**: - The name of the new column that will store the row number.

##### Returns

A promise that resolves when the row number column has been added.

##### Examples

```ts
// Add a new column named 'rowNumber' with the row number for each row
await table.addRowNumber("rowNumber");
```

#### `crossJoin`

Performs a cross join operation with another table. A cross join returns the
Cartesian product of the rows from both tables, meaning all possible pairs of
rows will be in the resulting table. This means that if the left table has `n`
rows and the right table has `m` rows, the result will have `n * m` rows.

##### Signature

```typescript
async crossJoin(rightTable: SimpleTable, options?: { outputTable?: string | boolean }): Promise<SimpleTable>;
```

##### Parameters

- **`rightTable`**: - The SimpleTable instance to cross join with.
- **`options`**: - An optional object with configuration options:
- **`options.outputTable`**: - If `true`, the results will be stored in a new
  table with a generated name. If a string, it will be used as the name for the
  new table. If `false` or omitted, the current table will be overwritten.
  Defaults to `false`.

##### Returns

A promise that resolves to the SimpleTable instance containing the cross-joined
data (either the modified current table or a new table).

##### Examples

```ts
// Perform a cross join with 'tableB', overwriting the current table (tableA)
await tableA.crossJoin(tableB);
```

```ts
// Perform a cross join with 'tableB' and store the results in a new table with a generated name
const tableC = await tableA.crossJoin(tableB, { outputTable: true });
```

```ts
// Perform a cross join with 'tableB' and store the results in a new table named 'tableC'
const tableC = await tableA.crossJoin(tableB, { outputTable: "tableC" });
```

#### `join`

Merges the data of this table (considered the left table) with another table
(the right table) based on a common column or multiple columns. Note that the
order of rows in the returned data is not guaranteed to be the same as in the
original tables. This operation might create temporary files in a `.tmp` folder;
consider adding `.tmp` to your `.gitignore`.

##### Signature

```typescript
async join(rightTable: SimpleTable, options?: { commonColumn?: string | string[]; type?: "inner" | "left" | "right" | "full"; outputTable?: string | boolean }): Promise<SimpleTable>;
```

##### Parameters

- **`rightTable`**: - The SimpleTable instance to be joined with this table.
- **`options`**: - An optional object with configuration options:
- **`options.commonColumn`**: - The common column(s) used for the join
  operation. If omitted, the method automatically searches for a column name
  that exists in both tables. Can be a single string or an array of strings for
  multiple join keys.
- **`options.type`**: - The type of join operation to perform. Possible values
  are `"inner"`, `"left"` (default), `"right"`, or `"full"`.
- **`options.outputTable`**: - If `true`, the results will be stored in a new
  table with a generated name. If a string, it will be used as the name for the
  new table. If `false` or omitted, the current table will be overwritten.
  Defaults to `false`.

##### Returns

A promise that resolves to the SimpleTable instance containing the joined data
(either the modified current table or a new table).

##### Examples

```ts
// Perform a left join with 'tableB' on a common column (auto-detected), overwriting tableA
await tableA.join(tableB);
```

```ts
// Perform an inner join with 'tableB' on the 'id' column, storing results in a new table named 'tableC'
const tableC = await tableA.join(tableB, {
  commonColumn: "id",
  type: "inner",
  outputTable: "tableC",
});
```

```ts
// Perform a join on multiple columns ('name' and 'category')
await tableA.join(tableB, { commonColumn: ["name", "category"] });
```

#### `replace`

Replaces specified strings in the selected columns.

##### Signature

```typescript
async replace(columns: string | string[], strings: Record<string, string>, options?: { entireString?: boolean; regex?: boolean }): Promise<void>;
```

##### Parameters

- **`columns`**: - The column name or an array of column names where string
  replacements will occur.
- **`strings`**: - An object mapping old strings to new strings (e.g.,
  `{ "oldValue": "newValue" }`).
- **`options`**: - An optional object with configuration options:
- **`options.entireString`**: - A boolean indicating whether the entire cell
  content must match the `oldString` for replacement to occur. Defaults to
  `false` (replaces substrings).
- **`options.regex`**: - A boolean indicating whether the `oldString` should be
  treated as a regular expression for global replacement. Cannot be used with
  `entireString: true`. Defaults to `false`.

##### Returns

A promise that resolves when the string replacements are complete.

##### Examples

```ts
// Replace all occurrences of "kilograms" with "kg" in 'column1'
await table.replace("column1", { "kilograms": "kg" });
```

```ts
// Replace "kilograms" with "kg" and "liters" with "l" in 'column1' and 'column2'
await table.replace(["column1", "column2"], {
  "kilograms": "kg",
  "liters": "l",
});
```

```ts
// Replace only if the entire string in 'column1' is "kilograms"
await table.replace("column1", { "kilograms": "kg" }, { entireString: true });
```

```ts
// Replace any sequence of one or more digits with a hyphen in 'column1' using regex
await table.replace("column1", { "\d+": "-" }, { regex: true });
```

#### `lower`

Converts string values in the specified columns to lowercase.

##### Signature

```typescript
async lower(columns: string | string[]): Promise<void>;
```

##### Parameters

- **`columns`**: - The column name or an array of column names to be converted
  to lowercase.

##### Returns

A promise that resolves when the strings have been converted to lowercase.

##### Examples

```ts
// Convert strings in 'column1' to lowercase
await table.lower("column1");
```

```ts
// Convert strings in 'column1' and 'column2' to lowercase
await table.lower(["column1", "column2"]);
```

#### `upper`

Converts string values in the specified columns to uppercase.

##### Signature

```typescript
async upper(columns: string | string[]): Promise<void>;
```

##### Parameters

- **`columns`**: - The column name or an array of column names to be converted
  to uppercase.

##### Returns

A promise that resolves when the strings have been converted to uppercase.

##### Examples

```ts
// Convert strings in 'column1' to uppercase
await table.upper("column1");
```

```ts
// Convert strings in 'column1' and 'column2' to uppercase
await table.upper(["column1", "column2"]);
```

#### `capitalize`

Capitalizes the first letter of each string in the specified columns and
converts the rest of the string to lowercase.

##### Signature

```typescript
async capitalize(columns: string | string[]): Promise<void>;
```

##### Parameters

- **`columns`**: - The column name or an array of column names to be
  capitalized.

##### Returns

A promise that resolves when the strings have been capitalized.

##### Examples

```ts
// Capitalize strings in 'column1' (e.g., "hello world" becomes "Hello world")
await table.capitalize("column1");
```

```ts
// Capitalize strings in 'column1' and 'column2'
await table.capitalize(["column1", "column2"]);
```

#### `splitExtract`

Splits strings in a specified column by a separator and extracts a substring at
a given index, storing the result in a new or existing column. If the index is
out of bounds, an empty string will be returned for that row.

##### Signature

```typescript
async splitExtract(column: string, separator: string, index: number, newColumn: string): Promise<void>;
```

##### Parameters

- **`column`**: - The name of the column containing the strings to be split.
- **`separator`**: - The substring to use as a delimiter for splitting the
  strings.
- **`index`**: - The zero-based index of the substring to extract after
  splitting. For example, `0` for the first part, `1` for the second, etc.
- **`newColumn`**: - The name of the column where the extracted substrings will
  be stored. To overwrite the original column, use the same name as `column`.

##### Returns

A promise that resolves when the strings have been split and extracted.

##### Examples

```ts
// Split 'address' by comma and extract the second part (index 1) into a new 'city' column
// e.g., "123 Main St, Anytown, USA" -> "Anytown"
await table.splitExtract("address", ",", 1, "city");
```

```ts
// Split 'fileName' by dot and extract the first part (index 0), overwriting 'fileName'
// e.g., "document.pdf" -> "document"
await table.splitExtract("fileName", ".", 0, "fileName");
```

#### `left`

Extracts a specific number of characters from the beginning (left side) of
string values in the specified column.

##### Signature

```typescript
async left(column: string, numberOfCharacters: number): Promise<void>;
```

##### Parameters

- **`column`**: - The name of the column containing the strings to be modified.
- **`numberOfCharacters`**: - The number of characters to extract from the left
  side of each string.

##### Returns

A promise that resolves when the strings have been updated.

##### Examples

```ts
// Replace strings in 'productCode' with their first two characters
// e.g., "ABC-123" becomes "AB"
await table.left("productCode", 2);
```

#### `right`

Extracts a specific number of characters from the end (right side) of string
values in the specified column.

##### Signature

```typescript
async right(column: string, numberOfCharacters: number): Promise<void>;
```

##### Parameters

- **`column`**: - The name of the column containing the strings to be modified.
- **`numberOfCharacters`**: - The number of characters to extract from the right
  side of each string.

##### Returns

A promise that resolves when the strings have been updated.

##### Examples

```ts
// Replace strings in 'productCode' with their last two characters
// e.g., "ABC-123" becomes "23"
await table.right("productCode", 2);
```

#### `replaceNulls`

Replaces `NULL` values in the specified columns with a given value.

##### Signature

```typescript
async replaceNulls(columns: string | string[], value: number | string | Date | boolean): Promise<void>;
```

##### Parameters

- **`columns`**: - The column name or an array of column names in which to
  replace `NULL` values.
- **`value`**: - The value to replace `NULL` occurrences with.

##### Returns

A promise that resolves when the `NULL` values have been replaced.

##### Examples

```ts
// Replace NULL values in 'column1' with 0
await table.replaceNulls("column1", 0);
```

```ts
// Replace NULL values in 'columnA' and 'columnB' with the string "N/A"
await table.replaceNulls(["columnA", "columnB"], "N/A");
```

```ts
// Replace NULL values in 'dateColumn' with a specific date
await table.replaceNulls("dateColumn", new Date("2023-01-01"));
```

#### `concatenate`

Concatenates values from specified columns into a new column.

##### Signature

```typescript
async concatenate(columns: string[], newColumn: string, options?: { separator?: string }): Promise<void>;
```

##### Parameters

- **`columns`**: - An array of column names whose values will be concatenated.
- **`newColumn`**: - The name of the new column to store the concatenated
  values.
- **`options`**: - An optional object with configuration options:
- **`options.separator`**: - The string used to separate concatenated values.
  Defaults to an empty string (`""`).

##### Returns

A promise that resolves when the concatenation is complete.

##### Examples

```ts
// Concatenate 'firstName' and 'lastName' into a new 'fullName' column
await table.concatenate(["firstName", "lastName"], "fullName");
```

```ts
// Concatenate 'city' and 'country' into 'location', separated by a comma and space
await table.concatenate(["city", "country"], "location", { separator: ", " });
```

#### `round`

Rounds numeric values in specified columns.

##### Signature

```typescript
async round(columns: string | string[], options?: { decimals?: number; method?: "round" | "ceiling" | "floor" }): Promise<void>;
```

##### Parameters

- **`columns`**: - The column name or an array of column names containing
  numeric values to be rounded.
- **`options`**: - An optional object with configuration options:
- **`options.decimals`**: - The number of decimal places to round to. Defaults
  to `0` (rounds to the nearest integer).
- **`options.method`**: - The rounding method to use: `"round"` (rounds to the
  nearest integer, with halves rounding up), `"ceiling"` (rounds up to the
  nearest integer), or `"floor"` (rounds down to the nearest integer). Defaults
  to `"round"`.

##### Returns

A promise that resolves when the numeric values have been rounded.

##### Examples

```ts
// Round 'column1' values to the nearest integer
await table.round("column1");
```

```ts
// Round 'column1' values to 2 decimal places
await table.round("column1", { decimals: 2 });
```

```ts
// Round 'column1' values down to the nearest integer (floor)
await table.round("column1", { method: "floor" });
```

```ts
// Round 'columnA' and 'columnB' values to 1 decimal place using ceiling method
await table.round(["columnA", "columnB"], { decimals: 1, method: "ceiling" });
```

#### `updateColumn`

Updates values in a specified column using a SQL expression.

##### Signature

```typescript
async updateColumn(column: string, definition: string): Promise<void>;
```

##### Parameters

- **`column`**: - The name of the column to be updated.
- **`definition`**: - The SQL expression used to set the new values in the
  column (e.g., `"column1 * 2"`, `"UPPER(column_name)"`).

##### Returns

A promise that resolves when the column has been updated.

##### Examples

```ts
// Update 'column1' with the left 5 characters of 'column2'
await table.updateColumn("column1", `LEFT(column2, 5)`);
```

```ts
// Double the values in 'price' column
await table.updateColumn("price", `price * 2`);
```

```ts
// Set 'status' to 'active' where 'isActive' is true
await table.updateColumn(
  "status",
  `CASE WHEN isActive THEN 'active' ELSE 'inactive' END`,
);
```

#### `ranks`

Assigns ranks to rows in a new column based on the values of a specified column.

##### Signature

```typescript
async ranks(values: string, newColumn: string, options?: { order?: "asc" | "desc"; categories?: string | string[]; noGaps?: boolean }): Promise<void>;
```

##### Parameters

- **`values`**: - The column containing the values to be used for ranking.
- **`newColumn`**: - The name of the new column where the ranks will be stored.
- **`options`**: - An optional object with configuration options:
- **`options.order`**: - The order of values for ranking: `"asc"` for ascending
  (default) or `"desc"` for descending.
- **`options.categories`**: - The column name or an array of column names that
  define categories for ranking. Ranks will be assigned independently within
  each category.
- **`options.noGaps`**: - A boolean indicating whether to assign ranks without
  gaps (dense ranking). If `true`, ranks will be consecutive integers (e.g., 1,
  2, 2, 3). If `false` (default), ranks might have gaps (e.g., 1, 2, 2, 4).

##### Returns

A promise that resolves when the ranks have been assigned.

##### Examples

```ts
// Compute ranks in a new 'rank' column based on 'score' values (ascending)
await table.ranks("score", "rank");
```

```ts
// Compute ranks in a new 'descRank' column based on 'score' values (descending)
await table.ranks("score", "descRank", { order: "desc" });
```

```ts
// Compute ranks within 'department' categories, based on 'salary' values, without gaps
await table.ranks("salary", "salaryRank", {
  categories: "department",
  noGaps: true,
});
```

```ts
// Compute ranks within multiple categories ('department' and 'city')
await table.ranks("sales", "salesRank", { categories: ["department", "city"] });
```

#### `quantiles`

Assigns quantiles to rows in a new column based on specified column values.

##### Signature

```typescript
async quantiles(values: string, nbQuantiles: number, newColumn: string, options?: { categories?: string | string[] }): Promise<void>;
```

##### Parameters

- **`values`**: - The column containing values from which quantiles will be
  assigned.
- **`nbQuantiles`**: - The number of quantiles to divide the data into (e.g.,
  `4` for quartiles, `10` for deciles).
- **`newColumn`**: - The name of the new column where the assigned quantiles
  will be stored.
- **`options`**: - An optional object with configuration options:
- **`options.categories`**: - The column name or an array of column names that
  define categories for computing quantiles. Quantiles will be assigned
  independently within each category.

##### Returns

A promise that resolves when the quantiles have been assigned.

##### Examples

```ts
// Assigns a quantile from 1 to 10 for each row in a new 'quantiles' column, based on 'column1' values.
await table.quantiles("column1", 10, "quantiles");
```

```ts
// Assigns quantiles within 'column2' categories, based on 'column1' values.
await table.quantiles("column1", 10, "quantiles", { categories: "column2" });
```

```ts
// Assigns quartiles (4 quantiles) to 'sales' data, storing results in 'salesQuartile'
await table.quantiles("sales", 4, "salesQuartile");
```

#### `bins`

Assigns bins for specified column values based on an interval size.

##### Signature

```typescript
async bins(values: string, interval: number, newColumn: string, options?: { startValue?: number }): Promise<void>;
```

##### Parameters

- **`values`**: - The column containing values from which bins will be computed.
- **`interval`**: - The interval size for binning the values.
- **`newColumn`**: - The name of the new column where the bins will be stored.
- **`options`**: - An optional object with configuration options:
- **`options.startValue`**: - The starting value for binning. Defaults to the
  minimum value in the specified column.

##### Returns

A promise that resolves when the bins have been assigned.

##### Examples

```ts
// Assigns a bin for each row in a new 'bins' column based on 'column1' values, with an interval of 10.
// If the minimum value in 'column1' is 5, the bins will follow this pattern: "[5-14]", "[15-24]", etc.
await table.bins("column1", 10, "bins");
```

```ts
// Assigns bins starting at a specific value (0) with an interval of 10.
// The bins will follow this pattern: "[0-9]", "[10-19]", "[20-29]", etc.
await table.bins("column1", 10, "bins", { startValue: 0 });
```

#### `proportionsHorizontal`

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
async proportionsHorizontal(columns: string[], options?: { suffix?: string; decimals?: number }): Promise<void>;
```

##### Parameters

- **`columns`**: - An array of column names for which proportions will be
  computed on each row.
- **`options`**: - An optional object with configuration options:
- **`options.suffix`**: - A string suffix to append to the names of the new
  columns storing the computed proportions. Defaults to `"Perc"`.
- **`options.decimals`**: - The number of decimal places to round the computed
  proportions. Defaults to `undefined` (no rounding).

##### Returns

A promise that resolves when the horizontal proportions have been computed.

##### Examples

```ts
// Compute horizontal proportions for 'Men', 'Women', and 'NonBinary' columns, rounded to 2 decimal places
await table.proportionsHorizontal(["Men", "Women", "NonBinary"], {
  decimals: 2,
});
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
await table.proportionsHorizontal(["Men", "Women", "NonBinary"], {
  suffix: "Prop",
  decimals: 2,
});
```

The table will then look like this:

| Year | Men | Women | NonBinary | MenProp | WomenProp | NonBinaryProp |
| :--- | :-- | :---- | :-------- | :------ | :-------- | :------------ |
| 2021 | 564 | 685   | 145       | 0.4     | 0.49      | 0.10          |
| 2022 | 354 | 278   | 56        | 0.51    | 0.4       | 0.08          |
| 2023 | 856 | 321   | 221       | 0.61    | 0.23      | 0.16          |

#### `proportionsVertical`

Computes proportions vertically over a column's values, relative to the sum of
all values in that column (or within specified categories).

##### Signature

```typescript
async proportionsVertical(column: string, newColumn: string, options?: { categories?: string | string[]; decimals?: number }): Promise<void>;
```

##### Parameters

- **`column`**: - The column containing values for which proportions will be
  computed. The proportions are calculated based on the sum of values in the
  specified column.
- **`newColumn`**: - The name of the new column where the proportions will be
  stored.
- **`options`**: - An optional object with configuration options:
- **`options.categories`**: - The column name or an array of column names that
  define categories for computing proportions. Proportions will be calculated
  independently within each category.
- **`options.decimals`**: - The number of decimal places to round the computed
  proportions. Defaults to `undefined` (no rounding).

##### Returns

A promise that resolves when the vertical proportions have been computed.

##### Examples

```ts
// Add a new column 'perc' with each 'column1' value divided by the sum of all 'column1' values
await table.proportionsVertical("column1", "perc");
```

```ts
// Compute proportions for 'column1' within 'column2' categories, rounded to two decimal places
await table.proportionsVertical("column1", "perc", {
  categories: "column2",
  decimals: 2,
});
```

```ts
// Compute proportions for 'sales' within 'region' and 'product_type' categories
await table.proportionsVertical("sales", "sales_proportion", {
  categories: ["region", "product_type"],
});
```

#### `summarize`

Creates a summary table based on specified values, categories, and summary
operations. This method allows you to aggregate data, calculate statistics
(e.g., count, mean, sum), and group results by categorical columns.

##### Signature

```typescript
async summarize(options?: { values?: string | string[]; categories?: string | string[]; summaries?: ("count" | "countUnique" | "countNull" | "min" | "max" | "mean" | "median" | "sum" | "skew" | "stdDev" | "var") | ("count" | "countUnique" | "countNull" | "min" | "max" | "mean" | "median" | "sum" | "skew" | "stdDev" | "var")[] | Record<string, "count" | "countUnique" | "countNull" | "min" | "max" | "mean" | "median" | "sum" | "skew" | "stdDev" | "var">; decimals?: number; outputTable?: string | boolean; toMs?: boolean; noColumnValue?: boolean }): Promise<SimpleTable>;
```

##### Parameters

- **`options`**: - An object with configuration options for summarization:
- **`options.values`**: - The column name or an array of column names whose
  values will be summarized. If omitted, all columns will be summarized.
- **`options.categories`**: - The column name or an array of column names that
  define categories for the summarization. Results will be grouped by these
  categories.
- **`options.summaries`**: - The summary operations to be performed. Can be a
  single operation (e.g., `"mean"`), an array of operations (e.g.,
  `["min", "max"]`), or an object mapping new column names to operations (e.g.,
  `{ avgSalary: "mean" }`). Supported operations include: `"count"`,
  `"countUnique"`, `"countNull"`, `"min"`, `"max"`, `"mean"`, `"median"`,
  `"sum"`, `"skew"`, `"stdDev"`, `"var"`.
- **`options.decimals`**: - The number of decimal places to round the summarized
  values. Defaults to `undefined` (no rounding).
- **`options.outputTable`**: - If `true`, the results will be stored in a new
  table with a generated name. If a string, it will be used as the name for the
  new table. If `false` or omitted, the current table will be overwritten.
  Defaults to `false`.
- **`options.toMs`**: - If `true`, timestamps, dates, and times will be
  converted to milliseconds before summarizing. This is useful when summarizing
  mixed data types (numbers and dates) as values must be of the same type for
  aggregation.
- **`options.noColumnValue`**: - If `true`, the default `value` column will be
  removed. This option only works when summarizing a single column without
  categories. Defaults to `false`.

##### Returns

A promise that resolves to the SimpleTable instance containing the summarized
data (either the modified current table or a new table).

##### Examples

```ts
// Summarize all columns with all available summary operations, overwriting the current table
const columns = await table.getColumns();
await table.summarize({ values: columns });
```

```ts
// Summarize all columns and store the results in a new table with a generated name
const columns = await table.getColumns();
const summaryTable = await table.summarize({
  values: columns,
  outputTable: true,
});
```

```ts
// Summarize all columns and store the results in a new table named 'mySummary'
const columns = await table.getColumns();
const mySummaryTable = await table.summarize({
  values: columns,
  outputTable: "mySummary",
});
```

```ts
// Summarize a single column ('sales') with all available summary operations
await table.summarize({ values: "sales" });
```

```ts
// Summarize multiple columns ('sales' and 'profit') with all available summary operations
await table.summarize({ values: ["sales", "profit"] });
```

```ts
// Summarize 'sales' by 'region' (single category)
await table.summarize({ values: "sales", categories: "region" });
```

```ts
// Summarize 'sales' by 'region' and 'product_type' (multiple categories)
await table.summarize({
  values: "sales",
  categories: ["region", "product_type"],
});
```

```ts
// Summarize 'sales' by 'region' with a specific summary operation (mean)
await table.summarize({
  values: "sales",
  categories: "region",
  summaries: "mean",
});
```

```ts
// Summarize 'sales' by 'region' with specific summary operations (mean and sum)
await table.summarize({
  values: "sales",
  categories: "region",
  summaries: ["mean", "sum"],
});
```

```ts
// Summarize 'sales' by 'region' with custom named summary operations
await table.summarize({
  values: "sales",
  categories: "region",
  summaries: { averageSales: "mean", totalSales: "sum" },
});
```

```ts
// Summarize 'price' and 'cost', rounding aggregated values to 2 decimal places
await table.summarize({ values: ["price", "cost"], decimals: 2 });
```

```ts
// Summarize 'timestamp_column' by converting to milliseconds first
await table.summarize({
  values: "timestamp_column",
  toMs: true,
  summaries: "mean",
});
```

```ts
// Summarize a single column 'value_column' without the default 'value' column in the output
await table.summarize({ values: "value_column", noColumnValue: true });
```

#### `accumulate`

Computes the cumulative sum of values in a column. For this method to work
properly, ensure your data is sorted first.

##### Signature

```typescript
async accumulate(column: string, newColumn: string, options?: { categories?: string | string[] }): Promise<void>;
```

##### Parameters

- **`column`**: - The name of the column storing the values to be accumulated.
- **`newColumn`**: - The name of the new column in which the computed cumulative
  values will be stored.
- **`options`**: - An optional object with configuration options:
- **`options.categories`**: - The column name or an array of column names that
  define categories for the accumulation. Accumulation will be performed
  independently within each category.

##### Returns

A promise that resolves when the cumulative sum has been computed.

##### Examples

```ts
// Compute the cumulative sum of 'sales' in a new 'cumulativeSales' column
// Ensure the table is sorted by a relevant column (e.g., date) before calling this method.
await table.accumulate("sales", "cumulativeSales");
```

```ts
// Compute the cumulative sum of 'orders' within 'customer_id' categories
// Ensure the table is sorted by 'customer_id' and then by a relevant order column (e.g., order_date).
await table.accumulate("orders", "cumulativeOrders", {
  categories: "customer_id",
});
```

```ts
// Compute the cumulative sum of 'revenue' within 'region' and 'product_category' categories
await table.accumulate("revenue", "cumulativeRevenue", {
  categories: ["region", "product_category"],
});
```

#### `rolling`

Computes rolling aggregations (e.g., rolling average, min, max) over a specified
column. For rows without enough preceding or following rows to form a complete
window, `NULL` will be returned. For this method to work properly, ensure your
data is sorted by the relevant column(s) first.

##### Signature

```typescript
async rolling(column: string, newColumn: string, summary: "min" | "max" | "mean" | "median" | "sum", preceding: number, following: number, options?: { categories?: string | string[]; decimals?: number }): Promise<void>;
```

##### Parameters

- **`column`**: - The name of the column storing the values to be aggregated.
- **`newColumn`**: - The name of the new column in which the computed rolling
  values will be stored.
- **`summary`**: - The aggregation function to apply: `"min"`, `"max"`,
  `"mean"`, `"median"`, or `"sum"`.
- **`preceding`**: - The number of preceding rows to include in the rolling
  window.
- **`following`**: - The number of following rows to include in the rolling
  window.
- **`options`**: - An optional object with configuration options:
- **`options.categories`**: - The column name or an array of column names that
  define categories for the aggregation. Rolling aggregations will be computed
  independently within each category.
- **`options.decimals`**: - The number of decimal places to round the aggregated
  values. Defaults to `undefined` (no rounding).

##### Returns

A promise that resolves when the rolling aggregation is complete.

##### Examples

```ts
// Compute a 7-day rolling average of 'sales' with 3 preceding and 3 following rows
// (total window size of 7: 3 preceding + current + 3 following)
await table.rolling("sales", "rollingAvgSales", "mean", 3, 3);
```

```ts
// Compute a rolling sum of 'transactions' within 'customer_id' categories
await table.rolling("transactions", "rollingSumTransactions", "sum", 5, 0, {
  categories: "customer_id",
});
```

```ts
// Compute a rolling maximum of 'temperature' rounded to 1 decimal place
await table.rolling("temperature", "rollingMaxTemp", "max", 2, 2, {
  decimals: 1,
});
```

#### `correlations`

Calculates correlations between columns. If no `x` and `y` columns are
specified, the method computes the correlations for all numeric column
combinations. Note that correlation is symmetrical: the correlation of `x` with
`y` is the same as `y` with `x`.

##### Signature

```typescript
async correlations(options?: { x?: string; y?: string; categories?: string | string[]; decimals?: number; outputTable?: string | boolean }): Promise<SimpleTable>;
```

##### Parameters

- **`options`**: - An optional object with configuration options:
- **`options.x`**: - The name of the column for the x-values. If omitted,
  correlations will be computed for all numeric columns.
- **`options.y`**: - The name of the column for the y-values. If omitted,
  correlations will be computed for all numeric columns.
- **`options.categories`**: - The column name or an array of column names that
  define categories. Correlation calculations will be performed independently
  for each category.
- **`options.decimals`**: - The number of decimal places to round the
  correlation values. Defaults to `undefined` (no rounding).
- **`options.outputTable`**: - If `true`, the results will be stored in a new
  table with a generated name. If a string, it will be used as the name for the
  new table. If `false` or omitted, the current table will be overwritten.
  Defaults to `false`.

##### Returns

A promise that resolves to the SimpleTable instance containing the correlation
results (either the modified current table or a new table).

##### Examples

```ts
// Compute correlations between all numeric columns, overwriting the current table
await table.correlations();
```

```ts
// Compute correlations between 'column1' and all other numeric columns
await table.correlations({ x: "column1" });
```

```ts
// Compute the correlation between 'column1' and 'column2'
await table.correlations({ x: "column1", y: "column2" });
```

```ts
// Compute correlations within 'categoryColumn' and store results in a new table
const correlationTable = await table.correlations({
  categories: "categoryColumn",
  outputTable: true,
});
```

```ts
// Compute correlations, rounded to 2 decimal places
await table.correlations({ decimals: 2 });
```

#### `linearRegressions`

Performs linear regression analysis. The results include the slope, the
y-intercept, and the R-squared value. If no `x` and `y` columns are specified,
the method computes linear regression analysis for all numeric column
permutations. Note that linear regression analysis is asymmetrical: the linear
regression of `x` over `y` is not the same as `y` over `x`.

##### Signature

```typescript
async linearRegressions(options?: { x?: string; y?: string; categories?: string | string[]; decimals?: number; outputTable?: string | boolean }): Promise<SimpleTable>;
```

##### Parameters

- **`options`**: - An optional object with configuration options:
- **`options.x`**: - The name of the column for the independent variable
  (x-values). If omitted, linear regressions will be computed for all numeric
  columns as x.
- **`options.y`**: - The name of the column for the dependent variable
  (y-values). If omitted, linear regressions will be computed for all numeric
  columns as y.
- **`options.categories`**: - The column name or an array of column names that
  define categories. Linear regression analysis will be performed independently
  for each category.
- **`options.decimals`**: - The number of decimal places to round the regression
  values (slope, intercept, r-squared). Defaults to `undefined` (no rounding).
- **`options.outputTable`**: - If `true`, the results will be stored in a new
  table with a generated name. If a string, it will be used as the name for the
  new table. If `false` or omitted, the current table will be overwritten.
  Defaults to `false`.

##### Returns

A promise that resolves to the SimpleTable instance containing the linear
regression results (either the modified current table or a new table).

##### Examples

```ts
// Compute all linear regressions between all numeric columns, overwriting the current table
await table.linearRegressions();
```

```ts
// Compute linear regressions with 'column1' as the independent variable and all other numeric columns as dependent variables
await table.linearRegressions({ x: "column1" });
```

```ts
// Compute the linear regression of 'sales' (y) over 'advertising' (x)
await table.linearRegressions({ x: "advertising", y: "sales" });
```

```ts
// Compute linear regressions within 'region' categories and store results in a new table
const regressionTable = await table.linearRegressions({
  categories: "region",
  outputTable: true,
});
```

```ts
// Compute linear regressions, rounded to 3 decimal places
await table.linearRegressions({ decimals: 3 });
```

#### `outliersIQR`

Identifies outliers in a specified column using the Interquartile Range (IQR)
method.

##### Signature

```typescript
async outliersIQR(column: string, newColumn: string, options?: { categories?: string | string[] }): Promise<void>;
```

##### Parameters

- **`column`**: - The name of the column in which outliers will be identified.
- **`newColumn`**: - The name of the new column where the boolean results
  (`TRUE` for outlier, `FALSE` otherwise) will be stored.
- **`options`**: - An optional object with configuration options:
- **`options.categories`**: - The column name or an array of column names that
  define categories. Outlier detection will be performed independently within
  each category.

##### Returns

A promise that resolves when the outliers have been identified.

##### Examples

```ts
// Look for outliers in the 'age' column and store results in a new 'isOutlier' column
await table.outliersIQR("age", "isOutlier");
```

```ts
// Look for outliers in 'salary' within 'gender' categories
await table.outliersIQR("salary", "salaryOutlier", { categories: "gender" });
```

#### `zScore`

Computes the Z-score for values in a specified column.

##### Signature

```typescript
async zScore(column: string, newColumn: string, options?: { categories?: string | string[]; decimals?: number }): Promise<void>;
```

##### Parameters

- **`column`**: - The name of the column for which Z-scores will be calculated.
- **`newColumn`**: - The name of the new column where the computed Z-scores will
  be stored.
- **`options`**: - An optional object with configuration options:
- **`options.categories`**: - The column name or an array of column names that
  define categories. Z-scores will be calculated independently within each
  category.
- **`options.decimals`**: - The number of decimal places to round the Z-score
  values. Defaults to `undefined` (no rounding).

##### Returns

A promise that resolves when the Z-scores have been computed.

##### Examples

```ts
// Calculate the Z-score for 'age' values and store results in a new 'ageZScore' column
await table.zScore("age", "ageZScore");
```

```ts
// Calculate Z-scores for 'salary' within 'department' categories
await table.zScore("salary", "salaryZScore", { categories: "department" });
```

```ts
// Calculate Z-scores for 'score', rounded to 2 decimal places
await table.zScore("score", "scoreZScore", { decimals: 2 });
```

#### `normalize`

Normalizes the values in a column using min-max normalization.

##### Signature

```typescript
async normalize(column: string, newColumn: string, options?: { categories?: string | string[]; decimals?: number }): Promise<void>;
```

##### Parameters

- **`column`**: - The name of the column in which values will be normalized.
- **`newColumn`**: - The name of the new column where normalized values will be
  stored.
- **`options`**: - An optional object with configuration options:
- **`options.categories`**: - The column name or an array of column names that
  define categories for the normalization. Normalization will be performed
  independently within each category.
- **`options.decimals`**: - The number of decimal places to round the normalized
  values. Defaults to `undefined` (no rounding).

##### Returns

A promise that resolves when the values have been normalized.

##### Examples

```ts
// Normalize the values in 'column1' and store them in a new 'normalizedColumn1' column
await table.normalize("column1", "normalizedColumn1");
```

```ts
// Normalize 'value' within 'group' categories
await table.normalize("value", "normalizedValue", { categories: "group" });
```

```ts
// Normalize 'data' values, rounded to 2 decimal places
await table.normalize("data", "normalizedData", { decimals: 2 });
```

#### `updateWithJS`

Updates data in the table using a JavaScript function. The function receives the
existing rows as an array of objects and must return the modified rows as an
array of objects. This method offers high flexibility for data manipulation but
can be slow for large tables as it involves transferring data between DuckDB and
JavaScript. This method does not work with tables containing geometries.

##### Signature

```typescript
async updateWithJS(dataModifier: ((rows: Record<string, number | string | Date | boolean | null>[]) => any) | ((rows: Record<string, number | string | Date | boolean | null>[]) => any)): Promise<void>;
```

##### Parameters

- **`dataModifier`**: - A synchronous or asynchronous function that takes the
  existing rows (as an array of objects) and returns the modified rows (as an
  array of objects).

##### Returns

A promise that resolves when the data has been updated.

##### Examples

```ts
// Add 1 to values in 'column1'. If values are not numbers, they are replaced by null.
await table.updateWithJS((rows) => {
  const modifiedRows = rows.map((d) => ({
    ...d,
    column1: typeof d.column1 === "number" ? d.column1 + 1 : null,
  }));
  return modifiedRows;
});
```

```ts
// Convert a date string to a Date object in 'dateColumn'
await table.updateWithJS((rows) => {
  const modifiedRows = rows.map((d) => ({
    ...d,
    dateColumn: typeof d.dateColumn === "string"
      ? new Date(d.dateColumn)
      : d.dateColumn,
  }));
  return modifiedRows;
});
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

#### `getNbColumns`

Returns the number of columns in the table.

##### Signature

```typescript
async getNbColumns(): Promise<number>;
```

##### Returns

A promise that resolves to a number representing the total count of columns.

##### Examples

```ts
// Get the number of columns in the table
const nbColumns = await table.getNbColumns();
console.log(nbColumns); // e.g., 3
```

#### `getNbRows`

Returns the number of rows in the table.

##### Signature

```typescript
async getNbRows(): Promise<number>;
```

##### Returns

A promise that resolves to a number representing the total count of rows.

##### Examples

```ts
// Get the number of rows in the table
const nbRows = await table.getNbRows();
console.log(nbRows); // e.g., 100
```

#### `getNbValues`

Returns the total number of values in the table (number of columns multiplied by
the number of rows).

##### Signature

```typescript
async getNbValues(): Promise<number>;
```

##### Returns

A promise that resolves to a number representing the total count of values.

##### Examples

```ts
// Get the total number of values in the table
const nbValues = await table.getNbValues();
console.log(nbValues); // e.g., 300 (if 3 columns and 100 rows)
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

#### `getValues`

Returns all values from a specific column.

##### Signature

```typescript
async getValues(column: string): Promise<(string | number | boolean | Date | null)[]>;
```

##### Parameters

- **`column`**: - The name of the column from which to retrieve values.

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

Returns the minimum value from a specific column.

##### Signature

```typescript
async getMin(column: string): Promise<string | number | boolean | Date | null>;
```

##### Parameters

- **`column`**: - The name of the column from which to retrieve the minimum
  value.

##### Returns

A promise that resolves to the minimum value of the specified column.

##### Examples

```ts
// Get the minimum value from the 'price' column
const minPrice = await table.getMin("price");
console.log(minPrice); // e.g., 10.50
```

#### `getMax`

Returns the maximum value from a specific column.

##### Signature

```typescript
async getMax(column: string): Promise<string | number | boolean | Date | null>;
```

##### Parameters

- **`column`**: - The name of the column from which to retrieve the maximum
  value.

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
array.

##### Signature

```typescript
async getExtent(column: string): Promise<any>;
```

##### Parameters

- **`column`**: - The name of the column from which to retrieve the extent.

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

- **`column`**: - The name of the numeric column from which to retrieve the mean
  value.
- **`options`**: - An optional object with configuration options:
- **`options.decimals`**: - The number of decimal places to round the result to.
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

- **`column`**: - The name of the numeric column from which to retrieve the
  median value.
- **`options`**: - An optional object with configuration options:
- **`options.decimals`**: - The number of decimal places to round the result to.
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

- **`column`**: - The name of the numeric column from which to retrieve the sum.

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

- **`column`**: - The name of the numeric column from which to retrieve the
  skewness.
- **`options`**: - An optional object with configuration options:
- **`options.decimals`**: - The number of decimal places to round the result to.
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

- **`column`**: - The name of the numeric column from which to retrieve the
  standard deviation.
- **`options`**: - An optional object with configuration options:
- **`options.decimals`**: - The number of decimal places to round the result to.
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

#### `getVar`

Returns the variance of values from a specific numeric column.

##### Signature

```typescript
async getVar(column: string, options?: { decimals?: number }): Promise<number>;
```

##### Parameters

- **`column`**: - The name of the numeric column from which to retrieve the
  variance.
- **`options`**: - An optional object with configuration options:
- **`options.decimals`**: - The number of decimal places to round the result to.
  Defaults to `undefined` (no rounding).

##### Returns

A promise that resolves to the variance value of the specified column.

##### Examples

```ts
// Get the variance of the 'data' column
const dataVariance = await table.getVar("data");
console.log(dataVariance); // e.g., 25.5
```

```ts
// Get the variance of the 'values' column, rounded to 2 decimal places
const valuesVariance = await table.getVar("values", { decimals: 2 });
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

- **`column`**: - The name of the numeric column from which to calculate the
  quantile.
- **`quantile`**: - The quantile to calculate, expressed as a number between 0
  and 1 (e.g., `0.25` for the first quartile, `0.5` for the median, `0.75` for
  the third quartile).
- **`options`**: - An optional object with configuration options:
- **`options.decimals`**: - The number of decimal places to round the result to.
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
ascending order.

##### Signature

```typescript
async getUniques(column: string): Promise<(string | number | boolean | Date | null)[]>;
```

##### Parameters

- **`column`**: - The name of the column from which to retrieve unique values.

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

##### Signature

```typescript
async getFirstRow(options?: { conditions?: string }): Promise<Record<string, string | number | boolean | Date | null>>;
```

##### Parameters

- **`options`**: - An optional object with configuration options:
- **`options.conditions`**: - The filtering conditions specified as a SQL
  `WHERE` clause (e.g., `"category = 'Book'"`).

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

##### Signature

```typescript
async getLastRow(options?: { conditions?: string }): Promise<Record<string, string | number | boolean | Date | null>>;
```

##### Parameters

- **`options`**: - An optional object with configuration options:
- **`options.conditions`**: - The filtering conditions specified as a SQL
  `WHERE` clause (e.g., `"category = 'Book'"`).

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
`!==`).

##### Signature

```typescript
async getTop(count: number, options?: { conditions?: string }): Promise<Record<string, string | number | boolean | Date | null>[]>;
```

##### Parameters

- **`count`**: - The number of rows to return from the top of the table.
- **`options`**: - An optional object with configuration options:
- **`options.conditions`**: - The filtering conditions specified as a SQL
  `WHERE` clause (e.g., `"category = 'Books'"`).

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
conditions (e.g., `&&`, `||`, `===`, `!==`).

##### Signature

```typescript
async getBottom(count: number, options?: { originalOrder?: boolean; conditions?: string }): Promise<Record<string, string | number | boolean | Date | null>[]>;
```

##### Parameters

- **`count`**: - The number of rows to return from the bottom of the table.
- **`options`**: - An optional object with configuration options:
- **`options.originalOrder`**: - A boolean indicating whether the rows should be
  returned in their original order (`true`) or in reverse order (last row first,
  `false`). Defaults to `false`.
- **`options.conditions`**: - The filtering conditions specified as a SQL
  `WHERE` clause (e.g., `"category = 'Books'"`).

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
JavaScript syntax for conditions (e.g., `AND`, `||`, `===`, `!==`).

##### Signature

```typescript
async getRow(conditions: string, options?: { noCheck?: boolean }): Promise<Record<string, string | number | boolean | Date | null> | undefined>;
```

##### Parameters

- **`conditions`**: - The conditions to match, specified as a SQL `WHERE`
  clause.
- **`options`**: - Optional settings:
- **`options.noCheck`**: - If `true`, no error will be thrown when no row or
  more than one row match the condition. Defaults to `false`.

##### Returns

A promise that resolves to an object representing the matched row.

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
const flexibleRow = await table.getRow(`status = 'pending'`, { noCheck: true });
console.log(flexibleRow);
```

#### `getData`

Returns the data from the table as an array of objects, optionally filtered by
SQL conditions. You can also use JavaScript syntax for conditions (e.g., `&&`,
`||`, `===`, `!==`).

##### Signature

```typescript
async getData(options?: { conditions?: string }): Promise<Record<string, string | number | boolean | Date | null>[]>;
```

##### Parameters

- **`options`**: - An optional object with configuration options:
- **`options.conditions`**: - The filtering conditions specified as a SQL
  `WHERE` clause (e.g., `"category = 'Book'"`).

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
// Get data filtered by a condition (using JS syntax)
const booksData = await table.getData({ conditions: `category === 'Book'` });
console.log(booksData);
```

#### `points`

Creates point geometries from longitude and latitude columns. The geometries
will have `[latitude, longitude]` axis order.

##### Signature

```typescript
async points(columnLat: string, columnLon: string, newColumn: string): Promise<void>;
```

##### Parameters

- **`columnLat`**: - The name of the column storing the latitude values.
- **`columnLon`**: - The name of the column storing the longitude values.
- **`newColumn`**: - The name of the new column where the point geometries will
  be stored.

##### Returns

A promise that resolves when the point geometries have been created.

##### Examples

```ts
// Create point geometries in a new 'geom' column using 'lat' and 'lon' columns
await table.points("lat", "lon", "geom");
```

#### `isValidGeo`

Adds a column with boolean values indicating the validity of geometries.

##### Signature

```typescript
async isValidGeo(newColumn: string, options?: { column?: string }): Promise<void>;
```

##### Parameters

- **`newColumn`**: - The name of the new column where the boolean results
  (`TRUE` for valid, `FALSE` for invalid) will be stored.
- **`options`**: - An optional object with configuration options:
- **`options.column`**: - The name of the column storing the geometries to be
  checked. If omitted, the method will automatically attempt to find a geometry
  column.

##### Returns

A promise that resolves when the validity check is complete.

##### Examples

```ts
// Check if geometries are valid and store results in a new 'isValid' column
// The method will automatically detect the geometry column.
await table.isValidGeo("isValid");
```

```ts
// Check validity of geometries in a specific column named 'myGeom'
await table.isValidGeo("isValidMyGeom", { column: "myGeom" });
```

#### `nbVertices`

Adds a column with the number of vertices (points) in each geometry.

##### Signature

```typescript
async nbVertices(newColumn: string, options?: { column?: string }): Promise<void>;
```

##### Parameters

- **`newColumn`**: - The name of the new column where the vertex counts will be
  stored.
- **`options`**: - An optional object with configuration options:
- **`options.column`**: - The name of the column storing the geometries. If
  omitted, the method will automatically attempt to find a geometry column.

##### Returns

A promise that resolves when the vertex counts have been added.

##### Examples

```ts
// Add a new column 'vertexCount' with the number of vertices for each geometry
// The method will automatically detect the geometry column.
await table.nbVertices("vertexCount");
```

```ts
// Add vertex counts for geometries in a specific column named 'myGeom'
await table.nbVertices("myGeomVertices", { column: "myGeom" });
```

#### `fixGeo`

Attempts to make invalid geometries valid without removing any vertices.

##### Signature

```typescript
async fixGeo(column?: string): Promise<void>;
```

##### Parameters

- **`column`**: - The name of the column storing the geometries to be fixed. If
  omitted, the method will automatically attempt to find a geometry column.

##### Returns

A promise that resolves when the geometries have been processed.

##### Examples

```ts
// Fix invalid geometries in the default geometry column
await table.fixGeo();
```

```ts
// Fix invalid geometries in a specific column named 'myGeom'
await table.fixGeo("myGeom");
```

#### `isClosedGeo`

Adds a column with boolean values indicating whether geometries are closed
(e.g., polygons) or open (e.g., linestrings).

##### Signature

```typescript
async isClosedGeo(newColumn: string, options?: { column?: string }): Promise<void>;
```

##### Parameters

- **`newColumn`**: - The name of the new column where the boolean results
  (`TRUE` for closed, `FALSE` for open) will be stored.
- **`options`**: - An optional object with configuration options:
- **`options.column`**: - The name of the column storing the geometries. If
  omitted, the method will automatically attempt to find a geometry column.

##### Returns

A promise that resolves when the closed geometry check is complete.

##### Examples

```ts
// Check if geometries are closed and store results in a new 'isClosed' column
await table.isClosedGeo("isClosed");
```

```ts
// Check closed status of geometries in a specific column named 'boundaryGeom'
await table.isClosedGeo("boundaryClosed", { column: "boundaryGeom" });
```

#### `typeGeo`

Adds a column with the geometry type (e.g., `"POINT"`, `"LINESTRING"`,
`"POLYGON"`) for each geometry.

##### Signature

```typescript
async typeGeo(newColumn: string, options?: { column?: string }): Promise<void>;
```

##### Parameters

- **`newColumn`**: - The name of the new column where the geometry types will be
  stored.
- **`options`**: - An optional object with configuration options:
- **`options.column`**: - The name of the column storing the geometries. If
  omitted, the method will automatically attempt to find a geometry column.

##### Returns

A promise that resolves when the geometry types have been added.

##### Examples

```ts
// Add a new column 'geometryType' with the type of each geometry
await table.typeGeo("geometryType");
```

```ts
// Get the geometry type for geometries in a specific column named 'featureGeom'
await table.typeGeo("featureType", { column: "featureGeom" });
```

#### `flipCoordinates`

Flips the coordinate order of geometries in a specified column (e.g., from
`[lon, lat]` to `[lat, lon]` or vice-versa). **Warning:** This method should be
used with caution as it directly manipulates coordinate order and can affect the
accuracy of geospatial operations if not used correctly. It also messes up with
the projections stored in `table.projections`.

##### Signature

```typescript
async flipCoordinates(column?: string): Promise<void>;
```

##### Parameters

- **`column`**: - The name of the column storing the geometries. If omitted, the
  method will automatically attempt to find a geometry column.

##### Returns

A promise that resolves when the coordinates have been flipped.

##### Examples

```ts
// Flip coordinates in the default geometry column
await table.flipCoordinates();
```

```ts
// Flip coordinates in a specific column named 'myGeom'
await table.flipCoordinates("myGeom");
```

#### `reducePrecision`

Reduces the precision of geometries in a specified column to a given number of
decimal places.

##### Signature

```typescript
async reducePrecision(decimals: number, options?: { column?: string }): Promise<void>;
```

##### Parameters

- **`decimals`**: - The number of decimal places to keep in the coordinates of
  the geometries.
- **`options`**: - An optional object with configuration options:
- **`options.column`**: - The name of the column storing the geometries. If
  omitted, the method will automatically attempt to find a geometry column.

##### Returns

A promise that resolves when the precision of the geometries has been reduced.

##### Examples

```ts
// Reduce the precision of geometries in the default column to 3 decimal places
await table.reducePrecision(3);
```

```ts
// Reduce the precision of geometries in a specific column named 'myGeom' to 2 decimal places
await table.reducePrecision(2, { column: "myGeom" });
```

#### `reproject`

Reprojects the geometries in a specified column to another Spatial Reference
System (SRS). If reprojecting to WGS84 (`"WGS84"` or `"EPSG:4326"`), the
resulting geometries will have `[latitude, longitude]` axis order.

##### Signature

```typescript
async reproject(to: string, options?: { from?: string; column?: string }): Promise<void>;
```

##### Parameters

- **`to`**: - The target SRS (e.g., `"EPSG:3347"`, `"WGS84"`).
- **`options`**: - An optional object with configuration options:
- **`options.from`**: - The original projection of the geometries. If omitted,
  the method attempts to automatically detect it. Provide this option if
  auto-detection fails.
- **`options.column`**: - The name of the column storing the geometries. If
  omitted, the method will automatically attempt to find a geometry column.

##### Returns

A promise that resolves when the geometries have been reprojected.

##### Examples

```ts
// Reproject geometries in the default column to EPSG:3347 (NAD83/Statistics Canada Lambert)
await table.reproject("EPSG:3347");
```

```ts
// Reproject geometries from EPSG:4326 to EPSG:3347, specifying the original projection
await table.reproject("EPSG:3347", { from: "EPSG:4326" });
```

```ts
// Reproject geometries in a specific column named 'myGeom' to EPSG:3347
await table.reproject("EPSG:3347", { column: "myGeom", from: "EPSG:4326" });
```

#### `area`

Computes the area of geometries in square meters (`"m2"`) or optionally square
kilometers (`"km2"`). The input geometry is assumed to be in the EPSG:4326
coordinate system (WGS84), with `[latitude, longitude]` axis order.

##### Signature

```typescript
async area(newColumn: string, options?: { unit?: "m2" | "km2"; column?: string }): Promise<void>;
```

##### Parameters

- **`newColumn`**: - The name of the new column where the computed areas will be
  stored.
- **`options`**: - An optional object with configuration options:
- **`options.unit`**: - The unit for the computed area: `"m2"` (square meters)
  or `"km2"` (square kilometers). Defaults to `"m2"`.
- **`options.column`**: - The name of the column storing the geometries. If
  omitted, the method will automatically attempt to find a geometry column.

##### Returns

A promise that resolves when the areas have been computed.

##### Examples

```ts
// Compute the area of geometries in square meters and store in 'area_m2'
await table.area("area_m2");
```

```ts
// Compute the area of geometries in square kilometers and store in 'area_km2'
await table.area("area_km2", { unit: "km2" });
```

```ts
// Compute the area of geometries in a specific column named 'myGeom'
await table.area("myGeomArea", { column: "myGeom" });
```

#### `length`

Computes the length of line geometries in meters (`"m"`) or optionally
kilometers (`"km"`). The input geometry is assumed to be in the EPSG:4326
coordinate system (WGS84), with `[latitude, longitude]` axis order.

##### Signature

```typescript
async length(newColumn: string, options?: { unit?: "m" | "km"; column?: string }): Promise<void>;
```

##### Parameters

- **`newColumn`**: - The name of the new column where the computed lengths will
  be stored.
- **`options`**: - An optional object with configuration options:
- **`options.unit`**: - The unit for the computed length: `"m"` (meters) or
  `"km"` (kilometers). Defaults to `"m"`.
- **`options.column`**: - The name of the column storing the geometries. If
  omitted, the method will automatically attempt to find a geometry column.

##### Returns

A promise that resolves when the lengths have been computed.

##### Examples

```ts
// Compute the length of line geometries in meters and store in 'length_m'
await table.length("length_m");
```

```ts
// Compute the length of line geometries in kilometers and store in 'length_km'
await table.length("length_km", { unit: "km" });
```

```ts
// Compute the length of geometries in a specific column named 'routeGeom'
await table.length("routeLength", { column: "routeGeom" });
```

#### `perimeter`

Computes the perimeter of polygon geometries in meters (`"m"`) or optionally
kilometers (`"km"`). The input geometry is assumed to be in the EPSG:4326
coordinate system (WGS84), with `[latitude, longitude]` axis order.

##### Signature

```typescript
async perimeter(newColumn: string, options?: { unit?: "m" | "km"; column?: string }): Promise<void>;
```

##### Parameters

- **`newColumn`**: - The name of the new column where the computed perimeters
  will be stored.
- **`options`**: - An optional object with configuration options:
- **`options.unit`**: - The unit for the computed perimeter: `"m"` (meters) or
  `"km"` (kilometers). Defaults to `"m"`.
- **`options.column`**: - The name of the column storing the geometries. If
  omitted, the method will automatically attempt to find a geometry column.

##### Returns

A promise that resolves when the perimeters have been computed.

##### Examples

```ts
// Compute the perimeter of polygon geometries in meters and store in 'perimeter_m'
await table.perimeter("perimeter_m");
```

```ts
// Compute the perimeter of polygon geometries in kilometers and store in 'perimeter_km'
await table.perimeter("perimeter_km", { unit: "km" });
```

```ts
// Compute the perimeter of geometries in a specific column named 'landParcelGeom'
await table.perimeter("landParcelPerimeter", { column: "landParcelGeom" });
```

#### `buffer`

Computes a buffer (a polygon representing a specified distance around a
geometry) for geometries in a specified column. The distance is in the Spatial
Reference System (SRS) unit of the input geometries.

##### Signature

```typescript
async buffer(newColumn: string, distance: number, options?: { column?: string }): Promise<void>;
```

##### Parameters

- **`newColumn`**: - The name of the new column where the buffered geometries
  will be stored.
- **`distance`**: - The distance for the buffer. This value is in the units of
  the geometry's SRS.
- **`options`**: - An optional object with configuration options:
- **`options.column`**: - The name of the column storing the geometries. If
  omitted, the method will automatically attempt to find a geometry column.

##### Returns

A promise that resolves when the buffers have been computed.

##### Examples

```ts
// Create a buffer of 1 unit around geometries in the default column, storing results in 'bufferedGeom'
await table.buffer("bufferedGeom", 1);
```

```ts
// Create a buffer of 10 units around geometries in a specific column named 'pointsGeom'
await table.buffer("pointsBuffer", 10, { column: "pointsGeom" });
```

#### `joinGeo`

Merges the data of this table (considered the left table) with another table
(the right table) based on a spatial relationship. Note that the order of rows
in the returned data is not guaranteed to be the same as in the original tables.
This operation might create temporary files in a `.tmp` folder; consider adding
`.tmp` to your `.gitignore`.

##### Signature

```typescript
async joinGeo(rightTable: SimpleTable, method: "intersect" | "inside" | "within", options?: { leftTableColumn?: string; rightTableColumn?: string; type?: "inner" | "left" | "right" | "full"; distance?: number; distanceMethod?: "srs" | "haversine" | "spheroid"; outputTable?: string | boolean }): Promise<SimpleTable>;
```

##### Parameters

- **`rightTable`**: - The SimpleTable instance to be joined with this table.
- **`method`**: - The spatial join method to use: `"intersect"` (geometries
  overlap), `"inside"` (geometries of the left table are entirely within
  geometries of the right table), or `"within"` (geometries of the left table
  are within a specified distance of geometries in the right table).
- **`options`**: - An optional object with configuration options:
- **`options.leftTableColumn`**: - The name of the column storing geometries in
  the left table (this table). If omitted, the method attempts to find one.
- **`options.rightTableColumn`**: - The name of the column storing geometries in
  the right table. If omitted, the method attempts to find one.
- **`options.type`**: - The type of join operation to perform: `"inner"`,
  `"left"` (default), `"right"`, or `"full"`. For some types (like `"inside"`),
  the table order is important.
- **`options.distance`**: - Required if `method` is `"within"`. The target
  distance for the spatial join. The unit depends on `distanceMethod`.
- **`options.distanceMethod`**: - The method for distance calculations: `"srs"`
  (default, uses the SRS unit), `"haversine"` (uses meters, requires EPSG:4326
  input), or `"spheroid"` (uses meters, requires EPSG:4326 input, most accurate
  but slowest).
- **`options.outputTable`**: - If `true`, the results will be stored in a new
  table with a generated name. If a string, it will be used as the name for the
  new table. If `false` or omitted, the current table will be overwritten.
  Defaults to `false`.

##### Returns

A promise that resolves to the SimpleTable instance containing the spatially
joined data (either the modified current table or a new table).

##### Examples

```ts
// Merge data based on intersecting geometries, overwriting tableA
await tableA.joinGeo(tableB, "intersect");
```

```ts
// Merge data where geometries in tableA are inside geometries in tableB
await tableA.joinGeo(tableB, "inside");
```

```ts
// Merge data where geometries in tableA are within 10 units (SRS) of geometries in tableB
await tableA.joinGeo(tableB, "within", { distance: 10 });
```

```ts
// Merge data where geometries in tableA are within 10 kilometers (Haversine) of geometries in tableB
// Input geometries must be in EPSG:4326.
await tableA.joinGeo(tableB, "within", {
  distance: 10,
  distanceMethod: "haversine",
  unit: "km",
});
```

```ts
// Merge data with specific geometry columns and an inner join type, storing results in a new table
const tableC = await tableA.joinGeo(tableB, "intersect", {
  leftTableColumn: "geometriesA",
  rightTableColumn: "geometriesB",
  type: "inner",
  outputTable: true,
});
```

#### `intersection`

Computes the intersection of two sets of geometries, creating new geometries
where they overlap.

##### Signature

```typescript
async intersection(column1: string, column2: string, newColumn: string): Promise<void>;
```

##### Parameters

- **`column1`**: - The name of the first column storing geometries.
- **`column2`**: - The name of the second column storing geometries. Both
  columns must have the same projection.
- **`newColumn`**: - The name of the new column where the computed intersection
  geometries will be stored.

##### Returns

A promise that resolves when the intersection geometries have been computed.

##### Examples

```ts
// Compute the intersection of geometries in 'geomA' and 'geomB' columns, storing results in 'intersectGeom'
await table.intersection("geomA", "geomB", "intersectGeom");
```

#### `removeIntersection`

Removes the intersection of two geometries from the first geometry, effectively
computing the geometric difference.

##### Signature

```typescript
async removeIntersection(column1: string, column2: string, newColumn: string): Promise<void>;
```

##### Parameters

- **`column1`**: - The name of the column storing the reference geometries.
  These geometries will have the intersection removed.
- **`column2`**: - The name of the column storing the geometries used to compute
  the intersection. Both columns must have the same projection.
- **`newColumn`**: - The name of the new column where the resulting geometries
  (without the intersection) will be stored.

##### Returns

A promise that resolves when the geometries have been processed.

##### Examples

```ts
// Remove the intersection of 'geomB' from 'geomA', storing the result in 'geomA_minus_geomB'
await table.removeIntersection("geomA", "geomB", "geomA_minus_geomB");
```

#### `fillHoles`

Fills holes in polygon geometries.

##### Signature

```typescript
async fillHoles(column?: string): Promise<void>;
```

##### Parameters

- **`column`**: - The name of the column storing the geometries. If omitted, the
  method will automatically attempt to find a geometry column.

##### Returns

A promise that resolves when the holes have been filled.

##### Examples

```ts
// Fill holes in geometries in the default geometry column
await table.fillHoles();
```

```ts
// Fill holes in geometries in a specific column named 'polygonGeom'
await table.fillHoles("polygonGeom");
```

#### `intersect`

Returns `TRUE` if two geometries intersect (overlap in any way), and `FALSE`
otherwise.

##### Signature

```typescript
async intersect(column1: string, column2: string, newColumn: string): Promise<void>;
```

##### Parameters

- **`column1`**: - The name of the first column storing geometries.
- **`column2`**: - The name of the second column storing geometries. Both
  columns must have the same projection.
- **`newColumn`**: - The name of the new column where the boolean results
  (`TRUE` for intersection, `FALSE` otherwise) will be stored.

##### Returns

A promise that resolves when the intersection check is complete.

##### Examples

```ts
// Check if geometries in 'geomA' and 'geomB' intersect, storing results in 'doIntersect'
await table.intersect("geomA", "geomB", "doIntersect");
```

#### `inside`

Returns `TRUE` if all points of a geometry in `column1` lie inside a geometry in
`column2`, and `FALSE` otherwise.

##### Signature

```typescript
async inside(column1: string, column2: string, newColumn: string): Promise<void>;
```

##### Parameters

- **`column1`**: - The name of the column storing the geometries to be tested
  for containment.
- **`column2`**: - The name of the column storing the geometries to be tested as
  containers. Both columns must have the same projection.
- **`newColumn`**: - The name of the new column where the boolean results
  (`TRUE` for inside, `FALSE` otherwise) will be stored.

##### Returns

A promise that resolves when the containment check is complete.

##### Examples

```ts
// Check if geometries in 'pointGeom' are inside 'polygonGeom', storing results in 'isInsidePolygon'
await table.inside("pointGeom", "polygonGeom", "isInsidePolygon");
```

#### `union`

Computes the union of two geometries, creating a new geometry that represents
the merged area of both.

##### Signature

```typescript
async union(column1: string, column2: string, newColumn: string): Promise<void>;
```

##### Parameters

- **`column1`**: - The name of the first column storing geometries.
- **`column2`**: - The name of the second column storing geometries. Both
  columns must have the same projection.
- **`newColumn`**: - The name of the new column where the computed union
  geometries will be stored.

##### Returns

A promise that resolves when the union geometries have been computed.

##### Examples

```ts
// Compute the union of geometries in 'geomA' and 'geomB', storing results in 'unionGeom'
await table.union("geomA", "geomB", "unionGeom");
```

#### `latLon`

Extracts the latitude and longitude coordinates from point geometries. The input
geometry is assumed to be in the EPSG:4326 coordinate system (WGS84), with
`[latitude, longitude]` axis order.

##### Signature

```typescript
async latLon(column: string, columnLat: string, columnLon: string): Promise<void>;
```

##### Parameters

- **`column`**: - The name of the column storing the point geometries.
- **`columnLat`**: - The name of the new column where the extracted latitude
  values will be stored.
- **`columnLon`**: - The name of the new column where the extracted longitude
  values will be stored.

##### Returns

A promise that resolves when the latitude and longitude have been extracted.

##### Examples

```ts
// Extract latitude and longitude from 'geom' column into new 'lat' and 'lon' columns
await table.latLon("geom", "lat", "lon");
```

#### `simplify`

Simplifies geometries while preserving their overall coverage. A higher
tolerance results in more significant simplification.

##### Signature

```typescript
async simplify(tolerance: number, options?: { column?: string; simplifyBoundary?: boolean }): Promise<void>;
```

##### Parameters

- **`tolerance`**: - A numeric value representing the simplification tolerance.
  A higher value leads to greater simplification.
- **`options`**: - An optional object with configuration options:
- **`options.column`**: - The name of the column storing the geometries. If
  omitted, the method will automatically attempt to find a geometry column.
- **`options.simplifyBoundary`**: - If `true` (default), the boundary of the
  geometries will also be simplified. If `false`, only the interior of the
  geometries will be simplified, preserving the original boundary.

##### Returns

A promise that resolves when the geometries have been simplified.

##### Examples

```ts
// Simplify geometries in the default column with a tolerance of 0.1
await table.simplify(0.1);
```

```ts
// Simplify geometries in 'myGeom' column, preserving the boundary
await table.simplify(0.05, { column: "myGeom", simplifyBoundary: false });
```

#### `centroid`

Computes the centroid of geometries. The values are returned in the SRS unit of
the input geometries.

##### Signature

```typescript
async centroid(newColumn: string, options?: { column?: string }): Promise<void>;
```

##### Parameters

- **`newColumn`**: - The name of the new column where the computed centroid
  geometries will be stored.
- **`options`**: - An optional object with configuration options:
- **`options.column`**: - The name of the column storing the geometries. If
  omitted, the method will automatically attempt to find a geometry column.

##### Returns

A promise that resolves when the centroids have been computed.

##### Examples

```ts
// Compute the centroid of geometries in the default column, storing results in 'centerPoint'
await table.centroid("centerPoint");
```

```ts
// Compute the centroid of geometries in a specific column named 'areaGeom'
await table.centroid("areaCentroid", { column: "areaGeom" });
```

#### `distance`

Computes the distance between geometries in two specified columns. By default,
the distance is calculated in the Spatial Reference System (SRS) unit of the
input geometries. You can optionally specify `"spheroid"` or `"haversine"`
methods to get results in meters or kilometers. If using `"spheroid"` or
`"haversine"`, the input geometries must be in the EPSG:4326 coordinate system
(WGS84), with `[latitude, longitude]` axis order.

##### Signature

```typescript
async distance(column1: string, column2: string, newColumn: string, options?: { unit?: "m" | "km"; method?: "srs" | "haversine" | "spheroid"; decimals?: number }): Promise<void>;
```

##### Parameters

- **`column1`**: - The name of the first column storing geometries.
- **`column2`**: - The name of the second column storing geometries.
- **`newColumn`**: - The name of the new column where the computed distances
  will be stored.
- **`options`**: - An optional object with configuration options:
- **`options.method`**: - The method to use for distance calculations: `"srs"`
  (default, uses SRS unit), `"haversine"` (meters, requires EPSG:4326), or
  `"spheroid"` (meters, requires EPSG:4326, most accurate but slowest).
- **`options.unit`**: - If `method` is `"spheroid"` or `"haversine"`, you can
  choose between `"m"` (meters, default) or `"km"` (kilometers).
- **`options.decimals`**: - The number of decimal places to round the distance
  values. Defaults to `undefined` (no rounding).

##### Returns

A promise that resolves when the distances have been computed.

##### Examples

```ts
// Compute distance between 'geomA' and 'geomB' in SRS units, store in 'distance_srs'
await table.distance("geomA", "geomB", "distance_srs");
```

```ts
// Compute Haversine distance in meters between 'point1' and 'point2', store in 'distance_m'
// Input geometries must be in EPSG:4326.
await table.distance("point1", "point2", "distance_m", { method: "haversine" });
```

```ts
// Compute Haversine distance in kilometers, rounded to 2 decimal places
// Input geometries must be in EPSG:4326.
await table.distance("point1", "point2", "distance_km", {
  method: "haversine",
  unit: "km",
  decimals: 2,
});
```

```ts
// Compute Spheroid distance in kilometers
// Input geometries must be in EPSG:4326.
await table.distance("area1", "area2", "distance_spheroid_km", {
  method: "spheroid",
  unit: "km",
});
```

#### `unnestGeo`

Unnests geometries recursively, transforming multi-part geometries (e.g.,
MultiPolygon) into individual single-part geometries (e.g., Polygon).

##### Signature

```typescript
async unnestGeo(column?: string): Promise<void>;
```

##### Parameters

- **`column`**: - The name of the column storing the geometries to be unnested.
  If omitted, the method will automatically attempt to find a geometry column.

##### Returns

A promise that resolves when the geometries have been unnested.

##### Examples

```ts
// Unnest geometries in the default column
await table.unnestGeo();
```

```ts
// Unnest geometries in a specific column named 'multiGeom'
await table.unnestGeo("multiGeom");
```

#### `aggregateGeo`

Aggregates geometries in a specified column based on a chosen aggregation
method.

##### Signature

```typescript
async aggregateGeo(method: "union" | "intersection", options?: { column?: string; categories?: string | string[]; outputTable?: string | boolean }): Promise<SimpleTable>;
```

##### Parameters

- **`method`**: - The aggregation method to apply: `"union"` (combines all
  geometries into a single multi-geometry) or `"intersection"` (computes the
  intersection of all geometries).
- **`options`**: - An optional object with configuration options:
- **`options.column`**: - The name of the column storing the geometries to be
  aggregated. If omitted, the method will automatically attempt to find a
  geometry column.
- **`options.categories`**: - The column name or an array of column names that
  define categories for the aggregation. Aggregation will be performed
  independently within each category.
- **`options.outputTable`**: - If `true`, the results will be stored in a new
  table with a generated name. If a string, it will be used as the name for the
  new table. If `false` or omitted, the current table will be overwritten.
  Defaults to `false`.

##### Returns

A promise that resolves to the SimpleTable instance containing the aggregated
geometries (either the modified current table or a new table).

##### Examples

```ts
// Aggregate all geometries in the default column into a single union geometry
await table.aggregateGeo("union");
```

```ts
// Aggregate geometries by 'country' and compute their union
await table.aggregateGeo("union", { categories: "country" });
```

```ts
// Aggregate geometries in 'regions' column into their intersection, storing results in a new table
const intersectionTable = await table.aggregateGeo("intersection", {
  column: "regions",
  outputTable: true,
});
```

#### `linesToPolygons`

Transforms closed linestring geometries into polygon geometries.

##### Signature

```typescript
async linesToPolygons(column?: string): Promise<void>;
```

##### Parameters

- **`column`**: - The name of the column storing the linestring geometries. If
  omitted, the method will automatically attempt to find a geometry column.

##### Returns

A promise that resolves when the transformation is complete.

##### Examples

```ts
// Transform closed linestrings in the default geometry column into polygons
await table.linesToPolygons();
```

```ts
// Transform closed linestrings in a specific column named 'routeLines' into polygons
await table.linesToPolygons("routeLines");
```

#### `getBoundingBox`

Returns the bounding box of geometries in `[minLat, minLon, maxLat, maxLon]`
order. By default, the method will try to find the column with the geometries.
The input geometry is assumed to be in the EPSG:4326 coordinate system (WGS84),
with `[latitude, longitude]` axis order.

##### Signature

```typescript
async getBoundingBox(column?: string): Promise<any>;
```

##### Parameters

- **`column`**: - The name of the column storing geometries. If omitted, the
  method will automatically attempt to find a geometry column.

##### Returns

A promise that resolves to an array `[minLat, minLon, maxLat, maxLon]`
representing the bounding box.

##### Examples

```ts
// Get the bounding box of geometries in the default column
const bbox = await table.getBoundingBox();
console.log(bbox); // e.g., [45.0, -75.0, 46.0, -73.0]
```

```ts
// Get the bounding box of geometries in a specific column named 'areaGeom'
const areaBbox = await table.getBoundingBox("areaGeom");
console.log(areaBbox);
```

#### `getGeoData`

Returns the table's geospatial data as a GeoJSON object. If the table has
multiple geometry columns, you must specify which one to use. If the geometry
column's projection is WGS84 or EPSG:4326 (`[latitude, longitude]` axis order),
the coordinates will be flipped to follow the RFC7946 standard
(`[longitude, latitude]` axis order) in the output GeoJSON.

##### Signature

```typescript
async getGeoData(column?: string, options?: { rewind?: boolean }): Promise<{ type: string; features: unknown[] }>;
```

##### Parameters

- **`column`**: - The name of the column storing the geometries. If omitted, the
  method will automatically attempt to find a geometry column.
- **`options`**: - An optional object with configuration options:
- **`options.rewind`**: - If `true`, rewinds the coordinates of polygons to
  follow the spherical winding order (important for D3.js). Defaults to `false`.

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
async writeData(file: string, options?: { compression?: boolean; dataAsArrays?: boolean; formatDates?: boolean }): Promise<void>;
```

##### Parameters

- **`file`**: - The absolute path to the output file (e.g., `"./output.csv"`,
  `"./output.json"`).
- **`options`**: - An optional object with configuration options:
- **`options.compression`**: - A boolean indicating whether to compress the
  output file. If `true`, CSV and JSON files will be compressed with GZIP, while
  Parquet files will use ZSTD. Defaults to `false`.
- **`options.dataAsArrays`**: - For JSON files only. If `true`, JSON files are
  written as a single object with arrays for each column (e.g.,
  `{ "col1": [v1, v2], "col2": [v3, v4] }`) instead of an array of objects. This
  can reduce file size for web projects. You can use the `arraysToData` function
  from the
  [journalism library](https://jsr.io/@nshiab/journalism/doc/~/arraysToData) to
  convert it back.
- **`options.formatDates`**: - For CSV and JSON files only. If `true`, date and
  timestamp columns will be formatted as ISO 8601 strings (e.g.,
  `"2025-01-01T01:00:00.000Z"`). Defaults to `false`.

##### Returns

A promise that resolves when the data has been written to the file.

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

Writes the table's geospatial data to a file in GeoJSON or GeoParquet format. If
the specified path does not exist, it will be created.

For GeoJSON files (`.geojson` or `.json`), if the projection is WGS84 or
EPSG:4326 (`[latitude, longitude]` axis order), the coordinates will be flipped
to follow the RFC7946 standard (`[longitude, latitude]` axis order) in the
output.

##### Signature

```typescript
async writeGeoData(file: string, options?: { precision?: number; compression?: boolean; rewind?: boolean; metadata?: unknown; formatDates?: boolean }): Promise<void>;
```

##### Parameters

- **`file`**: - The absolute path to the output file (e.g.,
  `"./output.geojson"`, `"./output.geoparquet"`).
- **`options`**: - An optional object with configuration options:
- **`options.precision`**: - For GeoJSON, the maximum number of figures after
  the decimal separator to write in coordinates. Defaults to `undefined` (full
  precision).
- **`options.compression`**: - For GeoParquet, if `true`, the output will be
  ZSTD compressed. Defaults to `false`.
- **`options.rewind`**: - For GeoJSON, if `true`, rewinds the coordinates of
  polygons to follow the right-hand rule (RFC 7946). Defaults to `false`.
- **`options.metadata`**: - For GeoJSON, an object to be added as top-level
  metadata to the GeoJSON output.
- **`options.formatDates`**: - For GeoJSON, if `true`, formats date and
  timestamp columns to ISO 8601 strings. Defaults to `false`.

##### Returns

A promise that resolves when the geospatial data has been written to the file.

##### Examples

```ts
// Write geospatial data to a GeoJSON file
await table.writeGeoData("./output.geojson");
```

```ts
// Write geospatial data to a compressed GeoParquet file
await table.writeGeoData("./output.geoparquet", { compression: true });
```

```ts
// Write GeoJSON with specific precision and metadata
await table.writeGeoData("./output_high_precision.geojson", {
  precision: 6,
  metadata: { source: "SimpleDataAnalysis" },
});
```

#### `toSheet`

Clears a Google Sheet and populates it with the table's data. This method uses
the `overwriteSheetData` function from the
[journalism library](https://jsr.io/@nshiab/journalism/doc/~/overwriteSheetData).
Refer to its documentation for more details.

By default, this function looks for the API key in `GOOGLE_PRIVATE_KEY` and the
service account email in `GOOGLE_SERVICE_ACCOUNT_EMAIL` environment variables.
If you don't have credentials, refer to the
[Google Spreadsheet authentication guide](https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication).

##### Signature

```typescript
async toSheet(sheetUrl: string, options?: { prepend?: string; lastUpdate?: boolean; timeZone?: "Canada/Atlantic" | "Canada/Central" | "Canada/Eastern" | "Canada/Mountain" | "Canada/Newfoundland" | "Canada/Pacific" | "Canada/Saskatchewan" | "Canada/Yukon"; raw?: boolean; apiEmail?: string; apiKey?: string }): Promise<void>;
```

##### Parameters

- **`sheetUrl`**: - The URL pointing to a specific Google Sheet (e.g.,
  `"https://docs.google.com/spreadsheets/d/.../edit#gid=0"`).
- **`options`**: - An optional object with configuration options:
- **`options.prepend`**: - Text to be added before the data in the sheet.
- **`options.lastUpdate`**: - If `true`, adds a row before the data with the
  date of the update.
- **`options.timeZone`**: - If `lastUpdate` is `true`, this option allows
  formatting the date to a specific time zone.
- **`options.raw`**: - If `true`, Google Sheets will not attempt to guess the
  data type and will not format or parse the values.
- **`options.apiEmail`**: - If your API email is stored under a different
  environment variable name, use this option to specify it.
- **`options.apiKey`**: - If your API key is stored under a different
  environment variable name, use this option to specify it.

##### Returns

A promise that resolves when the data has been written to the Google Sheet.

##### Examples

```ts
// Write table data to a Google Sheet
await table.toSheet("https://docs.google.com/spreadsheets/d/.../edit#gid=0");
```

```ts
// Write data to a Google Sheet, prepending a message and including the last update timestamp
await table.toSheet("https://docs.google.com/spreadsheets/d/.../edit#gid=0", {
  prepend: "Report generated on:",
  lastUpdate: true,
  timeZone: "Canada/Eastern",
});
```

#### `cache`

Caches the results of computations in `./.sda-cache`. You should add
`./.sda-cache` to your `.gitignore` file.

##### Signature

```typescript
async cache(run: () => any, options?: { ttl?: number }): Promise<void>;
```

##### Parameters

- **`run`**: - A function wrapping the computations to be cached. This function
  will be executed on the first run or if the cached data is invalid/expired.
- **`options`**: - An optional object with configuration options:
- **`options.ttl`**: - Time to live (in seconds). If the data in the cache is
  older than this duration, the `run` function will be executed again to refresh
  the cache. By default, there is no TTL, meaning the cache is only invalidated
  if the `run` function's content changes.

##### Returns

A promise that resolves when the computations are complete or the data is loaded
from cache.

##### Examples

```ts
// Basic usage: computations are cached and re-run only if the function content changes
const sdb = new SimpleDB();
const table = sdb.newTable();

await table.cache(async () => {
  await table.loadData("items.csv");
  await table.summarize({
    values: "price",
    categories: "department",
    summaries: ["min", "max", "mean"],
  });
});

// It's important to call done() on the SimpleDB instance to clean up the cache.
// This prevents the cache from growing indefinitely.
await sdb.done();
```

```ts
// Cache with a Time-To-Live (TTL) of 60 seconds
// The computations will be re-run if the cached data is older than 1 minute or if the function content changes.
const sdb = new SimpleDB();
const table = sdb.newTable();

await table.cache(async () => {
  await table.loadData("items.csv");
  await table.summarize({
    values: "price",
    categories: "department",
    summaries: ["min", "max", "mean"],
  });
}, { ttl: 60 });

await sdb.done();
```

```ts
// Enable verbose logging for cache operations via SimpleDB instance
const sdb = new SimpleDB({ cacheVerbose: true });
const table = sdb.newTable();

await table.cache(async () => {
  await table.loadData("items.csv");
  await table.summarize({
    values: "price",
    categories: "department",
    summaries: ["min", "max", "mean"],
  });
});

await sdb.done();
```

#### `writeChart`

Creates an [Observable Plot](https://github.com/observablehq/plot) chart as an
image file (.png, .jpeg, or .svg) from the table data. To create maps, use the
`writeMap` method.

##### Signature

```typescript
async writeChart(chart: (data: unknown[]) => any, path: string, options?: { style?: string; dark?: boolean }): Promise<void>;
```

##### Parameters

- **`chart`**: - A function that takes data (as an array of objects) and returns
  an Observable Plot chart (an `SVGSVGElement` or `HTMLElement`).
- **`path`**: - The absolute path where the chart image will be saved (e.g.,
  `"./output/chart.png"`).
- **`options`**: - Optional object containing additional settings:
- **`options.style`**: - A CSS string to customize the chart's appearance. This
  is applied to a `<div>` element wrapping the Plot chart (which has the id
  `chart`). Use this if the Plot `style` option is insufficient.
- **`options.dark`**: - If `true`, switches the chart to dark mode. Defaults to
  `false`.

##### Returns

A promise that resolves when the chart image has been saved.

##### Examples

```ts
import { dot, plot } from "@observablehq/plot";

const sdb = new SimpleDB();
const table = sdb.newTable();
const data = [{ year: 2024, value: 10 }, { year: 2025, value: 15 }];
await table.loadArray(data);

const chartFunction = (plotData: unknown[]) =>
  plot({
    marks: [
      dot(plotData, { x: "year", y: "value" }),
    ],
  });

const outputPath = "output/chart.png";

await table.writeChart(chartFunction, outputPath);
```

#### `writeMap`

Creates an [Observable Plot](https://github.com/observablehq/plot) map as an
image file (.png, .jpeg, or .svg) from the table's geospatial data. To create
charts from non-geospatial data, use the `writeChart` method.

##### Signature

```typescript
async writeMap(map: (geoData: { features: { properties: Record<string, unknown> }[] }) => any, path: string, options?: { column?: string; rewind?: boolean; style?: string; dark?: boolean }): Promise<void>;
```

##### Parameters

- **`map`**: - A function that takes geospatial data (in GeoJSON format) and
  returns an Observable Plot map (an `SVGSVGElement` or `HTMLElement`).
- **`path`**: - The absolute path where the map image will be saved (e.g.,
  `"./output/map.png"`).
- **`options`**: - An optional object with configuration options:
- **`options.column`**: - The name of the column storing geometries. If there is
  only one geometry column, it will be used by default.
- **`options.rewind`**: - If `true`, rewinds the coordinates of polygons to
  follow the spherical winding order (important for D3.js). Defaults to `true`.
- **`options.style`**: - A CSS string to customize the map's appearance. This is
  applied to a `<div>` element wrapping the Plot map (which has the ID `chart`).
  Use this if the Plot `style` option is insufficient.
- **`options.dark`**: - If `true`, switches the map to dark mode. Defaults to
  `false`.

##### Returns

A promise that resolves when the map image has been saved.

##### Examples

```ts
import { geo, plot } from "@observablehq/plot";

const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadGeoData("./CanadianProvincesAndTerritories.geojson");

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

await table.writeMap(mapFunction, outputPath);
```

#### `logTable`

Logs a specified number of rows from the table to the console. By default, the
first 10 rows are logged. You can optionally log the column types and filter the
data based on conditions. You can also use JavaScript syntax for conditions
(e.g., `&&`, `||`, `===`, `!==`).

##### Signature

```typescript
async logTable(options?: "all" | number | { nbRowsToLog?: number | "all"; types?: boolean; conditions?: string }): Promise<void>;
```

##### Parameters

- **`options`**: - Either the number of rows to log (a specific number or
  `"all"`) or an object with configuration options:
- **`options.nbRowsToLog`**: - The number of rows to log. Defaults to 10 or the
  value set in the SimpleDB instance. Use `"all"` to log all rows.
- **`options.types`**: - If `true`, logs the column types along with the data.
  Defaults to `false`.
- **`options.conditions`**: - A SQL `WHERE` clause condition to filter the data
  before logging. Defaults to no condition.

##### Returns

A promise that resolves when the table data has been logged.

##### Examples

```ts
// Log the first 10 rows (default behavior)
await table.logTable();
```

```ts
// Log the first 50 rows
await table.logTable(50);
```

```ts
// Log all rows
await table.logTable("all");
```

```ts
// Log the first 20 rows and include column types
await table.logTable({ nbRowsToLog: 20, types: true });
```

```ts
// Log rows where 'status' is 'active' (using JS syntax for conditions)
await table.logTable({ conditions: `status === 'active'` });
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
async logLineChart(x: string, y: string, options?: { formatX?: (d: unknown) => any; formatY?: (d: unknown) => any; smallMultiples?: string; fixedScales?: boolean; smallMultiplesPerRow?: number; width?: number; height?: number }): Promise<void>;
```

##### Parameters

- **`x`**: - The name of the column to be used for the x-axis. Values must be
  numbers or Date objects.
- **`y`**: - The name of the column to be used for the y-axis. Values must be
  numbers.
- **`options`**: - An optional object with configuration options:
- **`options.formatX`**: - A function to format the x-axis values for display.
  It receives the raw x-value as input and should return a string. If the first
  data point's x value is a Date, it defaults to formatting the date as
  "YYYY-MM-DD".
- **`options.formatY`**: - A function to format the y-axis values for display.
  It receives the raw y-value as input and should return a string.
- **`options.smallMultiples`**: - The name of a column to create small multiples
  (also known as facets or trellis charts). Each unique value in this column
  will generate a separate chart.
- **`options.fixedScales`**: - If `true`, all small multiples will share the
  same y-axis scale. Defaults to `false`.
- **`options.smallMultiplesPerRow`**: - The number of small multiples to display
  per row.
- **`options.width`**: - The width of the chart in characters.
- **`options.height`**: - The height of the chart in characters.

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
await table.loadArray(data);
await table.convert({ date: "string" }, { datetimeFormat: "%x" });
await table.logLineChart("date", "value");
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
await table.loadArray(data);
await table.convert({ date: "string" }, { datetimeFormat: "%x" });
await table.logLineChart("date", "value", {
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
async logDotChart(x: string, y: string, options?: { formatX?: (d: unknown) => any; formatY?: (d: unknown) => any; smallMultiples?: string; fixedScales?: boolean; smallMultiplesPerRow?: number; width?: number; height?: number }): Promise<void>;
```

##### Parameters

- **`x`**: - The name of the column to be used for the x-axis. Values must be
  numbers or Date objects.
- **`y`**: - The name of the column to be used for the y-axis. Values must be
  numbers.
- **`options`**: - An optional object with configuration options:
- **`options.formatX`**: - A function to format the x-axis values for display.
  It receives the raw x-value as input and should return a string. If the first
  data point's x value is a Date, it defaults to formatting the date as
  "YYYY-MM-DD".
- **`options.formatY`**: - A function to format the y-axis values for display.
  It receives the raw y-value as input and should return a string.
- **`options.smallMultiples`**: - The name of a column to create small multiples
  (also known as facets). Each unique value in this column will generate a
  separate chart.
- **`options.fixedScales`**: - If `true`, all small multiples will share the
  same y-axis scale. Defaults to `false`.
- **`options.smallMultiplesPerRow`**: - The number of small multiples to display
  per row.
- **`options.width`**: - The width of the chart in characters.
- **`options.height`**: - The height of the chart in characters.

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
await table.loadArray(data);
await table.convert({ date: "string" }, { datetimeFormat: "%x" });
await table.logDotChart("date", "value");
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
await table.loadArray(data);
await table.convert({ date: "string" }, { datetimeFormat: "%x" });
await table.logDotChart("date", "value", {
  smallMultiples: "category",
});
```

#### `logBarChart`

Generates and logs a bar chart to the console.

##### Signature

```typescript
async logBarChart(labels: string, values: string, options?: { formatLabels?: (d: unknown) => any; formatValues?: (d: unknown) => any; width?: number }): Promise<void>;
```

##### Parameters

- **`labels`**: - The name of the column to be used for the labels (categories).
- **`values`**: - The name of the column to be used for the values.
- **`options`**: - An optional object with configuration options:
- **`options.formatLabels`**: - A function to format the labels. Defaults to
  converting the label to a string.
- **`options.formatValues`**: - A function to format the values. Defaults to
  converting the value to a string.
- **`options.width`**: - The width of the chart in characters. Defaults to 40.

##### Returns

A promise that resolves when the chart has been logged to the console.

##### Examples

```typescript
const data = [
  { category: "A", value: 10 },
  { category: "B", value: 20 },
];
await table.loadArray(data);
await table.logBarChart("category", "value");
```

#### `logHistogram`

Generates and logs a histogram of a numeric column to the console.

##### Signature

```typescript
async logHistogram(values: string, options?: { bins?: number; formatLabels?: (min: number, max: number) => any; compact?: boolean; width?: number }): Promise<void>;
```

##### Parameters

- **`values`**: - The name of the numeric column for which to generate the
  histogram.
- **`options`**: - An optional object with configuration options:
- **`options.bins`**: - The number of bins (intervals) to use for the histogram.
  Defaults to 10.
- **`options.formatLabels`**: - A function to format the labels for the
  histogram bins. It receives the lower and upper bounds of each bin as
  arguments.
- **`options.compact`**: - If `true`, the histogram will be displayed in a more
  compact format. Defaults to `false`.
- **`options.width`**: - The maximum width of the histogram bars in characters.

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

#### `logDescription`

Logs descriptive information about the columns in the table to the console. This
includes details such as data types, number of null values, and number of
distinct values for each column. It internally calls the `getDescription` method
to retrieve the descriptive statistics.

##### Signature

```typescript
async logDescription(): Promise<void>;
```

##### Returns

A promise that resolves when the column description has been logged to the
console.

##### Examples

```ts
// Log descriptive information for all columns in the table
await table.logDescription();
```

#### `logProjections`

Logs the projections of the geospatial data (if any) to the console.

##### Signature

```typescript
async logProjections(): Promise<SimpleTable>;
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
async logTypes(): Promise<SimpleTable>;
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
async logUniques(column: string, options?: { stringify?: boolean }): Promise<SimpleTable>;
```

##### Parameters

- **`column`**: - The name of the column from which to retrieve and log unique
  values.
- **`options`**: - An optional object with configuration options:
- **`options.stringify`**: - If `true`, converts the unique values to a JSON
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
async logColumns(options?: { types?: boolean }): Promise<SimpleTable>;
```

##### Parameters

- **`options`**: - An optional object with configuration options:
- **`options.types`**: - If `true`, logs the column names along with their data
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

#### `logNbRows`

Logs the total number of rows in the table to the console.

##### Signature

```typescript
async logNbRows(): Promise<SimpleTable>;
```

##### Returns

A promise that resolves to the SimpleTable instance after logging the row count.

##### Examples

```ts
// Log the total number of rows in the table
await table.logNbRows();
```

#### `logBottom`

Logs the bottom `n` rows of the table to the console. By default, the last row
will be returned first. To preserve the original order, use the `originalOrder`
option.

##### Signature

```typescript
async logBottom(count: number, options?: { originalOrder?: boolean }): Promise<void>;
```

##### Parameters

- **`count`**: - The number of rows to log from the bottom of the table.

##### Returns

A promise that resolves when the rows have been logged to the console.

##### Examples

```ts
// Log the last 10 rows (last row first)
await table.logBottom(10);
```

```ts
// Log the last 5 rows in their original order
await table.logBottom(5, { originalOrder: true });
```

#### `logExtent`

Logs the extent (minimum and maximum values) of a numeric column to the console.

##### Signature

```typescript
async logExtent(column: string): Promise<void>;
```

##### Parameters

- **`column`**: - The name of the numeric column for which to log the extent.

##### Returns

A promise that resolves when the column extent has been logged to the console.

##### Examples

```ts
// Log the extent of the 'price' column
await table.logExtent("price");
```

### Examples

```ts
// Create a SimpleDB instance (in-memory by default)
const sdb = new SimpleDB();

// Create a new table named "employees" within the database
const employees = sdb.newTable("employees");

// Load data from a CSV file into the "employees" table
await employees.loadData("./employees.csv");

// Log the first few rows of the "employees" table to the console
await employees.logTable();

// Close the database connection and free up resources
await sdb.done();
```

```ts
// Handling geospatial data
// Create a SimpleDB instance
const sdb = new SimpleDB();

// Create a new table for geospatial data
const boundaries = sdb.newTable("boundaries");

// Load geospatial data from a GeoJSON file
await boundaries.loadGeoData("./boundaries.geojson");

// Close the database connection
await sdb.done();
```
