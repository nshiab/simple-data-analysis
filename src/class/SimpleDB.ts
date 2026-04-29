import { SimpleDB as SimpleDBCore } from "@nshiab/simple-data-analysis-core";
import SimpleTable from "./SimpleTable.ts";

/**
 * Manages a DuckDB database instance, providing a simplified interface for database operations.
 * Extends the core SimpleDB to use our extended SimpleTable class which includes
 * additional AI, Google Sheets, and charting methods.
 *
 * @example
 * ```ts
 * // Create an in-memory database instance
 * const sdb = new SimpleDB();
 * // Create a new table named "employees"
 * const employees = sdb.newTable("employees");
 * // Load data from a CSV file into the "employees" table
 * await employees.loadData("./employees.csv");
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
 *   debug: true, // Enable debugging output
 *   nbRowsToLog: 20 // Set the number of rows to log by default
 * });
 * ```
 */
export default class SimpleDB extends SimpleDBCore {
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
   * @param options.nbRowsToLog - The number of rows to display when logging a table.
   * @param options.nbCharactersToLog - The maximum number of characters to display for text-based cells.
   * @param options.types - A flag indicating whether to include data types when logging a table.
   * @param options.cacheVerbose - A flag indicating whether to log verbose cache-related messages.
   * @param options.debug - A flag indicating whether to log debugging information.
   * @param options.duckDbCache - A flag indicating whether to use DuckDB's external file cache.
   * @param options.progressBar - A flag indicating whether to display a progress bar for long-running operations.
   * @category Constructor
   */
  constructor(
    options: {
      file?: string;
      overwrite?: boolean;
      logDuration?: boolean;
      nbRowsToLog?: number;
      nbCharactersToLog?: number;
      types?: boolean;
      cacheVerbose?: boolean;
      debug?: boolean;
      duckDbCache?: boolean | null;
      progressBar?: boolean;
    } = {},
  ) {
    super(options);
    // Use our extended SimpleTable which includes AI, Google Sheets, and charting methods
    this.tableClass = SimpleTable;
  }

  /**
   * Creates a new SimpleTable instance within the database.
   *
   * @param name - The name of the new table. If not provided, a default name is generated (e.g., "table1").
   * @param projections - An object mapping column names to their geospatial projections.
   * @returns A new SimpleTable instance.
   * @category Table Management
   *
   * @example
   * ```ts
   * // Create a table with a default name (e.g., "table1", "table2", etc.)
   * const dataTable = sdb.newTable();
   * ```
   *
   * @example
   * ```ts
   * // Create a table with a specific name
   * const employees = sdb.newTable("employees");
   * ```
   */
  override newTable(
    name?: string,
    projections?: { [key: string]: string },
  ): SimpleTable {
    return super.newTable(name, projections) as unknown as SimpleTable;
  }

  /**
   * Retrieves an existing SimpleTable instance from the database.
   *
   * @param name - The name of the table to retrieve.
   * @returns A promise that resolves to the SimpleTable instance if found.
   * @category Table Management
   *
   * @example
   * ```ts
   * // Retrieve the "employees" table
   * const employees = await sdb.getTable("employees");
   * ```
   */
  override getTable(name: string): Promise<SimpleTable> {
    return super.getTable(name) as unknown as Promise<SimpleTable>;
  }

  /**
   * Returns an array of all SimpleTable instances in the database.
   *
   * @returns A promise that resolves to an array of SimpleTable instances.
   * @category Table Management
   *
   * @example
   * ```ts
   * // Get all SimpleTable instances
   * const tables = await sdb.getTables();
   * ```
   */
  override getTables(): Promise<SimpleTable[]> {
    return super.getTables() as unknown as Promise<SimpleTable[]>;
  }
}
