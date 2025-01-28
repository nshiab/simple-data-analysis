import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import runQueryWeb from "../helpers/runQueryWeb.ts";
import getTableNames from "../methods/getTableNames.ts";
import SimpleWebTable from "./SimpleWebTable.ts";
import Simple from "./Simple.ts";
import { prettyDuration } from "jsr:@nshiab/journalism@1/web";

/**
 * SimpleWebDB is a class that provides a simplified interface for working with DuckDB, a high-performance in-memory analytical database. This class is meant to be used in a web browser.
 *
 * Here's how to instantiate a SimpleWebDB instance and then a SimpleWebTable.
 *
 * @example
 * Basic usage
 * ```ts
 * // Instantiating the database.
 * const sdb = new SimpleWebDB()
 *
 * // Creating a new table.
 * const employees = sdb.newTable("employees")
 *
 * // You can now invoke methods on the table.
 * await employees.loadData("./employees.csv")
 * await employees.logTable()
 *
 * // Removing the table.
 * await employees.removeTable()
 *
 * // Removing the DB to free up memory.
 * await sdb.done()
 * ```
 *
 * @example
 * Instanciating with options
 * ```ts
 * // Creating a database with options. Debug information will be logged each time a method is invoked. The first 20 rows of tables will be logged (default is 10).
 * const sdb = new SimpleWebDB({ debug: true, nbRowsToLog: 20 })
 * ```
 *
 * @param options - Configuration options for the SimpleWebDB instance.
 * @param options.logDuration - If true, logs the duration of operations.
 * @param options.debug - If true, enables debug logging.
 * @param options.nbRowsToLog - Number of rows to log when displaying table data.
 * @param options.nbCharactersToLog - Maximum number of characters to log for strings. Useful to avoid logging large text content.
 */
export default class SimpleWebDB extends Simple {
  /** An object keeping track of the data used in cache. @category Properties */
  cacheSourcesUsed: string[];
  /** A timestamp used to track the total duration logged in done(). @category Properties */
  durationStart: number | undefined;
  /** A number used when creating new tables. @category Properties */
  tableIncrement: number;
  /** An array of SimpleWebTable instances. @category Properties */
  tables: SimpleWebTable[];

  constructor(
    options: {
      logDuration?: boolean;
      debug?: boolean;
      nbRowsToLog?: number;
      nbCharactersToLog?: number;
      logTypes?: boolean;
    } = {},
  ) {
    super(runQueryWeb, options);
    if (options.logDuration || options.debug) {
      this.durationStart = Date.now();
    }

    this.tableIncrement = 1;
    this.tables = [];
    this.cacheSourcesUsed = [];
  }

  /**
   * Initializes DuckDB and establishes a connection to the database. For internal use only.
   *
   * @category Internal
   */
  async start(): Promise<this> {
    if (this.db === undefined || this.connection === undefined) {
      this.debug && console.log("\nstart()\n");
      // We await import to make duckdb-wasm optional
      const { default: getDuckDB } = await import(
        "../helpers/getDuckDB.ts"
      );
      const duckDB = await getDuckDB();
      this.db = duckDB.db;
      this.connection = await this.db.connect();
      this.worker = duckDB.worker;
    }
    return this;
  }

  /** Creates a table in the DB.
   *
   * @example
   * Basic usage
   * ```ts
   * // This returns a new SimpleWebTable
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
  ): SimpleWebTable {
    this.debug && console.log("\nnewWebTable()");

    const proj = projections ?? {};

    // SHOW MATCH CLONE TABLE
    let table;
    if (typeof name === "string") {
      table = new SimpleWebTable(name, proj, this, {
        debug: this.debug,
        nbRowsToLog: this.nbRowsToLog,
        nbCharactersToLog: this.nbCharactersToLog,
        logTypes: this.logTypes,
      });
      table.defaultTableName = false;
    } else {
      table = new SimpleWebTable(
        `table${this.tableIncrement}`,
        proj,
        this,
        {
          debug: this.debug,
          nbRowsToLog: this.nbRowsToLog,
          nbCharactersToLog: this.nbCharactersToLog,
          logTypes: this.logTypes,
        },
      );
      table.defaultTableName = true;
      this.tableIncrement += 1;
    }

    this.debug &&
      console.log(
        `${table.name} has been created ${
          table.defaultTableName ? "(name automatically attributed)" : ""
        }`,
      );

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
  async getTable(name: string): Promise<SimpleWebTable> {
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
  async removeTables(tables: SimpleWebTable | SimpleWebTable[]) {
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
  async getTables(): Promise<SimpleWebTable[]> {
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
  async hasTable(table: SimpleWebTable | string): Promise<boolean> {
    this.debug && console.log("\nhasTable()");
    const tableName = typeof table === "string" ? table : table.name;
    this.debug && console.log("parameters:", { table: tableName });
    const result = (await this.getTableNames()).includes(tableName);
    this.debug && console.log("hasTable:", result);
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
   * Frees up memory. Closes the connection to the database and terminates associated resources.
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
    this.debug && console.log("\ndone()");
    if (this.connection) {
      await this.connection.close();
    }
    if (this.db) {
      // @ts-expect-error We should check for instance of AsyncDuckDB but I don't want to import it to make duckdb-wasm optional
      await this.db.terminate();
    }
    if (this.worker instanceof Worker) {
      this.worker.terminate();
    }
    if (typeof this.durationStart === "number") {
      prettyDuration(this.durationStart, {
        log: true,
        prefix: "\nSimpleWebDB - Done in ",
        suffix: "\n",
      });
    }

    return this;
  }
}
