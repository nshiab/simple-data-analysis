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

/**
 * SimpleDB is a class that provides a simplified interface for working with DuckDB, a high-performance in-memory analytical database. This class is meant to be used in a web browser. For NodeJS and similar runtimes, use SimpleNodeDB.
 *
 * Here's how to instantiate a SimpleDB instance.
 *
 * ```ts
 * const sdb = new SimpleDB()
 * ```
 *
 * The start() method will be called internally automatically with the first method you'll run. It initializes DuckDB and establishes a connection to the database. It sets the default_collation to NOCASE.
 *
 */

export default class SimpleDB {
    debug: boolean
    nbRowsToLog: number
    db!: AsyncDuckDB | Database
    connection!: AsyncDuckDBConnection | Connection
    worker!: Worker | null
    bigIntToInt: boolean | undefined // For SimpleNodeDB

    /**
     * For internal use. If you want to run a SQL query, use the customQuery method.
     */
    runQuery!: (
        query: string,
        connection: AsyncDuckDBConnection | Connection,
        returnDataFromQuery: boolean,
        options?: {
            bigIntToInt?: boolean
        }
    ) => Promise<
        | {
              [key: string]: number | string | Date | boolean | null
          }[]
        | null
    >

    /**
     * Creates an instance of SimpleDB.
     *
     * ```ts
     * const sdb = new SimpleDB()
     * ```
     *
     * The start() method will be called internally automatically with the first method you'll run. It initializes DuckDB and establishes a connection to the database. It sets the default_collation to NOCASE.
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
        this.runQuery = runQueryBrowser
    }

    /**
     * Initializes DuckDB and establishes a connection to the database. It sets the default_collation to NOCASE. It's called automatically with the first method you'll run.
     */
    async start() {
        this.debug && console.log("\nstart()")
        const duckDB = await getDuckDB()
        this.db = duckDB.db
        this.connection = await this.db.connect()
        this.connection.query("PRAGMA default_collation=NOCASE;")

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
        this.debug && console.log("\nloadArray()")

        await queryDB(
            this,
            loadArrayQuery(table, arrayOfObjects),
            mergeOptions(this, { table })
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
     *   - fileType: The type of the external file (csv, dsv, json, parquet). Defaults to the file extension.
     *   - autoDetect: A boolean indicating whether to automatically detect the data format. Defaults to true.
     *   - header: A boolean indicating whether the file contains a header row. Applicable for CSV files. Defaults to true.
     *   - delim: The delimiter used in the file. Applicable for DSV files. Defaults to ",".
     *   - skip: The number of rows to skip at the beginning of the file. Defaults to 0.
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
        this.debug && console.log("\ninsertRows()")

        await queryDB(
            this,
            insertRowsQuery(table, rows),
            mergeOptions(this, { table })
        )
    }

    /**
     * Inserts all rows from one table into another existing table.
     *
     * ```ts
     * // Insert all rows from tableB into tableA.
     * await sdb.insertTable("tableA", "tableB")
     * ```
     *
     * @param table - The name of the table to insert rows into.
     * @param tableToInsert - The name of the table from which rows will be inserted.
     *
     * @category Importing data
     */
    async insertTable(table: string, tableToInsert: string) {
        this.debug && console.log("\ninsertTable()")
        await queryDB(
            this,
            `INSERT INTO ${table} SELECT * FROM ${tableToInsert}`,
            mergeOptions(this, { table })
        )
    }

    /**
     * Clones an existing table by creating or replacing a table with the same structure and data.
     *
     * ```ts
     * // tableA data is cloned into tableB.
     * await sdb.cloneTable("tableA", "tableB")
     * ```
     *
     * @param originalTable - The name of the table to be cloned.
     * @param newTable - The name of the new table that will be created as a clone.
     */
    async cloneTable(originalTable: string, newTable: string) {
        this.debug && console.log("\ncloneTable()")
        await queryDB(
            this,
            `CREATE OR REPLACE TABLE ${newTable} AS SELECT * FROM ${originalTable}`,
            mergeOptions(this, { table: newTable })
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
        this.debug && console.log("\nselectColumns()")

        await queryDB(
            this,
            `CREATE OR REPLACE TABLE ${table} AS SELECT ${stringToArray(columns)
                .map((d) => `"${d}"`)
                .join(", ")} FROM ${table}`,
            mergeOptions(this, { table })
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
     *   - seed: A number specifying the seed for repeatable sampling. For example, setting it to 1 will ensure random rows will be the same each time you run the method.
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
        this.debug && console.log("\nsample()")

        await queryDB(
            this,
            `CREATE OR REPLACE TABLE ${table} AS SELECT * FROM ${table} USING SAMPLE RESERVOIR(${
                typeof quantity === "number" ? `${quantity} ROWS` : quantity
            })${
                typeof options.seed === "number"
                    ? ` REPEATABLE(${options.seed})`
                    : ""
            }`,
            mergeOptions(this, { table })
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
     *   - on: A column or multiple columns to consider to remove duplicates. The other columns in the table will not be considered to exclude duplicates.
     *
     * @category Selecting or filtering data
     */
    async removeDuplicates(
        table: string,
        options: {
            on?: string | string[]
        } = {}
    ) {
        this.debug && console.log("\nremoveDuplicates()")
        await queryDB(
            this,
            removeDuplicatesQuery(table, options),
            mergeOptions(this, { table })
        )
    }

    /**
     * Removes rows with missing values from a table. By default, missing values are NULL (as an SQL value), but also "null", "NaN" and "undefined" that might have been converted to strings before being loaded into the table. Empty strings "" are also considered missing values.
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
     *
     * @category Selecting or filtering data
     */
    async removeMissing(
        table: string,
        options: {
            columns?: string | string[]
            missingValues?: (string | number)[]
            invert?: boolean
        } = {
            missingValues: ["undefined", "NaN", "null", ""],
        }
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
     *   - character: The string to trim. Defaults to whitespace.
     *   - method: The trimming method, one of "leftTrim", "rightTrim", or "trim". Defaults to "trim".
     *
     * @category Updating data
     */
    async trim(
        table: string,
        columns: string | string[],
        options: {
            character?: string
            method?: "leftTrim" | "rightTrim" | "trim"
        } = {
            method: "trim",
        }
    ) {
        this.debug && console.log("\ntrim()")
        await queryDB(
            this,
            trimQuery(table, stringToArray(columns), options),
            mergeOptions(this, { table })
        )
    }

    /**
     * Filters rows from a table based on SQL conditions.
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
        this.debug && console.log("\nfilter()")
        await queryDB(
            this,
            `CREATE OR REPLACE TABLE ${table} AS SELECT *
            FROM ${table}
            WHERE ${conditions}`,
            mergeOptions(this, { table })
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
        this.debug && console.log("\nrenameColumns()")
        await queryDB(
            this,
            renameColumnQuery(table, Object.keys(names), Object.values(names)),
            mergeOptions(this, { table })
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
        this.debug && console.log("\nlonger()")
        await queryDB(
            this,
            `CREATE OR REPLACE TABLE ${table} AS SELECT * FROM (UNPIVOT ${table}
        ON ${columns.map((d) => `"${d}"`).join(", ")}
        INTO
            NAME ${columnsTo}
            VALUE ${valuesTo})`,
            mergeOptions(this, { table })
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
        this.debug && console.log("\nwider()")
        await queryDB(
            this,
            `CREATE OR REPLACE TABLE ${table} AS (SELECT * FROM (PIVOT ${table} ON "${columnsFrom}" USING FIRST("${valuesFrom}")));`,
            mergeOptions(this, { table })
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
     *   - try: When true, the values that can't be converted will be replaced by NULL instead of throwing an error. Defaults to false.
     *   - datetimeFormat: A string specifying the format for date and time conversions. The method uses strftime and strptime functions from DuckDB. For the format specifiers, see https://duckdb.org/docs/sql/functions/dateformat.
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
        } = {}
    ) {
        this.debug && console.log("\nconvert()")

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
            mergeOptions(this, { table })
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
        this.debug && console.log("\nremoveTables()")
        await queryDB(
            this,
            stringToArray(tables)
                .map((d) => `DROP TABLE ${d};`)
                .join("\n"),
            mergeOptions(this, { table: null })
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
        this.debug && console.log("\nremoveColumns()")
        await queryDB(
            this,
            stringToArray(columns)
                .map((d) => `ALTER TABLE ${table} DROP "${d}";`)
                .join("\n"),
            mergeOptions(this, { table })
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
     * @param column - The name of the new column to be added.
     * @param type - The data type for the new column. JavaScript or SQL types.
     * @param definition - SQL expression defining how the values should be computed for the new column.
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
        definition: string
    ) {
        this.debug && console.log("\naddColumn()")
        await queryDB(
            this,
            `ALTER TABLE ${table} ADD "${column}" ${parseType(type)};
            UPDATE ${table} SET "${column}" = ${definition}`,
            mergeOptions(this, { table })
        )
    }

    /**
     * Merges the data of two tables based on a common column and puts the result in a new table.
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
     *
     * @category Restructuring data
     */
    async join(
        leftTable: string,
        rightTable: string,
        commonColumn: string,
        join: "inner" | "left" | "right" | "full",
        outputTable: string
    ) {
        this.debug && console.log("\njoin()")
        await queryDB(
            this,
            joinQuery(leftTable, rightTable, commonColumn, join, outputTable),
            mergeOptions(this, {
                table: outputTable,
            })
        )
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
        }
    ) {
        this.debug && console.log("\ncreateTable()")
        await queryDB(
            this,
            `CREATE OR REPLACE TABLE ${table} (${Object.keys(types)
                .map((d) => `"${d}" ${parseType(types[d])}`)
                .join(", ")});`,
            mergeOptions(this, { table })
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
     *
     * @category Updating data
     */
    async replaceStrings(
        table: string,
        columns: string | string[],
        strings: { [key: string]: string },
        options: {
            entireString?: boolean
        } = {}
    ) {
        this.debug && console.log("\nreplaceStrings()")
        options.entireString = options.entireString ?? false
        await queryDB(
            this,
            replaceStringsQuery(
                table,
                stringToArray(columns),
                Object.keys(strings),
                Object.values(strings),
                options
            ),
            mergeOptions(this, {
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
        this.debug && console.log("\nconcatenate()")
        await queryDB(
            this,
            concatenateQuery(table, columns, newColumn, options),
            mergeOptions(this, { table })
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
     *   - decimals: The number of decimal places to round to. Defaults to 0.
     *   - method: The rounding method to use ("round", "ceiling", or "floor"). Defaults to "round".
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
        this.debug && console.log("\nround()")
        await queryDB(
            this,
            roundQuery(table, stringToArray(columns), options),
            mergeOptions(this, { table })
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
        this.debug && console.log("\nsort()")
        await queryDB(
            this,
            sortQuery(table, order, options),
            mergeOptions(this, { table })
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
        this.debug && console.log("\nranks()")
        await queryDB(
            this,
            ranksQuery(table, values, newColumn, options),
            mergeOptions(this, { table })
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
        this.debug && console.log("\nquantiles()")
        await queryDB(
            this,
            quantilesQuery(table, values, nbQuantiles, newColumn, options),
            mergeOptions(this, { table })
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
        this.debug && console.log("\nbins()")
        await queryDB(
            this,
            await binsQuery(this, table, values, interval, newColumn, options),
            mergeOptions(this, { table })
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
        this.debug && console.log("\nproportionsHorizontal()")
        await queryDB(
            this,
            proportionsHorizontalQuery(table, columns, options),
            mergeOptions(this, { table })
        )
    }

    /**
     * Computes proportions over a column values within a table.
     *
     * ```ts
     * // This will add a column perc with the result of each column1 value divided by the sum of all column1 values.
     * await sdb.proportionsVertical("tableA", "column1", "perc")
     * ```
     *
     * @param table - The name of the table.
     * @param column - The column containing values for which proportions will be computed. The proportions are calculated based on the sum of values in the specified column.
     * @param newColumn - The name of the new column where the bins will be stored.
     * @param options - An optional object with configuration options:
     *   - categories: The column or columns that define categories for computing proportions. This can be a single column name or an array of column names.
     *   - decimals: The number of decimal places to round the computed proportions. Defaults to 2.
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
        this.debug && console.log("\nproportionsVertical()")
        await queryDB(
            this,
            proportionsVerticalQuery(table, column, newColumn, options),
            mergeOptions(this, { table })
        )
    }

    /**
     * Creates a summary table based on specified values, categories, and summary operations.
     *
     * ```ts
     * // Summarizes all numeric columns with all available summary operations (count, min, max, mean, median, sum, skew, stdDev, and var). Table tableA will be overwritten with the results.
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
     * // Summarizes and round values with a specific number of decimal places (default is 2).
     * await sdb.summarize("tableA", {values: "column1", categories: "column2", summaries: "mean", decimals: 4})
     * ```
     *
     * @param table - The name of the table to be summarized.
     * @param options - An optional object with configuration options:
     *   - values: The column or columns whose values will be summarized. This can be a single column name or an array of column names.
     *   - categories: The column or columns that define categories for the summarization. This can be a single column name or an array of column names.
     *   - summaries: The summary operations to be performed. This can be a single summary operation or an array of summary operations. Possible values are "count", "min", "max", "mean", "median", "sum", "skew", "stdDev", and "var".
     *   - decimals: The number of decimal places to round the summarized values. Defaults to 2.
     *   - outputTable: An option to store the results in a new table.
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
            outputTable?: string
        } = {}
    ) {
        await summarize(this, table, options)
    }

    /**
     * Calculates correlations between columns in a table.
     *
     * If no *x* and *y* columns are specified, the method computes the correlations of all numeric column *combinations*. It's important to note that correlation is symmetrical: the correlation of *x* over *y* is the same as *y* over *x*.
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
     *   - x: The column name for the x values. Default is all numeric columns.
     *   - y: The column name for the y values. Default is all numeric columns.
     *   - categories: The column or columns that define categories. Correlation calculations will be run for each category.
     *   - decimals: The number of decimal places to round the correlation values. Defaults to 2.
     *   - outputTable: An option to store the results in a new table.
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
     * If no *x* and *y* columns are specified, the method computes the linear regression analysis of all numeric column *permutations*. It's important to note that linear regression analysis is asymmetrical: the linear regression of *x* over *y* is not the same as *y* over *x*.
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
     *   - x: The column name for the independent variable (x values) in the linear regression analysis.
     *   - y: The column name for the dependent variable (y values) in the linear regression analysis.
     *   - categories: The column or columns that define categories. Correlation calculations will be run for each category.
     *   - decimals: The number of decimal places to round the regression coefficients. Defaults to 2.
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
     *   - categories: The column or columns that define categories for outliers.
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
        this.debug && console.log("\noutliersIQR()")
        await queryDB(
            this,
            outliersIQRQuery(
                table,
                column,
                newColumn,
                (await this.getLength(table)) % 2 === 0 ? "even" : "odd",
                options
            ),
            mergeOptions(this, { table })
        )
    }

    /**
     * Calculates the Z-Score.
     *
     * ```ts
     * // Calculates the Z-score for the values in column age and puts the results in a column sigma.
     * await sdb.zScore("table1", "age", "sigma")
     * ```
     *
     * @param table - The name of the table.
     * @param column - The name of the column for which Z-Score will be calculated.
     * @param newColumn - The name of the new column where the bins will be stored.
     * @param options - An optional object with configuration options:
     *   - categories: The column or columns that define categories for zScores.
     *   - decimals: The number of decimal places to round the Z-Score values. Defaults to 2.
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
        this.debug && console.log("\nzScore()")
        options.decimals = options.decimals ?? 2
        await queryDB(
            this,
            zScoreQuery(table, column, newColumn, options),
            mergeOptions(this, { table })
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
     */
    async customQuery(
        query: string,
        options: {
            returnDataFrom?: "query" | "none"
            table?: string
        } = {}
    ) {
        this.debug && console.log("\ncustomQuery()")
        return await queryDB(
            this,
            query,
            mergeOptions(this, {
                returnDataFrom: options.returnDataFrom,
                table: options.table ?? null,
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
        const oldData = await this.getData(table)
        if (!oldData) {
            throw new Error("No data from getData.")
        }
        const newData = dataModifier(oldData)
        await queryDB(
            this,
            loadArrayQuery(table, newData),
            mergeOptions(this, { table })
        )
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
    async getSchema(table: string) {
        this.debug && console.log("\ngetSchema()")
        return await queryDB(
            this,
            `DESCRIBE ${table}`,
            mergeOptions(this, {
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
     * ```
     *
     * @param table - The name of the table.
     */

    async getDescription(table: string) {
        return await getDescription(this, table)
    }

    /**
     * Returns the list of tables in the database.
     * ```ts
     * const tables = await sdb.getTables()
     * ```
     */
    async getTables() {
        return getTables(this)
    }

    /**
     * Returns true if a specified table exists in the database and false if not.
     *
     * ```ts
     * const hasEmployees = await sdb.hasTable("employees")
     * ```
     *
     * @param table - The name of the table to check for existence.
     */
    async hasTable(table: string) {
        this.debug && console.log("\nhasTable()")
        return (await this.getTables()).includes(table)
    }

    /**
     * Return the list of column names for a specified table in the database.
     *
     * ```ts
     * const columns = await sdb.getColumns("dataCsv")
     * ```
     *
     * @param table - The name of the table for which to retrieve column names.
     */
    async getColumns(table: string) {
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
    async hasColumn(table: string, column: string) {
        this.debug && console.log("\nhasColumn()")
        return (await getColumns(this, table)).includes(column)
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
    async getWidth(table: string) {
        this.debug && console.log("\ngetWidth()")
        return (await getColumns(this, table)).length
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
    async getLength(table: string) {
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
    async getValuesCount(table: string) {
        this.debug && console.log("\ngetValuesCount()")
        return (await this.getWidth(table)) * (await this.getLength(table))
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
    async getTypes(table: string) {
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
    async getValues(table: string, column: string) {
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
    async getMin(table: string, column: string) {
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
    async getMax(table: string, column: string) {
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
     * @param options - An optional object with configuration options:e.
     *   - decimals: The number of decimal places to round the result to. All decimals are kept by default.
     *
     * @category Getting data
     */
    async getMean(
        table: string,
        column: string,
        options: {
            decimals?: number
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
     *   - decimals: The number of decimal places to round the result to. All decimals are kept by default.
     *
     * @category Getting data
     */
    async getMedian(
        table: string,
        column: string,
        options: {
            decimals?: number
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
     *
     * @category Getting data
     */
    async getSum(table: string, column: string) {
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
     *   - decimals: The number of decimal places to round the result to. All decimals are kept by default.
     *
     * @category Getting data
     */
    async getSkew(
        table: string,
        column: string,
        options: {
            decimals?: number
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
     *   - decimals: The number of decimal places to round the result to. All decimals are kept by default.
     *
     * @category Getting data
     */
    async getStdDev(
        table: string,
        column: string,
        options: {
            decimals?: number
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
     *   - decimals: The number of decimal places to round the result to. All decimals are kept by default.
     *
     * @category Getting data
     */
    async getVar(
        table: string,
        column: string,
        options: {
            decimals?: number
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
     *   - decimals: The number of decimal places to round the result to. All decimals are kept by default.
     *
     * @category Getting data
     */
    async getQuantile(
        table: string,
        column: string,
        quantile: number,
        options: { decimals?: number } = {}
    ) {
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
    async getUniques(table: string, column: string) {
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
     *   - condition: The filtering conditions specified as a SQL WHERE clause. Defaults to no condition.
     *
     * @category Getting data
     */
    async getFirstRow(
        table: string,
        options: {
            condition?: string
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
     * const top10 = await sdb.getTop("inventory", 10)
     *
     * // With a condition
     * const top10Books = await sdb.getTop("inventory", 10, {condition: `category = 'Books'` })
     * ```
     *
     * @param table - The name of the table.
     * @param count - The number of rows to return.
     * @param options - An optional object with configuration options:
     *   - condition: The filtering conditions specified as a SQL WHERE clause. Defaults to no condition.
     *
     * @category Getting data
     */
    async getTop(
        table: string,
        count: number,
        options: {
            condition?: string
        } = {}
    ) {
        return await getTop(this, table, count, options)
    }

    /**
     * Returns the bottom N rows from a table. The last row will be returned first. To keep the original order of the data, use the originalOrder option.
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
     *   - originalOrder: A boolean indicating whether the rows should be returned in their original order. Default is false, meaning the last row will be returned first.
     *   - condition: The filtering conditions specified as a SQL WHERE clause. Defaults to no condition.
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
     *
     * @category Getting data
     */
    async getData(
        table: string,
        options: {
            condition?: string
        } = {}
    ) {
        this.debug && console.log("\ngetData()")
        return await queryDB(
            this,
            `SELECT * from ${table}${
                options.condition ? ` WHERE ${options.condition}` : ""
            }`,
            mergeOptions(this, { returnDataFrom: "query", table })
        )
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
     */
    async logTable(
        table: string,
        options: {
            nbRowsToLog?: number
        } = {}
    ) {
        this.debug && console.log("\nlogTable()")
        options.nbRowsToLog = options.nbRowsToLog ?? this.nbRowsToLog

        console.log(`\ntable ${table}:`)
        const data = await this.runQuery(
            `SELECT * FROM ${table} LIMIT ${options.nbRowsToLog}`,
            this.connection,
            true,
            { bigIntToInt: this.bigIntToInt }
        )
        console.table(data)
        const nbRows = await this.runQuery(
            `SELECT COUNT(*) FROM ${table};`,
            this.connection,
            true,
            { bigIntToInt: this.bigIntToInt }
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
