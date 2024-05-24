import { AsyncDuckDB, AsyncDuckDBConnection } from "@duckdb/duckdb-wasm"
import { Database, Connection } from "duckdb"
import getDuckDB from "../helpers/getDuckDB.js"
import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import runQueryWeb from "../helpers/runQueryWeb.js"
import parseType from "../helpers/parseTypes.js"
import getTables from "../methods/getTables.js"
import SimpleWebTable from "./SimpleWebTable.js"

/**
 * SimpleWebDB is a class that provides a simplified interface for working with DuckDB, a high-performance in-memory analytical database. This class is meant to be used in a web browser. For NodeJS and similar runtimes, use SimpleDB.
 *
 * Here's how to instantiate a SimpleWebDB instance and then a SimpleWebTable.
 *
 * @example Basic usage
 * ```ts
 * // Instantiating the database.
 * const sdb = new SimpleWebDB()
 *
 * // Creating a new table.
 * const employees = await sdb.newTable("employees")
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
 * @example Instanciating with options
 * ```ts
 * // Creating a database with options. Debug information will be logged each time a method is invoked. The first 20 rows of tables will be logged (default is 10).
 * const sdb = new SimpleWebDB({ debug: true, nbRowsToLog: 20 })
 * ```
 */
export default class SimpleWebDB {
    /** A flag indicating whether debugging information should be logged. Defaults to false. @category Properties */
    debug: boolean
    /** The number of rows to log when debugging. Defaults to 10. @category Properties */
    nbRowsToLog: number
    /** A DuckDB database. @category Properties */
    db!: AsyncDuckDB | Database
    /** A connection to a DuckDB database. @category Properties */
    connection!: AsyncDuckDBConnection | Connection
    /** A worker to make DuckDB WASM work. @category Properties */
    worker!: Worker | null
    /** A flag for SimpleDB. Default is true. When data is retrieved from the database as an array of objects, BIGINT values are automatically converted to integers, which are easier to work with in JavaScript. If you want actual bigint values, set this option to false. @category Properties */
    bigIntToInt: boolean | undefined

    /**
     * For internal use only. If you want to run a SQL query, use the customQuery method. @category Properties
     */
    runQuery!: (
        query: string,
        connection: AsyncDuckDBConnection | Connection,
        returnDataFromQuery: boolean,
        options: {
            debug: boolean
            method: string | null
            parameters: { [key: string]: unknown } | null
            bigIntToInt?: boolean
        }
    ) => Promise<
        | {
              [key: string]: number | string | Date | boolean | null
          }[]
        | null
    >

    constructor(
        options: {
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        options.debug && console.log("\nnew SimpleWebDB()")
        this.nbRowsToLog = options.nbRowsToLog ?? 10
        this.debug = options.debug ?? false
        this.worker = null
        this.runQuery = runQueryWeb
    }

    /**
     * Initializes DuckDB and establishes a connection to the database. For internal use only.
     *
     * @category Internal
     */
    async start() {
        if (this.db === undefined || this.connection === undefined) {
            this.debug && console.log("\nstart()\n")
            const duckDB = await getDuckDB()
            this.db = duckDB.db
            this.connection = await this.db.connect()
            this.worker = duckDB.worker
        }
    }

    /** Creates a table. Table names must be unique.
     *
     * @example Basic usage
     * ```ts
     * // This returns a new SimpleWebTable
     * const employees = await sdb.newTable("employees")
     * ```
     *
     * @example With columns and types
     * ```ts
     * // You can create a table with specific types.
     * const employees = await sdb.newTable("employees", {
     *   types: {
     *     name: "string",
     *     salary: "integer",
     *     raise: "float",
     *   }
     * })
     * ```
     * @param name - The name of the new table
     * @param options - An optional object with configuration options:
     *   @param options.types - An object specifying the columns and  their data types (JavaScript or SQL).
     *
     * @category DB methods
     */
    async newTable(
        name: string,
        options: {
            types?: {
                [key: string]:
                    | "integer"
                    | "float"
                    | "number"
                    | "string"
                    | "date"
                    | "time"
                    | "datetime"
                    | "datetimeTz"
                    | "bigint"
                    | "double"
                    | "varchar"
                    | "timestamp"
                    | "timestamp with time zone"
                    | "boolean"
                    | "geometry"
            }
        } = {}
    ) {
        this.debug && console.log("\nnewTable()")

        await this.start()
        if (await this.hasTable(name)) {
            throw new Error(`Table ${name} already exists.`)
        }
        const table = new SimpleWebTable(name, this, {
            debug: this.debug,
            nbRowsToLog: this.nbRowsToLog,
        })

        const types = options.types
        if (types !== undefined) {
            await queryDB(
                this,
                `CREATE OR REPLACE TABLE ${name} (${Object.keys(types)
                    .map((d) => `"${d}" ${parseType(types[d])}`)
                    .join(", ")});`,
                mergeOptions(this, {
                    table: name,
                    method: "newTable() with options",
                    parameters: { options },
                })
            )
        }

        return table
    }

    /**
     * Remove a table from the database. Invoking methods on this table will throw and error.
     *
     * @example Basic usage
     * ```ts
     * await table.removeTable("tableA")
     * ```
     *
     * @category DB methods
     */
    async removeTable(table: string) {
        await queryDB(
            this,
            `DROP TABLE ${table};`,
            mergeOptions(this, {
                table: null,
                method: "removeTable()",
                parameters: {},
            })
        )
    }

    /**
     * Returns the list of tables.
     *
     * @example Basic usage
     * ```ts
     * const tables = await sdb.getTables()
     * ```
     *
     * @category DB methods
     */
    async getTables(): Promise<string[]> {
        return getTables(this)
    }

    /**
     * Returns true if a specified table exists and false if not.
     *
     * @example Basic usage
     * ```ts
     * const hasEmployees = await sdb.hasTable("employees")
     * ```
     *
     * @param table - The name of the table to check for existence.
     *
     * @category DB methods
     */
    async hasTable(table: string): Promise<boolean> {
        this.debug && console.log("\nhasTable()")
        this.debug && console.log("parameters:", { table })
        const result = (await this.getTables()).includes(table)
        this.debug && console.log("hasTable:", result)
        return result
    }

    /**
     * Returns the DuckDB extensions.
     *
     * ```ts
     * const extensions = await sdb.getExtensions()
     * ```
     *
     * @category DB methods
     */
    async getExtensions(): Promise<
        {
            [key: string]: string | number | boolean | Date | null
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
            })
        )) as {
            [key: string]: string | number | boolean | Date | null
        }[]
    }

    /**
     * Executes a custom SQL query, providing flexibility for advanced users.
     *
     * @example Basic usage
     * ```ts
     * // You can use the returnDataFrom option to retrieve the data from the query, if needed.
     * await sdb.customQuery("SELECT * FROM employees WHERE Job = 'Clerk'", { returnDataFrom: "query" })
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
            returnDataFrom?: "query" | "none"
            table?: string
        } = {}
    ): Promise<
        | {
              [key: string]: string | number | boolean | Date | null
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
            })
        )
    }

    /**
     * Frees up memory. Closes the connection to the database and terminates associated resources.
     *
     * @example Basic usage
     * ```typescript
     * await sdb.done();
     * ```
     *
     * @category DB methods
     */
    async done() {
        this.debug && console.log("\ndone()")
        await (this.connection as AsyncDuckDBConnection)?.close()
        await (this.db as AsyncDuckDB)?.terminate()
        this.worker?.terminate()
    }
}
