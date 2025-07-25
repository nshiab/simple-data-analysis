import { DuckDBInstance } from "@duckdb/node-api";
import runQuery from "../helpers/runQuery.ts";
import SimpleTable from "./SimpleTable.ts";
import cleanCache from "../helpers/cleanCache.ts";
import { createDirectory, prettyDuration } from "@nshiab/journalism";
import Simple from "./Simple.ts";
import queryDB from "../helpers/queryDB.ts";
import mergeOptions from "../helpers/mergeOptions.ts";
import getTableNames from "../methods/getTableNames.ts";
import cleanPath from "../helpers/cleanPath.ts";
import getExtension from "../helpers/getExtension.ts";
import { existsSync, rmSync } from "node:fs";
import checkVssIndexes from "../helpers/checkVssIndexes.ts";
import setDbProps from "../helpers/setDbProps.ts";
import writeProjectionsAndIndexes from "../helpers/writeProjectionsAndIndexes.ts";
import getName from "../helpers/getName.ts";
import { renameSync } from "node:fs";

/**
 * Manages a DuckDB database instance, providing a simplified interface for database operations.
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

export default class SimpleDB extends Simple {
  /**
   * An array of paths to the data sources used in the cache.
   *
   * @defaultValue `[]`
   * @category Properties
   */
  cacheSourcesUsed: string[];
  /**
   * A timestamp marking the start of a duration measurement.
   *
   * @defaultValue `undefined`
   * @category Properties
   */
  durationStart: number | undefined;
  /**
   * A counter for incrementing default table names.
   *
   * @defaultValue `1`
   * @category Properties
   */
  tableIncrement: number;
  /**
   * A flag indicating whether to log the total execution duration.
   *
   * @defaultValue `false`
   * @category Properties
   */
  logDuration: boolean;
  /**
   * An array of SimpleTable instances associated with this database.
   *
   * @defaultValue `[]`
   * @category Properties
   */
  tables: SimpleTable[];
  /**
   * A flag indicating whether to log verbose cache-related messages.
   *
   * @defaultValue `false`
   * @category Properties
   */
  cacheVerbose: boolean;
  /**
   * The total time saved by using the cache, in milliseconds.
   *
   * @defaultValue `0`
   * @category Properties
   */
  cacheTimeSaved: number;
  /**
   * The total time spent writing to the cache, in milliseconds.
   *
   * @defaultValue `0`
   * @category Properties
   */
  cacheTimeWriting: number;
  /**
   * A flag indicating whether to display a progress bar for long-running operations.
   *
   * @defaultValue `false`
   * @category Properties
   */
  progressBar: boolean;
  /**
   * A flag indicating whether to use DuckDB's external file cache.
   *
   * @defaultValue `false`
   * @category Properties
   */
  duckDbCache: boolean | null;
  /**
   * The path to the database file. If not provided, an in-memory database is used.
   *
   * @defaultValue `:memory:`
   * @category Properties
   */
  file: string;
  /**
   * A flag indicating whether to overwrite the database file if it already exists.
   *
   * @defaultValue `false`
   * @category Properties
   */
  overwrite: boolean;

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
    this.file = options.file ?? ":memory:";
    this.overwrite = options.overwrite ?? false;
    this.logDuration = options.logDuration ?? false;
    this.tableIncrement = 1;
    this.tables = [];
    this.cacheSourcesUsed = [];
    this.cacheVerbose = options.cacheVerbose ?? false;
    this.cacheTimeSaved = 0;
    this.cacheTimeWriting = 0;
    this.progressBar = options.progressBar ?? false;
    this.duckDbCache = options.duckDbCache === undefined
      ? false
      : options.duckDbCache;
    this.runQuery = runQuery;
    if (this.cacheVerbose || this.logDuration) {
      this.durationStart = Date.now();
    }
  }

  /**
   * Initializes the DuckDB database instance and connection.
   *
   * @returns A promise that resolves to the SimpleDB instance after initialization.
   * @internal
   * @category Lifecycle
   */
  async start(): Promise<SimpleDB> {
    if (this.db === undefined || this.connection === undefined) {
      if (this.file !== ":memory:") {
        if (getExtension(this.file) !== "db") {
          throw new Error(
            `The file extension must be .db. The current file is ${this.file}.`,
          );
        }
        if (existsSync(this.file) && this.overwrite === false) {
          throw new Error(
            `The file ${this.file} already exists. Set the overwrite option to true to overwrite it. Otherwise, use the loadDB() method to load an existing database with more options.`,
          );
        } else if (existsSync(this.file) && this.overwrite === true) {
          rmSync(this.file);
        }
      }

      this.db = await DuckDBInstance.create(this.file);
      this.connection = await this.db.connect();

      if (this.duckDbCache === true) {
        await this.customQuery("SET enable_external_file_cache=true;");
      } else if (this.duckDbCache === false) {
        await this.customQuery("SET enable_external_file_cache=false;");
      }

      if (this.progressBar) {
        await this.customQuery(
          `SET enable_progress_bar = TRUE;`,
        );
      }
    }
    return this;
  }

  /**
   * Adds a SimpleTable instance to the internal list of tables.
   *
   * @param table - The SimpleTable instance to add.
   * @internal
   * @category Table Management
   */
  pushTable(table: SimpleTable): void {
    if (!(table instanceof SimpleTable)) {
      throw new Error("The table must be an instance of SimpleTable.");
    }
    if (this.tables.map((t) => t.name).includes(table.name)) {
      throw new Error(`Table ${table.name} already exists.`);
    }

    this.tables.push(table);
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
  newTable(
    name?: string,
    projections?: { [key: string]: string },
  ): SimpleTable {
    const proj = projections ?? {};

    // SHOULD MATCH cloneTable
    let table;
    if (typeof name === "string") {
      table = new SimpleTable(name, proj, this, {
        debug: this.debug,
        nbRowsToLog: this.nbRowsToLog,
        nbCharactersToLog: this.nbCharactersToLog,
        types: this.types,
      });
      table.defaultTableName = false;
    } else {
      table = new SimpleTable(`table${this.tableIncrement}`, proj, this, {
        debug: this.debug,
        nbRowsToLog: this.nbRowsToLog,
        nbCharactersToLog: this.nbCharactersToLog,
        types: this.types,
      });
      table.defaultTableName = true;
      this.tableIncrement += 1;
    }

    this.pushTable(table);

    return table;
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
  async getTable(name: string): Promise<SimpleTable> {
    const table = this.tables.find((t) => t.name === name);
    if (table) {
      return await table;
    } else {
      throw new Error(`Table ${name} not found.`);
    }
  }

  /**
   * Removes one or more tables from the database.
   *
   * @param tables - A single table or an array of tables to remove, specified by name or as SimpleTable instances.
   * @returns A promise that resolves when the tables have been removed.
   * @category Table Management
   *
   * @example
   * ```ts
   * // Remove a single table by name
   * await sdb.removeTables("employees");
   * ```
   *
   * @example
   * ```ts
   * // Remove multiple tables by name
   * await sdb.removeTables(["customers", "products"]);
   * ```
   *
   * @example
   * ```ts
   * // Remove a single table using a SimpleTable instance
   * const employeesTable = sdb.newTable("employees");
   * // ... load data ...
   * await sdb.removeTables(employeesTable);
   * ```
   */
  async removeTables(
    tables: SimpleTable | string | (SimpleTable | string)[],
  ): Promise<void> {
    const tablesToBeRemoved = Array.isArray(tables) ? tables : [tables];

    await queryDB(
      this,
      tablesToBeRemoved.map((d) =>
        `DROP TABLE "${d instanceof SimpleTable ? d.name : d}";`
      ).join("\n"),
      mergeOptions(this, {
        table: null,
        method: "removeTable()",
        parameters: {},
      }),
    );

    const tablesNamesToBeRemoved = tablesToBeRemoved.map((t) =>
      t instanceof SimpleTable ? t.name : t
    );
    this.tables = this.tables.filter((t) =>
      !tablesNamesToBeRemoved.includes(t.name)
    );
  }

  /**
   * Selects one or more tables to keep in the database, removing all others.
   *
   * @param tables - A single table or an array of tables to select, specified by name or as SimpleTable instances.
   * @returns A promise that resolves when the tables have been selected.
   * @category Table Management
   *
   * @example
   * ```ts
   * // Select a single table by name, removing all other tables
   * await sdb.selectTables("employees");
   * ```
   *
   * @example
   * ```ts
   * // Select multiple tables by name, removing all other tables
   * await sdb.selectTables(["customers", "products"]);
   * ```
   *
   * @example
   * ```ts
   * // Select a single table using a SimpleTable instance
   * const employeesTable = sdb.newTable("employees");
   * // ... load data ...
   * await sdb.selectTables(employeesTable);
   * ```
   */
  async selectTables(
    tables: SimpleTable | string | (SimpleTable | string)[],
  ): Promise<void> {
    const tablesToBeSelected = (Array.isArray(tables) ? tables : [tables]).map((
      t,
    ) => t instanceof SimpleTable ? t.name : t);

    for (const table of tablesToBeSelected) {
      if (!(await this.hasTable(table))) {
        throw new Error(`Table ${table} not found.`);
      }
    }

    const tablesToBeRemoved = this.tables.filter((t) =>
      !tablesToBeSelected.includes(t.name)
    );

    await queryDB(
      this,
      tablesToBeRemoved.map((d) =>
        `DROP TABLE "${d instanceof SimpleTable ? d.name : d}";`
      ).join("\n"),
      mergeOptions(this, {
        table: null,
        method: "removeTable()",
        parameters: {},
      }),
    );

    const tablesNamesToBeRemoved = tablesToBeRemoved.map((t) =>
      t instanceof SimpleTable ? t.name : t
    );
    this.tables = this.tables.filter((t) =>
      !tablesNamesToBeRemoved.includes(t.name)
    );
  }

  /**
   * Returns an array of all table names in the database, sorted alphabetically.
   *
   * @returns A promise that resolves to an array of table names.
   * @category Table Management
   *
   * @example
   * ```ts
   * // Get all table names
   * const tableNames = await sdb.getTableNames();
   * console.log(tableNames); // Output: ["employees", "customers"]
   * ```
   */
  async getTableNames(): Promise<string[]> {
    return await getTableNames(this);
  }

  /**
   * Logs the names of all tables in the database to the console, sorted alphabetically.
   *
   * @returns A promise that resolves when the table names have been logged.
   * @category Table Management
   *
   * @example
   * ```ts
   * // Log all table names to the console
   * await sdb.logTableNames();
   * // Example output: SimpleDB - Tables:  ["employees","customers"]
   * ```
   */
  async logTableNames(): Promise<void> {
    const tables = await this.getTableNames();
    if (tables.length > 0) {
      console.log(
        `\nSimpleDB - Tables:  ${JSON.stringify(tables)}`,
      );
    } else {
      console.log(`\nSimpleDB - No tables found.`);
    }
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
  async getTables(): Promise<SimpleTable[]> {
    return await this.tables;
  }

  /**
   * Checks if a table exists in the database.
   *
   * @param table - The name of the table or a SimpleTable instance.
   * @returns A promise that resolves to `true` if the table exists, `false` otherwise.
   * @category Table Management
   *
   * @example
   * ```ts
   * // Check if a table named "employees" exists
   * const exists = await sdb.hasTable("employees");
   * console.log(exists); // Output: true or false
   * ```
   *
   * @example
   * ```ts
   * // Check if a SimpleTable instance exists in the database
   * const myTable = sdb.newTable("my_data");
   * const existsInstance = await sdb.hasTable(myTable);
   * console.log(existsInstance); // Output: true or false
   * ```
   */
  async hasTable(table: SimpleTable | string): Promise<boolean> {
    const tableName = typeof table === "string" ? table : table.name;
    const result = (await this.getTableNames()).includes(tableName);
    return result;
  }

  /**
   * Returns a list of installed DuckDB extensions.
   *
   * @returns A promise that resolves to an array of objects, each representing an installed extension.
   * @category DuckDB
   *
   * @example
   * ```ts
   * // Get a list of all installed extensions
   * const extensions = await sdb.getExtensions();
   * console.log(extensions); // Output: [{ extension_name: "spatial", loaded: true, ... }]
   * ```
   */
  async getExtensions(): Promise<
    {
      [key: string]: string | number | boolean | Date | null;
    }[]
  > {
    return (await queryDB(
      this,
      `FROM duckdb_extensions();`,
      mergeOptions(this, {
        returnDataFrom: "query",
        table: null,
        method: "getExtensions()",
        parameters: {},
      }),
    )) as {
      [key: string]: string | number | boolean | Date | null;
    }[];
  }

  /**
   * Executes a custom SQL query directly against the DuckDB instance.
   *
   * If you want to force the returned data to match the types of the columns, you can use the `types` option.
   *
   * @param query - The SQL query string to execute.
   * @param options - Configuration options for the query.
   * @param options.returnDataFrom - Specifies whether to return data from the query. Can be `"query"` to return data or `"none"` (default) to not return data.
   * @param options.table - The name of the table associated with the query, primarily used for debugging and logging.
   * @param options.types - An optional object specifying data types for the query parameters.
   * @returns A promise that resolves to the query result as an array of objects if `returnDataFrom` is `"query"`, otherwise `null`.
   * @category DuckDB
   *
   * @example
   * ```ts
   * // Execute a query without returning data
   * await sdb.customQuery("CREATE TABLE young_employees AS SELECT * FROM employees WHERE age > 30");
   * ```
   *
   * @example
   * ```ts
   * // Execute a query and return the results
   * const youngEmployees = await sdb.customQuery(
   *   "SELECT * FROM employees WHERE age < 30",
   *   { returnDataFrom: "query" }
   * );
   * console.log(youngEmployees);
   * ```
   */
  async customQuery(
    query: string,
    options: {
      returnDataFrom?: "query" | "none";
      table?: string;
      types?: { [key: string]: string };
    } = {},
  ): Promise<
    | {
      [key: string]: string | number | boolean | Date | null;
    }[]
    | null
  > {
    return await queryDB(
      this,
      query,
      mergeOptions(this, {
        returnDataFrom: options.returnDataFrom,
        table: options.table ?? null,
        method: "customQuery()",
        parameters: { query, options },
        types: options.types,
      }),
    );
  }

  /**
   * Loads a database from a specified file into the current SimpleDB instance.
   * Supported file types are `.db` (DuckDB) and `.sqlite` (SQLite).
   *
   * @param file - The absolute path to the database file (e.g., "./my_database.db").
   * @param options - Configuration options for loading the database.
   * @param options.name - The name to assign to the loaded database within the DuckDB instance. Defaults to the file name without extension.
   * @param options.detach - If `true` (default), the database is detached after loading its contents into memory. If `false`, the database remains attached.
   * @returns A promise that resolves when the database has been loaded.
   * @category File Operations
   *
   * @example
   * ```ts
   * // Load a DuckDB database file
   * await sdb.loadDB("./my_database.db");
   * ```
   *
   * @example
   * ```ts
   * // Load a SQLite database file and keep it attached
   * await sdb.loadDB("./my_database.sqlite", { detach: false });
   * ```
   *
   * @example
   * ```ts
   * // Load a database with a custom name
   * await sdb.loadDB("./archive.db", { name: "archive_db" });
   * ```
   */
  async loadDB(file: string, options: {
    name?: string;
    detach?: boolean;
  } = {}): Promise<void> {
    const name = options.name ?? "my_database";
    const detach = options.detach ?? true;

    if (!existsSync(file)) {
      throw new Error(`The file ${file} does not exist.`);
    }
    const extension = getExtension(file);

    const allIndexesFile = `${file.replace(`.${extension}`, "")}_indexes.json`;
    const vssIndex = checkVssIndexes(allIndexesFile);
    if (vssIndex) {
      await this.customQuery(`INSTALL vss; LOAD vss;`);
    }

    if (extension === "db") {
      if (detach) {
        await queryDB(
          this,
          `ATTACH '${cleanPath(file)}' AS ${name};
COPY FROM DATABASE ${name} TO memory;
DETACH ${name};`,
          mergeOptions(this, {
            returnDataFrom: "none",
            table: null,
            method: "loadDB()",
            parameters: {},
          }),
        );
      } else {
        await queryDB(
          this,
          `ATTACH '${cleanPath(file)}' AS ${name};
          USE ${name};`,
          mergeOptions(this, {
            returnDataFrom: "none",
            table: null,
            method: "loadDB()",
            parameters: {},
          }),
        );
      }
    } else if (extension === "sqlite") {
      if (detach) {
        await queryDB(
          this,
          `INSTALL sqlite; LOAD sqlite;
        ATTACH '${cleanPath(file)}' AS ${name} (TYPE SQLITE);
COPY FROM DATABASE ${name} TO memory;
DETACH ${name};`,
          mergeOptions(this, {
            returnDataFrom: "none",
            table: null,
            method: "loadDB()",
            parameters: {},
          }),
        );
      } else {
        await queryDB(
          this,
          `INSTALL sqlite; LOAD sqlite;
        ATTACH '${cleanPath(file)}' AS ${name} (TYPE SQLITE);
        USE ${name};`,
          mergeOptions(this, {
            returnDataFrom: "none",
            table: null,
            method: "loadDB()",
            parameters: {},
          }),
        );
      }
    } else {
      throw new Error(
        `The extension ${extension} is not supported. Please use .db or .sqlite instead.`,
      );
    }

    await setDbProps(this, file, extension, allIndexesFile);
  }

  /**
   * Writes the current state of the database to a specified file.
   * Supported output file types are `.db` (DuckDB) and `.sqlite` (SQLite).
   *
   * @param file - The absolute path to the output file (e.g., "./my_exported_database.db").
   * @param options - Configuration options for writing the database.
   * @param options.noMetaData - If `true`, metadata files (projections, indexes) are not created alongside the database file. Defaults to `false`.
   * @returns A promise that resolves when the database has been written to the file.
   * @category File Operations
   *
   * @example
   * ```ts
   * // Write the current database to a DuckDB file
   * await sdb.writeDB("./my_exported_database.db");
   * ```
   *
   * @example
   * ```ts
   * // Write the current database to a SQLite file without metadata
   * await sdb.writeDB("./my_exported_database.sqlite", { noMetaData: true });
   * ```
   */
  async writeDB(
    file: string,
    options: { noMetaData?: boolean } = {},
  ): Promise<void> {
    const noMetaData = options.noMetaData ?? false;

    if (existsSync(file)) {
      rmSync(file);
    }
    createDirectory(file);
    const extension = getExtension(file);

    if (!noMetaData) {
      writeProjectionsAndIndexes(this, extension, file);
    }

    const name = getName(file);
    if (extension === "db") {
      await queryDB(
        this,
        `ATTACH '${cleanPath(file)}' AS ${name};
COPY FROM DATABASE ${getName(this.file)} TO ${name};
DETACH ${name};`,
        mergeOptions(this, {
          returnDataFrom: "none",
          table: null,
          method: "writeDB()",
          parameters: {},
        }),
      );
    } else if (extension === "sqlite") {
      await queryDB(
        this,
        `INSTALL sqlite; LOAD sqlite;
        ATTACH '${cleanPath(file)}' AS ${name} (TYPE SQLITE);
COPY FROM DATABASE ${getName(this.file)} TO ${name};
DETACH ${name};`,
        mergeOptions(this, {
          returnDataFrom: "none",
          table: null,
          method: "writeDB()",
          parameters: {},
        }),
      );
    } else {
      throw new Error(
        `The extension ${extension} is not supported. Please use .db or .sqlite instead.`,
      );
    }
  }

  /**
   * Frees up memory by closing the database connection and instance, and cleans up the cache.
   * If the database is file-based, it also compacts the database file to optimize storage.
   *
   * @returns A promise that resolves to the SimpleDB instance after cleanup.
   * @category Lifecycle
   *
   * @example
   * ```ts
   * // Close the database and clean up resources
   * await sdb.done();
   * ```
   */
  async done(): Promise<SimpleDB> {
    if (this.file !== ":memory:") {
      await this.customQuery("CHECKPOINT;");
      // To make sure the files will have the proper names.
      writeProjectionsAndIndexes(this, getExtension(this.file), this.file);
      await this.writeDB(this.file.replace(".db", "_compacted.db"), {
        noMetaData: true,
      });
      rmSync(this.file);
      renameSync(this.file.replace(".db", "_compacted.db"), this.file);
    }
    if (this.db instanceof DuckDBInstance) {
      this.connection.closeSync();
      this.db.closeSync();
    }
    cleanCache(this);

    if (typeof this.durationStart === "number") {
      let string = prettyDuration(this.durationStart, {
        prefix: "\n\nSimpleDB - Done in ",
      });

      if (this.cacheTimeSaved > 0) {
        string += ` / ${
          prettyDuration(0, {
            end: this.cacheTimeSaved,
          })
        } saved by using the cache`;
      }
      if (this.cacheTimeWriting > 0) {
        string += ` / ${
          prettyDuration(0, {
            end: this.cacheTimeWriting,
          })
        } spent writing the cache`;
      }

      console.log(`${string}\n`);
    }

    return await this;
  }
}
