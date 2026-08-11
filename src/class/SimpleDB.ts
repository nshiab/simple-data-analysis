import { SimpleDB as SimpleDBCore } from "@nshiab/simple-data-analysis-core";
import SimpleTable from "./SimpleTable.ts";

/**
 * Manages a DuckDB database instance, providing a simplified interface for database operations.
 * Extends the core [`SimpleDB`](https://github.com/nshiab/simple-data-analysis-core) class
 * from [`simple-data-analysis-core`](https://github.com/nshiab/simple-data-analysis-core) to use
 * our extended SimpleTable class which includes additional AI, Google Sheets, and charting methods.
 *
 * @example
 * ```ts
 * // Create an in-memory database instance
 * const sdb = new SimpleDB();
 * // Create a new table named "employees"
 * const employees = sdb.newTable("employees");
 * // Load data from a CSV file into the "employees" table
 * employees.loadData("./employees.csv");
 * // Log the first few rows of the "employees" table to the console
 * await employees.logTable();
 * // Close the database connection and clean up resources
 * await sdb.done();
 * ```
 *
 * @example
 * ```ts
 * // Create a persistent database instance, saving data to a file
 * // To load an existing database, use the `loadDB` method instead
 * const sdb = new SimpleDB({ file: "./my_database.db" });
 * // Perform database operations...
 * // Close the database connection, which saves changes to the specified file
 * await sdb.done();
 * ```
 *
 * @example
 * ```ts
 * // Create a database instance with custom options
 * const sdb = new SimpleDB({
 *   logSQL: true, // Log SQL immediately before execution
 *   rowsToLog: 20 // Set the number of rows to log by default
 * });
 * ```
 *
 * @example
 * ```ts
 * // Work around Deno result-chunk finalization crashes with file transport
 * const sdb = new SimpleDB({ dataTransport: "file" });
 * ```
 */
export default class SimpleDB extends SimpleDBCore<SimpleTable> {
  /**
   * The class used to create new table instances. Set to our extended SimpleTable
   * which includes additional AI, Google Sheets, and charting methods.
   * @internal
   */
  override tableClass: typeof SimpleTable;

  /**
   * Creates a new SimpleDB instance.
   *
   * @param options - Configuration options for the SimpleDB instance.
   * @param options.file - The path to the database file. If not provided, an in-memory database is used.
   * @param options.overwrite - A flag indicating whether to overwrite the database file if it already exists.
   * @param options.logDuration - A flag indicating whether to log the total execution duration.
   * @param options.rowsToLog - The number of rows to display when logging a table.
   * @param options.charsToLog - The maximum number of characters to display for text-based cells.
   * @param options.typesToLog - A flag indicating whether to include data types when logging a table.
   * @param options.cacheVerbose - A flag indicating whether to log verbose cache-related messages.
   * @param options.logSQL - A flag indicating whether to log SQL immediately before execution.
   * @param options.explainSQL - A flag indicating whether to log DuckDB query plans for supported statements.
   * @param options.duckDbCache - A flag indicating whether to use DuckDB's external file cache.
   * @param options.progressBar - A flag indicating whether to display a progress bar for long-running operations.
   * @param options.memoryLimit - The maximum amount of memory DuckDB is allowed to use (for example, `"4GB"`).
   * @param options.tempDir - The path to the directory used for temporary files.
   * @param options.dataTransport - The transport used to retrieve data from DuckDB. Defaults to `"direct"`. The experimental `"file"` option works around [Deno issue #36538](https://github.com/denoland/deno/issues/36538), but adds serialization, disk I/O, and parsing; it requires filesystem permissions and is not a streaming or low-memory mode.
   * @category Constructor
   */
  constructor(
    options: {
      file?: string;
      overwrite?: boolean;
      logDuration?: boolean;
      rowsToLog?: number;
      charsToLog?: number;
      typesToLog?: boolean;
      cacheVerbose?: boolean;
      logSQL?: boolean;
      explainSQL?: boolean;
      duckDbCache?: boolean | null;
      progressBar?: boolean;
      memoryLimit?: string;
      tempDir?: string;
      dataTransport?: "direct" | "file";
    } = {},
  ) {
    super(options);
    // Use our extended SimpleTable which includes AI, Google Sheets, and charting methods
    this.tableClass = SimpleTable;
  }
}
