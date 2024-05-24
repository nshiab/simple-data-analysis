import duckdb, { Database } from "duckdb"
import runQueryNode from "../helpers/runQueryNode.js"
import SimpleWebDB from "./SimpleWebDB.js"
import SimpleTable from "./SimpleTable.js"
import queryDB from "../helpers/queryDB.js"
import mergeOptions from "../helpers/mergeOptions.js"
import parseType from "../helpers/parseTypes.js"

/**
 * SimpleDB is a class that provides a simplified interface for working with DuckDB, a high-performance, in-memory analytical database. This class is meant to be used with NodeJS and similar runtimes. For web browsers, use SimpleWebDB.
 *
 * With very expensive computations, it might create a .tmp folder, so make sure to add .tmp to your gitignore.
 *
 * Here's how to instantiate a SimpleDB instance and then a SimpleTable.
 *
 * @example Basic usage
 * ```ts
 * // Instantiating the database.
 * const sdb = new SimpleDB()
 *
 * // Creating a new table.
 * const employees = await sdb.newTable("employees")
 *
 * // You can now invoke methods on the table.
 * await employees.loadData("./employees.csv")
 * await employees.logTable()
 *
 * // To free up memory.
 * await sdb.done()
 * ```
 *
 * @example Instanciating with options
 * ```ts
 * // Creating a database with options. Debug information will be logged each time a method is invoked. The first 20 rows of tables will be logged (default is 10).
 * const sdb = new SimpleWebDB({ debug: true, nbRowsToLog: 20 })
 * ```
 *
 */

export default class SimpleDB extends SimpleWebDB {
    constructor(
        options: {
            nbRowsToLog?: number
            debug?: boolean
            bigIntToInt?: boolean
        } = {}
    ) {
        super(options)
        this.bigIntToInt = options.bigIntToInt ?? true
        this.runQuery = runQueryNode
    }

    /**
     * Initializes DuckDB and establishes a connection to the database. For internal use only.
     */
    async start() {
        if (this.db === undefined || this.connection === undefined) {
            this.debug && console.log("\nstart()")
            this.db = new duckdb.Database(":memory:")
            this.connection = this.db.connect()
        }
    }

    /** Creates a table. Table names must be unique.
     *
     * @example Basic usage
     * ```ts
     * // This returns a new SimpleTable
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
    ): Promise<SimpleTable> {
        this.debug && console.log("\nnewTable()")

        await this.start()
        if (await this.hasTable(name)) {
            throw new Error(`Table ${name} already exists.`)
        }

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

        return new SimpleTable(name, this, {
            debug: this.debug,
            nbRowsToLog: this.nbRowsToLog,
        })
    }

    /**
     * Frees up memory by closing down the database.
     * @example Basic usage
     * ```typescript
     * await sdb.done();
     * ```
     */
    async done() {
        this.debug && console.log("\ndone()")
        ;(this.db as Database).close()
    }
}
