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
 * // Create a table, load a CSV file, and log its first few rows
 * const employees = await sdb
 *   .newTable("employees")
 *   .loadData("./employees.csv")
 *   .log();
 * // Close the database connection and clean up resources
 * await sdb.close();
 * ```
 *
 * @example
 * ```ts
 * // Open an existing DuckDB file, or create it on first use
 * const sdb = new SimpleDB({ file: "./my_database.db" });
 * // Perform database operations...
 * // Execute pending work, save metadata, and close the database connection
 * await sdb.close();
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
   * @param options.file - The path to a persistent DuckDB file, opened or created on first use. If not provided, an in-memory database is used.
   * @param options.overwrite - Whether to replace an existing DuckDB file on first use instead of opening it. Defaults to false.
   * @param options.readOnly - Opens an existing DuckDB file read-only. Defaults to false. Requires a file and cannot be combined with overwrite.
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
   * @category Constructor
   * @example
   * ```ts
   * const sdb = new SimpleDB({ file: "./archive.duckdb", readOnly: true });
   * const table = await sdb.getTable("employees");
   * await table.log();
   * await sdb.close();
   * ```
   */
  constructor(
    options: {
      file?: string;
      overwrite?: boolean;
      readOnly?: boolean;
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
    } = {},
  ) {
    super(options);
    // Use our extended SimpleTable which includes AI, Google Sheets, and charting methods
    this.tableClass = SimpleTable;
  }
}
