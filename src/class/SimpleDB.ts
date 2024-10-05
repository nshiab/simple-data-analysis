import pkg from "duckdb"
const { Database } = pkg
import runQueryNode from "../helpers/runQueryNode.js"
import SimpleWebDB from "./SimpleWebDB.js"
import SimpleTable from "./SimpleTable.js"
import cleanCache from "../helpers/cleanCache.js"
import { prettyDuration } from "journalism"

/**
 * SimpleDB is a class that provides a simplified interface for working with DuckDB, a high-performance, in-memory analytical database. This class is meant to be used with NodeJS and similar runtimes. For web browsers, use SimpleWebDB.
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
 * const sdb = new SimpleWebDB({ debug: true, nbRowsToLog: 20 })
 * ```
 *
 * @param options - Configuration options for the SimpleDB instance.
 * @param options.logDuration - Whether to log the duration of operations.
 * @param options.nbRowsToLog - Number of rows to log when displaying table data.
 * @param options.nbCharactersToLog - Number of characters to log when displaying text content. Useful for long strings.
 * @param options.cacheVerbose - Whether to log cache-related messages.
 * @param options.debug - Whether to enable debug logging.
 * @param options.bigIntToInt - Whether to convert BigInt values to integers. Defaults to true.
 */

export default class SimpleDB extends SimpleWebDB {
    /** A flag to log messages relative to the cache. Defaults to false. */
    cacheVerbose: boolean
    /** Amount of time saved by using the cache. */
    cacheTimeSaved: number

    constructor(
        options: {
            logDuration?: boolean
            nbRowsToLog?: number
            nbCharactersToLog?: number
            cacheVerbose?: boolean
            debug?: boolean
            bigIntToInt?: boolean
        } = {}
    ) {
        super(options)
        this.bigIntToInt = options.bigIntToInt ?? true
        this.cacheVerbose = options.cacheVerbose ?? false
        this.cacheTimeSaved = 0
        this.runQuery = runQueryNode
        if (this.cacheVerbose) {
            this.durationStart = Date.now()
        }
    }

    /**
     * Initializes DuckDB and establishes a connection to the database. For internal use only.
     *
     * @category Internal
     */
    override async start(): Promise<this> {
        if (this.db === undefined || this.connection === undefined) {
            this.debug && console.log("\nstart()")
            this.db = new Database(":memory:")
            this.connection = this.db.connect()
        }
        return this
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
    override newTable(
        name?: string,
        projections?: { [key: string]: string }
    ): SimpleTable {
        this.debug && console.log("\nnewTable()")

        const proj = projections ?? {}

        let table
        if (typeof name === "string") {
            table = new SimpleTable(name, proj, this, {
                debug: this.debug,
                nbRowsToLog: this.nbRowsToLog,
                nbCharactersToLog: this.nbCharactersToLog,
            })
            table.defaultTableName = false
        } else {
            table = new SimpleTable(`table${this.tableIncrement}`, proj, this, {
                debug: this.debug,
                nbRowsToLog: this.nbRowsToLog,
                bigIntToInt: this.bigIntToInt,
                nbCharactersToLog: this.nbCharactersToLog,
            })
            table.defaultTableName = true
            this.tableIncrement += 1
        }

        this.debug &&
            console.log(
                `${table.name} has been created ${table.defaultTableName ? "(name automatically attributed)" : ""}`
            )

        return table
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
    override async done() {
        this.debug && console.log("\ndone()")
        if (this.db instanceof Database) {
            this.db.close()
        }
        cleanCache(this)
        if (typeof this.durationStart === "number") {
            if (this.cacheTimeSaved > 0) {
                prettyDuration(this.durationStart, {
                    log: true,
                    prefix: "\nSimpleDB - Done in ",
                    suffix: ` / You saved ${prettyDuration(0, { end: this.cacheTimeSaved })} by using the cache\n`,
                })
            } else {
                prettyDuration(this.durationStart, {
                    log: true,
                    prefix: "\nSimpleDB - Done in ",
                    suffix: "\n",
                })
            }
        }
    }
}
