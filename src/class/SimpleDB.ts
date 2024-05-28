import duckdb, { Database } from "duckdb"
import runQueryNode from "../helpers/runQueryNode.js"
import SimpleWebDB from "./SimpleWebDB.js"
import SimpleTable from "./SimpleTable.js"

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
        options.debug && console.log("\nnew SimpleDB()")
        super(options)
        this.bigIntToInt = options.bigIntToInt ?? true
        this.runQuery = runQueryNode
    }

    /**
     * Initializes DuckDB and establishes a connection to the database. For internal use only.
     *
     * @category Internal
     */
    async start() {
        if (this.db === undefined || this.connection === undefined) {
            this.debug && console.log("\nstart()")
            this.db = new duckdb.Database(":memory:")
            this.connection = this.db.connect()
        }
    }

    /** Creates a table.
     *
     * @example Basic usage
     * ```ts
     * // This returns a new SimpleTable
     * const employees = sdb.newTable("employees")
     * ```
     *
     * @param name - The name of the new table
     *
     * @category DB methods
     */
    newTable(name: string): SimpleTable {
        this.debug && console.log("\nnewTable()")

        return new SimpleTable(name, this, {
            debug: this.debug,
            nbRowsToLog: this.nbRowsToLog,
        })
    }

    /**
     * Frees up memory by closing down the database.
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
        ;(this.db as Database).close()
    }
}
