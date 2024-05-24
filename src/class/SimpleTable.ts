import { readdirSync } from "fs"
import { tableFromJSON, tableToIPC } from "apache-arrow"
import SimpleDB from "./SimpleDB.js"
import SimpleWebTable from "./SimpleWebTable.js"
import { Connection } from "duckdb"
import stringToArray from "../helpers/stringToArray.js"
import loadDataNodeQuery from "../methods/loadDataNodeQuery.js"
import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import writeDataQuery from "../methods/writeDataQuery.js"
import writeGeoDataQuery from "../methods/writeGeoDataQuery.js"

/**
 * SimpleTable is a class representing a table in a SimpleDB. To create one, it's best to instantiate a SimpleDB first.
 *
 * @example Basic usage
 * ```ts
 * // Creating a database first.
 * const sdb = new SimpleDB()
 *
 * // Making a new table. This returns a SimpleTable.
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
 * @example Instanciating with types
 * ```ts
 * // You can also create a new table with specific types.
 * await sdb.newTable("employees", { types: { name: "string", salary: "integer", raise: "float" }})
 * ```
 */
export default class SimpleTable extends SimpleWebTable {
    constructor(
        name: string,
        simpleDB: SimpleDB,
        options: {
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        super(name, simpleDB, options)
    }

    /**
     * Loads an array of objects into the table.
     *
     * @example Basic usage
     * ```ts
     * const data = [{ letter: "a", number: 1 }, { letter: "b", number: 2 }]
     * await table.loadArray(data)
     * ```
     *
     * @param table - The name of the table to be created.
     * @param arrayOfObjects - An array of objects representing the data.
     *
     * @category Importing data
     */
    async loadArray(arrayOfObjects: { [key: string]: unknown }[]) {
        this.debug && console.log("\nloadArray()")
        this.debug &&
            console.log("parameters:", {
                table: this.name,
                arrayOfObjects:
                    arrayOfObjects.length > 5
                        ? `${JSON.stringify(arrayOfObjects.slice(0, 2))} (just showing the first 5 items)`
                        : arrayOfObjects,
            })

        const arrowTable = tableFromJSON(arrayOfObjects)

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
            `CREATE OR REPLACE TABLE ${this.name} AS SELECT * FROM tableAsView;
            DROP VIEW tableAsView;`
        )

        this.debug && (await this.logTable())
    }

    /**
     * This method is just for the web. For NodeJS and other runtimes, use loadData.
     */
    async fetchData() {
        throw new Error(
            "This method is just for the web. For NodeJS and other runtimes, use loadData."
        )
    }

    /**
     * Loads data from local or remote file(s) into it. CSV, JSON and PARQUET files are accepted.
     *
     * @example Basic usage
     * ```ts
     * // Load data from a local file
     * await table.loadData("./some-data.csv")
     *
     * // Load data from a remote file
     * await table.loadData("https://some-website.com/some-data.parquet")
     * ```
     *
     * @example Multiple files
     * ```
     * // Load data from multiple local files.
     * await table.loadData([ "./some-data1.json", "./some-data2.json", "./some-data3.json" ])
     *
     * // Load data from multiple remote files
     * await table.loadData([ "https://some-website.com/some-data1.parquet", "https://some-website.com/some-data2.parquet", "https://some-website.com/some-data3.parquet" ])
     * ```
     *
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
            loadDataNodeQuery(this.name, stringToArray(files), options),
            mergeOptions(this, {
                table: this.name,
                method: "loadData()",
                parameters: { files, options },
            })
        )
    }

    /**
     * Loads data from all files in a local directory. CSV, JSON, and PARQUET files are accepted.
     *
     * @example Basic usage
     * ```ts
     * await table.loadDataFromDirectory("./data/")
     * ```
     *
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
            loadDataNodeQuery(this.name, files, options),
            mergeOptions(this, {
                table: this.name,
                method: "loadDataFromDirectory",
                parameters: { directory, options },
            })
        )
    }

    /**
     * Writes data to a file.
     *
     * @example Basic usage
     * ```ts
     * await table.writeData("output/data.csv");
     * ```
     *
     * @param file - The path to the file to which data will be written.
     * @param options - An optional object with configuration options:
     *   @param options.compression - A boolean indicating whether to compress the output file. Defaults to false. If true, CSV and JSON files will be compressed with GZIP while PARQUET files will use ZSTD.
     *
     * @category Exporting data
     */
    async writeData(
        file: string,
        options: {
            compression?: boolean
        } = {}
    ) {
        await queryDB(
            this,
            writeDataQuery(this.name, file, options),
            mergeOptions(this, {
                table: this.name,
                method: "writeData()",
                parameters: { file, options },
            })
        )
    }

    /**
     * Writes geospatial data to a file.
     *
     * @example Basic usage
     * ```ts
     * await table.writeGeoata("output/data.geojson");
     * ```
     *
     * @param file - The path to the file to which data will be written.
     * @param options - An optional object with configuration options:
     *   @param options.precision - Maximum number of figures after decimal separator to write in coordinates.
     *
     * * @category Exporting data
     */
    async writeGeoData(file: string, options: { precision?: number } = {}) {
        await queryDB(
            this,
            writeGeoDataQuery(this.name, file, options),
            mergeOptions(this, {
                table: this.name,
                method: "writeGeoData()",
                parameters: { file, options },
            })
        )
    }
}
