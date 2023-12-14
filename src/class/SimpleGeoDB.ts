import getDuckDB from "../helpers/getDuckDB.js"
import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleDB from "./SimpleDB.js"

/**
 * !!! UNDER HEAVY DEVELOPMENT !!!
 *
 * SimpleGeoDB extends the SimpleDB class by adding methods for geospatial analysis. This class provides a simplified interface for working with DuckDB, a high-performance in-memory analytical database. This class is meant to be used in a web browser. For NodeJS and similar runtimes, use SimpleNodeDB with the loadSpatial option set to true.
 *
 * Here's how to instantiate a SimpleGeoDB instance.
 *
 * ```ts
 * const sdb = new SimpleGeoDB()
 * ```
 *
 * The start() method will be called internally automatically with the first method you'll run. It initializes DuckDB and establishes a connection to the database. It sets the default_collation to NOCASE and loads the [spatial](https://duckdb.org/docs/extensions/spatial) extension.
 *
 */
export default class SimpleGeoDB extends SimpleDB {
    constructor(
        options: {
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        super(options)
    }

    /**
     * Initializes DuckDB and establishes a connection to the database. It sets the default_collation to NOCASE and loads the [spatial](https://duckdb.org/docs/extensions/spatial) extension. It's called automatically with the first method you'll run.
     */
    async start() {
        this.debug && console.log("\nstart()\n")
        const duckDB = await getDuckDB()
        this.db = duckDB.db
        this.connection = await this.db.connect()
        this.connection.query(
            "PRAGMA default_collation=NOCASE; INSTALL spatial; LOAD spatial;"
        ) // Not working?
        this.worker = duckDB.worker
    }

    /**
     * @category Geospatial
     */
    async loadGeoData(table: string, file: string) {
        this.debug && console.log("\nloadGeoData()")
        await queryDB(
            this,
            `CREATE OR REPLACE TABLE ${table} AS SELECT * FROM ST_Read('${file}');`,
            mergeOptions(this, { table })
        )
    }

    /**
     * @category Geospatial
     */
    async flipCoordinates(table: string, column: string) {
        this.debug && console.log("\nflipCoordinates")
        await queryDB(
            this,
            `UPDATE ${table} SET "${column}" = ST_FlipCoordinates("${column}")`,
            mergeOptions(this, { table })
        )
    }

    /**
     * @category Geospatial
     */
    async reproject(table: string, column: string, from: string, to: string) {
        this.debug && console.log("\nreproject()")
        await queryDB(
            this,
            `
        UPDATE ${table} SET "${column}" = ST_Transform("${column}", '${from}', '${to}')`,
            mergeOptions(this, { table })
        )
    }

    /**
     * @category Geospatial
     */
    async area(table: string, column: string, newColumn: string) {
        this.debug && console.log("\narea()")
        await queryDB(
            this,
            `ALTER TABLE ${table} ADD "${newColumn}" DOUBLE; UPDATE ${table} SET "${newColumn}" =  ST_Area("${column}");`,
            mergeOptions(this, { table })
        )
    }
}
