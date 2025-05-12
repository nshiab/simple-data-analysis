import { DuckDBInstance } from "@duckdb/node-api";
import runQuery from "../helpers/runQuery.ts";
import SimpleTable from "./SimpleTable.ts";
import cleanCache from "../helpers/cleanCache.ts";
import { prettyDuration } from "@nshiab/journalism";
import Simple from "./Simple.ts";
import queryDB from "../helpers/queryDB.ts";
import mergeOptions from "../helpers/mergeOptions.ts";
import getTableNames from "../methods/getTableNames.ts";

/**
 * SimpleDB is a class that provides a simplified interface for working with DuckDB, a high-performance, in-memory analytical database.
 *
 * With very expensive computations, it might create a .tmp folder, so make sure to add .tmp to your gitignore.
 *
 * Here's how to instantiate a SimpleDB instance and then a SimpleTable.
 *
 * @example
 * Basic usage
 * ```ts
 * // Instantiating the database.
 * const sdb = new SimpleDB()
 *
 * // Creating a new table.
 * const employees = sdb.newTable("employees")
 *
 * // You can now invoke methods on the table.
 * await employees.loadData("./employees.csv")
 * await employees.logTable()
 *
 * // To free up memory.
 * await sdb.done()
 * ```
 *
 * @example
 * Instanciating with options
 * ```ts
 * // Creating a database with options. Debug information will be logged each time a method is invoked. The first 20 rows of tables will be logged (default is 10).
 * const sdb = new SimpleDB({ debug: true, nbRowsToLog: 20 })
 * ```
 *
 * @param options - Configuration options for the SimpleDB instance.
 * @param options.logDuration - Whether to log the duration of operations.
 * @param options.nbRowsToLog - Number of rows to log when displaying table data.
 * @param options.nbCharactersToLog - Number of characters to log when displaying text content. Useful for long strings.
 * @param options.cacheVerbose - Whether to log cache-related messages.
 * @param options.debug - Whether to enable debug logging.
 * @param options.progressBar - Whether to show a progress bar for long-running operations.
 * @param options.types - Whether to log the types of columns in the table.
 */

export default class SimpleDB extends Simple {
  /** An object keeping track of the data used in cache. @category Properties */
  cacheSourcesUsed: string[];
  /** A timestamp used to track the total duration logged in done(). @category Properties */
  durationStart: number | undefined;
  /** A number used when creating new tables. @category Properties */
  tableIncrement: number;
  /** A flag to log the total duration. */
  logDuration: boolean;
  /** An array of SimpleTable instances. @category Properties */
  tables: SimpleTable[];
  /** A flag to log messages relative to the cache. Defaults to false. */
  cacheVerbose: boolean;
  /** Amount of time saved by using the cache. */
  cacheTimeSaved: number;
  /** Amount of time spent writing the cache. */
  cacheTimeWriting: number;
  /** A flag to log a progress bar when a method takes more than 2s. Defaults to false. */
  progressBar: boolean;

  constructor(
    options: {
      logDuration?: boolean;
      nbRowsToLog?: number;
      nbCharactersToLog?: number;
      types?: boolean;
      cacheVerbose?: boolean;
      debug?: boolean;
      progressBar?: boolean;
    } = {},
  ) {
    super(options);
    this.logDuration = options.logDuration ?? false;
    this.tableIncrement = 1;
    this.tables = [];
    this.cacheSourcesUsed = [];
    this.tables = [];
    this.cacheVerbose = options.cacheVerbose ?? false;
    this.cacheTimeSaved = 0;
    this.cacheTimeWriting = 0;
    this.progressBar = options.progressBar ?? false;
    this.runQuery = runQuery;
    if (this.cacheVerbose || this.logDuration) {
      this.durationStart = Date.now();
    }
  }

  /**
   * Initializes DuckDB and establishes a connection to the database. For internal use only.
   *
   * @category Internal
   */
  async start(): Promise<this> {
    if (this.db === undefined || this.connection === undefined) {
      this.db = await DuckDBInstance.create(":memory:");
      this.connection = await this.db.connect();
      if (this.progressBar) {
        await this.customQuery(
          `SET enable_progress_bar = TRUE;`,
        );
      }
    }
    return await this;
  }

  /** Creates a table in the DB.
   *
   * @example
   * Basic usage
   * ```ts
   * // This returns a new SimpleTable
   * const employees = sdb.newTable()
   * ```
   *
   * @example
   * With a specific name
   * ```ts
   * // By default, tables will be named table1, table2, etc.
   * // But you can also give them specific names.
   * const employees = sdb.newTable("employees")
   * ```
   *
   * @param name - The name of the new table.
   * @param projections - The projections of the geospatial data, if any.
   *
   * @category DB methods
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

    this.tables.push(table);

    return table;
  }

  /**
   * Retrieves a table in the DB.
   *
   * @example
   * Basic usage
   * ```ts
   * const employees = await sdb.getTable("employees")
   * ```
   *
   * @param name - The name of the table to retrieve.
   *
   * @category DB methods
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
   * Remove a table or multiple tables from the database. Invoking methods on the tables will throw and error.
   *
   * @example
   * Basic usage
   * ```ts
   * await table.removeTables(tableA)
   * ```
   *
   * @example
   * Multiple tables
   * ```ts
   * await table.removeTables([tableA, tableB])
   * ```
   *
   * @param tables - The tables to be removed
   *
   * @category DB methods
   */
  async removeTables(tables: SimpleTable | SimpleTable[]) {
    const tablesToBeRemoved = Array.isArray(tables) ? tables : [tables];

    await queryDB(
      this,
      tablesToBeRemoved.map((d) => `DROP TABLE ${d.name};`).join("\n"),
      mergeOptions(this, {
        table: null,
        method: "removeTable()",
        parameters: {},
      }),
    );

    const tablesNamesToBeRemoved = tablesToBeRemoved.map((t) => t.name);
    this.tables = this.tables.filter((t) =>
      !tablesNamesToBeRemoved.includes(t.name)
    );
  }

  /**
   * Returns the list of table names.
   *
   * @example
   * Basic usage
   * ```ts
   * const tablesNames = await sdb.getTableNames()
   * ```
   *
   * @category DB methods
   */
  async getTableNames(): Promise<string[]> {
    return await getTableNames(this);
  }

  /**
   * Returns all tables in the db.
   *
   * @example
   * Basic usage
   * ```ts
   * const tablesNames = await sdb.getTableNames()
   * ```
   *
   * @category DB methods
   */
  async getTables(): Promise<SimpleTable[]> {
    return await this.tables;
  }

  /**
   * Returns true if a specified table exists and false if not.
   *
   * @example
   * Basic usage
   * ```ts
   * // You can also pass a table instance.
   * const hasEmployees = await sdb.hasTable("employees")
   * ```
   *
   * @param table - The name of the table to check for existence.
   *
   * @category DB methods
   */
  async hasTable(table: SimpleTable | string): Promise<boolean> {
    const tableName = typeof table === "string" ? table : table.name;
    const result = (await this.getTableNames()).includes(tableName);
    return result;
  }

  /**
   * Returns the DuckDB extensions.
   *
   * @example
   * Basic usage
   * ```ts
   * const extensions = await sdb.getExtensions()
   * ```
   *
   * @category DB methods
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
   * Executes a custom SQL query, providing flexibility for advanced users.
   *
   * @example
   * Basic usage
   * ```ts
   * // You can use the returnDataFrom option to retrieve the data from the query, if needed.
   * const data = await sdb.customQuery("SELECT * FROM employees WHERE Job = 'Clerk'", { returnDataFrom: "query" })
   * ```
   *
   * @param query - The custom SQL query to be executed.
   * @param options - An optional object with configuration options:
   *   @param options.returnDataFrom - Specifies whether to return data from the "query" or not. Defaults to "none".
   *   @param options.table - The name of the table associated with the query (if applicable). Needed when debug is true.
   *
   * @category DB methods
   */
  async customQuery(
    query: string,
    options: {
      returnDataFrom?: "query" | "none";
      table?: string;
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
      }),
    );
  }

  /**
   * Frees up memory by closing down the database and cleans up cache so it doesn't grow in size indefinitely.
   *
   * @example
   * Basic usage
   * ```typescript
   * await sdb.done();
   * ```
   *
   * @category DB methods
   */
  async done(): Promise<this> {
    if (this.db instanceof DuckDBInstance) {
      this.connection.closeSync();
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
