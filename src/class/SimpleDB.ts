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
 * // In-memory database
 * const sdb = new SimpleDB();
 * const employees = sdb.newTable("employees");
 * await employees.loadData("./employees.csv");
 * await employees.logTable();
 * await sdb.done();
 *
 * @example
 * // Persistent database
 * const sdb = new SimpleDB({ file: "./my_database.db" });
 * //... operations
 * await sdb.done(); // Saves changes to the file
 *
 * @example
 * // With options
 * const sdb = new SimpleDB({ debug: true, nbRowsToLog: 20 });
 */

export default class SimpleDB extends Simple {
  /**
   * An array of paths to the data sources used in the cache.
   *
   * @defaultValue `[]`
   */
  cacheSourcesUsed: string[];
  /**
   * A timestamp marking the start of a duration measurement.
   *
   * @defaultValue `undefined`
   */
  durationStart: number | undefined;
  /**
   * A counter for incrementing default table names.
   *
   * @defaultValue `1`
   */
  tableIncrement: number;
  /**
   * A flag indicating whether to log the total execution duration.
   *
   * @defaultValue `false`
   */
  logDuration: boolean;
  /**
   * An array of SimpleTable instances associated with this database.
   *
   * @defaultValue `[]`
   */
  tables: SimpleTable[];
  /**
   * A flag indicating whether to log verbose cache-related messages.
   *
   * @defaultValue `false`
   */
  cacheVerbose: boolean;
  /**
   * The total time saved by using the cache, in milliseconds.
   *
   * @defaultValue `0`
   */
  cacheTimeSaved: number;
  /**
   * The total time spent writing to the cache, in milliseconds.
   *
   * @defaultValue `0`
   */
  cacheTimeWriting: number;
  /**
   * A flag indicating whether to display a progress bar for long-running operations.
   *
   * @defaultValue `false`
   */
  progressBar: boolean;
  /**
   * A flag indicating whether to use DuckDB's external file cache.
   *
   * @defaultValue `false`
   */
  duckDbCache: boolean | null;
  /**
   * The path to the database file. If not provided, an in-memory database is used.
   *
   * @defaultValue `:memory:`
   */
  file: string;
  /**
   * A flag indicating whether to overwrite the database file if it already exists.
   *
   * @defaultValue `false`
   */
  overwrite: boolean;

  constructor(
    /**
     * Configuration options for the SimpleDB instance.
     */
    options: {
      /**
       * The path to the database file. If not provided, an in-memory database is used.
       *
       * @defaultValue `:memory:`
       */
      file?: string;
      /**
       * A flag indicating whether to overwrite the database file if it already exists.
       *
       * @defaultValue `false`
       */
      overwrite?: boolean;
      /**
       * A flag indicating whether to log the total execution duration.
       *
       * @defaultValue `false`
       */
      logDuration?: boolean;
      /**
       * The number of rows to display when logging a table.
       *
       * @defaultValue `10`
       */
      nbRowsToLog?: number;
      /**
       * The maximum number of characters to display for text-based cells.
       *
       * @defaultValue `undefined`
       */
      nbCharactersToLog?: number;
      /**
       * A flag indicating whether to include data types when logging a table.
       *
       * @defaultValue `false`
       */
      types?: boolean;
      /**
       * A flag indicating whether to log verbose cache-related messages.
       *
       * @defaultValue `false`
       */
      cacheVerbose?: boolean;
      /**
       * A flag indicating whether to log debugging information.
       *
       * @defaultValue `false`
       */
      debug?: boolean;
      /**
       * A flag indicating whether to use DuckDB's external file cache.
       *
       * @defaultValue `false`
       */
      duckDbCache?: boolean | null;
      /**
       * A flag indicating whether to display a progress bar for long-running operations.
       *
       * @defaultValue `false`
       */
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
   * Initializes DuckDB and establishes a connection to the database. For internal use only.
   *
   * @category Internal
   */
  async start(): Promise<this> {
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

  /** Just for internal use. */
  pushTable(table: SimpleTable): void {
    if (!(table instanceof SimpleTable)) {
      throw new Error("The table must be an instance of SimpleTable.");
    }
    if (this.tables.map((t) => t.name).includes(table.name)) {
      throw new Error(`Table ${table.name} already exists.`);
    }

    this.tables.push(table);
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

    this.pushTable(table);

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
   * Multiple tables, as instances or strings
   * ```ts
   * await table.removeTables([tableA, "tableB"])
   * ```
   *
   * @param tables - The tables to be removed
   *
   * @category DB methods
   */
  async removeTables(tables: SimpleTable | string | (SimpleTable | string)[]) {
    const tablesToBeRemoved = Array.isArray(tables) ? tables : [tables];

    await queryDB(
      this,
      tablesToBeRemoved.map((d) =>
        `DROP TABLE ${d instanceof SimpleTable ? d.name : d};`
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
   * Selects a table or multiple tables in the database. Invoking methods on the tables that have not been selected will throw an error.
   *
   * @example
   * Basic usage
   * ```ts
   * await table.selectTables(tableA)
   * ```
   *
   * @example
   * Multiple tables, as instances or strings
   * ```ts
   * await table.selectTables([tableA, "tableB"])
   * ```
   *
   * @param tables - The tables to be selected
   *
   * @category DB methods
   */
  async selectTables(tables: SimpleTable | string | (SimpleTable | string)[]) {
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
        `DROP TABLE ${d instanceof SimpleTable ? d.name : d};`
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
   * Logs the names of all tables in the database.
   *
   * @example
   * Basic usage
   * ```ts
   * await sdb.logTablesNames()
   * ```
   *
   * @category DB methods
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
   * Loads a database. The method will automatically look for files with projections and indexes in the same folder as the database file, if any.
   *
   * By default, the database will be copied into memory and detached. The original file will not be modified. To keep the database attached, set the `detach` option to `false`.
   *
   * If you want to load multiple databases, you can use the `name` option to give them different names. If you don't provide a name, it will default to `my_database`. Note that the last database loaded will be considered the default database.
   *
   * @example
   * Basic usage
   * ```ts
   * await sdb.loadDB("my_database.db")
   * const myTable = await sdb.getTable("myTable")
   * ```
   *
   * @example
   * Loading a SQLite database
   * ```ts
   * await sdb.loadDB("my_database.sqlite")
   * const myTable = await sdb.getTable("myTable")
   * ```
   *
   * @example
   * Loading a database with a specific name and keeping it attached
   * ```ts
   * await sdb.loadDB("my_database.db", { name: "my_custom_name", detach: false })
   * ```
   *
   * @param file - The path to the file storing the database.
   * @param options - An optional object with configuration options:
   *   @param options.name - The name of the database to be loaded. Defaults to "my_database".
   *   @param options.detach - Whether to detach the database after loading it. Defaults to true.
   *
   * @category DB methods
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
   * Writes the database to a file. The file will be created if it doesn't exist, and overwritten if it does. If one or more tables have geometries, a .json file will be created with the projections. If one or more indexes are present, a .json file will be created with the indexes.
   *
   * @example
   * Basic usage
   * ```ts
   * await sdb.writeDB("my_database.db")
   * ```
   *
   * @example
   * Writing a SQLite database
   * ```ts
   * await sdb.writeDB("my_database.sqlite")
   * ```
   *
   * @param file - The path to the file where the database will be written.
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
   * Frees up memory by closing down the database and cleans up cache so it doesn't grow in size indefinitely. Also compacts the database if it is not in memory.
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
