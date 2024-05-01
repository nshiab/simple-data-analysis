import { AsyncDuckDB, AsyncDuckDBConnection } from "@duckdb/duckdb-wasm"
import { Database, Connection } from "duckdb"
import getDuckDB from "../helpers/getDuckDB.js"
import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import stringToArray from "../helpers/stringToArray.js"

import getDescription from "../methods/getDescription.js"
import renameColumnQuery from "../methods/renameColumnQuery.js"
import replaceQuery from "../methods/replaceQuery.js"
import convertQuery from "../methods/convertQuery.js"
import roundQuery from "../methods/roundQuery.js"
import joinQuery from "../methods/joinQuery.js"
import insertRowsQuery from "../methods/insertRowsQuery.js"
import sortQuery from "../methods/sortQuery.js"
import loadArrayQueryBrowser from "../methods/loadArrayQueryBrowser.js"
import outliersIQRQuery from "../methods/outliersIQRQuery.js"
import zScoreQuery from "../methods/zScoreQuery.js"
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
import runQueryBrowser from "../helpers/runQueryBrowser.js"
import trimQuery from "../methods/trimQuery.js"
import addThousandSeparator from "../helpers/addThousandSeparator.js"
import removeDuplicatesQuery from "../methods/removeDuplicatesQuery.js"
import logData from "../helpers/logData.js"
import replaceNullsQuery from "../methods/replaceNullsQuery.js"
import lowerQuery from "../methods/lowerQuery.js"
import upperQuery from "../methods/upperQuery.js"
import cloneColumnQuery from "../methods/cloneColumn.js"
import keepQuery from "../methods/keepQuery.js"
import removeQuery from "../methods/removeQuery.js"
import normalizeQuery from "../methods/normalizeQuery.js"
import rollingQuery from "../methods/rollingQuery.js"

/**
 * SimpleDB is a class that provides a simplified interface for working with DuckDB, a high-performance in-memory analytical database. This class is meant to be used in a web browser. For NodeJS and similar runtimes, use SimpleNodeDB.
 *
 * Here's how to instantiate a SimpleDB instance.
 *
 * ```ts
 * const sdb = new SimpleDB()
 *
 * // Same thing but will log useful information in the console. The first 20 rows of tables will be logged.
 * const sdb = new SimpleDB({ debug: true, nbRowsToLog: 20})
 * ```
 *
 * The start() method will be called internally automatically with the first method you'll run. It initializes DuckDB and establishes a connection to the database.
 *
 */

export default class SimpleDB {
    /** A flag indicating whether debugging information should be logged. Defaults to false. @category Properties */
    debug: boolean
    /** The number of rows to log when debugging. Defaults to 10. @category Properties */
    nbRowsToLog: number
    /** A DuckDB database. @category Properties */
    db!: AsyncDuckDB | Database
    /** A connection to a DuckDB database. @category Properties */
    connection!: AsyncDuckDBConnection | Connection
    /** A worker to make DuckDB work. @category Properties */
    worker!: Worker | null
    /** A flag for SimpleNodeDB. Default is true. When data is retrieved from the database as an array of objects, BIGINT values are automatically converted to integers, which are easier to work with in JavaScript. If you want actual bigint values, set this option to false. @category Properties */
    bigIntToInt: boolean | undefined // For SimpleNodeDB
    /** A flag to install the [the spatial](https://duckdb.org/docs/extensions/spatial) extension. Default is false. If true, extension will be loaded, which allows geospatial analysis. @category Properties */
    spatial: boolean | undefined
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
            spatial?: boolean
        }
    ) => Promise<
        | {
              [key: string]: number | string | Date | boolean | null
          }[]
        | null
    >

    constructor(
        options: {
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        options.debug && console.log("\nnew SimpleDB()")
        this.nbRowsToLog = options.nbRowsToLog ?? 10
        this.debug = options.debug ?? false
        this.worker = null
        this.runQuery = runQueryBrowser
    }

    /**
     * Initializes DuckDB and establishes a connection to the database. It's called automatically with the first method you'll run.
     */
    async start() {
        this.debug && console.log("\nstart()\n")
        const duckDB = await getDuckDB()
        this.db = duckDB.db
        this.connection = await this.db.connect()
        this.worker = duckDB.worker
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
        await queryDB(
            this,
            loadArrayQueryBrowser(table, arrayOfObjects),
            mergeOptions(this, {
                table,
                method: "loadArray()",
                parameters: {
                    table,
                    arrayOfObjects:
                        arrayOfObjects.length > 5
                            ? `${JSON.stringify(arrayOfObjects.slice(0, 5))} (just showing the first 5 items)`
                            : arrayOfObjects,
                },
            })
        )
    }

    /**
     * Creates or replaces a table and loads data from an external file into it.
     *
     * ```ts
     * await sdb.loadData("tableA", "https://some-website.com/some-data.csv")
     * ```
     *
     * @param table - The name of the new table.
     * @param url - The URL of the external file containing the data. CSV, JSON, and PARQUET files are accepted.
     * @param options - An optional object with configuration options:
     *   @param options.fileType - The type of the external file. Defaults to the file extension.
     *   @param options.autoDetect - A boolean indicating whether to automatically detect the data format. Defaults to true.
     *   @param options.header - A boolean indicating whether the file contains a header row. Applicable for CSV files. Defaults to true.
     *   @param options.delim - The delimiter used in the file. Applicable for DSV files. Defaults to ",".
     *   @param options.skip - The number of rows to skip at the beginning of the file. Defaults to 0.
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
        } = {}
    ) {
        await loadDataBrowser(this, table, url, options)
    }

    /**
     * Inserts rows formatted as an array of objects into an existing table.
     *
     * ```ts
     * const rows = [ { letter: "a", number: 1 }, { letter: "b", number: 2 }]
     * await sdb.insertRows("tableA", rows)
     * ```
     *
     * @param table - The name of the table to insert rows into.
     * @param rows - An array of objects representing the rows to be inserted into the table.
     *
     * @category Importing data
     */
    async insertRows(table: string, rows: { [key: string]: unknown }[]) {
        await queryDB(
            this,
            insertRowsQuery(table, rows),
            mergeOptions(this, {
                table,
                method: "insertRows()",
                parameters: { table, rows },
            })
        )
    }

    /**
     * Inserts all rows from one table (or multiple tables) into another existing table.
     *
     * ```ts
     * // Insert all rows from tableB into tableA.
     * await sdb.insertTable("tableA", "tableB")
     * // Insert all rows from tableB and tableC into tableA.
     * await sdb.insertTable("tableA", ["tableB", "tableC"])
     * ```
     *
     * @param table - The name of the table to insert rows into.
     * @param tablesToInsert - The name of the table(s) from which rows will be inserted.
     *
     * @category Importing data
     */
    async insertTables(table: string, tablesToInsert: string | string[]) {
        await queryDB(
            this,
            stringToArray(tablesToInsert)
                .map(
                    (tableToInsert) =>
                        `INSERT INTO ${table} SELECT * FROM ${tableToInsert};`
                )
                .join("\n"),
            mergeOptions(this, {
                table,
                method: "insertTable()",
                parameters: { table, tablesToInsert },
            })
        )
    }

    /**
     * Clones an existing table by creating or replacing a table with the same structure and data. The data can be optionally filtered. This can be very slow with big tables.
     *
     * ```ts
     * // tableA data is cloned into tableB.
     * await sdb.cloneTable("tableA", "tableB")
     *
     * // tableA data is cloned into tableB. Only rows with values greater than 10 in column1 are kept.
     * await sdb.cloneTable("tableA", "tableB", {condition: `column1 > 10`})
     * ```
     *
     * @param originalTable - The name of the table to be cloned.
     * @param newTable - The name of the new table that will be created as a clone.
     * @param options - An optional object with configuration options:
     *   @param options.condition - A SQL WHERE clause condition to filter the data. Defaults to no condition.
     */
    async cloneTable(
        originalTable: string,
        newTable: string,
        options: {
            condition?: string
        } = {}
    ) {
        await queryDB(
            this,
            `CREATE OR REPLACE TABLE ${newTable} AS SELECT * FROM ${originalTable}${
                options.condition ? ` WHERE ${options.condition}` : ""
            }`,
            mergeOptions(this, {
                table: newTable,
                method: "cloneTable()",
                parameters: { originalTable, newTable, options },
            })
        )
    }

    /**
     * Clones a column in a given table.
     *
     * ```ts
     * // Clones column1 as column2 from tableA
     * await sdb.cloneColumn("tableA", "column1", "column2")
     * ```
     * @param table - The table in which the cloning should happen.
     * @param originalColumn - The original column.
     * @param newColumn - The name of the cloned column.
     *
     * @category Restructuring data
     */
    async cloneColumn(
        table: string,
        originalColumn: string,
        newColumn: string
    ) {
        const types = await this.getTypes(table)

        await queryDB(
            this,
            cloneColumnQuery(table, originalColumn, newColumn, types),
            mergeOptions(this, {
                table: table,
                method: "cloneColumn()",
                parameters: { table, originalColumn, newColumn },
            })
        )
    }

    /**
     * Renames an existing table.
     *
     * ```ts
     * // tableA data is renamed tableB.
     * await sdb.renameTable("tableA", "tableB")
     * ```
     *
     * @param originalTable - The original name.
     * @param newTable - The new name.
     */
    async renameTable(originalTable: string, newTable: string) {
        await queryDB(
            this,
            `ALTER TABLE ${originalTable} RENAME TO ${newTable}`,
            mergeOptions(this, {
                table: newTable,
                method: "renameTable()",
                parameters: { originalTable, newTable },
            })
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
     *
     * @category Selecting or filtering data
     */
    async selectColumns(table: string, columns: string | string[]) {
        await queryDB(
            this,
            `CREATE OR REPLACE TABLE ${table} AS SELECT ${stringToArray(columns)
                .map((d) => `"${d}"`)
                .join(", ")} FROM ${table}`,
            mergeOptions(this, {
                table,
                method: "selectColumns()",
                parameters: { table, columns },
            })
        )
    }

    /**
     * Selects random rows from a table and removes the others.
     *
     * ```ts
     * // Selects 100 random rows in tableA
     * await sdb.sample("tableA", 100)
     *
     * // Selects 10% of the rows randomly in tableB
     * await sdb.sample("tableB", "10%")
     * ```
     *
     * @param table - The name of the table from which rows will be sampled.
     * @param quantity - The number of rows (1000 for example) or a string ("10%" for example) specifying the sampling size.
     * @param options - An optional object with configuration options:
     *   @param options.seed - A number specifying the seed for repeatable sampling. For example, setting it to 1 will ensure random rows will be the same each time you run the method.
     *
     * @category Selecting or filtering data
     */
    async sample(
        table: string,
        quantity: number | string,
        options: {
            seed?: number
        } = {}
    ) {
        await queryDB(
            this,
            `CREATE OR REPLACE TABLE ${table} AS SELECT * FROM ${table} USING SAMPLE RESERVOIR(${
                typeof quantity === "number" ? `${quantity} ROWS` : quantity
            })${
                typeof options.seed === "number"
                    ? ` REPEATABLE(${options.seed})`
                    : ""
            }`,
            mergeOptions(this, {
                table,
                method: "sample()",
                parameters: { table, quantity, options },
            })
        )
    }

    /**
     * Selects n rows from a table. An offset and outputTable options are available.
     *
     * ```ts
     * // Selects the first 100 rows from tableA.
     * await sdb.selectRows("tableA", 100)
     *
     * // Selects 100 rows from tableA, after skipping the first 100 rows.
     * await sdb.selectRows("tableA", 100, {offset: 100})
     *
     * // Selects 100 rows from tableA and stores them in tableB.
     * await sdb.selectRows("tableA", 100, {outputTable: "tableB"})
     * ```
     *
     * @param table - The name of the table from which rows will be selected.
     * @param count - The number of rows.
     * @param options - An optional object with configuration options:
     *   @param options.offset - The number of rows to skip before selecting. Defaults to 0.
     *   @param options.outputTable - The name of the table that will be created or replaced and where the new rows will be stored. By default, the original table is overwritten.
     *
     * @category Selecting or filtering data
     */
    async selectRows(
        table: string,
        count: number | string,
        options: { offset?: number; outputTable?: string } = {}
    ) {
        await queryDB(
            this,
            `CREATE OR REPLACE TABLE ${
                options.outputTable ?? table
            } AS SELECT * FROM ${table} LIMIT ${count}${
                typeof options.offset === "number"
                    ? ` OFFSET ${options.offset}`
                    : ""
            };`,
            mergeOptions(this, {
                table: options.outputTable ?? table,
                method: "selectRows",
                parameters: { table, count, options },
            })
        )
    }

    /**
     * Removes duplicate rows from a table, keeping unique rows. Note that SQL does not guarantee any specific order when using DISTINCT. So the data might be returned in a different order than the original.
     *
     * ```ts
     * await sdb.removeDuplicates("tableA")
     * ```
     *
     * @param table - The name of the table from which duplicates will be removed.
     * @param options - An optional object with configuration options:
     *   @param options.on - A column or multiple columns to consider to remove duplicates. The other columns in the table will not be considered to exclude duplicates.
     *
     * @category Selecting or filtering data
     */
    async removeDuplicates(
        table: string,
        options: {
            on?: string | string[]
        } = {}
    ) {
        await queryDB(
            this,
            removeDuplicatesQuery(table, options),
            mergeOptions(this, {
                table,
                method: "removeDuplicates()",
                parameters: { table, options },
            })
        )
    }

    /**
     * Removes rows with missing values from a table. By default, missing values are NULL (as an SQL value), but also "NULL", "null", "NaN" and "undefined" that might have been converted to strings before being loaded into the table. Empty strings "" are also considered missing values.
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
     *   @param options.columns - Either a string or an array of strings specifying the columns to consider for missing values. By default, all columns are considered.
     *   @param options.missingValues - An array of values to be treated as missing values. Defaults to ["undefined", "NaN", "null", "NULL", ""].
     *   @param options.invert - A boolean indicating whether to invert the condition, keeping only rows with missing values. Defaults to false.
     *
     * @category Selecting or filtering data
     */
    async removeMissing(
        table: string,
        options: {
            columns?: string | string[]
            missingValues?: (string | number)[]
            invert?: boolean
        } = {}
    ) {
        await removeMissing(this, table, options)
    }

    /**
     * Trims specified characters from the beginning, end, or both sides of string values.
     *
     * ```ts
     * // Trims values in column1
     * await sdb.trim("tableA", "column1")
     *
     * // Trims values in column2, columns3, and column4
     * await sdb.trim("tableA", ["column2", "column3", "column4"])
     * ```
     *
     * @param table - The name of the table.
     * @param columns - The column or columns to trim.
     * @param options - An optional object with configuration options:
     *   @param options.character - The string to trim. Defaults to whitespace.
     *   @param options.method - The trimming method.
     *
     * @category Updating data
     */
    async trim(
        table: string,
        columns: string | string[],
        options: {
            character?: string
            method?: "leftTrim" | "rightTrim" | "trim"
        } = {}
    ) {
        options.method = options.method ?? "trim"
        await queryDB(
            this,
            trimQuery(table, stringToArray(columns), options),
            mergeOptions(this, {
                table,
                method: "trim()",
                parameters: { table, columns, options },
            })
        )
    }

    /**
     * Filters rows from a table based on SQL conditions. Note that it's often faster to use the removeRows method.
     *
     * ```ts
     * // In table store, keep only rows where the fruit is not an apple.
     * await sdb.filter("store", "fruit != 'apple'")
     *
     * // More examples:
     * await sdb.filter("store", "price > 100 AND quantity > 0")
     * await sdb.filter("inventory", "category = 'Electronics' OR category = 'Appliances'")
     * await sdb.filter("customers", "lastPurchaseDate >= '2023-01-01'")
     * ```
     *
     * @param table - The name of the table from which rows will be filtered.
     * @param conditions - The filtering conditions specified as a SQL WHERE clause.
     *
     * @category Selecting or filtering data
     */
    async filter(table: string, conditions: string) {
        await queryDB(
            this,
            `CREATE OR REPLACE TABLE ${table} AS SELECT *
            FROM ${table}
            WHERE ${conditions}`,
            mergeOptions(this, {
                table,
                method: "filter()",
                parameters: { table, conditions },
            })
        )
    }

    /**
     * Keeps rows with specific values in specific columns.
     *
     * ```ts
     * // In table employees, keep only rows where the job is accountant or developer and where the city is Montreal.
     * await sdb.keep("employees", { job: [ "accountant", "developer" ], city: [ "Montreal" ] })
     * ```
     *
     * @param table - The name of the table
     * @param columnsAndValues - An object with the columns (keys) and the values to be kept (values as arrays)
     *
     * @category Selecting or filtering data
     */
    async keep(table: string, columnsAndValues: { [key: string]: unknown[] }) {
        await queryDB(
            this,
            keepQuery(table, columnsAndValues),
            mergeOptions(this, {
                table,
                method: "keep()",
                parameters: { table, columnsAndValues },
            })
        )
    }

    /**
     * Remove rows with specific values in specific columns.
     *
     * ```ts
     * // In table employees, remove rows where the job is accountant or developer and where the city is Montreal.
     * await sdb.remove("employees", { job: [ "accountant", "developer" ], city: [ "Montreal" ] })
     * ```
     *
     * @param table - The name of the table
     * @param columnsAndValues - An object with the columns (keys) and the values to be removed (values as arrays)
     *
     * @category Selecting or filtering data
     */
    async remove(
        table: string,
        columnsAndValues: { [key: string]: unknown[] }
    ) {
        await queryDB(
            this,
            removeQuery(table, columnsAndValues),
            mergeOptions(this, {
                table,
                method: "remove()",
                parameters: { table, columnsAndValues },
            })
        )
    }

    /**
     * Removes rows from a table based on SQL conditions.
     *
     * ```ts
     * // In table store, remove rows where the fruit is an apple.
     * await sdb.removeRows("store", "fruit = 'apple'")
     * ```
     *
     * @param table - The name of the table from which rows will be removed.
     * @param conditions - The filtering conditions specified as a SQL WHERE clause.
     *
     * @category Selecting or filtering data
     */
    async removeRows(table: string, conditions: string) {
        await queryDB(
            this,
            `DELETE FROM ${table} WHERE ${conditions}`,
            mergeOptions(this, {
                table,
                method: "removeRows()",
                parameters: { table, conditions },
            })
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
     *
     * @category Restructuring data
     */
    async renameColumns(table: string, names: { [key: string]: string }) {
        await queryDB(
            this,
            renameColumnQuery(table, Object.keys(names), Object.values(names)),
            mergeOptions(this, {
                table,
                method: "renameColumns()",
                parameters: { table, names },
            })
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
     *
     * @category Restructuring data
     */
    async longer(
        table: string,
        columns: string[],
        columnsTo: string,
        valuesTo: string
    ) {
        await queryDB(
            this,
            `CREATE OR REPLACE TABLE ${table} AS SELECT * FROM (
                FROM "${table}" UNPIVOT INCLUDE NULLS (
                "${valuesTo}"
                for "${columnsTo}" in (${columns.map((d) => `"${d}"`).join(", ")})
                )
            )`,
            mergeOptions(this, {
                table,
                method: "longer()",
                parameters: { table, columns, columnsTo, valuesTo },
            })
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
     * @param columnsFrom - The column containing the values that will be transformed into columns.
     * @param valuesFrom - The column containing values to be spread across the new columns.
     *
     * @category Restructuring data
     */
    async wider(table: string, columnsFrom: string, valuesFrom: string) {
        await queryDB(
            this,
            `CREATE OR REPLACE TABLE ${table} AS SELECT * FROM (PIVOT ${table} ON "${columnsFrom}" USING sum("${valuesFrom}"));`,
            mergeOptions(this, {
                table,
                method: "wider()",
                parameters: { table, columnsFrom, valuesFrom },
            })
        )
    }

    /**
     * Converts data types (JavaScript or SQL types) of specified columns in a table.
     *
     * ```ts
     * // Converts column1 to string and column2 to integer
     * await sdb.convert("tableA", {column1: "string", column2: "integer"})
     *
     * // Same thing but with SQL types
     * await sdb.convert("tableA", {column1: "varchar", column2: "bigint"})
     *
     * // Converts a string to a date
     * await sdb.convert("tableA", {column3: "datetime"}, {datetimeFormat: "%Y-%m-%d" })
     * ```
     *
     * @param table - The name of the table where data types will be converted.
     * @param types - An object mapping column names to the target data types for conversion.
     * @param options - An optional object with configuration options:
     *   @param options.try - When true, the values that can't be converted will be replaced by NULL instead of throwing an error. Defaults to false.
     *   @param options.datetimeFormat - A string specifying the format for date and time conversions. The method uses strftime and strptime functions from DuckDB. For the format specifiers, see https://duckdb.org/docs/sql/functions/dateformat.
     *
     * @category Restructuring data
     */
    async convert(
        table: string,
        types: {
            [key: string]:
                | "integer"
                | "float"
                | "number"
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
                | "boolean"
        },
        options: {
            try?: boolean
            datetimeFormat?: string
        } = {}
    ) {
        const allTypes = await this.getTypes(table)
        const allColumns = Object.keys(allTypes)

        await queryDB(
            this,
            convertQuery(
                table,
                Object.keys(types),
                Object.values(types),
                allColumns,
                allTypes,
                options
            ),
            mergeOptions(this, {
                table,
                method: "convert()",
                parameters: { table, types, options },
            })
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
     *
     * @category Restructuring data
     */
    async removeTables(tables: string | string[]) {
        await queryDB(
            this,
            stringToArray(tables)
                .map((d) => `DROP TABLE ${d};`)
                .join("\n"),
            mergeOptions(this, {
                table: null,
                method: "removeTables()",
                parameters: { tables },
            })
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
     *
     * @category Restructuring data
     */
    async removeColumns(table: string, columns: string | string[]) {
        await queryDB(
            this,
            stringToArray(columns)
                .map((d) => `ALTER TABLE ${table} DROP "${d}";`)
                .join("\n"),
            mergeOptions(this, {
                table,
                method: "removeColumns()",
                parameters: { table, columns },
            })
        )
    }

    /**
     * Adds a new column to a table based on a type (JavaScript or SQL types) and a SQL definition.
     *
     * ```ts
     * // Adds column3 to tableA. The column's values are floats (equivalent to DOUBLE in SQL) and are the results of the sum of values from column1 and column2.
     * await sdb.addColumn("tableA", "column3", "float", "column1 + column2")
     * ```
     *
     * @param table - The name of the table to which the new column will be added.
     * @param newColumn - The name of the new column to be added.
     * @param type - The data type for the new column. JavaScript or SQL types.
     * @param definition - SQL expression defining how the values should be computed for the new column.
     *
     * @category Restructuring data
     */
    async addColumn(
        table: string,
        newColumn: string,
        type:
            | "integer"
            | "float"
            | "number"
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
            | "boolean"
            | "geometry",
        definition: string
    ) {
        await queryDB(
            this,
            `ALTER TABLE ${table} ADD "${newColumn}" ${parseType(type)};
            UPDATE ${table} SET "${newColumn}" = ${definition}`,
            mergeOptions(this, {
                table,
                method: "addColumn()",
                parameters: { table, newColumn, type, definition },
            })
        )
    }

    /**
     * Adds a new column to a table with the row number.
     *
     * ```ts
     * // Adds the row number in new column rowNumber.
     * await sdb.addRowNumber("tableA", "rowNumber")
     * ```
     *
     * @param table - The name of the table
     * @param newColumn - The name of the new column storing the row number
     *
     * @category Restructuring data
     */
    async addRowNumber(table: string, newColumn: string) {
        await queryDB(
            this,
            `CREATE OR REPLACE TABLE ${table} AS SELECT *, ROW_NUMBER() OVER() AS "${newColumn}" FROM ${table}`,
            mergeOptions(this, {
                table,
                method: "addRowNumber()",
                parameters: { table, newColumn },
            })
        )
    }

    /**
     * Performs a cross join operation between two tables returning all pairs of rows. Note that the returned data is not guaranteed to be in the same order as the original tables. With SimpleNodeDB, it might create a .tmp folder, so make sure to add .tmp to your gitignore.
     *
     * ```ts
     * // By default, the leftTable (tableA here) will be overwritten with the result.
     * await crossJoin("tableA", "tableB");
     *
     * // But you can put the result into another table if needed.
     * await crossJoin("tableA", "tableB", { outputTable: "tableC" });
     * ```
     *
     * @param leftTable - The name of the left table.
     * @param rightTable - The name of the right table.
     * @param options - An optional object with configuration options:
     *   @param options.outputTable - The name of the table that will be created or replaced with the result of the cross join.
     *
     * @category Restructuring data
     */
    async crossJoin(
        leftTable: string,
        rightTable: string,
        options: {
            outputTable?: string
        } = {}
    ) {
        await queryDB(
            this,
            `CREATE OR REPLACE TABLE "${options.outputTable ?? leftTable}" AS SELECT "${leftTable}".*, "${rightTable}".* FROM "${leftTable}" CROSS JOIN "${rightTable}";`,
            mergeOptions(this, {
                table: options.outputTable ?? leftTable,
                method: "crossJoin()",
                parameters: { leftTable, rightTable, options },
            })
        )
    }

    /**
     * Merges the data of two tables based on a common column. Note that the returned data is not guaranteed to be in the same order as the original tables. With SimpleNodeDB, it might create a .tmp folder, so make sure to add .tmp to your gitignore.
     *
     * ```ts
     * // By default, the method automatically looks for a common column in the two tables and does a left join of tableA (left) and tableB (right). The leftTable (tableA here) will be overwritten with the result.
     * await sdb.join("tableA", "tableB")
     *
     * // You can change the common column, the join type, and the output table in options.
     * await sdb.join("tableA", "tableB", { commonColumn: 'id', type: 'inner', outputTable: 'tableC' })
     * ```
     *
     * @param leftTable - The name of the left table to be joined.
     * @param rightTable - The name of the right table to be joined.
     * @param options - An optional object with configuration options:
     *   @param options.commonColumn - The common column used for the join operation. By default, the method automatically searches for a column name that exists in both tables.
     *   @param options.type - The type of join operation to perform. Possible values are "inner", "left", "right", or "full". Default is "left".
     *   @param options.outputTable - The name of the new table that will store the result of the join operation. Default is the leftTable.
     *
     * @category Restructuring data
     */
    async join(
        leftTable: string,
        rightTable: string,
        options: {
            commonColumn?: string
            type?: "inner" | "left" | "right" | "full"
            outputTable?: string
        } = {}
    ) {
        let commonColumn: string | undefined
        if (options.commonColumn) {
            commonColumn = options.commonColumn
        } else {
            const leftTableColumns = await this.getColumns(leftTable)
            const rightTableColumns = await this.getColumns(rightTable)
            commonColumn = leftTableColumns.find((d) =>
                rightTableColumns.includes(d)
            )
            if (commonColumn === undefined) {
                throw new Error("No common column")
            }
        }
        const outputTable = options.outputTable ?? leftTable
        await queryDB(
            this,
            joinQuery(
                leftTable,
                rightTable,
                commonColumn,
                options.type ?? "left",
                outputTable
            ),
            mergeOptions(this, {
                table: outputTable,
                method: "join()",
                parameters: {
                    leftTable,
                    rightTable,
                    options,
                },
            })
        )
        // Need to remove the extra column common column. Ideally, this would happen in the query. :1 is with web assembly version. _1 is with nodejs version. At some point, both will be the same.
        const columns = await this.getColumns(outputTable)
        const extraCommonColumn = columns.find(
            (d) => d === `${commonColumn}_1` || d === `${commonColumn}:1`
        )
        if (extraCommonColumn !== undefined) {
            await this.removeColumns(outputTable, extraCommonColumn)
        }
    }

    /**
     * Creates a new empty table with specified columns and data types (JavaScript or SQL). If the table already exists, it will be overwritten.
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
     * @param types - An object specifying the columns and their data types (JavaScript or SQL).
     * 
     * @category Restructuring data
     */
    async createTable(
        table: string,
        types: {
            [key: string]:
                | "integer"
                | "float"
                | "number"
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
                | "boolean"
                | "geometry"
        }
    ) {
        await queryDB(
            this,
            `CREATE OR REPLACE TABLE ${table} (${Object.keys(types)
                .map((d) => `"${d}" ${parseType(types[d])}`)
                .join(", ")});`,
            mergeOptions(this, {
                table,
                method: "createTable()",
                parameters: { table, types },
            })
        )
    }

    /**
     * Replaces specified strings in the selected columns of a table.
     *
     *```ts
     * // Replaces entire strings and substrings too.
     * await sdb.replace("tableA", "column1", {"kilograms": "kg", liters: "l" })
     *
     * // Replaces only if matching entire string.
     * await sdb.replace("tableA", "column1", {"kilograms": "kg", liters: "l" }, {entireString: true})
     *
     * // Replaces using a regular expression. Any sequence of one or more digits would be replaced by a hyphen.
     * await sdb.replace("tableA", "column1", {"\d+": "-" }, {regex: true})
     * ```
     *
     * @param table - The name of the table in which strings will be replaced.
     * @param columns - Either a string or an array of strings specifying the columns where string replacements will occur.
     * @param strings - An object mapping old strings to new strings.
     * @param options - An optional object with configuration options:
     *   @param options.entireString - A boolean indicating whether the entire string must match for replacement. Defaults to false.
     *   @param options.regex - A boolean indicating the use of regular expressions for a global replace. See the [RE2 docs](https://github.com/google/re2/wiki/Syntax) for the syntax. Defaults to false.
     * @category Updating data
     */
    async replace(
        table: string,
        columns: string | string[],
        strings: { [key: string]: string },
        options: {
            entireString?: boolean
            regex?: boolean
        } = {}
    ) {
        options.entireString = options.entireString ?? false
        options.regex = options.regex ?? false
        if (options.entireString === true && options.regex === true) {
            throw new Error(
                "You can't have entireString to true and regex to true at the same time. Pick one."
            )
        }
        await queryDB(
            this,
            replaceQuery(
                table,
                stringToArray(columns),
                Object.keys(strings),
                Object.values(strings),
                options
            ),
            mergeOptions(this, {
                table,
                method: "replace()",
                parameters: { table, columns, strings, options },
            })
        )
    }

    /**
     * Formats strings to lowercase.
     *
     *```ts
     * // Just in one column.
     * await sdb.lower("tableA", "column1")
     *
     * // In multiple columns
     * await sdb.lower("tableA", ["column1", "column2"])
     * ```
     *
     * @param table - The name of the table in which strings will be formatted to lowercase.
     * @param columns - Either a string or an array of strings specifying the columns to be updated.
     *
     * @category Updating data
     */
    async lower(table: string, columns: string | string[]) {
        await queryDB(
            this,
            lowerQuery(table, stringToArray(columns)),
            mergeOptions(this, {
                table,
                method: "lower()",
                parameters: { table, columns },
            })
        )
    }

    /**
     * Formats strings to uppercase.
     *
     *```ts
     * // Just in one column.
     * await sdb.upper("tableA", "column1")
     *
     * // In multiple columns
     * await sdb.upper("tableA", ["column1", "column2"])
     * ```
     *
     * @param table - The name of the table in which strings will be formatted to uppercase.
     * @param columns - Either a string or an array of strings specifying the columns to be updated.
     *
     * @category Updating data
     */
    async upper(table: string, columns: string | string[]) {
        await queryDB(
            this,
            upperQuery(table, stringToArray(columns)),
            mergeOptions(this, {
                table,
                method: "lower()",
                parameters: { table, columns },
            })
        )
    }

    /**
     * Splits strings along a separator and replaces the values with a substring at a specified index (starting at 0). If the index is outside the bounds of the list, return an empty string.
     *
     *```ts
     * // Splits on commas and replaces values with the second substring.
     * await sdb.splitExtract("tableA", "column1", ",", 1)
     * ```
     *
     * @param table - The name of the table
     * @param column - The name of the column storing the strings
     * @param separator - The substring to use as a separator
     * @param index - The index of the substring to replace values
     *
     * @category Updating data
     */
    async splitExtract(
        table: string,
        column: string,
        separator: string,
        index: number
    ) {
        await queryDB(
            this,
            `UPDATE ${table} SET "${column}" = SPLIT_PART("${column}", '${separator}', ${index + 1})`,
            mergeOptions(this, {
                table,
                method: "splitExtract()",
                parameters: { table, column, separator, index },
            })
        )
    }

    /**
     * Extracts a specific number of characters, starting from the left.
     *
     *```ts
     * // Strings in column1 of tableA will be replaced by the first two characters of each string.
     * await sdb.left("tableA", "column1", 2)
     * ```
     *
     * @param table - The name of the table
     * @param column - The name of the column storing the strings
     * @param numberOfCharacters - The number of characters, starting from the left
     *
     * @category Updating data
     */
    async left(table: string, column: string, numberOfCharacters: number) {
        await queryDB(
            this,
            `UPDATE ${table} SET "${column}" = LEFT("${column}", ${numberOfCharacters})`,
            mergeOptions(this, {
                table,
                method: "left()",
                parameters: { table, column, numberOfCharacters },
            })
        )
    }

    /**
     * Extracts a specific number of characters, starting from the right.
     *
     *```ts
     * // Strings in column1 of tableA will be replaced by the last two characters of each string.
     * await sdb.right("tableA", "column1", 2)
     * ```
     *
     * @param table - The name of the table
     * @param column - The name of the column storing the strings
     * @param numberOfCharacters - The number of characters, starting from the right
     *
     * @category Updating data
     */
    async right(table: string, column: string, numberOfCharacters: number) {
        await queryDB(
            this,
            `UPDATE ${table} SET "${column}" = RIGHT("${column}", ${numberOfCharacters})`,
            mergeOptions(this, {
                table,
                method: "right()",
                parameters: { table, column, numberOfCharacters },
            })
        )
    }

    /**
     * Replaces null values in the selected columns of a table.
     *
     *```ts
     * // Replace null values by 0.
     * await sdb.replaceNulls("tableA", "column1", 0)
     * ```
     *
     * @param table - The name of the table in which strings will be replaced.
     * @param columns - Either a string or an array of strings specifying the columns where string replacements will occur.
     * @param value - The value to replace the null values.
     *
     * @category Updating data
     */
    async replaceNulls(
        table: string,
        columns: string | string[],
        value: number | string | Date | boolean
    ) {
        await queryDB(
            this,
            replaceNullsQuery(table, stringToArray(columns), value),
            mergeOptions(this, {
                table,
                method: "replaceNulls()",
                parameters: { table, columns, value },
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
     *   @param options.separator - The string used to separate concatenated values. Defaults to an empty string.
     *
     * @category Updating data
     */
    async concatenate(
        table: string,
        columns: string[],
        newColumn: string,
        options: {
            separator?: string
        } = {}
    ) {
        await queryDB(
            this,
            concatenateQuery(table, columns, newColumn, options),
            mergeOptions(this, {
                table,
                method: "concatenate()",
                parameters: { table, columns, newColumn, options },
            })
        )
    }

    /**
     * Rounds numeric values in specified columns of a table.
     *
     * ```ts
     * // Rounds column1's values to the nearest integer.
     * await sdb.round("tableA", "column1")
     *
     * // Rounds column1's values with a specific number of decimal places.
     * await sdb.round("tableA", "column1", {decimals: 2})
     *
     * // Rounds column1's values with a specific method. Available methods are "round", "floor" and "ceiling".
     * await sdb.round("tableA", "column1", {method: "floor"})
     * ```
     *
     * @param table - The name of the table where numeric values will be rounded.
     * @param columns - Either a string or an array of strings specifying the columns containing numeric values to be rounded.
     * @param options - An optional object with configuration options:
     *   @param options.decimals - The number of decimal places to round to. Defaults to 0.
     *   @param options.method - The rounding method to use. Defaults to "round".
     *
     * @category Updating data
     */
    async round(
        table: string,
        columns: string | string[],
        options: {
            decimals?: number
            method?: "round" | "ceiling" | "floor"
        } = {}
    ) {
        await queryDB(
            this,
            roundQuery(table, stringToArray(columns), options),
            mergeOptions(this, {
                table,
                method: "round()",
                parameters: { table, columns, options },
            })
        )
    }

    /**
     * Updates values in a specified column in a given table.
     *
     * ```ts
     * await sdb.updateColumn("tableA", "column1", `LEFT(column2)`)
     * ```
     * @param table - The name of the table.
     * @param column - The name of the column to be updated.
     * @param definition - The SQL expression to set the new values in the column.
     *
     * @category Updating data
     */
    async updateColumn(table: string, column: string, definition: string) {
        await queryDB(
            this,
            `UPDATE ${table} SET "${column}" = ${definition}`,
            mergeOptions(this, {
                table,
                method: "updateColumn()",
                parameters: { table, column, definition },
            })
        )
    }

    /**
     * Sorts the rows of a table based on specified column(s) and order(s).
     *
     * ```ts
     * // Sorts column1 ascendingly then column2 descendingly.
     * await sdb.sort("tableA", {column1: "asc", column2: "desc"})
     *
     * // Same thing but taking French accent into account.
     * await sdb.sort("tableA", {column1: "asc", column2: "desc"}, {lang: {column1: "fr"}})
     * ```
     * @param table - The name of the table to sort.
     * @param order - An object mapping column names to the sorting order: "asc" for ascending or "desc" for descending.
     * @param options - An optional object with configuration options:
     *    @param options.lang - An object mapping column names to language codes. See DuckDB Collations documentation for more: https://duckdb.org/docs/sql/expressions/collations.
     *
     * @category Updating data
     */
    async sort(
        table: string,
        order: { [key: string]: "asc" | "desc" },
        options: {
            lang?: { [key: string]: string }
        } = {}
    ) {
        await queryDB(
            this,
            sortQuery(table, order, options),
            mergeOptions(this, {
                table,
                method: "sort()",
                parameters: { table, order, options },
            })
        )
    }

    /**
     * Assigns ranks in a new column based on specified column values within a table.
     *
     * ```ts
     * // Computes ranks in the new column rank from the column1 values.
     * await sdb.ranks("tableA", "column1", "rank")
     *
     * // Computing ranks in the new column rank from the column1 values. Using the values from column2 as categories.
     * await sdb.ranks("tableA", "column1", "rank", {categories: "column2"})
     * ```
     *
     * @param table - The name of the table.
     * @param values - The column containing values to be used for ranking.
     * @param newColumn - The name of the new column where the ranks will be stored.
     * @param options - An optional object with configuration options:
     *   @param options.categories - The column or columns that define categories for ranking.
     *   @param options.noGaps - A boolean indicating whether to assign ranks without gaps. Defaults to false.
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
        } = {}
    ) {
        await queryDB(
            this,
            ranksQuery(table, values, newColumn, options),
            mergeOptions(this, {
                table,
                method: "ranks()",
                parameters: { table, values, newColumn, options },
            })
        )
    }

    /**
     * Assigns quantiles for specified column values within a table.
     *
     * ```ts
     * // Assigns a quantile from 1 to 10 for each row in new column quantiles, based on values from column1.
     * await sdb.quantiles("tableA", "column1", 10, "quantiles")
     *
     * // Same thing, except the values in column2 are used as categories.
     * await sdb.quantiles("tableA", "column1", 10, "quantiles", {categories: "column2"})
     * ```
     *
     * @param table - The name of the table.
     * @param values - The column containing values from which quantiles will be assigned.
     * @param nbQuantiles - The number of quantiles.
     * @param newColumn - The name of the new column where the assigned quantiles will be stored.
     * @param options - An optional object with configuration options:
     *   @param options.categories - The column or columns that define categories for computing quantiles. This can be a single column name or an array of column names.
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
        } = {}
    ) {
        await queryDB(
            this,
            quantilesQuery(table, values, nbQuantiles, newColumn, options),
            mergeOptions(this, {
                table,
                method: "quantiles()",
                parameters: {
                    table,
                    values,
                    nbQuantiles,
                    newColumn,
                    options,
                },
            })
        )
    }

    /**
     * Assigns bins for specified column values within a table, based on an interval size.
     *
     * ```ts
     * // Assigns a bin for each row in new column bins based on column1 values, with an interval of 10.
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
     *   @param options.startValue The starting value for binning. Defaults to the minimum value in the specified column.
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
        } = {}
    ) {
        await queryDB(
            this,
            await binsQuery(this, table, values, interval, newColumn, options),
            mergeOptions(this, {
                table,
                method: "bins()",
                parameters: {
                    table,
                    values,
                    interval,
                    newColumn,
                    options,
                },
            })
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
     *   @param options.suffix - A string suffix to append to the names of the new columns storing the computed proportions. Defaults to "Perc".
     *   @param options.decimals - The number of decimal places to round the computed proportions.
     *
     * @category Analyzing data
     */
    async proportionsHorizontal(
        table: string,
        columns: string[],
        options: {
            suffix?: string
            decimals?: number
        } = {}
    ) {
        await queryDB(
            this,
            proportionsHorizontalQuery(table, columns, options),
            mergeOptions(this, {
                table,
                method: "proportionsHorizontal()",
                parameters: {
                    table,
                    columns,
                    options,
                },
            })
        )
    }

    /**
     * Computes proportions over a column's values within a table.
     *
     * ```ts
     * // This will add a column perc with the result of each column1 value divided by the sum of all column1 values.
     * await sdb.proportionsVertical("tableA", "column1", "perc")
     * ```
     *
     * @param table - The name of the table.
     * @param column - The column containing values for which proportions will be computed. The proportions are calculated based on the sum of values in the specified column.
     * @param newColumn - The name of the new column where the proportions will be stored.
     * @param options - An optional object with configuration options:
     *   @param options.categories - The column or columns that define categories for computing proportions. This can be a single column name or an array of column names.
     *   @param options.decimals - The number of decimal places to round the computed proportions.
     *
     * @category Analyzing data
     */
    async proportionsVertical(
        table: string,
        column: string,
        newColumn: string,
        options: {
            categories?: string | string[]
            decimals?: number
        } = {}
    ) {
        await queryDB(
            this,
            proportionsVerticalQuery(table, column, newColumn, options),
            mergeOptions(this, {
                table,
                method: "proportionsVertical()",
                parameters: {
                    table,
                    column,
                    newColumn,
                    options,
                },
            })
        )
    }

    /**
     * Creates a summary table based on specified values, categories, and summary operations.
     *
     * ```ts
     * // Summarizes all numeric columns with all available summary operations. Table tableA will be overwritten with the results.
     * await sdb.summarize("tableA")
     *
     * // Same, but the results will be stored in tableB.
     * await sdb.summarize("tableA", {outputTable: "tableB"})
     *
     * // Summarizes a specific column with all available summary operations. Values can be an array of column names, too.
     * await sdb.summarize("tableA", {values: "column1"})
     *
     * // Summarizes a specific column with all available summary operations and use the values in another column as categories. Categories can be an array of column names, too.
     * await sdb.summarize("tableA", {values: "column1", categories: "column2"})
     *
     * // Summarizes a specific column with a specific summary operation and use the values in another column as categories. Summaries can be an array of summary operations, too.
     * await sdb.summarize("tableA", {values: "column1", categories: "column2", summaries: "mean"})
     *
     * // Summarizes and round values with a specific number of decimal places.
     * await sdb.summarize("tableA", {values: "column1", categories: "column2", summaries: "mean", decimals: 4})
     * ```
     *
     * @param table - The name of the table to be summarized.
     * @param options - An optional object with configuration options:
     *   @param options.values - The column or columns whose values will be summarized. This can be a single column name or an array of column names.
     *   @param options.categories - The column or columns that define categories for the summarization. This can be a single column name or an array of column names.
     *   @param options.summaries - The summary operations to be performed. This can be a single summary operation or an array of summary operations.
     *   @param options.decimals - The number of decimal places to round the summarized values.
     *   @param options.outputTable - An option to store the results in a new table.
     *
     * @category Analyzing data
     */
    async summarize(
        table: string,
        options: {
            values?: string | string[]
            categories?: string | string[]
            summaries?:
                | (
                      | "count"
                      | "countUnique"
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
                      | "countUnique"
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
            outputTable?: string
        } = {}
    ) {
        await summarize(this, table, options)
    }

    /**
     * Computes rolling aggregations, like a rolling average. For rows without enough preceding or following rows, returns NULL. For this method to work properly, don't forget to sort your data first.
     *
     * ```ts
     * // 7-day rolling average of values in column1 with the 3 preceding and 3 following rows.
     * await sdb.rolling("tableA", "column1", "rollingAvg", "mean", 3, 3)
     * ```
     *
     * @param table - The name of the table
     * @param column - The name of the column storing the values to be aggregated
     * @param newColumn - The name of the new column in which the computed values will be stored
     * @param summary - How to aggregate the values
     * @param preceding - How many preceding rows to include
     * @param following - How many following rows to include
     * @param options - An optional object with configuration options:
     *   @param options.categories - The category or categories to be used for the aggragation.
     *   @param options.decimals - The number of decimal places to round the summarized values.
     * @category Analyzing data
     */
    async rolling(
        table: string,
        column: string,
        newColumn: string,
        summary: "min" | "max" | "mean" | "median" | "sum",
        preceding: number,
        following: number,
        options: {
            categories?: string | string[]
            decimals?: number
        } = {}
    ) {
        await queryDB(
            this,
            rollingQuery(
                table,
                column,
                newColumn,
                summary,
                preceding,
                following,
                options
            ),
            mergeOptions(this, {
                table,
                method: "rolling()",
                parameters: {
                    table,
                    column,
                    newColumn,
                    summary,
                    preceding,
                    following,
                    options,
                },
            })
        )
    }

    /**
     * Calculates correlations between columns in a table.
     *
     * If no *x* and *y* columns are specified, the method computes the correlations of all numeric columns *combinations*. It's important to note that correlation is symmetrical: the correlation of *x* over *y* is the same as *y* over *x*.
     *
     * ```ts
     * // Computes all correlations between all numeric columns in tableA and overwrite tableA with the results.
     * await sdb.correlations("tableA")
     *
     * // Same but results are stored in tableB.
     * await sdb.correlations("tableA", {outputTable: "tableB"})
     *
     * // Computes all correlations between a specific x column and all other numeric columns.
     * await sdb.correlations("tableA", {x: "column1"})
     *
     * // Computes the correlations between a specific x and y columns.
     * await sdb.correlations("tableA", {x: "column1", y: "column2"})
     * ```
     *
     * @param table - The name of the table.
     * @param options - An optional object with configuration options:
     *   @param options.x - The column name for the x values. Default is all numeric columns.
     *   @param options.y - The column name for the y values. Default is all numeric columns.
     *   @param options.categories - The column or columns that define categories. Correlation calculations will be run for each category.
     *   @param options.decimals - The number of decimal places to round the correlation values.
     *   @param options.outputTable - An option to store the results in a new table.
     *
     * @category Analyzing data
     */
    async correlations(
        table: string,
        options: {
            x?: string
            y?: string
            categories?: string | string[]
            decimals?: number
            outputTable?: string
        } = {}
    ) {
        await correlations(this, table, options)
    }

    /**
     * Performs linear regression analysis and creates a table with regression results. The results include the slope, the y-intercept the R-squared.
     *
     * If no *x* and *y* columns are specified, the method computes the linear regression analysis of all numeric columns *permutations*. It's important to note that linear regression analysis is asymmetrical: the linear regression of *x* over *y* is not the same as *y* over *x*.
     *
     * ```ts
     * // Computes all linear regressions between all numeric columns in tableA and overwrites tableA.
     * await sdb.linearRegressions("tableA")
     *
     * // Same but stores the results in tableB.
     * await sdb.linearRegressions("tableA", {outputTable: "tableB"})
     *
     * // Computes all linear regressions between a specific x column and all other numeric columns.
     * await sdb.linearRegressions("tableA", {x: "column1"})
     *
     * // Computes the linear regression between a specific x and y columns.
     * await sdb.linearRegressions("tableA", {x: "column1", y: "column2"})
     * ```
     *
     * @param table - The name of the table.
     * @param options - An optional object with configuration options:
     *   @param options.x - The column name for the independent variable (x values) in the linear regression analysis.
     *   @param options.y - The column name for the dependent variable (y values) in the linear regression analysis.
     *   @param options.categories - The column or columns that define categories. Correlation calculations will be run for each category.
     *   @param options.decimals - The number of decimal places to round the regression coefficients.
     *
     * @category Analyzing data
     */
    async linearRegressions(
        table: string,
        options: {
            x?: string
            y?: string
            categories?: string | string[]
            decimals?: number
            outputTable?: string
        } = {}
    ) {
        await linearRegressions(this, table, options)
    }

    /**
     * Identifies outliers using the Interquartile Range (IQR) method.
     *
     * ```ts
     * // Looks for outliers in column age from table1. Creates a new column outliers with TRUE or FALSE values.
     * await sdb.outliersIQR("table1", "age", "outliers")
     * ```
     *
     * @param table - The name of the table containing the column for outlier detection.
     * @param column - The name of the column in which outliers will be identified.
     * @param newColumn - The name of the new column where the bins will be stored.
     * @param options - An optional object with configuration options:
     *   @param options.categories - The column or columns that define categories for outliers.
     *
     * @category Analyzing data
     */
    async outliersIQR(
        table: string,
        column: string,
        newColumn: string,
        options: {
            categories?: string | string[]
        } = {}
    ) {
        await queryDB(
            this,
            outliersIQRQuery(
                table,
                column,
                newColumn,
                (await this.getLength(table)) % 2 === 0 ? "even" : "odd",
                options
            ),
            mergeOptions(this, {
                table,
                method: "outliersIQR()",
                parameters: { table, column, newColumn, options },
            })
        )
    }

    /**
     * Computes the Z-score.
     *
     * ```ts
     * // Calculates the Z-score for the values in column age and puts the results in column sigma.
     * await sdb.zScore("table1", "age", "sigma")
     * ```
     *
     * @param table - The name of the table.
     * @param column - The name of the column for which Z-Score will be calculated.
     * @param newColumn - The name of the new column where the bins will be stored.
     * @param options - An optional object with configuration options:
     *   @param options.categories - The column or columns that define categories for zScores.
     *   @param options.decimals - The number of decimal places to round the Z-score values.
     *
     * @category Analyzing data
     */
    async zScore(
        table: string,
        column: string,
        newColumn: string,
        options: {
            categories?: string | string[]
            decimals?: number
        } = {}
    ) {
        await queryDB(
            this,
            zScoreQuery(table, column, newColumn, options),
            mergeOptions(this, {
                table,
                method: "zScore()",
                parameters: { table, column, newColumn, options },
            })
        )
    }

    /**
     * Normalizes the values in a column using min-max normalization.
     *
     * ```ts
     * // Normalizes the values in the column1 from tableA.
     * await sdb.normalize("tableA", "column1")
     * ```
     *
     * @param table - The name of the table.
     * @param column - The name of the column in which values will be normalized.
     * @param newColumn - The name of the new column where normalized values will be stored.
     * @param options - An optional object with configuration options:
     *   @param options.categories - The column or columns that define categories for the normalization.
     *   @param options.decimals - The number of decimal places to round the normalized values.
     *
     * @category Analyzing data
     */
    async normalize(
        table: string,
        column: string,
        newColumn: string,
        options: {
            categories?: string | string[]
            decimals?: number
        } = {}
    ) {
        await queryDB(
            this,
            normalizeQuery(table, column, newColumn, options),
            mergeOptions(this, {
                table,
                method: "zScore()",
                parameters: { table, column, options },
            })
        )
    }

    /**
     * Executes a custom SQL query, providing flexibility for advanced users.
     *
     * ```ts
     * // You can use the returnDataFrom option to retrieve the data from the query, if needed.
     * await sdb.customQuery( "SELECT * FROM employees WHERE Job = 'Clerk'", {returnDataFrom: "query"})
     * ```
     *
     * @param query - The custom SQL query to be executed.
     * @param options - An optional object with configuration options:
     *   @param options.returnDataFrom - Specifies whether to return data from the "query" or not. Defaults to "none".
     *   @param options.table - The name of the table associated with the query (if applicable). Needed when debug is true.
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
     *
     * @category Updating data
     */
    async updateWithJS(
        table: string,
        dataModifier: (
            rows: {
                [key: string]: number | string | Date | boolean | null
            }[]
        ) => {
            [key: string]: number | string | Date | boolean | null
        }[]
    ) {
        this.debug && console.log("\nupdateWithJS()")
        this.debug &&
            console.log("parameters:", { table, dataModifier: dataModifier })
        const oldData = await this.getData(table)
        if (!oldData) {
            throw new Error("No data from getData.")
        }
        const newData = dataModifier(oldData)
        await this.loadArray(table, newData)
    }

    /**
     * Returns the schema (column names and their data types) of a specified table.
     *
     * ```ts
     * const schema = await sdb.getSchema("tableA")
     * ```
     *
     * @param table - The name of the table for which to retrieve the schema.
     */
    async getSchema(table: string): Promise<
        {
            [key: string]: string | null
        }[]
    > {
        return (await queryDB(
            this,
            `DESCRIBE ${table}`,
            mergeOptions(this, {
                returnDataFrom: "query",
                nbRowsToLog: Infinity,
                table,
                method: "getSchema()",
                parameters: { table },
            })
        )) as {
            [key: string]: string | null
        }[]
    }

    /**
     * Returns descriptive information about the columns of a specified table, including details like data types, number of null and distinct values. Best to look at with console.table.
     *
     * ```ts
     * const description = await sdb.getDescription("tableA")
     * ```
     *
     * @param table - The name of the table.
     */

    async getDescription(table: string): Promise<
        {
            [key: string]: unknown
        }[]
    > {
        return await getDescription(this, table)
    }

    /**
     * Returns the list of tables.
     *
     * ```ts
     * const tables = await sdb.getTables()
     * ```
     */
    async getTables(): Promise<string[]> {
        return getTables(this)
    }

    /**
     * Returns true if a specified table exists and false if not.
     *
     * ```ts
     * const hasEmployees = await sdb.hasTable("employees")
     * ```
     *
     * @param table - The name of the table to check for existence.
     */
    async hasTable(table: string): Promise<boolean> {
        this.debug && console.log("\nhasTable()")
        this.debug && console.log("parameters:", { table })
        const result = (await this.getTables()).includes(table)
        this.debug && console.log("hasTable:", result)
        return result
    }

    /**
     * Return the list of column names for a specified table.
     *
     * ```ts
     * const columns = await sdb.getColumns("dataCsv")
     * ```
     *
     * @param table - The name of the table for which to retrieve column names.
     */
    async getColumns(table: string): Promise<string[]> {
        return await getColumns(this, table)
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
     */
    async hasColumn(table: string, column: string): Promise<boolean> {
        this.debug && console.log("\nhasColumn()")
        this.debug && console.log("parameters:", { table, column })
        const result = (await getColumns(this, table)).includes(column)
        this.debug && console.log("hasColumn:", result)
        return result
    }

    /**
     * Returns the number of columns (width) in a table.
     *
     * ```ts
     * const nbColumns = await sdb.getWidth("tableA")
     * ```
     *
     * @param table - The name of the table.
     */
    async getWidth(table: string): Promise<number> {
        this.debug && console.log("\ngetWidth()")
        this.debug && console.log("parameters:", { table })
        const result = (await getColumns(this, table)).length
        this.debug && console.log("width:", result)
        return result
    }

    /**
     * Returns the number of rows (length) in a table.
     *
     * ```ts
     * const nbRows = await sdb.getLength("tableA")
     * ```
     *
     * @param table - The name of the table.
     */
    async getLength(table: string): Promise<number> {
        return await getLength(this, table)
    }

    /**
     * Returns the number of data points (cells/values) in a table.
     *
     * ```ts
     * const nbDataPoints = await sdb.getValuesCount("tableA")
     * ```
     *
     * @param table - The name of the table .
     */
    async getValuesCount(table: string): Promise<number> {
        this.debug && console.log("\ngetValuesCount()")
        this.debug && console.log("parameters:", { table })
        const result =
            (await this.getWidth(table)) * (await this.getLength(table))
        this.debug && console.log("values count:", result)
        return result
    }

    /**
     * Returns the data types of columns in a table.
     *
     * ```ts
     * const dataTypes = await sdb.getTypes("tableA")
     * ```
     *
     * @param table - The name of the table.
     */
    async getTypes(table: string): Promise<{
        [key: string]: string
    }> {
        return await getTypes(this, table)
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
     *
     * @category Getting data
     */
    async getValues(
        table: string,
        column: string
    ): Promise<(string | number | boolean | Date | null)[]> {
        return await getValues(this, table, column)
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
     *
     * @category Getting data
     */
    async getMin(
        table: string,
        column: string
    ): Promise<string | number | boolean | Date | null> {
        return await getMin(this, table, column)
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
     *
     * @category Getting data
     */
    async getMax(
        table: string,
        column: string
    ): Promise<string | number | boolean | Date | null> {
        return await getMax(this, table, column)
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
     *   @param options.decimals - The number of decimal places to round the result to.
     *
     * @category Getting data
     */
    async getMean(
        table: string,
        column: string,
        options: {
            decimals?: number
        } = {}
    ): Promise<number> {
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
     *   @param options.decimals - The number of decimal places to round the result to.
     *
     * @category Getting data
     */
    async getMedian(
        table: string,
        column: string,
        options: {
            decimals?: number
        } = {}
    ): Promise<number> {
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
     *
     * @category Getting data
     */
    async getSum(table: string, column: string): Promise<number> {
        return await getSum(this, table, column)
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
     *   @param options.decimals - The number of decimal places to round the result to.
     *
     * @category Getting data
     */
    async getSkew(
        table: string,
        column: string,
        options: {
            decimals?: number
        } = {}
    ): Promise<number> {
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
     *   @param options.decimals - The number of decimal places to round the result to.
     *
     * @category Getting data
     */
    async getStdDev(
        table: string,
        column: string,
        options: {
            decimals?: number
        } = {}
    ): Promise<number> {
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
     *   @param options.decimals - The number of decimal places to round the result to.
     *
     * @category Getting data
     */
    async getVar(
        table: string,
        column: string,
        options: {
            decimals?: number
        } = {}
    ): Promise<number> {
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
     *   @param options.decimals - The number of decimal places to round the result to.
     *
     * @category Getting data
     */
    async getQuantile(
        table: string,
        column: string,
        quantile: number,
        options: { decimals?: number } = {}
    ): Promise<number> {
        return await getQuantile(this, table, column, quantile, options)
    }

    /**
     * Returns unique values from a specific column in a table. For convenience, it returns the value ascendingly.
     *
     * ```ts
     * const uniques = await sdb.getUniques("tableA", "column1")
     * ```
     *
     * @param table - The name of the table.
     * @param column - The name of the column from which to retrieve unique values.
     *
     * @category Getting data
     */
    async getUniques(
        table: string,
        column: string
    ): Promise<(string | number | boolean | Date | null)[]> {
        return await getUniques(this, table, column)
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
     *    @param options.condition - The filtering conditions specified as a SQL WHERE clause. Defaults to no condition.
     *
     * @category Getting data
     */
    async getFirstRow(
        table: string,
        options: {
            condition?: string
        } = {}
    ): Promise<{
        [key: string]: string | number | boolean | Date | null
    }> {
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
     *   @param options.condition - The filtering conditions specified as a SQL WHERE clause. Defaults to no condition.
     *
     * @category Getting data
     */
    async getLastRow(
        table: string,
        options: {
            condition?: string
        } = {}
    ): Promise<{
        [key: string]: string | number | boolean | Date | null
    }> {
        return getLastRow(this, table, options)
    }

    /**
     * Returns the top n rows from a table.
     *
     * ```ts
     * const top10 = await sdb.getTop("inventory", 10)
     *
     * // With a condition
     * const top10Books = await sdb.getTop("inventory", 10, {condition: `category = 'Books'` })
     * ```
     *
     * @param table - The name of the table.
     * @param count - The number of rows to return.
     * @param options - An optional object with configuration options:
     *   @param options.condition - The filtering conditions specified as a SQL WHERE clause. Defaults to no condition.
     *
     * @category Getting data
     */
    async getTop(
        table: string,
        count: number,
        options: {
            condition?: string
        } = {}
    ): Promise<
        {
            [key: string]: string | number | boolean | Date | null
        }[]
    > {
        return await getTop(this, table, count, options)
    }

    /**
     * Returns the bottom n rows from a table. The last row will be returned first. To keep the original order of the data, use the originalOrder option.
     *
     * ```ts
     * // Last row will be returned first.
     * const bottom10 = await sdb.getBottom("inventory", 10)
     *
     * // Last row will be returned last.
     * const bottom10 = await sdb.getBottom("inventory", 10, {originalOrder: true})
     *
     * // With a condition
     * const bottom10Books = await sdb.getBottom("inventory", 10, {condition: `category = 'Books'` })
     * ```
     *
     * @param table - The name of the table.
     * @param count - The number of rows to return.
     * @param options - An optional object with configuration options:
     *   @param options.originalOrder - A boolean indicating whether the rows should be returned in their original order. Default is false, meaning the last row will be returned first.
     *   @param options.condition - The filtering conditions specified as a SQL WHERE clause. Defaults to no condition.
     *
     * @category Getting data
     */
    async getBottom(
        table: string,
        count: number,
        options: {
            originalOrder?: boolean
            condition?: string
        } = {}
    ): Promise<
        {
            [key: string]: string | number | boolean | Date | null
        }[]
    > {
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
     *   @param options.condition - A SQL WHERE clause condition to filter the data. Defaults to no condition.
     *
     * @category Getting data
     */
    async getData(
        table: string,
        options: {
            condition?: string
        } = {}
    ): Promise<
        {
            [key: string]: string | number | boolean | Date | null
        }[]
    > {
        return (await queryDB(
            this,
            `SELECT * from ${table}${
                options.condition ? ` WHERE ${options.condition}` : ""
            }`,
            mergeOptions(this, {
                returnDataFrom: "query",
                table,
                method: "getData()",
                parameters: { table, options },
            })
        )) as {
            [key: string]: string | number | boolean | Date | null
        }[]
    }

    /**
     * Returns the DuckDB extensions.
     *
     * ```ts
     * const extensions = await sdb.getExtensions()
     * ```
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
     * Logs a specified number of rows from a table. Default is 10 rows.
     *
     * ```ts
     * // Logs first 10 rows
     * await sdb.logTable("tableA");
     *
     * // Logs first 100 rows
     * await sdb.logTable("tableA", {nbRowsToLog: 100});
     * ```
     *
     * @param table - The name of the table.
     * @param options - An optional object with configuration options:
     *   @param options.nbRowsToLog - The number of rows to log when debugging. Defaults to 10 or the value set in the SimpleDB instance.
     */
    async logTable(
        table: string,
        options: {
            nbRowsToLog?: number
        } = {}
    ) {
        this.debug && console.log("\nlogTable()")
        options.nbRowsToLog = options.nbRowsToLog ?? this.nbRowsToLog
        this.debug && console.log("parameters:", { table, options })

        console.log(`\ntable ${table}:`)
        const data = await this.runQuery(
            `SELECT * FROM ${table} LIMIT ${options.nbRowsToLog}`,
            this.connection,
            true,
            {
                debug: this.debug,
                method: null,
                parameters: null,
                bigIntToInt: this.bigIntToInt,
            }
        )
        logData(data)
        const nbRows = await this.runQuery(
            `SELECT COUNT(*) FROM ${table};`,
            this.connection,
            true,
            {
                debug: this.debug,
                method: null,
                parameters: null,
                bigIntToInt: this.bigIntToInt,
            }
        )
        if (nbRows === null) {
            throw new Error("nbRows is null")
        }
        console.log(
            `${addThousandSeparator(
                nbRows[0]["count_star()"] as number
            )} rows in total ${`(nbRowsToLog: ${options.nbRowsToLog})`}`
        )
    }

    /**
     * Frees up memory. Closes the connection to the database and terminates associated resources.
     *
     * ```typescript
     * await sdb.done();
     * ```
     */
    async done() {
        this.debug && console.log("\ndone()")
        await (this.connection as AsyncDuckDBConnection)?.close()
        await (this.db as AsyncDuckDB)?.terminate()
        this.worker?.terminate()
    }
}
