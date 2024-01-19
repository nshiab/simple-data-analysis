import duckdb, { Connection, Database } from "duckdb"
import { readdirSync } from "fs"
import SimpleGeoDB from "./SimpleGeoDB.js"

import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"

import loadDataNodeQuery from "../methods/loadDataNodeQuery.js"
import writeDataQuery from "../methods/writeDataQuery.js"
import stringToArray from "../helpers/stringToArray.js"
import runQueryNode from "../helpers/runQueryNode.js"
import batch from "../methods/batch.js"
import { tableFromJSON, tableToIPC } from "apache-arrow"

/**
 * SimpleNodeDB is a class that provides a simplified interface for working with DuckDB,
 * a high-performance, in-memory analytical database. This class is meant to be used
 * with NodeJS and similar runtimes. For web browsers, use SimpleDB.
 *
 * Here's how to instantiate a SimpleNodeDB instance.
 *
 * ```ts
 * const sdb = new SimpleNodeDB()
 * ```
 *
 * The start() method will be called internally automatically with the first method you'll run. It initializes DuckDB and establishes a connection to the database. It optionally loads the [spatial](https://duckdb.org/docs/extensions/spatial) extension.
 *
 * With very expensive computations, it might create a .tmp folder, so make sure to add .tmp to your gitignore.
 *
 */

export default class SimpleNodeDB extends SimpleGeoDB {
    /**
     * Creates an instance of SimpleNodeDB.
     *
     * ```ts
     * const sdb = new SimpleNodeDB()
     * ```
     *
     * The start() method will be called internally automatically with the first method you'll run. It initializes DuckDB and establishes a connection to the database. It optionally loads the [spatial](https://duckdb.org/docs/extensions/spatial) extension.
     *
     * @param options - An optional object with configuration options:
     *   - debug: A flag indicating whether debugging information should be logged. Defaults to false.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to 10.
     *   - bigIntToInt: Default is true. When data is retrieved from the database as an array of objects, BIGINT values are automatically converted to integers, which are easier to work with in JavaScript. If you want actual bigint values, set this option to false.
     *   - spatial: Default is false. If true, the spatial](https://duckdb.org/docs/extensions/spatial) extension will be loaded, which allows geospatial analysis.
     *
     */
    constructor(
        options: {
            nbRowsToLog?: number
            debug?: boolean
            bigIntToInt?: boolean
            spatial?: boolean
        } = {}
    ) {
        super(options)
        this.bigIntToInt = options.bigIntToInt ?? true
        this.spatial = options.spatial ?? false
        this.runQuery = runQueryNode
    }

    /**
     * Initializes DuckDB and establishes a connection to the database. It also optionnaly installs the [spatial](https://duckdb.org/docs/extensions/spatial) extensions. It's called automatically with the first method you'll run.
     */
    async start() {
        this.debug && console.log("\nstart()")
        this.db = new duckdb.Database(":memory:")
        if (this.spatial) {
            this.db.exec("INSTALL spatial; LOAD spatial;")
        }
        this.connection = this.db.connect()
    }

    /**
     * Creates or replaces a table and loads an array of objects into it.
     *
     * ```ts
     * const data = [{letter: "a", number: 1}, {letter: "b", number: 2}]
     * await simpleDB.loadArray("tableA", data)
     * ```
     *
     * @param table - The name of the table to be created.
     * @param arrayOfObjects - An array of objects representing the data.
     *
     * @category Importing data
     */
    async loadArray(
        table: string,
        arrayOfObjects: { [key: string]: unknown }[]
    ) {
        this.debug && console.log("\nloadArray()")
        this.debug && console.log("parameters:", { table, arrayOfObjects })

        const arrowTable = tableFromJSON(arrayOfObjects)
        if (this.connection === undefined) {
            await this.start()
        }
        ;(this.connection as Connection).register_buffer(
            `tableAsView`,
            [tableToIPC(arrowTable)],
            true
        )
        await this.customQuery(
            `CREATE OR REPLACE TABLE ${table} AS SELECT * FROM tableAsView;
            DROP VIEW tableAsView;`
        )

        this.debug && (await this.logTable(table))
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
     *   - compression: The compression type. Applicable to CSV files. Defaults to none.
     *   - jsonFormat: The format of JSON files ("unstructured", "newlineDelimited", "array"). By default, the format is inferred.
     *   - records: A boolean indicating whether each line in a newline-delimited JSON file represents a record. Applicable to JSON files. By default, it's inferred.
     *   - sheet: A string indicating a specific sheet to import. Applicable to Excel files. By default, the first sheet is imported.
     *
     * @category Importing data
     */
    async loadData(
        table: string,
        files: string | string[],
        options: {
            fileType?: "csv" | "dsv" | "json" | "parquet" | "excel"
            autoDetect?: boolean
            fileName?: boolean
            unifyColumns?: boolean
            columnTypes?: { [key: string]: string }
            // csv options
            header?: boolean
            allText?: boolean
            delim?: string
            skip?: number
            compression?: "none" | "gzip" | "zstd"
            // json options
            jsonFormat?: "unstructured" | "newlineDelimited" | "array"
            records?: boolean
            // excel options
            sheet?: string
        } = {}
    ) {
        this.debug && console.log("\nloadData()")
        this.debug && console.log("parameters:", { table, files, options })
        await queryDB(
            this,
            loadDataNodeQuery(table, stringToArray(files), options),
            mergeOptions(this, {
                table,
                method: "loadData()",
                parameters: { table, files, options },
            })
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
        } = {}
    ) {
        const files = readdirSync(directory).map(
            (file) =>
                `${directory.slice(-1) === "/" ? directory : directory + "/"}${file}`
        )
        await queryDB(
            this,
            loadDataNodeQuery(table, files, options),
            mergeOptions(this, {
                table,
                method: "loadDataFromDirectory",
                parameters: { table, directory, options },
            })
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
     *
     * * @category Exporting data
     */
    async writeData(
        table: string,
        file: string,
        options: {
            compression?: boolean
        } = {}
    ) {
        await queryDB(
            this,
            writeDataQuery(table, file, options),
            mergeOptions(this, {
                table,
                method: "writeData()",
                parameters: { table, file, options },
            })
        )
    }

    /**
     * A method to perform computations on small batches instead of all of the data at once. Useful with big join operations.
     *
     * ```ts
     * // The computation we want to run. A third parameter outputTable is optional.
     * const run = async (sdb: SimpleDB, originalTable: string) => {
            await sdb.convert(
                originalTable,
                { salary: "number" },
            )
            await sdb.addColumn(
                originalTable,
                "salaryMultipliedBy2",
                "number",
                `Salary * 2`
            )
        }
     * // Running it batch after batch.
     * await simpleNodeDB.batch(run, "tableA", {
            batchSize: 5,
        })
     * ```
     *
     * @param run - The function to be executed in batches.
     * @param originalTable - The name of the original table to be processed.
     * @param options - An optional object with configuration options:
     *   @param options.outputTable - The name of the output table where results will be stored. By default, the original table will be overwritten.
     *   @param options.batchSize - The number of items to process in each batch. Default is 10.
     *   @param options.logBatchNumber - A boolean indicating whether to log the batch number. Default is false.
     *
     * @category Updating data
     */
    async batch(
        run: (
            simpleDB: SimpleNodeDB,
            originalTable: string,
            outputTable?: string
        ) => Promise<void>,
        originalTable: string,
        options: {
            outputTable?: string
            batchSize?: number
            logBatchNumber?: boolean
        } = {}
    ) {
        await batch(this, run, originalTable, options)
    }

    /**
     * Frees up memory by closing down the database.
     *
     * ```typescript
     * await sdb.done();
     * ```
     */
    async done() {
        this.debug && console.log("\ndone()")
        ;(this.db as Database).close()
    }
}
