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
import writeGeoDataQuery from "../methods/writeGeoDataQuery.js"

/**
 * SimpleNodeDB is a class that provides a simplified interface for working with DuckDB,
 * a high-performance, in-memory analytical database. This class is meant to be used
 * with NodeJS and similar runtimes. For web browsers, use SimpleDB.
 *
 * Here's how to instantiate a SimpleNodeDB instance.
 *
 * ```ts
 * const sdb = new SimpleNodeDB()
 *
 * // Same thing but will log useful information in the terminal. The first 20 rows of tables will be logged. Also installs the spatial extension for geospatial analysis.
 * const sdb = new SimpleDB({ debug: true, nbRowsToLog: 20, spatial: true})
 * ```
 *
 * The start() method will be called internally automatically with the first method you'll run. It initializes DuckDB and establishes a connection to the database. It optionally loads the [spatial](https://duckdb.org/docs/extensions/spatial) extension.
 *
 * With very expensive computations, it might create a .tmp folder, so make sure to add .tmp to your gitignore.
 *
 */

export default class SimpleNodeDB extends SimpleGeoDB {
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
     * Initializes DuckDB and establishes a connection to the database. It also optionnaly installs the [spatial](https://duckdb.org/docs/extensions/spatial) extension. It's called automatically with the first method you'll run.
     */
    async start() {
        this.debug && console.log("\nstart()")
        this.db = new duckdb.Database(":memory:")
        if (this.spatial) {
            this.db.exec("INSTALL spatial; LOAD spatial; LOAD httpfs;")
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
        this.debug &&
            console.log("parameters:", {
                table,
                arrayOfObjects:
                    arrayOfObjects.length > 5
                        ? `${JSON.stringify(arrayOfObjects.slice(0, 2))} (just showing the first 5 items)`
                        : arrayOfObjects,
            })

        const arrowTable = tableFromJSON(arrayOfObjects)
        if (this.connection === undefined) {
            await this.start()
        }

        await this.customQuery("INSTALL arrow; LOAD arrow;")
        ;(this.connection as Connection).register_buffer(
            `tableAsView`,
            [tableToIPC(arrowTable)],
            true,
            (err) => {
                if (err) {
                    console.log(err)
                    return
                }
            }
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
     *   @param options.fileType - The type of file to load ("csv", "dsv", "json", "parquet"). Defaults to the first file extension.
     *   @param options.autoDetect - A boolean indicating whether to automatically detect the data format. Defaults to true.
     *   @param options.limit - A number indicating the number of rows to load. Defaults to all rows.
     *   @param options.fileName - A boolean indicating whether to include the file name as a column in the loaded data. Defaults to false.
     *   @param options.unifyColumns - A boolean indicating whether to unify columns across multiple files, when the files structure is not the same. Defaults to false.
     *   @param options.columnTypes - An object mapping the column names with their expected types. By default, the types are inferred.
     *   @param options.header - A boolean indicating whether the file has a header. Applicable to CSV files. Defaults to true.
     *   @param options.allText - A boolean indicating whether all columns should be treated as text. Applicable to CSV files. Defaults to false.
     *   @param options.delim - The delimiter used in the file. Applicable to CSV and DSV files. By default, the delimiter is inferred.
     *   @param options.skip - The number of lines to skip at the beginning of the file. Applicable to CSV files. Defaults to 0.
     *   @param options.compression - The compression type. Applicable to CSV files. Defaults to none.
     *   @param options.jsonFormat - The format of JSON files ("unstructured", "newlineDelimited", "array"). By default, the format is inferred.
     *   @param options.records - A boolean indicating whether each line in a newline-delimited JSON file represents a record. Applicable to JSON files. By default, it's inferred.
     *   @param options.sheet - A string indicating a specific sheet to import. Applicable to Excel files. By default, the first sheet is imported.
     *
     * @category Importing data
     */
    async loadData(
        table: string,
        files: string | string[],
        options: {
            fileType?: "csv" | "dsv" | "json" | "parquet" | "excel"
            autoDetect?: boolean
            limit?: number
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
     *   @param options.fileType - The type of file to load ("csv", "dsv", "json", "parquet"). Defaults to the first file extension.
     *   @param options.autoDetect - A boolean indicating whether to automatically detect the data format. Defaults to true.
     *   @param options.limit - A number indicating the number of rows to load. Defaults to all rows.
     *   @param options.fileName - A boolean indicating whether to include the file name as a column in the loaded data. Defaults to false.
     *   @param options.unifyColumns - A boolean indicating whether to unify columns across multiple files, when the files structure is not the same. Defaults to false.
     *   @param options.columnTypes - An object mapping the column names with their expected types. By default, the types are inferred.
     *   @param options.header - A boolean indicating whether the file has a header. Applicable to CSV files. Defaults to true.
     *   @param options.allText - A boolean indicating whether all columns should be treated as text. Applicable to CSV files. Defaults to false.
     *   @param options.delim - The delimiter used in the file. Applicable to CSV and DSV files. By default, the delimiter is inferred.
     *   @param options.skip - The number of lines to skip at the beginning of the file. Applicable to CSV files. Defaults to 0.
     *   @param options.compression - The compression type. Applicable to CSV files. Defaults to none.
     *   @param options.jsonFormat - The format of JSON files ("unstructured", "newlineDelimited", "array"). By default, the format is inferred.
     *   @param options.records - A boolean indicating whether each line in a newline-delimited JSON file represents a record. Applicable to JSON files. By default, it's inferred.
     *   @param options.sheet - A string indicating a specific sheet to import. Applicable to Excel files. By default, the first sheet is imported.
     *
     * @category Importing data
     */
    async loadDataFromDirectory(
        table: string,
        directory: string,
        options: {
            fileType?: "csv" | "dsv" | "json" | "parquet" | "excel"
            autoDetect?: boolean
            limit?: number
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
     * Writes geospatial data from a table to a file.
     *
     * ```ts
     * await sdb.writeGeoata("tableA", "output/data.geojson");
     * ```
     *
     * @param table - The name of the table from which data will be written.
     * @param file - The path to the file to which data will be written.
     * @param options - An optional object with configuration options:
     *   @param options.precision - Maximum number of figures after decimal separator to write in coordinates.
     *
     * * @category Exporting data
     */
    async writeGeoData(
        table: string,
        file: string,
        options: { precision?: number } = {}
    ) {
        await queryDB(
            this,
            writeGeoDataQuery(table, file, options),
            mergeOptions(this, {
                table,
                method: "writeGeoData()",
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
