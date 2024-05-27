import { AsyncDuckDB, AsyncDuckDBConnection } from "@duckdb/duckdb-wasm"
import { Connection, Database } from "duckdb"

export default class Simple {
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
        runQuery: (
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
        >,
        options: {
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        this.nbRowsToLog = options.nbRowsToLog ?? 10
        this.debug = options.debug ?? false
        this.worker = null
        this.runQuery = runQuery
    }
}
