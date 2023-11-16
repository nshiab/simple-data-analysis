import duckdb, { Connection, Database } from "duckdb"
import { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm"
import { readdirSync } from "fs"
import SimpleDB from "./SimpleDB.js"

import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"

import loadDataQuery from "../methods/loadDataQuery.js"
import writeDataQuery from "../methods/writeDataQuery.js"
import stringToArray from "../helpers/stringToArray.js"

/**
 * SimpleNodeDB is a class that provides a simplified interface for working with DuckDB,
 * a high-performance, in-memory analytical database. This class is meant to be used
 * with NodeJS and other runtimes. For web browsers, use SimpleDB.
 *
 * Here's how to instantiate and start a SimpleNodeDB instance.
 *
 * ```ts
 * const sdb = await new SimpleNodeDB().start()
 * ```
 */

export default class SimpleNodeDB extends SimpleDB {
    /**
     * Creates an instance of SimpleNodeDB.
     *
     * After instantiating, you need to call the start method.
     *
     * ```ts
     * const sdb = await new SimpleNodeDB().start()
     * ```
     *
     * @param options - An optional object with configuration options:
     *   - debug: A flag indicating whether debugging information should be logged. Defaults to false.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to 10.
     *
     */
    constructor(
        options: {
            nbRowsToLog?: number
            debug?: boolean
        } = {}
    ) {
        super(options)
        this.runQuery = function (
            query: string,
            connection: AsyncDuckDBConnection | Connection,
            returnDataFromQuery: boolean
        ) {
            return new Promise((resolve) => {
                if (returnDataFromQuery) {
                    ;(connection as Connection).all(query, (err, res) => {
                        if (err) {
                            throw err
                        }
                        resolve(
                            res as {
                                [key: string]:
                                    | number
                                    | string
                                    | Date
                                    | boolean
                                    | null
                            }[]
                        )
                    })
                } else {
                    ;(connection as Connection).exec(query, (err) => {
                        if (err) {
                            throw err
                        }
                        resolve(null)
                    })
                }
            })
        }
    }

    /**
     * Initializes DuckDB and establishes a connection to the database. Also installs the httpfs extension: https://duckdb.org/docs/extensions/httpfs.html.
     */
    async start() {
        this.debug && console.log("\nstart()")
        this.db = new duckdb.Database(":memory:")
        this.db.exec("INSTALL httpfs")
        this.connection = this.db.connect()
        return this
    }

    /**
     * Creates a table and loads data from local or remote file(s) into it. CSV, JSON, and PARQUET files are accepted.
     *
     * ```ts
     * // Load data from a local file into tableA
     * await sdb.loadData("tableA", "./some-data.csv")
     *
     * // Load data from multiple local files into tableB
     * await sdb.loadData("tableB", ["./some-data1.json", "./some-data2.json", "./some-data3.json"])
     *
     * // Load data from a remote file into tableC
     * await sdb.loadData("tableC", "https://some-website.com/some-data.parquet")
     *
     * // Load data from multiple remote files into tableD
     * await sdb.loadData("tableD", ["https://some-website.com/some-data1.parquet", "https://some-website.com/some-data2.parquet", "https://some-website.com/some-data3.parquet"])
     * ```
     *
     * @param table - The name of the table into which data will be loaded.
     * @param files - The path(s) or url(s) of file(s) containing the data to be loaded. CSV, JSON, and PARQUET files are accepted.
     * @param options - An optional object with configuration options:
     *   - fileType: The type of file to load ("csv", "dsv", "json", "parquet"). Defaults to the first file extension.
     *   - autoDetect: A boolean indicating whether to automatically detect the data format. Defaults to true.
     *   - fileName: A boolean indicating whether to include the file name as a column in the loaded data. Defaults to false.
     *   - unifyColumns: A boolean indicating whether to unify columns across multiple files, when the files structure is not the same. Defaults to false.
     *   - columnTypes: An object mapping the column names with their expected types. By default, the types are inferred.
     *   - header: A boolean indicating whether the file has a header. Applicable to CSV files. Defaults to true.
     *   - allText: A boolean indicating whether all columns should be treated as text. Applicable to CSV files. Defaults to false.
     *   - delim: The delimiter used in the file. Applicable to CSV and DSV files. By default, the delimiter is inferred.
     *   - skip: The number of lines to skip at the beginning of the file. Applicable to CSV files. Defaults to 0.
     *   - jsonFormat: The format of JSON files ("unstructured", "newlineDelimited", "array"). By default, the format is inferred.
     *   - records: A boolean indicating whether each line in a newline-delimited JSON file represents a record. Applicable to JSON files. By default, it's inferred.
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     *
     * @category Importing data
     */
    async loadData(
        table: string,
        files: string | string[],
        options: {
            fileType?: "csv" | "dsv" | "json" | "parquet"
            autoDetect?: boolean
            fileName?: boolean
            unifyColumns?: boolean
            columnTypes?: { [key: string]: string }
            // csv options
            header?: boolean
            allText?: boolean
            delim?: string
            skip?: number
            // json options
            jsonFormat?: "unstructured" | "newlineDelimited" | "array"
            records?: boolean
            // others
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ): Promise<
        | {
              [key: string]: string | number | boolean | Date | null
          }[]
        | null
    > {
        ;(options.debug || this.debug) && console.log("\nloadData()")
        return await queryDB(
            this.connection,
            this.runQuery,
            loadDataQuery(table, stringToArray(files), options),
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Creates a table and loads data from all files in a local directory. CSV, JSON, and PARQUET files are accepted.
     *
     * ```ts
     * await sdb.loadDataFromDirectory("tableA", "./data/")
     * ```
     *
     * @param table - The name of the table into which data will be loaded.
     * @param directory - The path of the directory containing the data files to be loaded. CSV, JSON, and PARQUET files are accepted.
     * @param options - An optional object with configuration options:
     *   - fileType: The type of file to load ("csv", "dsv", "json", "parquet"). Defaults to the first file extension.
     *   - autoDetect: A boolean indicating whether to automatically detect the data format. Defaults to true.
     *   - fileName: A boolean indicating whether to include the file name as a column in the loaded data. Defaults to false.
     *   - unifyColumns: A boolean indicating whether to unify columns across multiple files, when the files structure is not the same. Defaults to false.
     *   - columnTypes: An object mapping the column names with their expected types. By default, the types are inferred.
     *   - header: A boolean indicating whether the file has a header. Applicable to CSV files. Defaults to true.
     *   - allText: A boolean indicating whether all columns should be treated as text. Applicable to CSV files. Defaults to false.
     *   - delim: The delimiter used in the file. Applicable to CSV and DSV files. By default, the delimiter is inferred.
     *   - skip: The number of lines to skip at the beginning of the file. Applicable to CSV files. Defaults to 0.
     *   - jsonFormat: The format of JSON files ("unstructured", "newlineDelimited", "array"). By default, the format is inferred.
     *   - records: A boolean indicating whether each line in a newline-delimited JSON file represents a record. Applicable to JSON files. By default, it's inferred.
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     *
     * @category Importing data
     */
    async loadDataFromDirectory(
        table: string,
        directory: string,
        options: {
            fileType?: "csv" | "dsv" | "json" | "parquet"
            autoDetect?: boolean
            fileName?: boolean
            unifyColumns?: boolean
            columnTypes?: { [key: string]: string }
            // csv options
            header?: boolean
            allText?: boolean
            delim?: string
            skip?: number
            // json options
            jsonFormat?: "unstructured" | "newlineDelimited" | "array"
            records?: boolean
            // others
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) &&
            console.log("\nloadDataFromDirectory()")
        const files = readdirSync(directory).map(
            (file) => `${directory}${file}`
        )
        queryDB(
            this.connection,
            this.runQuery,
            loadDataQuery(table, files, options),
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Writes data from a table to a file.
     *
     * ```ts
     * await sdb.writeData("tableA", "output/data.csv");
     * ```
     *
     * @param table - The name of the table from which data will be written.
     * @param file - The path to the file to which data will be written.
     * @param options - An optional object with configuration options:
     *   - compression: A boolean indicating whether to compress the output file. Defaults to false. If true, CSV and JSON files will be compressed with GZIP while PARQUET files will use ZSTD.
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     *
     * * @category Exporting data
     */
    async writeData(
        table: string,
        file: string,
        options: {
            compression?: boolean
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nwriteData()")
        await queryDB(
            this.connection,
            this.runQuery,
            writeDataQuery(table, file, options),
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Frees up memory by closing down the database.
     *
     * ```typescript
     * await sdb.done();
     * ```
     *
     * @param options - An optional object with configuration options:
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     */
    async done(
        options: {
            debug?: boolean
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\ndone()")
        ;(this.db as Database).close()
    }
}
