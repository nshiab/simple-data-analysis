import { AsyncDuckDB, AsyncDuckDBConnection } from "@duckdb/duckdb-wasm"
import getDuckDB from "../helpers/getDuckDB.js"
import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import runQueryWeb from "../helpers/runQueryWeb.js"
import getTables from "../methods/getTables.js"
import SimpleWebTable from "./SimpleWebTable.js"
import Simple from "./Simple.js"

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
 * @example Instanciating with options
 * ```ts
 * // Creating a database with options. Debug information will be logged each time a method is invoked. The first 20 rows of tables will be logged (default is 10).
 * const sdb = new SimpleWebDB({ debug: true, nbRowsToLog: 20 })
 * ```
 */
export default class SimpleWebDB extends Simple {
    constructor(
        options: {
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        super(runQueryWeb, options)
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
        return this
    }

    /** Creates a table in the DB.
     *
     * @example Basic usage
     * ```ts
     * // This returns a new SimpleWebTable
     * const employees = sdb.newTable()
     * ```
     *
     * @example With a specific name
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
    newTable(name?: string, projections?: { [key: string]: string }) {
        this.debug && console.log("\nnewWebTable()")

        const proj = projections ?? {}

        let table
        if (typeof name === "string") {
            table = new SimpleWebTable(name, proj, this, {
                debug: this.debug,
                nbRowsToLog: this.nbRowsToLog,
            })
            table.defaultTableName = false
        } else {
            table = new SimpleWebTable(
                `table${this.tableIncrement}`,
                proj,
                this,
                {
                    debug: this.debug,
                    nbRowsToLog: this.nbRowsToLog,
                }
            )
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
     * Remove a table or multiple tables from the database. Invoking methods on the tables will throw and error.
     *
     * @example Basic usage
     * ```ts
     * await table.removeTables(tableA)
     * ```
     *
     * @example Multiple tables
     * ```ts
     * await table.removeTables([tableA, tableB])
     * ```
     *
     * @param tables - The tables to be removed
     *
     * @category DB methods
     */
    async removeTables(tables: SimpleWebTable | SimpleWebTable[]) {
        const tablesToBeRemoved = Array.isArray(tables) ? tables : [tables]

        await queryDB(
            this,
            tablesToBeRemoved.map((d) => `DROP TABLE ${d.name};`).join("\n"),
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
        if (this.connection instanceof AsyncDuckDBConnection) {
            await this.connection.close()
        }
        if (this.db instanceof AsyncDuckDB) {
            await this.db.terminate()
        }
        if (this.worker instanceof Worker) {
            this.worker.terminate()
        }
    }
}
