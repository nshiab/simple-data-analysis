import { AsyncDuckDB, AsyncDuckDBConnection } from "@duckdb/duckdb-wasm"
import { Database, Connection } from "duckdb"
import getDuckDB from "../helpers/getDuckDB.js"
import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import stringToArray from "../helpers/stringToArray.js"

import getDescription from "../methods/getDescription.js"
import renameColumnQuery from "../methods/renameColumnQuery.js"
import replaceStringsQuery from "../methods/replaceStringsQuery.js"
import convertQuery from "../methods/convertQuery.js"
import roundQuery from "../methods/roundQuery.js"
import joinQuery from "../methods/joinQuery.js"
import insertRowsQuery from "../methods/insertRowsQuery.js"
import sortQuery from "../methods/sortQuery.js"
import loadArrayQuery from "../methods/loadArrayQuery.js"
import outliersIQRQuery from "../methods/outliersIQRQuery.js"
import zScoreQuery from "../methods/zScoreQuery.js"
import tableToArrayOfObjects from "../helpers/arraysToData.js"
import parseType from "../helpers/parseTypes.js"
import concatenateQuery from "../methods/concatenateQuery.js"
import loadDataBrowser from "../methods/loadDataBrowser.js"
import removeMissing from "../methods/removeMissing.js"
import summarize from "../methods/summarize.js"
import correlations from "../methods/correlations.js"
import linearRegressions from "../methods/linearRegressions.js"
import getTables from "../methods/getTables.js"
import getColumns from "../methods/getColumns.js"
import getLength from "../methods/getLength.js"
import getTypes from "../methods/getTypes.js"
import getValues from "../methods/getValues.js"
import getUniques from "../methods/getUniques.js"
import getFirstRow from "../methods/getFirstRow.js"
import getLastRow from "../methods/getLastRow.js"
import getTop from "../methods/getTop.js"
import getBottom from "../methods/getBottom.js"
import getMin from "../methods/getMin.js"
import getMax from "../methods/getMax.js"
import getMean from "../methods/getMean.js"
import getMedian from "../methods/getMedian.js"
import getSum from "../methods/getSum.js"
import getSkew from "../methods/getSkew.js"
import getStdDev from "../methods/getStdDev.js"
import getVar from "../methods/getVar.js"
import getQuantile from "../methods/getQuantile.js"
import ranksQuery from "../methods/ranksQuery.js"
import quantilesQuery from "../methods/quantilesQuery.js"
import binsQuery from "../methods/binsQuery.js"
import proportionsHorizontalQuery from "../methods/proportionsHorizontalQuery.js"
import proportionsVerticalQuery from "../methods/proportionsVerticalQuery.js"
import { Data } from "@observablehq/plot"

/**
 * SimpleDB is a class that provides a simplified interface for working with DuckDB,
 * a high-performance, in-memory analytical database. This class is meant to be used
 * in a web browser. For NodeJS and other runtimes, use SimpleNodeDB.
 *
 * Here's how to instantiate and start a SimpleDB instance.
 *
 * ```ts
 * const sdb = await new SimpleDB().start()
 * ```
 */

export default class SimpleDB {
    debug: boolean
    nbRowsToLog: number
    db!: AsyncDuckDB | Database
    connection!: AsyncDuckDBConnection | Connection
    worker!: Worker | null
    /**
     * For internal use. If you want to run a SQL query, use the customQuery method.
     */
    runQuery!: (
        query: string,
        connection: AsyncDuckDBConnection | Connection,
        returnDataFromQuery: boolean
    ) => Promise<
        | {
              [key: string]: number | string | Date | boolean | null
          }[]
        | null
    >

    /**
     * Creates an instance of SimpleDB.
     *
     * After instantiating, you need to call the start method.
     *
     * ```ts
     * const sdb = await new SimpleDB().start()
     * ```
     *
     * @param options - An optional object with configuration options:
     *   - debug: A flag indicating whether debugging information should be logged. Defaults to false.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to 10.
     *
     */

    constructor(
        options: {
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        this.nbRowsToLog = options.nbRowsToLog ?? 10
        this.debug = options.debug ?? false
        this.worker = null
        this.runQuery = async function (
            query: string,
            connection: AsyncDuckDBConnection | Connection,
            returnDataFromQuery: boolean
        ) {
            if (returnDataFromQuery) {
                const data = await (connection as AsyncDuckDBConnection).query(
                    query
                )
                return tableToArrayOfObjects(data)
            } else {
                await (connection as AsyncDuckDBConnection).query(query)
                return null
            }
        }
    }

    /**
     * Initializes DuckDB and establishes a connection to the database.
     */
    async start() {
        this.debug && console.log("\nstart()")
        const duckDB = await getDuckDB()
        this.db = duckDB.db
        this.connection = await this.db.connect()

        this.worker = duckDB.worker
        return this
    }

    /**
     * Creates a new table and loads an array of objects into it.
     *
     * ```ts
     * const data = [{letter: "a", number: 1}, {letter: "b", number: 2}]
     * await simpleDB.loadArray("tableA", data)
     * ```
     *
     * @param table - The name of the table to be created.
     * @param arrayOfObjects - An array of objects representing the data.
     * @param options - An optional object with configuration options:
     *   - replace: A boolean indicating whether to replace the table if it already exists. Defaults to false.
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     *
     * @category Importing data
     */
    async loadArray(
        table: string,
        arrayOfObjects: { [key: string]: unknown }[],
        options: {
            replace?: boolean
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nloadArray()")

        return await queryDB(
            this.connection,
            this.runQuery,
            loadArrayQuery(table, arrayOfObjects, options),
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Creates a table and loads data from an external file into it.
     *
     * ```ts
     * await sdb.loadData("tableA", "https://some-website.com/some-data.csv")
     * ```
     *
     * @param table - The name of the new table.
     * @param url - The URL of the external file containing the data. CSV, JSON, and PARQUET files are accepted.
     * @param options - An optional object with configuration options:
     *   - fileType: The type of the external file (csv, dsv, json, parquet). Defaults to the file extension.
     *   - autoDetect: A boolean indicating whether to automatically detect the data format. Defaults to true.
     *   - header: A boolean indicating whether the file contains a header row. Applicable for CSV files. Defaults to true.
     *   - delim: The delimiter used in the file. Applicable for DSV files. Defaults to ",".
     *   - skip: The number of rows to skip at the beginning of the file. Defaults to 0.
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     *
     * @category Importing data
     */
    async loadData(
        table: string,
        url: string,
        options: {
            fileType?: "csv" | "dsv" | "json" | "parquet"
            autoDetect?: boolean
            // csv options
            header?: boolean
            delim?: string
            skip?: number
            // others
            returnDataFrom?: "table" | "query" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ): Promise<
        | {
              [key: string]: string | number | boolean | Date | null
          }[]
        | null
    > {
        return await loadDataBrowser(this, table, url, options)
    }

    /**
     * Inserts rows into a specified table.
     *
     * ```ts
     * const rows = [ { letter: "a", number: 1 }, { letter: "b", number: 2 }]
     * await sdb.insertRows("tableA", rows)
     * ```
     *
     * @param table - The name of the table to insert rows into.
     * @param rows - An array of objects representing the rows to be inserted into the table.
     * @param options - An optional object with configuration options:
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     *
     * @category Importing data
     */
    async insertRows(
        table: string,
        rows: { [key: string]: unknown }[],
        options: {
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\ninsertRows()")

        return await queryDB(
            this.connection,
            this.runQuery,
            insertRowsQuery(table, rows),
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Inserts all rows from one table into another specified table.
     *
     * ```ts
     * // Insert all rows from tableB into tableA.
     * await sdb.insertTable("tableA", "tableB")
     * ```
     *
     * @param table - The name of the table to insert rows into.
     * @param tableToInsert - The name of the table from which rows will be inserted.
     * @param options - An optional object with configuration options:
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     *
     * @category Importing data
     */
    async insertTable(
        table: string,
        tableToInsert: string,
        options: {
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\ninsertTable()")
        return await queryDB(
            this.connection,
            this.runQuery,
            `INSERT INTO ${table} SELECT * FROM ${tableToInsert}`,
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Clones a table by creating a new table with the same structure and data.
     *
     * ```ts
     * // tableA data is cloned into tableB.
     * await sdb.cloneTable("tableA", "tableB")
     * ```
     *
     * @param originalTable - The name of the table to be cloned.
     * @param newTable - The name of the new table that will be created as a clone.
     * @param options - An optional object with configuration options:
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     */
    async cloneTable(
        originalTable: string,
        newTable: string,
        options: {
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\ncloneTable()")
        return await queryDB(
            this.connection,
            this.runQuery,
            `CREATE OR REPLACE TABLE ${newTable} AS SELECT * FROM ${originalTable}`,
            mergeOptions(this, { ...options, table: newTable })
        )
    }

    /**
     * Selects specific columns in a table and removes the others.
     *
     * ```ts
     * // Selecting only the columns firstName and lastName from tableA. All other columns in the table will be removed.
     * await sdb.selectColumns("tableA", ["firstName", "lastName"])
     * ```
     * @param table - The name of the table from which columns will be selected.
     * @param columns - Either a string (one column) or an array of strings (multiple columns) representing the columns to be selected.
     * @param options - An optional object with configuration options:
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     *
     * @category Selecting or filtering data
     */
    async selectColumns(
        table: string,
        columns: string | string[],
        options: {
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nselectColumns()")

        return await queryDB(
            this.connection,
            this.runQuery,
            `CREATE OR REPLACE TABLE ${table} AS SELECT ${stringToArray(columns)
                .map((d) => `"${d}"`)
                .join(", ")} FROM ${table}`,
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Selects random rows from a table and removes the others.
     *
     * ```ts
     * // Selecting 100 random rows in tableA
     * await sdb.sample("tableA", 100)
     *
     * // Selecting 10% of the rows randomly in tableB
     * await sdb.sample("tableB", "10%")
     * ```
     *
     * @param table - The name of the table from which rows will be sampled.
     * @param quantity - The number of rows (1000 for example) or a string ("10%" for example) specifying the sampling size.
     * @param options - An optional object with configuration options:
     *   - seed: A number specifying the seed for repeatable sampling. For example, setting it to 1 will ensure that the random rows will be the same each time you run the method.
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     *
     * @category Selecting or filtering data
     */
    async sample(
        table: string,
        quantity: number | string,
        options: {
            seed?: number
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nsample()")

        return await queryDB(
            this.connection,
            this.runQuery,
            `CREATE OR REPLACE TABLE ${table} AS SELECT * FROM ${table} USING SAMPLE RESERVOIR(${
                typeof quantity === "number" ? `${quantity} ROWS` : quantity
            })${
                typeof options.seed === "number"
                    ? ` REPEATABLE(${options.seed})`
                    : ""
            }`,
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Removes duplicate rows from a table, keeping only unique rows.
     *
     * ```ts
     * await sdb.removeDuplicates("tableA")
     * ```
     *
     * @param table - The name of the table from which duplicates will be removed.
     * @param options - An optional object with configuration options:
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     *
     * @category Selecting or filtering data
     */
    async removeDuplicates(
        table: string,
        options: {
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nremoveDuplicates()")
        return await queryDB(
            this.connection,
            this.runQuery,
            `CREATE OR REPLACE TABLE ${table} AS SELECT DISTINCT * FROM ${table}`,
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Removes rows with missing values from a table. By default, missing values are NULL (as an SQL value), but also "null", "NaN" and "undefined" than might have been converted to strings before being loaded into the table. Empty strings ("") are also considered missing values.
     *
     * ```ts
     * // Removes rows with missing values in any columns.
     * await sdb.removeMissing("tableA")
     *
     * // Removes rows with missing values in specific columns.
     * await sdb.removeMissing("tableA", { columns: ["firstName", "lastName"]})
     * ```
     *
     * @param table - The name of the table from which rows with missing values will be removed.
     * @param options - An optional object with configuration options:
     *   - columns: Either a string or an array of strings specifying the columns to consider for missing values. By default, all columns are considered.
     *   - missingValues: An array of values to be treated as missing values. Defaults to ["undefined", "NaN", "null", ""].
     *   - invert: A boolean indicating whether to invert the condition, keeping only rows with missing values. Defaults to false.
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     *
     * @category Selecting or filtering data
     */
    async removeMissing(
        table: string,
        options: {
            columns?: string | string[]
            missingValues?: (string | number)[]
            invert?: boolean
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {
            missingValues: ["undefined", "NaN", "null", ""],
        }
    ) {
        return await removeMissing(this, table, options)
    }

    /**
     * Filters rows from a table based on SQL conditions.
     *
     * ```ts
     * // In table store, keep only rows where the fruit is not an apple.
     * await sdb.filter("store", "fruit != 'apple'"")
     *
     * // More examples:
     * await sdb.filter("store", "price > 100 AND quantity > 0")
     * await sdb.filter("inventory", "category = 'Electronics' OR category = 'Appliances'")
     * await sdb.filter("customers", "lastPurchaseDate >= '2023-01-01'")
     * ```
     *
     * @param table - The name of the table from which rows will be filtered.
     * @param conditions - The filtering conditions specified as a SQL WHERE clause.
     * @param options - An optional object with configuration options:
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     *
     * @category Selecting or filtering data
     */
    async filter(
        table: string,
        conditions: string,
        options: {
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nfilter()")
        return await queryDB(
            this.connection,
            this.runQuery,
            `CREATE OR REPLACE TABLE ${table} AS SELECT *
            FROM ${table}
            WHERE ${conditions}`,
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Renames columns in a specified table.
     *
     * ```ts
     * // Renaming "How old?" to "age" and "Man or woman?" to "sex" in tableA.
     * await sdb.renameColumns("tableA", {"How old?" : "age", "Man or woman?": "sex"})
     * ```
     *
     * @param table - The table in which columns will be renamed.
     * @param names - An object mapping old column names to new column names.
     * @param options - An optional object with configuration options:
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     *
     * @category Restructuring data
     */
    async renameColumns(
        table: string,
        names: { [key: string]: string },
        options: {
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nrenameColumns()")

        return await queryDB(
            this.connection,
            this.runQuery,
            renameColumnQuery(table, Object.keys(names), Object.values(names)),
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Restructures a table by stacking values. Useful to tidy up data.
     *
     * As an example, let's use this as tableA. Let's say it shows the number of employees per year in different departments.
     *
     * | Department | 2021 | 2022 | 2023 |
     * | ---------- | ---- | ---- | ---- |
     * | Accounting | 10   | 9    | 15   |
     * | Sales      | 52   | 75   | 98   |
     *
     * We restructure it by putting all years into a column *Year* and the employees counts into a column *Employees*.
     *
     * ```ts
     * await sdb.longer("tableA", ["2021", "2022", "2023"], "year", "employees")
     * ```
     *
     * Now, the table looks like this and is longer.
     *
     * | Department | Year | Employees |
     * | ---------- | ---- | --------- |
     * | Accounting | 2021 | 10        |
     * | Accounting | 2022 | 9         |
     * | Accounting | 2023 | 15        |
     * | Sales      | 2021 | 52        |
     * | Sales      | 2022 | 75        |
     * | Sales      | 2023 | 98        |
     *
     * @param table - The name of the table to be restructured.
     * @param columns - The column names (and associated values) that we want to stack.
     * @param columnsTo - The new column in which the stacked columns' names will be put into.
     * @param valuesTo - The new column in which the stacked columns' values will be put into.
     * @param options - An optional object with configuration options:
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     *
     * @category Restructuring data
     */
    async longer(
        table: string,
        columns: string[],
        columnsTo: string,
        valuesTo: string,
        options: {
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nlonger()")
        return await queryDB(
            this.connection,
            this.runQuery,
            `CREATE OR REPLACE TABLE ${table} AS SELECT * FROM (UNPIVOT ${table}
        ON ${columns.map((d) => `"${d}"`).join(", ")}
        INTO
            NAME ${columnsTo}
            VALUE ${valuesTo})`,
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Restructures a table by unstacking values.
     *
     * As an example, let's use this as tableA. Let's say it shows the number of employees per year in different departments.
     *
     * | Department | Year | Employees |
     * | ---------- | ---- | --------- |
     * | Accounting | 2021 | 10        |
     * | Accounting | 2022 | 9         |
     * | Accounting | 2023 | 15        |
     * | Sales      | 2021 | 52        |
     * | Sales      | 2022 | 75        |
     * | Sales      | 2023 | 98        |
     *
     * We restructure it by making a new column for each year and with the associated employees counts as values.
     *
     * ```ts
     * await sdb.longer("tableA", "Year", "Employees")
     * ```
     *
     * Now, the table looks like this and is wider.
     *
     * | Department | 2021 | 2022 | 2023 |
     * | ---------- | ---- | ---- | ---- |
     * | Accounting | 10   | 9    | 15   |
     * | Sales      | 52   | 75   | 98   |
     *
     * @param table - The name of the table to be restructured.
     * @param columnsFrom - The column containing the values that will be transformed as columns.
     * @param valuesFrom - The column containing values to be spread across the new columns.
     * @param options - An optional object with configuration options:
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     *
     * @category Restructuring data
     */
    async wider(
        table: string,
        columnsFrom: string,
        valuesFrom: string,
        options: {
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nwider()")
        return await queryDB(
            this.connection,
            this.runQuery,
            `CREATE OR REPLACE TABLE ${table} AS SELECT * FROM (PIVOT ${table} ON "${columnsFrom}" USING FIRST("${valuesFrom}"))`,
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Converts data types (JavaScript or SQL types) of specified columns in a table.
     *
     * ```ts
     * // Convert columns to string and number
     * await sdb.convert("tableA", {column1: "string", column2: "integer"})
     * // Same thing
     * await sdb.convert("tableA", {column1: "varchar", column2: "bigint"})
     * // Convert a string to a date
     * await sdb.convert("tableA", {column3: "datetime"}, {datetimeFormat: "%Y-%m-%d" })
     * ```
     *
     * @param table - The name of the table where data types will be converted.
     * @param types - An object mapping column names to the target data types for conversion.
     * @param options - An optional object with configuration options:
     *   - try: When true, the values that can't be converted will be replaced by NULL instead of throwing an error. Defaults to false.
     *   - datetimeFormat: A string specifying the format for date and time conversions. The method uses strftime and strptime functions from DuckDB. For the format specifiers, see https://duckdb.org/docs/sql/functions/dateformat.
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     *
     * @category Restructuring data
     */
    async convert(
        table: string,
        types: {
            [key: string]:
                | "integer"
                | "float"
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
        },
        options: {
            try?: boolean
            datetimeFormat?: string
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nconvert()")

        const allTypes = await this.getTypes(table)
        const allColumns = Object.keys(allTypes)

        return await queryDB(
            this.connection,
            this.runQuery,
            convertQuery(
                table,
                Object.keys(types),
                Object.values(types),
                allColumns,
                allTypes,
                options
            ),
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Removes one or more tables from the database.
     *
     * ```ts
     * await sdb.removeTables(["table1", "table2"])
     * ```
     *
     * @param tables - The name or an array of names of the tables to be removed.
     * @param options - An optional object with configuration options:
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *
     * @category Restructuring data
     */
    async removeTables(
        tables: string | string[],
        options: {
            debug?: boolean
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nremoveTables()")

        return await queryDB(
            this.connection,
            this.runQuery,
            stringToArray(tables)
                .map((d) => `DROP TABLE ${d};`)
                .join("\n"),
            mergeOptions(this, { ...options, table: null })
        )
    }

    /**
     * Removes one or more columns from a table.
     *
     * ```ts
     * await sdb.removeColumns("tableA", ["column1", "column2"])
     * ```
     *
     * @param table - The name of the table from which columns will be removed.
     * @param columns - The name or an array of names of the columns to be removed.
     * @param options - An optional object with configuration options:
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     *
     * @category Restructuring data
     */
    async removeColumns(
        table: string,
        columns: string | string[],
        options: {
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nremoveColumns()")

        return await queryDB(
            this.connection,
            this.runQuery,
            stringToArray(columns)
                .map((d) => `ALTER TABLE ${table} DROP "${d}";`)
                .join("\n"),
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Adds a new column to a table based on a type (JavaScript or SQL types) and a SQL definition.
     *
     * ```ts
     * await sdb.addColumn("tableA", "column3", "float", "column1 + column2")
     * ```
     *
     * @param table - The name of the table to which the new column will be added.
     * @param column - The name of the new column to be added.
     * @param type - The data type for the new column. JavaScript or SQL types.
     * @param definition - SQL expression defining how the values should be computed for the new column.
     * @param options - An optional object with configuration options:
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     *
     * @category Restructuring data
     */
    async addColumn(
        table: string,
        column: string,
        type:
            | "integer"
            | "float"
            | "string"
            | "date"
            | "time"
            | "datetime"
            | "datetimeTz"
            | "bigint"
            | "double"
            | "varchar"
            | "timestamp"
            | "timestamp with time zone",
        definition: string,
        options: {
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\naddColumn()")
        return await queryDB(
            this.connection,
            this.runQuery,
            `ALTER TABLE ${table} ADD "${column}" ${parseType(type)};
            UPDATE ${table} SET "${column}" = ${definition}`,
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Merges the data of two tables based on a common column and put the result in a new table.
     *
     * ```ts
     * // Do a left join of tableA (left) and tableB (right) based on the common column id. The result is put into tableC.
     * await sdb.join("tableA", "tableB", "id", "left", "tableC",)
     * ```
     *
     * @param leftTable - The name of the left table to be joined.
     * @param rightTable - The name of the right table to be joined.
     * @param commonColumn - The common column used for the join operation.
     * @param join - The type of join operation to perform. Possible values are "inner", "left", "right", or "full".
     * @param outputTable - The name of the new table that will store the result of the join operation.
     * @param options - An optional object with configuration options:
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     *
     * @category Restructuring data
     */
    async join(
        leftTable: string,
        rightTable: string,
        commonColumn: string,
        join: "inner" | "left" | "right" | "full",
        outputTable: string,
        options: {
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\njoin()")

        return await queryDB(
            this.connection,
            this.runQuery,
            joinQuery(leftTable, rightTable, commonColumn, join, outputTable),
            mergeOptions(this, {
                ...options,
                table: outputTable,
            })
        )
    }

    /**
     * Creates a new empty table with specified columns and data types.
     * 
     * ```ts
     *  await sdb.createTable("employees", {
        name: "string",
        salary: "integer",
        raise: "float",
    })
     * ```
     *
     * @param table - The name of the table.
     * @param types - An object specifying the columns and their data types.
     * @param options - An optional object with configuration options:
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     * 
     * @category Restructuring data
     */
    async createTable(
        table: string,
        types: {
            [key: string]:
                | "integer"
                | "float"
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
        },
        options: {
            debug?: boolean
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\ncreateTable()")
        return await queryDB(
            this.connection,
            this.runQuery,
            `CREATE TABLE ${table} (${Object.keys(types)
                .map((d) => `"${d}" ${parseType(types[d])}`)
                .join(", ")});`,
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Replaces specified strings in the selected columns of a table.
     *
     *```ts
     * // Replaces entire strings and substrings too.
     * await sdb.replaceStrings("tableA", "column1", {"kilograms": "kg", liters: "l" })
     *
     * // Replaces only if matching entire string.
     * await sdb.replaceStrings("tableA", "column1", {"kilograms": "kg", liters: "l" }, {entireString: true})
     * ```
     *
     * @param table - The name of the table in which strings will be replaced.
     * @param columns - Either a string or an array of strings specifying the columns where string replacements will occur.
     * @param strings - An object mapping old strings to new strings.
     * @param options - An optional object with configuration options:
     *   - entireString: A boolean indicating whether the entire string must match for replacement. Defaults to false.
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     *
     * @category Updating data
     */
    async replaceStrings(
        table: string,
        columns: string | string[],
        strings: { [key: string]: string },
        options: {
            entireString?: boolean
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nreplaceStrings()")
        options.entireString = options.entireString ?? false
        return await queryDB(
            this.connection,
            this.runQuery,
            replaceStringsQuery(
                table,
                stringToArray(columns),
                Object.keys(strings),
                Object.values(strings),
                options
            ),
            mergeOptions(this, {
                ...options,
                table,
            })
        )
    }

    /**
     * Concatenates values from specified columns into a new column in a table.
     *
     * ```ts
     * // Concatenates values from column1 and column2 into column3
     * await sdb.concatenate("tableA", ["column1", "column2"], "column3")
     *
     * // Same thing, but the values will be separated by a dash
     * await sdb.concatenate("tableA", ["column1", "column2"], "column3", {separator: "-"})
     * ```
     *
     * @param table - The name of the table where concatenation will occur.
     * @param columns - An array of column names from which values will be concatenated.
     * @param newColumn - The name of the new column to store the concatenated values.
     * @param options - An optional object with configuration options:
     *   - separator: The string used to separate concatenated values. Defaults to an empty string.
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     *
     * @category Updating data
     */
    async concatenate(
        table: string,
        columns: string[],
        newColumn: string,
        options: {
            separator?: string
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nconcatenate()")
        return await queryDB(
            this.connection,
            this.runQuery,
            concatenateQuery(table, columns, newColumn, options),
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Rounds numeric values in specified columns of a table.
     *
     * ```ts
     * // Round to the nearest integer.
     * await sdb.round("tableA", "column1")
     *
     * // Round with a specific number of decimal places.
     * await sdb.round("tableA", "column1", {decimals: 2})
     *
     * // Round with a specific method. Other methods are "round" and "ceiling".
     * await sdb.round("tableA", "column1", {method: "floor"})
     *
     * ```
     *
     * @param table - The name of the table where numeric values will be rounded.
     * @param columns - Either a string or an array of strings specifying the columns containing numeric values to be rounded.
     * @param options - An optional object with configuration options:
     *   - decimals: The number of decimal places to round to. Defaults to 0.
     *   - method: The rounding method to use ("round", "ceiling", or "floor"). Defaults to "round".
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     *
     * @category Updating data
     */
    async round(
        table: string,
        columns: string | string[],
        options: {
            decimals?: number
            method?: "round" | "ceiling" | "floor"
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nround()")
        return await queryDB(
            this.connection,
            this.runQuery,
            roundQuery(table, stringToArray(columns), options),
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Sorts the rows of a table based on specified column(s) and order(s).
     * ```ts
     * // Sort column1 ascendingly then column2 descendingly.
     * await sdb.sort("tableA", {column1: "asc", column2: "desc"})
     * // Same thing but taking French accent into account.
     * await sdb.sort("tableA", {column1: "asc", column2: "desc"}, {lang: {column1: "fr"}})
     * ```
     * @param table - The name of the table to sort.
     * @param order - An object mapping column names to the sorting order: "asc" for ascending or "desc" for descending.
     * @param options - An optional object with configuration options:
     *   - lang: An object mapping column names to language codes. See DuckDB Collations documentation for more: https://duckdb.org/docs/sql/expressions/collations.
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     *
     * @category Updating data
     */
    async sort(
        table: string,
        order: { [key: string]: "asc" | "desc" },
        options: {
            lang?: { [key: string]: string }
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nsort()")
        return await queryDB(
            this.connection,
            this.runQuery,
            sortQuery(table, order, options),
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Assigns ranks in a new column based on specified column values within a table.
     *
     * ```ts
     * // Computing ranks in the new column rank from the column1 values.
     * await sdb.ranks("tableA", "column1", "rank")
     *
     * * // Computing ranks in the new column rank from the column1 values. Using the values from column2 as categories.
     * await sdb.ranks("tableA", "column1", "rank", {categories: "column2"})
     * ```
     *
     * @param table - The name of the table.
     * @param values - The column containing values to be used for ranking.
     * @param newColumn - The name of the new column where the ranks will be stored.
     * @param options - An optional object with configuration options:
     *   - categories: The column or columns that define categories for ranking.
     *   - noGaps: A boolean indicating whether to assign ranks without gaps. Defaults to false.
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     *
     * @category Analyzing data
     */
    async ranks(
        table: string,
        values: string,
        newColumn: string,
        options: {
            categories?: string | string[]
            noGaps?: boolean
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nranks()")
        return await queryDB(
            this.connection,
            this.runQuery,
            ranksQuery(table, values, newColumn, options),
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Assigns quantiles for specified column values within a table.
     *
     * ```ts
     * // Assigning a quantile from 1 to 10 for each row in new column quantiles, based on values from column1.
     * await sdb.quantiles("tableA", "column1", 10, "quantiles")
     * // Same thing, except the values in column2 are used as categories.
     * await sdb.quantiles("tableA", "column1", 10, "quantiles", {categories: "column2"})
     * ```
     *
     * @param table - The name of the table.
     * @param values - The column containing values from which quantiles will be assigned.
     * @param nbQuantiles - The number of quantiles.
     * @param newColumn - The name of the new column where the assigned quantiles will be stored.
     * @param options - An optional object with configuration options:
     *   - categories: The column or columns that define categories for computing quantiles. This can be a single column name or an array of column names.
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     *
     * @category Analyzing data
     */
    async quantiles(
        table: string,
        values: string,
        nbQuantiles: number,
        newColumn: string,
        options: {
            categories?: string | string[]
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nquantiles()")
        return await queryDB(
            this.connection,
            this.runQuery,
            quantilesQuery(table, values, nbQuantiles, newColumn, options),
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Assigns bins for specified column values within a table, based on a interval size.
     *
     * ```ts
     * // Assigning a bin for each row in new column bins based on column1 values, with an interval of 10.
     * await sdb.bins("tableA", "column1", 10, "bins")
     * // If the minimum value in column1 is 5, the bins will follow this pattern: "[5-14]", "[15-24]", "[25-34]", etc.
     *
     * // Same thing, but with the bins starting at a specific value.
     * await sdb.bins("tableA", "column1", 10, "bins", {startValue: 0})
     * // The bins will follow this pattern: "[0-9]", "[10-19]", "[20-29]", etc.
     * ```
     *
     * @param table - The name of the table for which bins will be computed.
     * @param values - The column containing values from which bins will be computed.
     * @param interval - The interval size for binning the values.
     * @param newColumn - The name of the new column where the bins will be stored.
     * @param options - An optional object with configuration options:
     *   - startValue: The starting value for binning. Defaults to the minimum value in the specified column.
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     *
     * @category Analyzing data
     */
    async bins(
        table: string,
        values: string,
        interval: number,
        newColumn: string,
        options: {
            startValue?: number
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nbins()")
        return await queryDB(
            this.connection,
            this.runQuery,
            await binsQuery(this, table, values, interval, newColumn, options),
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Computes proportions within a row for specified columns in a given table.
     *
     * For example, let's say this is tableA.
     *
     * | Year | Men | Women | NonBinary |
     * | ---- | --- | ----- | ----------|
     * |2021  | 564 | 685   | 145       |
     * |2022  | 354 | 278   | 56        |
     * |2023  | 856 | 321   | 221       |
     *
     * We compute the proportions of men, women, and non-binary on each row.
     * ```ts
     * await sdb.proportionsHorizontal("tableA", ["Men", "Women", "NonBinary"])
     * ```
     *
     * The table now looks like this.
     *
     * | Year | Men | Women | NonBinary | MenPerc | WomenPerc | NonBinaryPerc |
     * | ---- | --- | ----- | --------- | ------- | --------- | ------------- |
     * |2021  | 564 | 685   | 145       | 0.4     | 0.49      | 0.10          |
     * |2022  | 354 | 278   | 56        | 0.51    | 0.4       | 0.08          |
     * |2023  | 856 | 321   | 221       | 0.61    | 0.23      | 0.16          |
     *
     * By default, the new columns have the suffix "Perc", but you use something else if you want.
     * ```ts
     * await sdb.proportionsHorizontal("tableA", ["Men", "Women", "NonBinary"], {suffix: "Prop"})
     * ```
     *
     * Here's the result with a different suffix.
     *
     * | Year | Men | Women | NonBinary | MenProp | WomenProp | NonBinaryProp |
     * | ---- | --- | ----- | --------- | ------- | --------- | ------------- |
     * |2021  | 564 | 685   | 145       | 0.4     | 0.49      | 0.10          |
     * |2022  | 354 | 278   | 56        | 0.51    | 0.4       | 0.08          |
     * |2023  | 856 | 321   | 221       | 0.61    | 0.23      | 0.16          |
     *
     * @param table - The name of the table.
     * @param columns - The columns for which proportions will be computed on each row.
     * @param options - An optional object with configuration options:
     *   - suffix: A string suffix to append to the names of the new columns storing the computed proportions. Defaults to "Perc".
     *   - decimals: The number of decimal places to round the computed proportions. Defaults to 2.
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     *
     * @category Analyzing data
     */
    async proportionsHorizontal(
        table: string,
        columns: string[],
        options: {
            suffix?: string
            decimals?: number
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) &&
            console.log("\nproportionsHorizontal()")
        return await queryDB(
            this.connection,
            this.runQuery,
            proportionsHorizontalQuery(table, columns, options),
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Computes proportions over a column values within a table.
     *
     * ```ts
     * // This will add a column column1Perc with the result of each column1 value divided by the sum of all column1 values.
     * await sdb.proportionsVertical("tableA", "column1")
     *
     * // Same thing, but with the suffix Prop instead of Perc. The new column with the proportions will be column1Prop. Also, the proportions will have 4 decimals instead of 2 (default).
     * await sdb.proportionsVertical("tableA", "column1", {suffix: "Prop", decimals: 4})
     * ```
     *
     * @param table - The name of the table.
     * @param column - The column containing values for which proportions will be computed. The proportions are calculated based on the sum of values in the specified column.
     * @param options - An optional object with configuration options:
     *   - categories: The column or columns that define categories for computing proportions. This can be a single column name or an array of column names.
     *   - suffix: A string suffix to append to the names of the new columns storing the computed proportions. Defaults to "Perc".
     *   - decimals: The number of decimal places to round the computed proportions. Defaults to 2.
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     *
     * @category Analyzing data
     */
    async proportionsVertical(
        table: string,
        column: string,
        options: {
            categories?: string | string[]
            suffix?: string
            decimals?: number
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nproportionsVertical()")
        return await queryDB(
            this.connection,
            this.runQuery,
            proportionsVerticalQuery(table, column, options),
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Creates a summary table based on specified values, categories, and summary operations.
     *
     * ```ts
     * // Summarize all numeric columns with all available summary operations (count, min, max, mean, median, sum, skew, stdDev, and var) and put the result in tableB.
     * await sdb.summarize("tableA", "tableB")
     *
     * // Summarize a specific column with all available summary operations. Values can be an array of column names, too.
     * await sdb.summarize("tableA", "tableB", {values: "column1"})
     *
     * // Summarize a specific column with all available summary operations and use the values in another column as categories. Categories can be an array of column names, too.
     * await sdb.summarize("tableA", "tableB", {values: "column1", categories: "column2"})
     *
     * // Summarize a specific column with a specific summary operation and use the values in another column as categories. Summaries can be an array of summary operations, too.
     * await sdb.summarize("tableA", "tableB", {values: "column1", categories: "column2", summaries: "mean"})
     *
     * // Summarize and round values with a specific number of decimal places (default is 2).
     * await sdb.summarize("tableA", "tableB", {values: "column1", categories: "column2", summaries: "mean", decimals: 4})
     * ```
     *
     * @param table - The name of the table to be summarized.
     * @param outputTable - The name of the new table that will store the result.
     * @param options - An optional object with configuration options:
     *   - values: The column or columns whose values will be summarized. This can be a single column name or an array of column names.
     *   - categories: The column or columns that define categories for the summarization. This can be a single column name or an array of column names.
     *   - summaries: The summary operations to be performed. This can be a single summary operation or an array of summary operations. Possible values are "count", "min", "max", "mean", "median", "sum", "skew", "stdDev", and "var".
     *   - decimals: The number of decimal places to round the summarized values. Defaults to 2.
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     *
     * @category Analyzing data
     */
    async summarize(
        table: string,
        outputTable: string,
        options: {
            values?: string | string[]
            categories?: string | string[]
            summaries?:
                | (
                      | "count"
                      | "min"
                      | "max"
                      | "mean"
                      | "median"
                      | "sum"
                      | "skew"
                      | "stdDev"
                      | "var"
                  )
                | (
                      | "count"
                      | "min"
                      | "max"
                      | "mean"
                      | "median"
                      | "sum"
                      | "skew"
                      | "stdDev"
                      | "var"
                  )[]
            decimals?: number
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        return await summarize(this, table, outputTable, options)
    }

    /**
     * Calculates correlations between columns in a table.
     *
     * If no *x* and *y* columns are specified, the method computes the correlations of all numeric column *combinations*. It's important to note that correlation is symmetrical: the correlation of *x* over *y* is the same as *y* over *x*.
     *
     * ```ts
     * // Compute all correlations between all numeric columns in tableA and put the results in tableB.
     * await sdb.correlations("tableA", "tableB")
     *
     * // Compute all correlations between a specific x column and all other numeric columns.
     * await sdb.correlations("tableA", "tableB", {x: "column1"})
     *
     * // Compute the correlations between a specific x and y columns.
     * await sdb.correlations("tableA", "tableB", {x: "column1", y: "column2"})
     * ```
     *
     * @param table - The name of the table.
     * @param outputTable - The name of the new table that will store the results.
     * @param options - An optional object with configuration options:
     *   - x: The column name for the x values. Default is all numeric columns.
     *   - y: The column name for the y values. Default is all numeric columns.
     *   - decimals: The number of decimal places to round the correlation values. Defaults to 2.
     *   - order: The order of correlation values in the output table. Possible values are "asc" (ascending) or "desc" (descending). Defaults to "desc".
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     *
     * @category Analyzing data
     */
    async correlations(
        table: string,
        outputTable: string,
        options: {
            x?: string
            y?: string
            decimals?: number
            order?: "asc" | "desc"
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        return await correlations(this, table, outputTable, options)
    }

    /**
     * Performs linear regression analysis and creates a table with regression results. The results include the slope, the y-intercept the R-squared.
     *
     * If no *x* and *y* columns are specified, the method computes the linear regression analysis of all numeric column *permutations*. It's important to note that linear regression analysis is asymmetrical: the linear regression of *x* over *y* is not the same as *y* over *x*.
     *
     * ```ts
     * // Compute all linear regressions between all numeric columns in tableA and put the results in tableB.
     * await sdb.linearRegressions("tableA", "tableB")
     *
     * // Compute all linear regressions between a specific x column and all other numeric columns.
     * await sdb.linearRegressions("tableA", "tableB", {x: "column1"})
     *
     * // Compute the linear regression between a specific x and y columns.
     * await sdb.linearRegressions("tableA", "tableB", {x: "column1", y: "column2"})
     * ```
     *
     * @param table - The name of the table.
     * @param outputTable - The name of the new table that will store the linear regression results.
     * @param options - An optional object with configuration options:
     *   - x: The column name for the independent variable (x values) in the linear regression analysis.
     *   - y: The column name for the dependent variable (y values) in the linear regression analysis.
     *   - decimals: The number of decimal places to round the regression coefficients. Defaults to 2.
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     *
     * @category Analyzing data
     */
    async linearRegressions(
        table: string,
        outputTable: string,
        options: {
            x?: string
            y?: string
            decimals?: number
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        return await linearRegressions(this, table, outputTable, options)
    }

    /**
     * Identifies outliers using the Interquartile Range (IQR) method.
     *
     * ```ts
     * // Looks for outliers in column age from table1. Creates a new column ageOutliers with TRUE or FALSE values. "Outliers" is the default suffix for the new column.
     * await sdb.outliersIQR("table1", "age")
     *
     * // Same thing, but overrides the default suffix "Outliers". The new column with TRUE or FALSE values will be ageOut.
     * await sdb.outliersIQR("table1", "age", {suffix: "Out"})
     * ```
     *
     * @param table - The name of the table containing the column for outlier detection.
     * @param column - The name of the column in which outliers will be identified.
     * @param options - An optional object with configuration options:
     *   - suffix: The suffix to be appended to the new column storing the outlier flags.
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     *
     * @category Analyzing data
     */
    async outliersIQR(
        table: string,
        column: string,
        options: {
            suffix?: string
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\noutliersIQR()")
        return await queryDB(
            this.connection,
            this.runQuery,
            outliersIQRQuery(
                table,
                column,
                (await this.getLength(table)) % 2 === 0 ? "even" : "odd",
                options
            ),
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Calculates the Z-Score.
     *
     * ```ts
     * // Calculates the Z-score for the values in column age and puts the results in a column ageZ. "Z" is the default suffix for the new column.
     * await sdb.zScore("table1", "age")
     *
     * // Same thing but overrides the suffix value. Here, the new column with the Z-scores will be named ageSigma.
     * await sdb.zScore("table1", "age", {suffix: "Sigma"})
     * ```
     *
     * @param table - The name of the table.
     * @param column - The name of the column for which Z-Score will be calculated.
     * @param options - An optional object with configuration options:
     *   - suffix: An optional suffix to append to the new column name storing the Z-Score values.
     *   - decimals: The number of decimal places to round the Z-Score values. Defaults to 2.
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     *
     * @category Analyzing data
     */
    async zScore(
        table: string,
        column: string,
        options: {
            suffix?: string
            decimals?: number
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nzScore()")
        options.decimals = options.decimals ?? 2
        return await queryDB(
            this.connection,
            this.runQuery,
            zScoreQuery(table, column, options),
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Executes a custom SQL query, providing flexibility for advanced users.
     *
     * ```ts
     * // You can use the returnDataFrom option to retrieve the data from the query, if needed. Default is "none".
     * await sdb.customQuery( "SELECT * FROM employees WHERE Job = 'Clerk'", {returnDataFrom: "query"})
     * ```
     *
     * @param query - The custom SQL query to be executed.
     * @param options - An optional object with configuration options:
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - table: The name of the table associated with the query (if applicable). Needed when debug is true.
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     */
    async customQuery(
        query: string,
        options: {
            returnDataFrom?: "query" | "table" | "none"
            table?: string
            returnedDataModifier?: (
                rows: {
                    [key: string]: number | string | Date | boolean | null
                }[]
            ) => {
                [key: string]: number | string | Date | boolean | null
            }[]
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\ncustomQuery()")
        return await queryDB(
            this.connection,
            this.runQuery,
            query,
            mergeOptions(this, { ...options, table: options.table ?? null })
        )
    }

    /**
     * Updates data in a table using a JavaScript function. The function
     * takes the existing rows as an array of objects and must return them modified as an array of objects. This method provides a flexible way to update data, but it's slow.
     *
     * ```ts
     * // Adds one to the values from column1 in tableA. If the values are not numbers, they are replaced by null.
     * await sdb.updateWithJS("tableA", (rows) => {
     *  const modifiedRows = rows.map(d => ({
     *      ...d,
     *      column1: typeof d.column1 === "number" ? d.column1 + 1 : null
     *  }))
     *  return modifiedRows
     * })
     * ```
     *
     * @param table - The name of the table to update.
     * @param dataModifier - A function that takes the existing rows and returns modified rows using JavaScript logic. The original rows are objects in an array and the modified rows must be returned as an array of objects too.
     * @param options - An optional object with configuration options:
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     */
    async updateWithJS(
        table: string,
        dataModifier: (
            rows: {
                [key: string]: number | string | Date | boolean | null
            }[]
        ) => {
            [key: string]: number | string | Date | boolean | null
        }[],
        options: {
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nupdateWithJS()")
        const oldData = await this.getData(
            table,
            mergeOptions(this, { ...options, table })
        )
        if (!oldData) {
            throw new Error("No data from getData.")
        }
        const newData = dataModifier(oldData)
        const updatedData = await queryDB(
            this.connection,
            this.runQuery,
            loadArrayQuery(table, newData, { replace: true }),
            mergeOptions(this, { ...options, table })
        )

        return updatedData
    }

    /**
     * Returns the schema (column names and their data types) of a specified table.
     *
     * ```ts
     * const schema = await sdb.getSchema("tableA")
     * // Or if you just want to log it.
     * await sdb.getSchema("tableA", {debug: true})
     * ```
     *
     * @param table - The name of the table for which to retrieve the schema.
     * @param options - An optional object with configuration options:
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     */
    async getSchema(
        table: string,
        options: {
            debug?: boolean
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\ngetSchema()")
        return await queryDB(
            this.connection,
            this.runQuery,
            `DESCRIBE ${table}`,
            mergeOptions(this, {
                ...options,
                returnDataFrom: "query",
                nbRowsToLog: Infinity,
                table,
            })
        )
    }

    /**
     * Returns descriptive information about the columns of a specified table, including details like data types, number of null and distinct values. Best to look at with console.table.
     *
     * ```ts
     * const description = await sdb.getDescription("tableA")
     * // Or if you just want to log it.
     * await sdb.getDescription("tableA", {debug: true})
     * ```
     *
     * @param table - The name of the table.
     * @param options - An optional object with configuration options:
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     */

    async getDescription(
        table: string,
        options: {
            debug?: boolean
        } = {}
    ) {
        return await getDescription(this, table, options)
    }

    /**
     * Returns the list of tables in the database.
     * ```ts
     * const tables = await sdb.getTables()
     * ```
     * @param options - An optional object with configuration options:
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     */
    async getTables(
        options: {
            debug?: boolean
        } = {}
    ) {
        return getTables(this, options)
    }

    /**
     * Returns true if a specified table exists in the database and false if not.
     *
     * ```ts
     * const hasEmployees = await sdb.hasTable("employees")
     * ```
     *
     * @param table - The name of the table to check for existence.
     * @param options - An optional object with configuration options:
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     */
    async hasTable(table: string, options: { debug?: boolean } = {}) {
        ;(options.debug || this.debug) && console.log("\nhasTable()")
        return (await this.getTables(options)).includes(table)
    }

    /**
     * Return the list of column names for a specified table in the database.
     *
     * ```ts
     * const columns = await sdb.getColumns("dataCsv")
     * ```
     *
     * @param table - The name of the table for which to retrieve column names.
     * @param options - An optional object with configuration options:
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     */
    async getColumns(
        table: string,
        options: {
            debug?: boolean
        } = {}
    ) {
        return await getColumns(this, table, options)
    }

    /**
     * Returns true if a specified column exists in a given table and false if not.
     *
     * ```ts
     * const hasColumnSalary = await sdb.hasColumn("employees", "salary")
     * ```
     *
     * @param table - The name of the table.
     * @param column - The name of the column to check for existence.
     * @param options - An optional object with configuration options:
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     */
    async hasColumn(
        table: string,
        column: string,
        options: {
            debug?: boolean
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nhasColumn()")
        return (await getColumns(this, table, options)).includes(column)
    }

    /**
     * Returns the number of columns (width) in a table.
     *
     * ```ts
     * const nbColumns = await sdb.getWidth("tableA")
     * // Or if you just want to log it
     * await sdb.getWidth("tableA", {debug: true})
     * ```
     *
     * @param table - The name of the table.
     * @param options - An optional object with configuration options:
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     */
    async getWidth(
        table: string,
        options: {
            debug?: boolean
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\ngetWidth()")
        return (await getColumns(this, table, options)).length
    }

    /**
     * Returns the number of rows (length) in a table.
     *
     * ```ts
     * const nbRows = await sdb.getLength("tableA")
     * // Or if you just want to log it
     * await sdb.getLength("tableA", {debug: true})
     * ```
     *
     * @param table - The name of the table.
     * @param options - An optional object with configuration options:
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     */
    async getLength(
        table: string,
        options: {
            debug?: boolean
        } = {}
    ) {
        return await getLength(this, table, options)
    }

    /**
     * Returns the number of data points (cells/values) in a table.
     *
     * ```ts
     * const nbDataPoints = await sdb.getValuesCount("tableA")
     * // Or if you just want to log it
     * await sdb.getValuesCount("tableA", {debug: true})
     * ```
     *
     * @param table - The name of the table .
     * @param options - An optional object with configuration options:
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     */
    async getValuesCount(
        table: string,
        options: {
            debug?: boolean
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\ngetValuesCount()")
        return (
            (await this.getWidth(table, options)) *
            (await this.getLength(table, options))
        )
    }

    /**
     * Returns the data types of columns in a table.
     *
     * ```ts
     * const dataTypes = await sdb.getTypes("tableA")
     * // Or if you just want to log it
     * await sdb.getTypes("tableA", {debug: true})
     * ```
     *
     * @param table - The name of the table.
     * @param options - An optional object with configuration options:
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     */
    async getTypes(
        table: string,
        options: {
            debug?: boolean
        } = {}
    ) {
        return await getTypes(this, table, options)
    }

    /**
     * Returns the values of a specific column in a table.
     *
     * ```ts
     * const values = await sdb.getValues("tableA", "column1")
     * ```
     *
     * @param table - The name of the table.
     * @param column - The name of the column.
     * @param options - An optional object with configuration options:
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     *
     * @category Getting data
     */
    async getValues(
        table: string,
        column: string,
        options: {
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        return await getValues(this, table, column, options)
    }

    /**
     * Returns the minimum value from a specific column in a table.
     *
     * ```ts
     * const minimum = sdb.getMin("tableA", "column1")
     * ```
     *
     * @param table - The name of the table.
     * @param column - The name of the column.
     * @param options - An optional object with configuration options:
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *
     * @category Getting data
     */
    async getMin(
        table: string,
        column: string,
        options: {
            debug?: boolean
        } = {}
    ) {
        return await getMin(this, table, column, options)
    }

    /**
     * Returns the maximum value from a specific column in a table.
     *
     * ```ts
     * const maximum = sdb.getMax("tableA", "column1")
     * ```
     *
     * @param table - The name of the table.
     * @param column - The name of the column.
     * @param options - An optional object with configuration options:
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *
     * @category Getting data
     */
    async getMax(
        table: string,
        column: string,
        options: {
            debug?: boolean
        } = {}
    ) {
        return await getMax(this, table, column, options)
    }

    /**
     * Returns the mean value from a specific column in a table.
     *
     * ```ts
     * const mean = sdb.getMean("tableA", "column1")
     * ```
     *
     * @param table - The name of the table.
     * @param column - The name of the column.
     * @param options - An optional object with configuration options:
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - decimals: The number of decimal places to round the result to. All decimals are kept by default.
     *
     * @category Getting data
     */
    async getMean(
        table: string,
        column: string,
        options: {
            decimals?: number
            debug?: boolean
        } = {}
    ) {
        return await getMean(this, table, column, options)
    }

    /**
     * Returns the median value from a specific column in a table.
     *
     * ```ts
     * const median = sdb.getMedian("tableA", "column1")
     * ```
     *
     * @param table - The name of the table.
     * @param column - The name of the column.
     * @param options - An optional object with configuration options:
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - decimals: The number of decimal places to round the result to. All decimals are kept by default.
     *
     * @category Getting data
     */
    async getMedian(
        table: string,
        column: string,
        options: {
            decimals?: number
            debug?: boolean
        } = {}
    ) {
        return await getMedian(this, table, column, options)
    }

    /**
     * Returns the sum of values from a specific column in a table.
     *
     * ```ts
     * const sum = sdb.getSum("tableA", "column1")
     * ```
     *
     * @param table - The name of the table.
     * @param column - The name of the column.
     * @param options - An optional object with configuration options:
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *
     * @category Getting data
     */
    async getSum(
        table: string,
        column: string,
        options: {
            debug?: boolean
        } = {}
    ) {
        return await getSum(this, table, column, options)
    }

    /**
     * Returns the skewness of values from a specific column in a table.
     *
     * ```ts
     * const skew = sdb.getSkew("tableA", "column1")
     * ```
     *
     * @param table - The name of the table.
     * @param column - The name of the column.
     * @param options - An optional object with configuration options:
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - decimals: The number of decimal places to round the result to. All decimals are kept by default.
     *
     * @category Getting data
     */
    async getSkew(
        table: string,
        column: string,
        options: {
            decimals?: number
            debug?: boolean
        } = {}
    ) {
        return await getSkew(this, table, column, options)
    }

    /**
     * Returns the standard deviation of values from a specific column in a table.
     *
     * ```ts
     * const standardDeviation = sdb.getStdDev("tableA", "column1")
     * ```
     *
     * @param table - The name of the table.
     * @param column - The name of the column.
     * @param options - An optional object with configuration options:
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - decimals: The number of decimal places to round the result to. All decimals are kept by default.
     *
     * @category Getting data
     */
    async getStdDev(
        table: string,
        column: string,
        options: {
            decimals?: number
            debug?: boolean
        } = {}
    ) {
        return await getStdDev(this, table, column, options)
    }

    /**
     * Returns the variance of values from a specific column in a table.
     *
     * ```ts
     * const variance = sdb.getVar("tableA", "column1")
     * ```
     *
     * @param table - The name of the table.
     * @param column - The name of the column.
     * @param options - An optional object with configuration options:
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - decimals: The number of decimal places to round the result to. All decimals are kept by default.
     *
     * @category Getting data
     */
    async getVar(
        table: string,
        column: string,
        options: {
            decimals?: number
            debug?: boolean
        } = {}
    ) {
        return await getVar(this, table, column, options)
    }

    /**
     * Returns the value of a specific quantile from the values in a given column of a table.
     *
     * ```ts
     * const firstQuartile = sdb.getQuantile("tableA", "column1", 0.25)
     * ```
     *
     * @param table - The name of the table.
     * @param column - The name of the column from which to calculate the quantile.
     * @param quantile - The quantile (between 0 and 1) to calculate. For example, 0.25 for the first quartile.
     * @param options - An optional object with configuration options:
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - decimals: The number of decimal places to round the result to. All decimals are kept by default.
     *
     * @category Getting data
     */
    async getQuantile(
        table: string,
        column: string,
        quantile: number,
        options: { decimals?: number; debug?: boolean } = {}
    ) {
        return await getQuantile(this, table, column, quantile, options)
    }

    /**
     * Returns unique values from a specific column in a table.
     *
     * ```ts
     * const uniques = await sdb.getUniques("tableA", "column1")
     * ```
     *
     * @param table - The name of the table.
     * @param column - The name of the column from which to retrieve unique values.
     * @param options - An optional object with configuration options:
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     *
     * @category Getting data
     */
    async getUniques(
        table: string,
        column: string,
        options: {
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        return await getUniques(this, table, column, options)
    }

    /**
     * Returns the first row from a table based on optional filtering conditions.
     *
     * ```ts
     * // No condition.
     * const firstRow = await sdb.getFirstRow("inventory")
     *
     * // With condition
     * const firstRowBooks = await sdb.getFirstRow("inventory", {condition: "category = 'Book'"})
     * ```
     *
     * @param table - The name of the table.
     * @param options - An optional object with configuration options:
     *   - condition: The filtering conditions specified as a SQL WHERE clause. Defaults to no condition.
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *
     * @category Getting data
     */
    async getFirstRow(
        table: string,
        options: {
            condition?: string
            debug?: boolean
        } = {}
    ) {
        return getFirstRow(this, table, options)
    }

    /**
     * Returns the last row from a table based on optional filtering conditions.
     *
     * ```ts
     * // No condition.
     * const lastRow = await sdb.getLastRow("inventory")
     *
     * // With condition
     * const lastRowBooks = await sdb.getLastRow("inventory", {condition: "category = 'Book'"})
     * ```
     *
     * @param table - The name of the table.
     * @param options - An optional object with configuration options:
     *   - condition: The filtering conditions specified as a SQL WHERE clause. Defaults to no condition.
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *
     * @category Getting data
     */
    async getLastRow(
        table: string,
        options: {
            condition?: string
            debug?: boolean
        } = {}
    ) {
        return getLastRow(this, table, options)
    }

    /**
     * Returns the top N rows from a table.
     *
     * ```ts
     * const top10 = await sdb.getTop("tableA", 10)
     * ```
     *
     * @param table - The name of the table.
     * @param count - The number of rows to return.
     * @param options - An optional object with configuration options:
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *
     * @category Getting data
     */
    async getTop(
        table: string,
        count: number,
        options: {
            debug?: boolean
        } = {}
    ) {
        return await getTop(this, table, count, options)
    }

    /**
     * Returns the bottom N rows from a table. The last row will be returned first. To keep the original order of the data, use the originalOrder option.
     *
     * ```ts
     * // Last row will be returned first.
     * const bottom10 = await sdb.getBottom("tableA", 10)
     *
     * // Last row will be returned last.
     * const bottom10 = await sdb.getBottom("tableA", 10, {originalOrder: true})
     * ```
     *
     * @param table - The name of the table.
     * @param count - The number of rows to return.
     * @param options - An optional object with configuration options:
     *   - originalOrder: A boolean indicating whether the rows should be returned in their original order. Default is false, meaning the last row will be returned first.
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *
     * @category Getting data
     */
    async getBottom(
        table: string,
        count: number,
        options: {
            originalOrder?: boolean
            debug?: boolean
        } = {}
    ) {
        return await getBottom(this, table, count, options)
    }

    /**
     * Returns the data from a specified table with an optional condition.
     *
     * ```ts
     * // No condition. Returns all data.
     * const data = await sdb.getData("inventory")
     *
     * // With condition
     * const books = await sdb.getData("inventory", {condition: "category = 'Book'"})
     * ```
     *
     * @param table - The name of the table from which to retrieve the data.
     * @param options - An optional object with configuration options:
     *   - condition: A SQL WHERE clause condition to filter the data. Defaults to no condition.
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     *
     * @category Getting data
     */
    async getData(
        table: string,
        options: {
            condition?: string
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\ngetData()")
        return await queryDB(
            this.connection,
            this.runQuery,
            `SELECT * from ${table}${
                options.condition ? ` WHERE ${options.condition}` : ""
            }`,
            mergeOptions(this, { ...options, returnDataFrom: "query", table })
        )
    }

    /**
     * Same as the getData method, but returns a Data type from Observable Plot. Used to pass the data directly to generate a chart without TypeScript warnings or errors.
     *
     * ```ts
     * // No condition. Returns all data.
     * const data = await sdb.getData("inventory")
     *
     * // With condition
     * const books = await sdb.getData("inventory", {condition: "category = 'Book'"})
     * ```
     *
     * @param table - The name of the table from which to retrieve the data.
     * @param options - An optional object with configuration options:
     *   - condition: A SQL WHERE clause condition to filter the data. Defaults to no condition.
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     */
    async getChartData(
        table: string,
        options: {
            condition?: string
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\ngetChartData()")
        return (await this.getData(table, options)) as Data
    }

    /**
     * Logs a specified number of rows from a table. Default is 10 rows.
     *
     * ```ts
     * await sdb.logTable("tableA");
     * ```
     *
     * @param table - The name of the table.
     * @param options - An optional object with configuration options:
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     */
    async logTable(
        table: string,
        options: {
            nbRowsToLog?: number
            debug?: boolean
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nlogTable()")
        options.debug = options.debug ?? true
        options.nbRowsToLog = options.nbRowsToLog ?? this.nbRowsToLog
        return await queryDB(
            this.connection,
            this.runQuery,
            `SELECT * FROM ${table} LIMIT ${options.nbRowsToLog}`,
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Frees up memory. Closes the connection to the database and terminates associated resources.
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
        await (this.connection as AsyncDuckDBConnection)?.close()
        await (this.db as AsyncDuckDB)?.terminate()
        this.worker?.terminate()
    }
}
