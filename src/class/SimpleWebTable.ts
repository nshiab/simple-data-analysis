import SimpleWebDB from "./SimpleWebDB.js"
import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import stringToArray from "../helpers/stringToArray.js"
import getDescription from "../methods/getDescription.js"
import renameColumnQuery from "../methods/renameColumnQuery.js"
import replaceQuery from "../methods/replaceQuery.js"
import convertQuery from "../methods/convertQuery.js"
import roundQuery from "../methods/roundQuery.js"
import insertRowsQuery from "../methods/insertRowsQuery.js"
import sortQuery from "../methods/sortQuery.js"
import outliersIQRQuery from "../methods/outliersIQRQuery.js"
import zScoreQuery from "../methods/zScoreQuery.js"
import parseType from "../helpers/parseTypes.js"
import concatenateQuery from "../methods/concatenateQuery.js"
import fetchDataBrowser from "../methods/fetchDataBrowser.js"
import removeMissing from "../methods/removeMissing.js"
import summarize from "../methods/summarize.js"
import correlations from "../methods/correlations.js"
import linearRegressions from "../methods/linearRegressions.js"
import getColumns from "../methods/getColumns.js"
import getNbRows from "../methods/getNbRows.js"
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
import loadArrayQueryWeb from "../methods/loadArrayQueryWeb.js"
import joinGeo from "../methods/joinGeo.js"
import distanceQuery from "../methods/distanceQuery.js"
import aggregateGeoQuery from "../methods/aggregateGeoQuery.js"
import getGeoData from "../methods/getGeoData.js"
import getProjection from "../methods/getProjection.js"
import Simple from "./Simple.js"
import runQueryWeb from "../helpers/runQueryWeb.js"
import selectRowsQuery from "../methods/selectRowsQuery.js"
import crossJoinQuery from "../methods/crossJoinQuery.js"
import join from "../methods/join.js"
import cloneQuery from "../methods/cloneQuery.js"
import toCamelCase from "../helpers/toCamelCase.js"

/**
 * SimpleWebTable is a class representing a table in a SimpleWebDB. To create one, it's best to instantiate a SimpleWebDB first.
 *
 * @example Basic usage
 * ```ts
 * // Creating a database first.
 * const sdb = new SimpleWebDB()
 *
 * // Making a new table. This returns a SimpleWebTable.
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
 * @example Instanciating with types
 * ```ts
 * // You can also create a new table with specific types.
 * const employees = sdb.newTable("employees", {
 *   types: {
 *     name: "string",
 *     salary: "integer",
 *     raise: "float",
 *   }
 * })
 * ```
 */
export default class SimpleWebTable extends Simple {
    /** Name of the table in the database. @category Properties */
    name: string
    /** The SimpleWebDB that created this table. @category Properties */
    sdb: SimpleWebDB

    constructor(
        name: string,
        simpleWebDB: SimpleWebDB,
        options: {
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        super(runQueryWeb, options)
        this.name = name
        this.sdb = simpleWebDB
        this.connection = this.sdb.connection
    }

    /** Set the types in the table.
     *
     * @example Basic usage
     * ```ts
     *  await table.setTypes({
     *     name: "string",
     *     salary: "integer",
     *     raise: "float",
     * })
     * ```
     *
     * @param types - An object specifying the columns and their data types (JavaScript or SQL).
     *
     */
    async setTypes(types: {
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
    }) {
        this.debug && console.log("\nsetTypes()")

        let spatial = ""
        if (
            Object.values(types)
                .map((d) => d.toLowerCase())
                .includes("geometry")
        ) {
            spatial = "INSTALL spatial; LOAD spatial;\n"
        }
        await queryDB(
            this,
            `${spatial}CREATE OR REPLACE TABLE ${this.name} (${Object.keys(
                types
            )
                .map((d) => `${d} ${parseType(types[d])}`)
                .join(", ")});`,
            mergeOptions(this, {
                table: this.name,
                method: "setTypes()",
                parameters: { types },
            })
        )
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
     * @param arrayOfObjects - An array of objects representing the data.
     *
     * @category Importing data
     */
    async loadArray(arrayOfObjects: { [key: string]: unknown }[]) {
        await queryDB(
            this,
            loadArrayQueryWeb(this.name, arrayOfObjects),
            mergeOptions(this, {
                table: this.name,
                method: "loadArray()",
                parameters: {
                    arrayOfObjects:
                        arrayOfObjects.length > 5
                            ? `${JSON.stringify(arrayOfObjects.slice(0, 5))} (just showing the first 5 items)`
                            : arrayOfObjects,
                },
            })
        )
    }

    /**
     * Fetch data from an url into the table. This method is just for the web. For NodeJS and other runtimes, use loadData.
     *
     * @example Basic usage
     * ```ts
     * await table.fetchData("https://some-website.com/some-data.csv")
     * ```
     *
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
    async fetchData(
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
        await fetchDataBrowser(this, this.name, url, options)
    }

    /**
     * Inserts rows formatted as an array of objects into the table.
     *
     * @example Basic usage
     * ```ts
     * const rows = [{ letter: "a", number: 1 }, { letter: "b", number: 2 }]
     * await table.insertRows(rows)
     * ```
     *
     * @param rows - An array of objects representing the rows to be inserted into the table.
     *
     * @category Importing data
     */
    async insertRows(rows: { [key: string]: unknown }[]) {
        await queryDB(
            this,
            insertRowsQuery(this.name, rows),
            mergeOptions(this, {
                table: this.name,
                method: "insertRows()",
                parameters: { rows },
            })
        )
    }

    /**
     * Inserts all rows from another table (or multiple tables) into this table.
     *
     * @example Basic usage with one table
     * ```ts
     * // Insert all rows from tableB into this table.
     * await tableA.insertTable("tableB")
     * ```
     *
     * @example With multiple tables
     * ```ts
     * // Insert all rows from tableB and tableC into this table.
     * await tableA.insertTable([ "tableB", "tableC" ])
     * ```
     *
     * @param tablesToInsert - The name of the table(s) from which rows will be inserted.
     *
     * @category Importing data
     */
    async insertTables(tablesToInsert: SimpleWebTable | SimpleWebTable[]) {
        const array = Array.isArray(tablesToInsert)
            ? tablesToInsert
            : [tablesToInsert]
        await queryDB(
            this,

            array
                .map(
                    (tableToInsert) =>
                        `INSERT INTO ${this.name} SELECT * FROM ${tableToInsert.name};`
                )
                .join("\n"),
            mergeOptions(this, {
                table: this.name,
                method: "insertTables()",
                parameters: { tablesToInsert },
            })
        )
    }

    /**
     * Returns a new table with the same structure and data as this table. The data can be optionally filtered. This can be very slow with big tables.
     *
     * @example Basic usage
     * ```ts
     * // Creating tableB as a clone of tableA.
     * // By default, tables are automatically named table1, table2, etc, in the DB.
     * const tableB = await tableA.cloneTable()
     * ```
     *
     * @example With a specific name
     * ```ts
     * // You can also give a specific name to the cloned table in the DB.
     * const tableB = await tableA.cloneTable({ outputTable: "tableB" })
     * ```
     *
     * @example Cloning with condition
     * ```ts
     * // Creating tableB as a clone of tableA. Only rows with values greater than 10 in column1 are cloned.
     * const tableB = await tableA.cloneTable({ condition: `column1 > 10` })
     * ```
     *
     * @param options - An optional object with configuration options:
     *   @param options.outputTable - The name of the new table that will be created as a clone.
     *   @param options.condition - A SQL WHERE clause condition to filter the data. Defaults to no condition.
     */
    async cloneTable(
        options: {
            outputTable?: string
            condition?: string
        } = {}
    ) {
        let clonedTable: SimpleWebTable
        if (typeof options.outputTable === "string") {
            clonedTable = this.sdb.newTable(options.outputTable)
        } else {
            clonedTable = this.sdb.newTable(`table${this.tableIncrement}`)
            this.tableIncrement += 1
        }

        await queryDB(
            this,
            cloneQuery(this.name, clonedTable.name, options),
            mergeOptions(this, {
                table: clonedTable.name,
                method: "cloneTable()",
                parameters: { options },
            })
        )

        return clonedTable
    }

    /**
     * Clones a column in this table.
     *
     * @example Basic usage
     * ```ts
     * // Clones column1 as column2
     * await table.cloneColumn("column1", "column2")
     * ```
     *
     * @param originalColumn - The original column.
     * @param newColumn - The name of the cloned column.
     *
     * @category Restructuring data
     */
    async cloneColumn(originalColumn: string, newColumn: string) {
        const types = await this.getTypes()

        await queryDB(
            this,
            cloneColumnQuery(this.name, originalColumn, newColumn, types),
            mergeOptions(this, {
                table: this.name,
                method: "cloneColumn()",
                parameters: { originalColumn, newColumn },
            })
        )
    }

    /**
     * Clones a column in the table and offsets the values down by one row. The last row will have a NULL value.
     *
     * @example Basic usage
     * ```ts
     * // Clones column1 as column2 and offsets values by 1. So value of column1-row1 will be in column2-row2, column1-row2 will be in column2-row3, etc.
     * await table.cloneColumnWithOffset("column1", "column2")
     * ```
     * @param originalColumn - The original column.
     * @param newColumn - The name of the cloned column.
     *
     * @category Restructuring data
     */
    async cloneColumnWithOffset(originalColumn: string, newColumn: string) {
        await queryDB(
            this,
            `CREATE OR REPLACE TABLE ${this.name} AS SELECT *, LEAD(${originalColumn}) OVER() AS ${newColumn} FROM ${this.name}`,
            mergeOptions(this, {
                table: this.name,
                method: "cloneColumnWithOffset()",
                parameters: { originalColumn, newColumn },
            })
        )
    }

    /**
     * Selects specific columns in the table and removes the others.
     *
     * @example Basic usage
     * ```ts
     * // Selecting only the columns firstName and lastName. All other columns in the table will be removed.
     * await table.selectColumns([ "firstName", "lastName" ])
     * ```
     * @param columns - Either a string (one column) or an array of strings (multiple columns) representing the columns to be selected.
     *
     * @category Selecting or filtering data
     */
    async selectColumns(columns: string | string[]) {
        await queryDB(
            this,
            `CREATE OR REPLACE TABLE ${this.name} AS SELECT ${stringToArray(
                columns
            )
                .map((d) => `${d}`)
                .join(", ")} FROM ${this.name}`,
            mergeOptions(this, {
                table: this.name,
                method: "selectColumns()",
                parameters: { columns },
            })
        )
    }

    /**
     * Returns TRUE if the table has the column and FALSE otherwise.
     *
     * @example Basic usage
     * ```ts
     * const bool = await table.hasColum("name")
     * ```
     */
    async hasColumn(column: string) {
        const columns = await this.getColumns()
        return columns.includes(column)
    }

    /**
     * Selects random rows from the table and removes the others. You can optionally specify a seed to ensure the same random rows are selected each time.
     *
     * @example Selecting a specific number
     * ```ts
     * // Selects 100 random rows
     * await table.sample(100)
     * ```
     *
     * @example Selecting a percentage
     * ```ts
     * // Selects 10% of the rows randomly
     * await table.sample("10%")
     * ```
     *
     * @example With a seed
     * ```ts
     * // Selects always the same random rows
     * await table.sample("10%", { seed: 1 })
     * ```
     *
     * @param quantity - The number of rows (1000 for example) or a string ("10%" for example) specifying the sampling size.
     * @param options - An optional object with configuration options:
     *   @param options.seed - A number specifying the seed for repeatable sampling. For example, setting it to 1 will ensure random rows will be the same each time you run the method.
     *
     * @category Selecting or filtering data
     */
    async sample(
        quantity: number | string,
        options: {
            seed?: number
        } = {}
    ) {
        await queryDB(
            this,
            `CREATE OR REPLACE TABLE ${this.name} AS SELECT * FROM ${this.name} USING SAMPLE RESERVOIR(${
                typeof quantity === "number" ? `${quantity} ROWS` : quantity
            })${
                typeof options.seed === "number"
                    ? ` REPEATABLE(${options.seed})`
                    : ""
            }`,
            mergeOptions(this, {
                table: this.name,
                method: "sample()",
                parameters: { quantity, options },
            })
        )
    }

    /**
     * Selects n rows from this table. An offset and outputTable options are available.
     *
     * @example Basic usage
     * ```ts
     * // Selects the first 100 rows.
     * await table.selectRows(100)
     * ```
     *
     * @example Skipping rows
     * ```ts
     * // Selects 100 rows after skipping the first 100 rows.
     * await table.selectRows(100, { offset: 100 })
     * ```
     *
     * @example Into a new table
     * ```ts
     * // Selects 100 rows and stores them in a new table.
     * const tableB = await tableA.selectRows(100, { outputTable: "tableB" })
     * ```
     *
     * @param count - The number of rows.
     * @param options - An optional object with configuration options:
     *   @param options.offset - The number of rows to skip before selecting. Defaults to 0.
     *   @param options.outputTable - The name of a new table that will be returned.
     *
     * @category Selecting or filtering data
     */
    async selectRows(
        count: number | string,
        options: { offset?: number; outputTable?: string } = {}
    ) {
        await queryDB(
            this,
            selectRowsQuery(this.name, count, options),
            mergeOptions(this, {
                table: options.outputTable ?? this.name,
                method: "selectRows",
                parameters: { count, options },
            })
        )

        if (typeof options.outputTable === "string") {
            return this.sdb.newTable(options.outputTable)
        } else {
            return this
        }
    }

    /**
     * Removes duplicate rows from this table, keeping unique rows. Note that SQL does not guarantee any specific order when using DISTINCT. So the data might be returned in a different order than the original.
     *
     * @example Basic usage
     * ```ts
     * await table.removeDuplicates("tableA")
     * ```
     *
     * @param options - An optional object with configuration options:
     *   @param options.on - A column or multiple columns to consider to remove duplicates. The other columns in the table will not be considered to exclude duplicates.
     *
     * @category Selecting or filtering data
     */
    async removeDuplicates(
        options: {
            on?: string | string[]
        } = {}
    ) {
        await queryDB(
            this,
            removeDuplicatesQuery(this.name, options),
            mergeOptions(this, {
                table: this.name,
                method: "removeDuplicates()",
                parameters: { options },
            })
        )
    }

    /**
     * Removes rows with missing values from this table. By default, missing values are NULL (as an SQL value), but also "NULL", "null", "NaN" and "undefined" that might have been converted to strings before being loaded into the table. Empty strings "" are also considered missing values.
     *
     * @example Basic usage
     * ```ts
     * // Removes rows with missing values in any columns.
     * await table.removeMissing()
     * ```
     *
     * @example Specific columns
     * ```ts
     * // Removes rows with missing values in specific columns.
     * await table.removeMissing({ columns: ["firstName", "lastName"] })
     * ```
     *
     * @param options - An optional object with configuration options:
     *   @param options.columns - Either a string or an array of strings specifying the columns to consider for missing values. By default, all columns are considered.
     *   @param options.missingValues - An array of values to be treated as missing values. Defaults to ["undefined", "NaN", "null", "NULL", ""].
     *   @param options.invert - A boolean indicating whether to invert the condition, keeping only rows with missing values. Defaults to false.
     *
     * @category Selecting or filtering data
     */
    async removeMissing(
        options: {
            columns?: string | string[]
            missingValues?: (string | number)[]
            invert?: boolean
        } = {}
    ) {
        await removeMissing(this, options)
    }

    /**
     * Trims specified characters from the beginning, end, or both sides of string values.
     *
     * @example Basic usage in one column
     * ```ts
     * // Trims values in column1
     * await table.trim("column1")
     * ```
     *
     * @example Multiple column
     * ```ts
     * // Trims values in column2, columns3, and column4
     * await table.trim(["column2", "column3", "column4"])
     * ```
     *
     * @param columns - The column or columns to trim.
     * @param options - An optional object with configuration options:
     *   @param options.character - The string to trim. Defaults to whitespace.
     *   @param options.method - The trimming method.
     *
     * @category Updating data
     */
    async trim(
        columns: string | string[],
        options: {
            character?: string
            method?: "leftTrim" | "rightTrim" | "trim"
        } = {}
    ) {
        options.method = options.method ?? "trim"
        await queryDB(
            this,
            trimQuery(this.name, stringToArray(columns), options),
            mergeOptions(this, {
                table: this.name,
                method: "trim()",
                parameters: { columns, options },
            })
        )
    }

    /**
     * Filters rows from this table based on SQL conditions. Note that it's often faster to use the removeRows method.
     *
     * @example Basic usage
     * ```ts
     * // Keeps only rows where the fruit is not an apple.
     * await table.filter(`fruit != 'apple'`)
     * ```
     *
     * @example More examples
     * ```
     * await table.filter(`price > 100 AND quantity > 0`)
     * await table.filter(`category = 'Electronics' OR category = 'Appliances'`)
     * await table.filter(`lastPurchaseDate >= '2023-01-01'`)
     * ```
     *
     * @param conditions - The filtering conditions specified as a SQL WHERE clause.
     *
     * @category Selecting or filtering data
     */
    async filter(conditions: string) {
        await queryDB(
            this,
            `CREATE OR REPLACE TABLE ${this.name} AS SELECT *
        FROM ${this.name}
        WHERE ${conditions}`,
            mergeOptions(this, {
                table: this.name,
                method: "filter()",
                parameters: { conditions },
            })
        )
    }

    /**
     * Keeps rows with specific values in specific columns.
     *
     * @example Basic usage
     * ```ts
     * // Keeps only rows where the job is 'accountant' or 'developer' and where the city is 'Montreal'.
     * await table.keep({ job: ["accountant", "developer"], city: ["Montreal"] })
     * ```
     *
     * @param columnsAndValues - An object with the columns (keys) and the values to be kept (values as arrays)
     *
     * @category Selecting or filtering data
     */
    async keep(columnsAndValues: { [key: string]: unknown[] }) {
        await queryDB(
            this,
            keepQuery(this.name, columnsAndValues),
            mergeOptions(this, {
                table: this.name,
                method: "keep()",
                parameters: { columnsAndValues },
            })
        )
    }

    /**
     * Remove rows with specific values in specific columns.
     *
     * @example Basic usage
     * ```ts
     * // Remove rows where the job is 'accountant' or 'developer' and where the city is 'Montreal'.
     * await table.remove({ job: ["accountant", "developer"], city: ["Montreal"] })
     * ```
     *
     * @param columnsAndValues - An object with the columns (keys) and the values to be removed (values as arrays)
     *
     * @category Selecting or filtering data
     */
    async remove(columnsAndValues: { [key: string]: unknown[] }) {
        await queryDB(
            this,
            removeQuery(this.name, columnsAndValues),
            mergeOptions(this, {
                table: this.name,
                method: "remove()",
                parameters: { columnsAndValues },
            })
        )
    }

    /**
     * Removes rows from this table based on SQL conditions.
     *
     * @example Basic usage
     * ```ts
     * // Removes rows where the fruit is an apple.
     * await table.removeRows(`fruit = 'apple'`)
     * ```
     *
     * @param conditions - The filtering conditions specified as a SQL WHERE clause.
     *
     * @category Selecting or filtering data
     */
    async removeRows(conditions: string) {
        await queryDB(
            this,
            `DELETE FROM ${this.name} WHERE ${conditions}`,
            mergeOptions(this, {
                table: this.name,
                method: "removeRows()",
                parameters: { conditions },
            })
        )
    }

    /**
     * Renames columns in the table.
     *
     * @example Basic usage
     * ```ts
     * // Renaming "How old?" to "age" and "Man or woman?" to "sex".
     * await table.renameColumns({ "How old?" : "age", "Man or woman?": "sex" })
     * ```
     *
     * @param names - An object mapping old column names to new column names.
     *
     * @category Restructuring data
     */
    async renameColumns(names: { [key: string]: string }) {
        await queryDB(
            this,
            renameColumnQuery(
                this.name,
                Object.keys(names),
                Object.values(names)
            ),
            mergeOptions(this, {
                table: this.name,
                method: "renameColumns()",
                parameters: { names },
            })
        )
    }

    /**
     * Cleans column names by removing non-alphanumeric characters and formats them to camel case.
     *
     * @example Basic usage
     * ```ts
     * await table.cleanColumnNames()
     * ```
     *
     * @category Restructuring data
     */
    async cleanColumnNames() {
        this.debug && console.log("\ncleanColumnNames()")
        const columns = await this.getColumns()
        const obj: { [key: string]: string } = {}
        for (const col of columns) {
            obj[col] = toCamelCase(col)
        }
        await this.renameColumns(obj)
    }

    /**
     * Restructures this table by stacking values. Useful to tidy up data.
     *
     * As an example, let's use this table. It shows the number of employees per year in different departments.
     *
     * | Department | 2021 | 2022 | 2023 |
     * | ---------- | ---- | ---- | ---- |
     * | Accounting | 10   | 9    | 15   |
     * | Sales      | 52   | 75   | 98   |
     *
     * We restructure it by putting all years into a column *Year* and the employees counts into a column *Employees*.
     *
     * @example Basic usage
     * ```ts
     * await table.longer(["2021", "2022", "2023"], "year", "employees")
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
     * @param columns - The column names (and associated values) that we want to stack.
     * @param columnsTo - The new column in which the stacked columns' names will be put into.
     * @param valuesTo - The new column in which the stacked columns' values will be put into.
     *
     * @category Restructuring data
     */
    async longer(columns: string[], columnsTo: string, valuesTo: string) {
        await queryDB(
            this,
            `CREATE OR REPLACE TABLE ${this.name} AS SELECT * FROM (
            FROM ${this.name} UNPIVOT INCLUDE NULLS (
            ${valuesTo}
            for ${columnsTo} in (${columns.map((d) => `${d}`).join(", ")})
            )
        )`,
            mergeOptions(this, {
                table: this.name,
                method: "longer()",
                parameters: { columns, columnsTo, valuesTo },
            })
        )
    }

    /**
     * Restructures this table by unstacking values.
     *
     * As an example, let's use this table. It shows the number of employees per year in different departments.
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
     * @example Basic usage
     * ```ts
     * await table.longer("Year", "Employees")
     * ```
     *
     * Now, the table looks like this and is wider.
     *
     * | Department | 2021 | 2022 | 2023 |
     * | ---------- | ---- | ---- | ---- |
     * | Accounting | 10   | 9    | 15   |
     * | Sales      | 52   | 75   | 98   |
     *
     * @param columnsFrom - The column containing the values that will be transformed into columns.
     * @param valuesFrom - The column containing values to be spread across the new columns.
     *
     * @category Restructuring data
     */
    async wider(columnsFrom: string, valuesFrom: string) {
        await queryDB(
            this,
            `CREATE OR REPLACE TABLE ${this.name} AS SELECT * FROM (PIVOT ${this.name} ON ${columnsFrom} USING sum(${valuesFrom}));`,
            mergeOptions(this, {
                table: this.name,
                method: "wider()",
                parameters: { columnsFrom, valuesFrom },
            })
        )
    }

    /**
     * Converts data types (JavaScript or SQL types) of specified columns. The date format specifiers can be found [here](https://duckdb.org/docs/sql/functions/dateformat).
     *
     * @example Basic usage with JavaScript types
     * ```ts
     * // Converts column1 to string and column2 to integer
     * await table.convert({ column1: "string", column2: "integer" })
     * ```
     *
     * @example With SQL types
     * ```ts
     * // Converts column1 to VARCHAR and column2 to BIGINT
     * await table.convert({ column1: "varchar", column2: "bigint" })
     * ```
     *
     * @example With dates
     * ```ts
     * // Converts strings in a specific format to dates
     * await table.convert({ column3: "datetime"}, { datetimeFormat: "%Y-%m-%d" })
     *
     * // Converts dates to strings with a specific format.
     * await table.convert({ column3: "datetime" }, { datetimeFormat: "%Y-%m-%d" })
     * ```
     *
     * @param types - An object mapping column names to the target data types for conversion.
     * @param options - An optional object with configuration options:
     *   @param options.try - When true, the values that can't be converted will be replaced by NULL instead of throwing an error. Defaults to false.
     *   @param options.datetimeFormat - A string specifying the format for date and time conversions. The method uses strftime and strptime functions from DuckDB. For the format specifiers, see https://duckdb.org/docs/sql/functions/dateformat.
     *
     * @category Restructuring data
     */
    async convert(
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
        const allTypes = await this.getTypes()
        const allColumns = Object.keys(allTypes)

        await queryDB(
            this,
            convertQuery(
                this.name,
                Object.keys(types),
                Object.values(types),
                allColumns,
                allTypes,
                options
            ),
            mergeOptions(this, {
                table: this.name,
                method: "convert()",
                parameters: { types, options },
            })
        )
    }

    /**
     * Remove the table from the database. Invoking methods on this table will throw and error.
     *
     * @example Basic usage
     * ```ts
     * await table.removeTable()
     * ```
     *
     * @category Restructuring data
     */
    async removeTable() {
        await queryDB(
            this,
            `DROP TABLE ${this.name};`,
            mergeOptions(this, {
                table: null,
                method: "removeTable()",
                parameters: {},
            })
        )
    }

    /**
     * Removes one or more columns from this table.
     *
     * @example Basic usage
     * ```ts
     * await table.removeColumns(["column1", "column2"])
     * ```
     *
     * @param columns - The name or an array of names of the columns to be removed.
     *
     * @category Restructuring data
     */
    async removeColumns(columns: string | string[]) {
        await queryDB(
            this,
            stringToArray(columns)
                .map((d) => `ALTER TABLE ${this.name} DROP ${d};`)
                .join("\n"),
            mergeOptions(this, {
                table: this.name,
                method: "removeColumns()",
                parameters: { columns },
            })
        )
    }

    /**
     * Adds a new column based on a type (JavaScript or SQL types) and a SQL definition.
     *
     * @example Basic usage
     * ```ts
     * // Adds column3. The column's values are floats (equivalent to DOUBLE in SQL) and are the results of the sum of values from column1 and column2.
     * await table.addColumn("column3", "float", "column1 + column2")
     * ```
     *
     * @param newColumn - The name of the new column to be added.
     * @param type - The data type for the new column. JavaScript or SQL types.
     * @param definition - SQL expression defining how the values should be computed for the new column.
     *
     * @category Restructuring data
     */
    async addColumn(
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
            `ALTER TABLE ${this.name} ADD ${newColumn} ${parseType(type)};
        UPDATE ${this.name} SET ${newColumn} = ${definition}`,
            mergeOptions(this, {
                table: this.name,
                method: "addColumn()",
                parameters: { newColumn, type, definition },
            })
        )
    }

    /**
     * Adds a new column with the row number.
     *
     * @example Basic usage
     * ```ts
     * // Adds the row number in new column rowNumber.
     * await table.addRowNumber("rowNumber")
     * ```
     *
     * @param newColumn - The name of the new column storing the row number
     *
     * @category Restructuring data
     */
    async addRowNumber(newColumn: string) {
        await queryDB(
            this,
            `CREATE OR REPLACE TABLE ${this.name} AS SELECT *, ROW_NUMBER() OVER() AS ${newColumn} FROM ${this.name}`,
            mergeOptions(this, {
                table: this.name,
                method: "addRowNumber()",
                parameters: { newColumn },
            })
        )
    }

    /**
     * Performs a cross join operation between this table and another table, returning all pairs of rows. This table is considered the left table. Note that the returned rows are not guaranteed to be in the same order. It might create a .tmp folder, so make sure to add .tmp to your gitignore.
     *
     * @example Basic usage
     * ```ts
     * // This table will be overwritten by the cross join with tableB.
     * await tableA.crossJoin(tableB);
     * ```
     *
     * @example Results in a new table
     * ```ts
     * // Returns the resuts in a newTable
     * const tableC = await tableA.crossJoin(tableB, { outputTable: "tableC" });
     * ```
     *
     * @param rightTable - The right table.
     * @param options - An optional object with configuration options:
     *   @param options.outputTable - The name of the table that will be created or replaced with the result of the cross join.
     *
     * @category Restructuring data
     */
    async crossJoin(
        rightTable: SimpleWebTable,
        options: {
            outputTable?: string
        } = {}
    ) {
        await queryDB(
            this,
            crossJoinQuery(this.name, rightTable.name, options),
            mergeOptions(this, {
                table: options.outputTable ?? this.name,
                method: "crossJoin()",
                parameters: { rightTable, options },
            })
        )
        if (typeof options.outputTable === "string") {
            return this.sdb.newTable(options.outputTable)
        } else {
            return this
        }
    }

    /**
     * Merges the data of this table with another table based on a common column. This table is considered the left table. Note that the returned data is not guaranteed to be in the same order as the original tables. It might create a .tmp folder, so make sure to add .tmp to your gitignore.
     *
     * @example Basic usage
     * ```ts
     * // By default, the method automatically looks for a common column in the two tables and does a left join of this tableA (left) and tableB (right). The leftTable (tableA here) will be overwritten with the result.
     * await tableA.join(tableB)
     * ```
     *
     * @example With options
     * ```ts
     * // You can change the common column, the join type, and the output table in options.
     * const tableC = await tableA.join("tableB", { commonColumn: 'id', type: 'inner', outputTable: 'tableC' })
     * ```
     *
     * @param rightTable - The right table to be joined.
     * @param options - An optional object with configuration options:
     *   @param options.commonColumn - The common column used for the join operation. By default, the method automatically searches for a column name that exists in both tables.
     *   @param options.type - The type of join operation to perform. Possible values are "inner", "left", "right", or "full". Default is "left".
     *   @param options.outputTable - The name of the new table that will store the result of the join operation. Default is the leftTable.
     *
     * @category Restructuring data
     */
    async join(
        rightTable: SimpleWebTable,
        options: {
            commonColumn?: string
            type?: "inner" | "left" | "right" | "full"
            outputTable?: string
        } = {}
    ) {
        await join(this, rightTable, options)

        if (typeof options.outputTable === "string") {
            return this.sdb.newTable(options.outputTable)
        } else {
            return this
        }
    }

    /**
     * Replaces specified strings in the selected columns
     *
     * @example Basic usage
     *```ts
     * // Replaces entire strings and substrings too.
     * await table.replace("column1", { "kilograms": "kg" })
     * ```
     *
     * @example Multiple columns and multiple strings
     *```ts
     * // Replaces multiple strings in multiple columns.
     * await table.replace(["column1", "column2"], { "kilograms": "kg", liters: "l" })
     * ```
     *
     * @example Exact match
     * ```ts
     * // Replaces only if matching entire string.
     * await table.replace("column1", { "kilograms": "kg", liters: "l" }, { entireString: true })
     * ```
     * @example Regular expression
     * ```ts
     * // Replaces using a regular expression. Any sequence of one or more digits would be replaced by a hyphen.
     * await table.replace("column1", {"\d+": "-" }, {regex: true})
     * ```
     *
     * @param columns - Either a string or an array of strings specifying the columns where string replacements will occur.
     * @param strings - An object mapping old strings to new strings.
     * @param options - An optional object with configuration options:
     *   @param options.entireString - A boolean indicating whether the entire string must match for replacement. Defaults to false.
     *   @param options.regex - A boolean indicating the use of regular expressions for a global replace. See the [RE2 docs](https://github.com/google/re2/wiki/Syntax) for the syntax. Defaults to false.
     *
     * @category Updating data
     */
    async replace(
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
                this.name,
                stringToArray(columns),
                Object.keys(strings),
                Object.values(strings),
                options
            ),
            mergeOptions(this, {
                table: this.name,
                method: "replace()",
                parameters: { columns, strings, options },
            })
        )
    }

    /**
     * Formats strings to lowercase.
     *
     * @example Basic usage
     *```ts
     * await table.lower("column1")
     * ```
     *
     * @example Multiple columns
     * ```ts
     * await table.lower(["column1", "column2"])
     * ```
     *
     * @param columns - Either a string or an array of strings specifying the columns to be updated.
     *
     * @category Updating data
     */
    async lower(columns: string | string[]) {
        await queryDB(
            this,
            lowerQuery(this.name, stringToArray(columns)),
            mergeOptions(this, {
                table: this.name,
                method: "lower()",
                parameters: { columns },
            })
        )
    }

    /**
     * Formats strings to uppercase.
     *
     * @example Basic usage
     * ```ts
     * await table.upper("tableA", "column1")
     *
     * @example Multiple columns
     * await table.upper(["column1", "column2"])
     * ```
     *
     * @param columns - Either a string or an array of strings specifying the columns to be updated.
     *
     * @category Updating data
     */
    async upper(columns: string | string[]) {
        await queryDB(
            this,
            upperQuery(this.name, stringToArray(columns)),
            mergeOptions(this, {
                table: this.name,
                method: "lower()",
                parameters: { columns },
            })
        )
    }

    /**
     * Splits strings along a separator and replaces the values with a substring at a specified index (starting at 0). If the index is outside the bounds of the list, return an empty string.
     *
     * @example Basic usage
     *```ts
     * // Splits on commas and replaces values with the second substring.
     * await table.splitExtract("column1", ",", 1)
     * ```
     *
     * @param column - The name of the column storing the strings
     * @param separator - The substring to use as a separator
     * @param index - The index of the substring to replace values
     *
     * @category Updating data
     */
    async splitExtract(column: string, separator: string, index: number) {
        await queryDB(
            this,
            `UPDATE ${this.name} SET ${column} = SPLIT_PART(${column}, '${separator}', ${index + 1})`,
            mergeOptions(this, {
                table: this.name,
                method: "splitExtract()",
                parameters: { column, separator, index },
            })
        )
    }

    /**
     * Extracts a specific number of characters, starting from the left.
     *
     * @example Basic usage
     *```ts
     * // Strings in column1 will be replaced by the first two characters of each string.
     * await table.left("column1", 2)
     * ```
     *
     * @param column - The name of the column storing the strings
     * @param numberOfCharacters - The number of characters, starting from the left
     *
     * @category Updating data
     */
    async left(column: string, numberOfCharacters: number) {
        await queryDB(
            this,
            `UPDATE ${this.name} SET ${column} = LEFT(${column}, ${numberOfCharacters})`,
            mergeOptions(this, {
                table: this.name,
                method: "left()",
                parameters: { column, numberOfCharacters },
            })
        )
    }

    /**
     * Extracts a specific number of characters, starting from the right.
     *
     * @example Basic usage
     *```ts
     * // Strings in column1 will be replaced by the last two characters of each string.
     * await table.right("column1", 2)
     * ```
     *
     * @param column - The name of the column storing the strings
     * @param numberOfCharacters - The number of characters, starting from the right
     *
     * @category Updating data
     */
    async right(column: string, numberOfCharacters: number) {
        await queryDB(
            this,
            `UPDATE ${this.name} SET ${column} = RIGHT(${column}, ${numberOfCharacters})`,
            mergeOptions(this, {
                table: this.name,
                method: "right()",
                parameters: { column, numberOfCharacters },
            })
        )
    }

    /**
     * Replaces null values in the selected columns.
     *
     * @example Basic usage
     *```ts
     * // Replace null values by 0.
     * await table.replaceNulls("column1", 0)
     * ```
     *
     * @param columns - Either a string or an array of strings specifying the columns where string replacements will occur.
     * @param value - The value to replace the null values.
     *
     * @category Updating data
     */
    async replaceNulls(
        columns: string | string[],
        value: number | string | Date | boolean
    ) {
        await queryDB(
            this,
            replaceNullsQuery(this.name, stringToArray(columns), value),
            mergeOptions(this, {
                table: this.name,
                method: "replaceNulls()",
                parameters: { columns, value },
            })
        )
    }

    /**
     * Concatenates values from specified columns into a new column.
     *
     * @example Basic usage
     * ```ts
     * // Concatenates values from column1 and column2 into column3
     * await table.concatenate(["column1", "column2"], "column3")
     * ```
     *
     * @example With a separator
     * ```ts
     * // Same thing, but the values will be separated by a dash
     * await table.concatenate(["column1", "column2"], "column3", { separator: "-" })
     * ```
     *
     * @param columns - An array of column names from which values will be concatenated.
     * @param newColumn - The name of the new column to store the concatenated values.
     * @param options - An optional object with configuration options:
     *   @param options.separator - The string used to separate concatenated values. Defaults to an empty string.
     *
     * @category Updating data
     */
    async concatenate(
        columns: string[],
        newColumn: string,
        options: {
            separator?: string
        } = {}
    ) {
        await queryDB(
            this,
            concatenateQuery(this.name, columns, newColumn, options),
            mergeOptions(this, {
                table: this.name,
                method: "concatenate()",
                parameters: { columns, newColumn, options },
            })
        )
    }

    /**
     * Rounds numeric values in specified columns.
     *
     * @example Basic usage
     * ```ts
     * // Rounds column1's values to the nearest integer.
     * await table.round("column1")
     * ```
     *
     * @example Specific number of decimals
     * ```ts
     * // Rounds column1's values with a specific number of decimal places.
     * await table.round("column1", { decimals: 2 })
     * ```
     *
     * @example Specific rounding method
     * ```ts
     * // Rounds column1's values with a specific method. Available methods are "round", "floor" and "ceiling".
     * await table.round("column1", { method: "floor" })
     * ```
     *
     * @param columns - Either a string or an array of strings specifying the columns containing numeric values to be rounded.
     * @param options - An optional object with configuration options:
     *   @param options.decimals - The number of decimal places to round to. Defaults to 0.
     *   @param options.method - The rounding method to use. Defaults to "round".
     *
     * @category Updating data
     */
    async round(
        columns: string | string[],
        options: {
            decimals?: number
            method?: "round" | "ceiling" | "floor"
        } = {}
    ) {
        await queryDB(
            this,
            roundQuery(this.name, stringToArray(columns), options),
            mergeOptions(this, {
                table: this.name,
                method: "round()",
                parameters: { columns, options },
            })
        )
    }

    /**
     * Updates values in a specified column with a SQL expression.
     *
     * @example Basic usage
     * ```ts
     * await table.updateColumn("column1", `LEFT(column2)`)
     * ```
     * @param column - The name of the column to be updated.
     * @param definition - The SQL expression to set the new values in the column.
     *
     * @category Updating data
     */
    async updateColumn(column: string, definition: string) {
        await queryDB(
            this,
            `UPDATE ${this.name} SET ${column} = ${definition}`,
            mergeOptions(this, {
                table: this.name,
                method: "updateColumn()",
                parameters: { column, definition },
            })
        )
    }

    /**
     * Sorts the rows based on specified column(s) and order(s).
     *
     * @example Basic usage
     * ```ts
     * // Sorts column1 ascendingly.
     * await table.sort({ column1: "asc" })
     * ```
     *
     * @example Sorting multiple columns
     * ```ts
     * // Sorts column1 ascendingly then column2 descendingly.
     * await table.sort({ column1: "asc", column2: "desc" })
     * ```
     *
     * @example Languages and special characters
     * ```ts
     * // Taking French accent into account in column1
     * await table.sort({ column1: "asc", column2: "desc" }, { lang: { column1: "fr" }})
     * ```
     *
     * @param order - An object mapping column names to the sorting order: "asc" for ascending or "desc" for descending.
     * @param options - An optional object with configuration options:
     *    @param options.lang - An object mapping column names to language codes. See DuckDB Collations documentation for more: https://duckdb.org/docs/sql/expressions/collations.
     *
     * @category Updating data
     */
    async sort(
        order: { [key: string]: "asc" | "desc" },
        options: {
            lang?: { [key: string]: string }
        } = {}
    ) {
        await queryDB(
            this,
            sortQuery(this.name, order, options),
            mergeOptions(this, {
                table: this.name,
                method: "sort()",
                parameters: { order, options },
            })
        )
    }

    /**
     * Assigns ranks in a new column based on specified column values.
     *
     * @example Basic usage
     * ```ts
     * // Computes ranks in the new column rank from the column1 values.
     * await table.ranks("column1", "rank")
     * ```
     * @example With categories
     * ```ts
     * // Computing ranks in the new column rank from the column1 values. Using the values from column2 as categories.
     * await table.ranks("tableA", "column1", "rank", { categories: "column2" })
     * ```
     *
     * @param values - The column containing values to be used for ranking.
     * @param newColumn - The name of the new column where the ranks will be stored.
     * @param options - An optional object with configuration options:
     *   @param options.categories - The column or columns that define categories for ranking.
     *   @param options.noGaps - A boolean indicating whether to assign ranks without gaps. Defaults to false.
     *
     * @category Analyzing data
     */
    async ranks(
        values: string,
        newColumn: string,
        options: {
            categories?: string | string[]
            noGaps?: boolean
        } = {}
    ) {
        await queryDB(
            this,
            ranksQuery(this.name, values, newColumn, options),
            mergeOptions(this, {
                table: this.name,
                method: "ranks()",
                parameters: { values, newColumn, options },
            })
        )
    }

    /**
     * Assigns quantiles for specified column values.
     *
     * @example Basic usage
     * ```ts
     * // Assigns a quantile from 1 to 10 for each row in new column quantiles, based on values from column1.
     * await table.quantiles("column1", 10, "quantiles")
     * ```
     *
     * @example With categories
     * ```ts
     * // Same thing, except the values in column2 are used as categories.
     * await table.quantiles("column1", 10, "quantiles", { categories: "column2" })
     * ```
     *
     * @param values - The column containing values from which quantiles will be assigned.
     * @param nbQuantiles - The number of quantiles.
     * @param newColumn - The name of the new column where the assigned quantiles will be stored.
     * @param options - An optional object with configuration options:
     *   @param options.categories - The column or columns that define categories for computing quantiles. This can be a single column name or an array of column names.
     *
     * @category Analyzing data
     */
    async quantiles(
        values: string,
        nbQuantiles: number,
        newColumn: string,
        options: {
            categories?: string | string[]
        } = {}
    ) {
        await queryDB(
            this,
            quantilesQuery(this.name, values, nbQuantiles, newColumn, options),
            mergeOptions(this, {
                table: this.name,
                method: "quantiles()",
                parameters: {
                    values,
                    nbQuantiles,
                    newColumn,
                    options,
                },
            })
        )
    }

    /**
     * Assigns bins for specified column values based on an interval size.
     *
     * @example Basic usage
     * ```ts
     * // Assigns a bin for each row in new column bins based on column1 values, with an interval of 10.
     * await table.bins("column1", 10, "bins")
     * // If the minimum value in column1 is 5, the bins will follow this pattern: "[5-14]", "[15-24]", "[25-34]", etc.
     * ```
     *
     * @example Starting value
     * ```ts
     * // Same thing, but with the bins starting at a specific value.
     * await table.bins("column1", 10, "bins", { startValue: 0 })
     * // The bins will follow this pattern: "[0-9]", "[10-19]", "[20-29]", etc.
     * ```
     *
     * @param values - The column containing values from which bins will be computed.
     * @param interval - The interval size for binning the values.
     * @param newColumn - The name of the new column where the bins will be stored.
     * @param options - An optional object with configuration options:
     *   @param options.startValue The starting value for binning. Defaults to the minimum value in the specified column.
     *
     * @category Analyzing data
     */
    async bins(
        values: string,
        interval: number,
        newColumn: string,
        options: {
            startValue?: number
        } = {}
    ) {
        await queryDB(
            this,
            await binsQuery(this, values, interval, newColumn, options),
            mergeOptions(this, {
                table: this.name,
                method: "bins()",
                parameters: {
                    values,
                    interval,
                    newColumn,
                    options,
                },
            })
        )
    }

    /**
     * Computes proportions within a row for specified columns.
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
     *
     * @example Basic usage with specific number of decimals
     * ```ts
     * await tableA.proportionsHorizontal(["Men", "Women", "NonBinary"], { decimals: 2 })
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
     * By default, the new columns have the suffix "Perc", but you can use something else if you want.
     *
     * @example Specific suffix for columns
     * ```ts
     * await tableA.proportionsHorizontal(["Men", "Women", "NonBinary"], { suffix: "Prop", decimals: 2 })
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
     *
     * @param columns - The columns for which proportions will be computed on each row.
     * @param options - An optional object with configuration options:
     *   @param options.suffix - A string suffix to append to the names of the new columns storing the computed proportions. Defaults to "Perc".
     *   @param options.decimals - The number of decimal places to round the computed proportions.
     *
     * @category Analyzing data
     */
    async proportionsHorizontal(
        columns: string[],
        options: {
            suffix?: string
            decimals?: number
        } = {}
    ) {
        await queryDB(
            this,
            proportionsHorizontalQuery(this.name, columns, options),
            mergeOptions(this, {
                table: this.name,
                method: "proportionsHorizontal()",
                parameters: {
                    columns,
                    options,
                },
            })
        )
    }

    /**
     * Computes proportions over a column's values.
     *
     * @example Basic usage
     * ```ts
     * // This will add a column perc with the result of each column1 value divided by the sum of all column1 values.
     * await table.proportionsVertical("column1", "perc")
     * ```
     *
     * @example With categories
     * ```ts
     * // Same thing but using column2 values as categories
     * await table.proportionsVertical("column1", "perc", { categories: "column2" })
     * ```
     *
     * @example With specific number of decimals
     * ```ts
     * // Same thing but rounding to two decimals
     * await table.proportionsVertical("column1", "perc", { categories: "column2", decimals: 2 })
     * ```
     *
     * @param column - The column containing values for which proportions will be computed. The proportions are calculated based on the sum of values in the specified column.
     * @param newColumn - The name of the new column where the proportions will be stored.
     * @param options - An optional object with configuration options:
     *   @param options.categories - The column or columns that define categories for computing proportions. This can be a single column name or an array of column names.
     *   @param options.decimals - The number of decimal places to round the computed proportions.
     *
     * @category Analyzing data
     */
    async proportionsVertical(
        column: string,
        newColumn: string,
        options: {
            categories?: string | string[]
            decimals?: number
        } = {}
    ) {
        await queryDB(
            this,
            proportionsVerticalQuery(this.name, column, newColumn, options),
            mergeOptions(this, {
                table: this.name,
                method: "proportionsVertical()",
                parameters: {
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
     * @example Basic usage
     * ```ts
     * // Summarizes all numeric columns with all available summary operations.
     * await tableA.summarize()
     * ```
     *
     * @example Results in a new table
     * ```ts
     * // Same, but the results will be stored in tableB.
     * const tableB = await tableA.summarize({ outputTable: "tableB" })
     * ```
     *
     * @example Just one column
     * ```ts
     * // Summarizes a specific column with all available summary operations
     * await tableA.summarize({ values: "column1" })
     * ```
     *
     * @example Multiple columns
     * ```ts
     * // Summarizes multiple columns with all available summary operations.
     * await tableA.summarize({ values: ["column1", "column2"] })
     * ```
     *
     * @example With categories
     * ```ts
     * // Summarizes a specific column with all available summary operations and use the values in another column as categories. Categories can be an array of column names, too.
     * await tableA.summarize({ values: "column1", categories: "column2" })
     * ```
     *
     * @example Specific aggregation
     * ```ts
     * // Summarizes a specific column with a specific summary operation and use the values in another column as categories. Summaries can be an array of summary operations, too.
     * await tableA.summarize({ values: "column1", categories: "column2", summaries: "mean" })
     * ```
     *
     * @example Rounding aggregated values
     * ```ts
     * // Summarizes and round values with a specific number of decimal places.
     * await tableA.summarize({ values: "column1", categories: "column2", summaries: "mean", decimals: 4 })
     * ```
     *
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
        await summarize(this, options)
        if (typeof options.outputTable === "string") {
            return this.sdb.newTable(options.outputTable)
        } else {
            return this
        }
    }

    /**
     * Computes rolling aggregations, like a rolling average. For rows without enough preceding or following rows, returns NULL. For this method to work properly, don't forget to sort your data first.
     *
     * @example Basic usage
     * ```ts
     * // 7-day rolling average of values in column1 with the 3 preceding and 3 following rows.
     * await table.rolling("column1", "rollingAvg", "mean", 3, 3)
     * ```
     *
     * @example With categories
     * ```ts
     * // 7-day rolling average of values in column1 with the 3 preceding and 3 following rows. Using values in column2 as categories.
     * await table.rolling("column1", "rollingAvg", "mean", 3, 3, { categories: "column2" })
     * ```
     *
     * @example Rounding
     * ```ts
     * // 7-day rolling average of values in column1 with the 3 preceding and 3 following rows. Using values in column2 as categories and rounding to two decimal places.
     * await table.rolling("column1", "rollingAvg", "mean", 3, 3, { categories: "column2", decimals: 2 })
     * ```
     *
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
                this.name,
                column,
                newColumn,
                summary,
                preceding,
                following,
                options
            ),
            mergeOptions(this, {
                table: this.name,
                method: "rolling()",
                parameters: {
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
     * Calculates correlations between columns.
     *
     * If no *x* and *y* columns are specified, the method computes the correlations of all numeric columns *combinations*. It's important to note that correlation is symmetrical: the correlation of *x* over *y* is the same as *y* over *x*.
     *
     * @example Basic usage
     * ```ts
     * // Computes all correlations between all numeric columns.
     * await table.correlations()
     * ```
     * @example Specific x column
     * ```ts
     * // Computes all correlations between a specific x column and all other numeric columns.
     * await table.correlations({ x: "column1" })
     * ```
     *
     * @example Specific x and y columns
     * ```ts
     * // Computes the correlations between specific x and y columns.
     * await table.correlations({ x: "column1", y: "column2" })
     * ```
     *
     * @example Returning results in a new table
     * ```ts
     * // Same but results are stored in tableB.
     * const tableB = await table.correlations({ outputTable: "tableB" })
     * ```
     *
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
        options: {
            x?: string
            y?: string
            categories?: string | string[]
            decimals?: number
            outputTable?: string
        } = {}
    ) {
        await correlations(this, options)
        if (typeof options.outputTable === "string") {
            return this.sdb.newTable(options.outputTable)
        } else {
            return this
        }
    }

    /**
     * Performs linear regression analysis. The results include the slope, the y-intercept the R-squared.
     *
     * If no *x* and *y* columns are specified, the method computes the linear regression analysis of all numeric columns *permutations*. It's important to note that linear regression analysis is asymmetrical: the linear regression of *x* over *y* is not the same as *y* over *x*.
     *
     * @example Basic usage
     * ```ts
     * // Computes all linear regressions between all numeric columns in tableA and overwrites tableA.
     * await table.linearRegressions()
     * ```
     *
     * @example Specific x column
     * ```ts
     * // Computes all linear regressions between a specific x column and all other numeric columns.
     * await table.linearRegressions({ x: "column1" })
     * ```
     *
     * @example Specific x and y columns
     * ```ts
     * // Computes the linear regression between a specific x and y columns.
     * await table.linearRegressions({ x: "column1", y: "column2" })
     * ```
     *
     * @example Returning results in a new table
     * ```ts
     * // Same but stores the results in tableB.
     * await table.linearRegressions({ outputTable: "tableB" })
     * ```
     *
     * @param options - An optional object with configuration options:
     *   @param options.x - The column name for the independent variable (x values) in the linear regression analysis.
     *   @param options.y - The column name for the dependent variable (y values) in the linear regression analysis.
     *   @param options.categories - The column or columns that define categories. Correlation calculations will be run for each category.
     *   @param options.decimals - The number of decimal places to round the regression coefficients.
     *
     * @category Analyzing data
     */
    async linearRegressions(
        options: {
            x?: string
            y?: string
            categories?: string | string[]
            decimals?: number
            outputTable?: string
        } = {}
    ) {
        await linearRegressions(this, options)
        if (typeof options.outputTable === "string") {
            return this.sdb.newTable(options.outputTable)
        } else {
            return this
        }
    }

    /**
     * Identifies outliers using the Interquartile Range (IQR) method.
     *
     * @example Basic usage
     * ```ts
     * // Looks for outliers in column age. Creates a new column outliers with TRUE or FALSE values.
     * await table.outliersIQR("age", "outliers")
     * ```
     *
     * @example With categories
     * ```ts
     * // Looks for outliers in column age with values from column gender as categories. Creates a new column outliers with TRUE or FALSE values.
     * await table.outliersIQR("age", "outliers", { categories: "gender" })
     * ```
     *
     * @param column - The name of the column in which outliers will be identified.
     * @param newColumn - The name of the new column where the bins will be stored.
     * @param options - An optional object with configuration options:
     *   @param options.categories - The column or columns that define categories for outliers.
     *
     * @category Analyzing data
     */
    async outliersIQR(
        column: string,
        newColumn: string,
        options: {
            categories?: string | string[]
        } = {}
    ) {
        await queryDB(
            this,
            outliersIQRQuery(
                this.name,
                column,
                newColumn,
                (await this.getNbRows()) % 2 === 0 ? "even" : "odd",
                options
            ),
            mergeOptions(this, {
                table: this.name,
                method: "outliersIQR()",
                parameters: { column, newColumn, options },
            })
        )
    }

    /**
     * Computes the Z-score.
     *
     * @example Basic usage
     * ```ts
     * // Calculates the Z-score for the values in column age and puts the results in column sigma.
     * await table.zScore("age", "sigma")
     * ```
     *
     * @example With categories
     * ```ts
     * // Calculates the Z-score for the values in column age with the column gender as categories and puts the results in column sigma.
     * await table.zScore("age", "sigma", { categories: "gender" })
     * ```
     *
     * @example Rounding values
     * ```ts
     * // Calculates the Z-score for the values in column age with the column gender as categories and puts the results in column sigma. The score is rounded to two decimal places.
     * await table.zScore("age", "sigma", { categories: "gender", decimals: 2 })
     * ```
     *
     * @param column - The name of the column for which Z-Score will be calculated.
     * @param newColumn - The name of the new column where the bins will be stored.
     * @param options - An optional object with configuration options:
     *   @param options.categories - The column or columns that define categories for zScores.
     *   @param options.decimals - The number of decimal places to round the Z-score values.
     *
     * @category Analyzing data
     */
    async zScore(
        column: string,
        newColumn: string,
        options: {
            categories?: string | string[]
            decimals?: number
        } = {}
    ) {
        await queryDB(
            this,
            zScoreQuery(this.name, column, newColumn, options),
            mergeOptions(this, {
                table: this.name,
                method: "zScore()",
                parameters: { column, newColumn, options },
            })
        )
    }

    /**
     * Normalizes the values in a column using min-max normalization.
     *
     * @example Basic usage
     * ```ts
     * // Normalizes the values in the column1.
     * await table.normalize("column1")
     * ```
     *
     * @example With categories
     * ```ts
     * // Normalizes the values in the column1 with values from column2 as categories.
     * await table.normalize("column1", { categories: "column2" })
     * ```
     *
     * @example Rounding values
     * ```ts
     * // Normalizes the values in the column1 with values from column2 as categories. The values are rounded to two decimal places.
     * await table.normalize("column1", { categories: "column2", decimals: 2 })
     * ```
     *
     * @param column - The name of the column in which values will be normalized.
     * @param newColumn - The name of the new column where normalized values will be stored.
     * @param options - An optional object with configuration options:
     *   @param options.categories - The column or columns that define categories for the normalization.
     *   @param options.decimals - The number of decimal places to round the normalized values.
     *
     * @category Analyzing data
     */
    async normalize(
        column: string,
        newColumn: string,
        options: {
            categories?: string | string[]
            decimals?: number
        } = {}
    ) {
        await queryDB(
            this,
            normalizeQuery(this.name, column, newColumn, options),
            mergeOptions(this, {
                table: this.name,
                method: "normalize()",
                parameters: { column, options },
            })
        )
    }

    /**
     * Updates data using a JavaScript function. The function takes the existing rows as an array of objects and must return them modified as an array of objects. This method provides a flexible way to update data, but it's slow.
     *
     * @example Basic usage
     * ```ts
     * // Adds one to the values from column1. If the values are not numbers, they are replaced by null.
     * await table.updateWithJS((rows) => {
     *  const modifiedRows = rows.map(d => ({
     *      ...d,
     *      column1: typeof d.column1 === "number" ? d.column1 + 1 : null
     *  }))
     *  return modifiedRows
     * })
     * ```
     *
     * @param dataModifier - A function that takes the existing rows and returns modified rows using JavaScript logic. The original rows are objects in an array and the modified rows must be returned as an array of objects too.
     *
     * @category Updating data
     */
    async updateWithJS(
        dataModifier: (
            rows: {
                [key: string]: number | string | Date | boolean | null
            }[]
        ) => {
            [key: string]: number | string | Date | boolean | null
        }[]
    ) {
        this.debug && console.log("\nupdateWithJS()")
        this.debug && console.log("parameters:", { dataModifier: dataModifier })
        const oldData = await this.getData()
        if (!oldData) {
            throw new Error("No data from getData.")
        }
        const newData = dataModifier(oldData)
        await this.loadArray(newData)
    }

    /**
     * Returns the schema (column names and their data types).
     *
     * @example Basic usage
     * ```ts
     * const schema = await table.getSchema()
     * ```
     *
     */
    async getSchema(): Promise<
        {
            [key: string]: string | null
        }[]
    > {
        return (await queryDB(
            this,
            `DESCRIBE ${this.name}`,
            mergeOptions(this, {
                returnDataFrom: "query",
                nbRowsToLog: Infinity,
                table: this.name,
                method: "getSchema()",
                parameters: {},
            })
        )) as {
            [key: string]: string | null
        }[]
    }

    /**
     * Returns descriptive information about the columns, including details like data types, number of null and distinct values. Best to look at with console.table.
     *
     * @example Basic usage
     * ```ts
     * const description = await table.getDescription()
     * ```
     *
     */
    async getDescription(): Promise<
        {
            [key: string]: unknown
        }[]
    > {
        return await getDescription(this)
    }

    /**
     * Return the list of column names.
     *
     * ```ts
     * const columns = await table.getColumns()
     * ```
     *
     */
    async getColumns(): Promise<string[]> {
        return await getColumns(this)
    }

    /**
     * Returns the number of columns.
     *
     * @example Basic usage
     * ```ts
     * const nbColumns = await table.getNbColumns()
     * ```
     */
    async getNbColumns(): Promise<number> {
        this.debug && console.log("\ngetNbColumns()")
        this.debug && console.log("parameters:", {})
        const result = (await getColumns(this)).length
        this.debug && console.log("Number columns:", result)
        return result
    }

    /**
     * Returns the number of rows in a table.
     *
     * @example Basic usage
     * ```ts
     * const nbRows = await table.getNbRows()
     * ```
     */
    async getNbRows(): Promise<number> {
        return await getNbRows(this)
    }

    /**
     * Returns the number of values (number of columns * number of rows) in a table.
     *
     * @example Basic usage
     * ```ts
     * const nbValues = await table.getNbValues()
     * ```
     */
    async getNbValues(): Promise<number> {
        this.debug && console.log("\ngetNbValues")
        this.debug && console.log("parameters:", {})
        const result = (await this.getNbColumns()) * (await this.getNbRows())
        this.debug && console.log("Number values:", result)
        return result
    }

    /**
     * Returns the data types of columns.
     *
     * @example Basic usage
     * ```ts
     * const dataTypes = await table.getTypes()
     * ```
     */
    async getTypes(): Promise<{
        [key: string]: string
    }> {
        return await getTypes(this)
    }

    /**
     * Returns the values of a specific column.
     *
     * @example Basic usage
     * ```ts
     * const values = await table.getValues("column1")
     * ```
     *
     * @param column - The name of the column.
     *
     * @category Getting data
     */
    async getValues(
        column: string
    ): Promise<(string | number | boolean | Date | null)[]> {
        return await getValues(this, column)
    }

    /**
     * Returns the minimum value from a specific column.
     *
     * @example Basic usage
     * ```ts
     * const minimum = await table.getMin("column1")
     * ```
     *
     * @param column - The name of the column.
     *
     * @category Getting data
     */
    async getMin(
        column: string
    ): Promise<string | number | boolean | Date | null> {
        return await getMin(this, column)
    }

    /**
     * Returns the maximum value from a specific column.
     *
     * ```ts
     * const maximum = await table.getMax("column1")
     * ```
     *
     * @param column - The name of the column.
     *
     * @category Getting data
     */
    async getMax(
        column: string
    ): Promise<string | number | boolean | Date | null> {
        return await getMax(this, column)
    }

    /**
     * Returns the mean value from a specific column.
     *
     * @example Basic usage
     * ```ts
     * const mean = await table.getMean("column1")
     * ```
     *
     * @example Rounding result
     * ```ts
     * // Same thing but rounding to two decimal places.
     * const mean = await table.getMean("column1", { decimals: 2 })
     * ```
     *
     * @param column - The name of the column.
     * @param options - An optional object with configuration options:
     *   @param options.decimals - The number of decimal places to round the result to.
     *
     * @category Getting data
     */
    async getMean(
        column: string,
        options: {
            decimals?: number
        } = {}
    ): Promise<number> {
        return await getMean(this, column, options)
    }

    /**
     * Returns the median value from a specific column.
     *
     * @example Basic usage
     * ```ts
     * const median = await table.getMedian("column1")
     * ```
     *
     * @example Rounding results
     * ```ts
     * // Same thing but rounding to two decimal places.
     * const median = await table.getMedian("column1", { decimals: 2})
     * ```
     *
     * @param column - The name of the column.
     * @param options - An optional object with configuration options:
     *   @param options.decimals - The number of decimal places to round the result to.
     *
     * @category Getting data
     */
    async getMedian(
        column: string,
        options: {
            decimals?: number
        } = {}
    ): Promise<number> {
        return await getMedian(this, column, options)
    }

    /**
     * Returns the sum of values from a specific column.
     *
     * @example Basic usage
     * ```ts
     * const sum = await table.getSum("column1")
     * ```
     *
     * @param column - The name of the column.
     *
     * @category Getting data
     */
    async getSum(column: string): Promise<number> {
        return await getSum(this, column)
    }

    /**
     * Returns the skewness of values from a specific column.
     *
     * @example Basic usage
     * ```ts
     * const skew = await table.getSkew("column1")
     * ```
     *
     * @example Rounding result
     * ```ts
     * // Same thing but rounding to two decimal places.
     * const skew = await table.getSkew("column1", { decimals: 2})
     * ```
     *
     * @param column - The name of the column.
     * @param options - An optional object with configuration options:
     *   @param options.decimals - The number of decimal places to round the result to.
     *
     * @category Getting data
     */
    async getSkew(
        column: string,
        options: {
            decimals?: number
        } = {}
    ): Promise<number> {
        return await getSkew(this, column, options)
    }

    /**
     * Returns the standard deviation of values from a specific column.
     *
     * @example Basic usage
     * ```ts
     * const standardDeviation = await table.getStdDev("column1")
     * ```
     *
     * @example Rounding result
     * ```ts
     * // Same thing but rounding to two decimal places.
     * const standardDeviation = await table.getStdDev("column1", { decimals: 2 })
     * ```
     *
     * @param column - The name of the column.
     * @param options - An optional object with configuration options:
     *   @param options.decimals - The number of decimal places to round the result to.
     *
     * @category Getting data
     */
    async getStdDev(
        column: string,
        options: {
            decimals?: number
        } = {}
    ): Promise<number> {
        return await getStdDev(this, column, options)
    }

    /**
     * Returns the variance of values from a specific column.
     *
     * @example Basic usage
     * ```ts
     * const variance = await table.getVar("column1")
     * ```
     *
     * @example Rounding result
     * ```ts
     * // Same thing but rounding to two decimal places
     * const variance = await table.getVar("column1")
     * ```
     *
     * @param column - The name of the column.
     * @param options - An optional object with configuration options:
     *   @param options.decimals - The number of decimal places to round the result to.
     *
     * @category Getting data
     */
    async getVar(
        column: string,
        options: {
            decimals?: number
        } = {}
    ): Promise<number> {
        return await getVar(this, column, options)
    }

    /**
     * Returns the value of a specific quantile from the values in a given column.
     *
     * @example Basic usage
     * ```ts
     * const firstQuartile = await table.getQuantile("column1", 0.25)
     * ```
     *
     * @example Rounding result
     * ```ts
     * // Same thing but rounding to two decimal places.
     * const firstQuartile = await table.getQuantile("column1", 0.25, { decimals: 2 })
     * ```
     *
     * @param column - The name of the column from which to calculate the quantile.
     * @param quantile - The quantile (between 0 and 1) to calculate. For example, 0.25 for the first quartile.
     * @param options - An optional object with configuration options:
     *   @param options.decimals - The number of decimal places to round the result to.
     *
     * @category Getting data
     */
    async getQuantile(
        column: string,
        quantile: number,
        options: { decimals?: number } = {}
    ): Promise<number> {
        return await getQuantile(this, column, quantile, options)
    }

    /**
     * Returns unique values from a specific column. For convenience, it returns the value ascendingly.
     *
     * @example Basic usage
     * ```ts
     * const uniques = await table.getUniques("column1")
     * ```
     *
     * @param column - The name of the column from which to retrieve unique values.
     *
     * @category Getting data
     */
    async getUniques(
        column: string
    ): Promise<(string | number | boolean | Date | null)[]> {
        return await getUniques(this, column)
    }

    /**
     * Returns the first row with optional filtering conditions written as an SQL expression.
     *
     * @example Basic usage
     * ```ts
     * // Returns the first row
     * const firstRow = await table.getFirstRow()
     * ```
     *
     * @example With condition
     * ```ts
     * // Returns the first row with category being 'Book'.
     * const firstRowBooks = await table.getFirstRow({ condition: `category = 'Book'` })
     * ```
     *
     * @param options - An optional object with configuration options:
     *    @param options.condition - The filtering conditions specified as a SQL WHERE clause. Defaults to no condition.
     *
     * @category Getting data
     */
    async getFirstRow(
        options: {
            condition?: string
        } = {}
    ): Promise<{
        [key: string]: string | number | boolean | Date | null
    }> {
        return getFirstRow(this, options)
    }

    /**
     * Returns the last row with optional filtering conditions written as an SQL expression.
     *
     * @example Basic usage
     * ```ts
     * // Returns the last row.
     * const lastRow = await table.getLastRow()
     * ```
     *
     * @example With condition
     * ```
     * // Returns the last row of all rows having a category 'Book'.
     * const lastRowBooks = await table.getLastRow({ condition: `category = 'Book'` })
     * ```
     *
     * @param options - An optional object with configuration options:
     *   @param options.condition - The filtering conditions specified as a SQL WHERE clause. Defaults to no condition.
     *
     * @category Getting data
     */
    async getLastRow(
        options: {
            condition?: string
        } = {}
    ): Promise<{
        [key: string]: string | number | boolean | Date | null
    }> {
        return getLastRow(this, options)
    }

    /**
     * Returns the top n rows, optionally with a condition written as an SQL expression.
     *
     * @example Basic usage
     * ```ts
     * // Returns the first 10 rows
     * const top10 = await table.getTop(10)
     * ```
     *
     * @example With a condition
     * ```
     * // Returns the first 10 rows with category being 'Books'.
     * const top10Books = await table.getTop(10, { condition: `category = 'Books'` })
     * ```
     *
     * @param count - The number of rows to return.
     * @param options - An optional object with configuration options:
     *   @param options.condition - The filtering conditions specified as a SQL WHERE clause. Defaults to no condition.
     *
     * @category Getting data
     */
    async getTop(
        count: number,
        options: {
            condition?: string
        } = {}
    ): Promise<
        {
            [key: string]: string | number | boolean | Date | null
        }[]
    > {
        return await getTop(this, count, options)
    }

    /**
     * Returns the bottom n rows, optionally with a condition written as a SQL expression. The last row will be returned first. To keep the original order of the data, use the originalOrder option.
     *
     * @example Basic usage
     * ```ts
     * // Last row will be returned first.
     * const bottom10 = await table.getBottom(10)
     * ```
     *
     * @example With original order
     * ```
     * // Last row will be returned last.
     * const bottom10 = await table.getBottom(10, { originalOrder: true })
     * ```
     *
     * @example With a condition
     * ```
     * // Returns the last 10 rows with category being 'Books'.
     * const bottom10Books = await table.getBottom(10, { condition: `category = 'Books'` })
     * ```
     *
     * @param count - The number of rows to return.
     * @param options - An optional object with configuration options:
     *   @param options.originalOrder - A boolean indicating whether the rows should be returned in their original order. Default is false, meaning the last row will be returned first.
     *   @param options.condition - The filtering conditions specified as a SQL WHERE clause. Defaults to no condition.
     *
     * @category Getting data
     */
    async getBottom(
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
        return await getBottom(this, count, options)
    }

    /**
     * Returns the data with an optional condition.
     *
     * @example Basic usage
     * ```ts
     * // Returns all data.
     * const data = await table.getData()
     * ```
     * @example With condition
     * ```ts
     * // Returns just the rows with a category 'Book'. Conditions are SQL expressions.
     * const books = await table.getData({ condition: `category = 'Book'` })
     * ```
     *
     * @param options - An optional object with configuration options:
     *   @param options.condition - A SQL WHERE clause condition to filter the data. Defaults to no condition.
     *
     * @category Getting data
     */
    async getData(
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
            `SELECT * from ${this.name}${
                options.condition ? ` WHERE ${options.condition}` : ""
            }`,
            mergeOptions(this, {
                returnDataFrom: "query",
                table: this.name,
                method: "getData()",
                parameters: { options },
            })
        )) as {
            [key: string]: string | number | boolean | Date | null
        }[]
    }

    // GEOSPATIAL

    /**
     * Loads geospatial data from an external file.
     *
     * @example Basic usage with URL
     * ```ts
     * await table.loadGeoData("https://some-website.com/some-data.geojson")
     * ```
     *
     * @example Basic usage with local file
     * ```ts
     * await table.loadGeoData("./some-data.geojson")
     * ```
     *
     * @param file - The URL or path to the external file containing the geospatial data.
     *
     * @category Geospatial
     */
    async loadGeoData(file: string) {
        await queryDB(
            this,
            `INSTALL spatial; LOAD spatial;
            CREATE OR REPLACE TABLE ${this.name} AS SELECT * FROM ST_Read('${file}');`,
            mergeOptions(this, {
                table: this.name,
                method: "loadGeoData()",
                parameters: { file },
            })
        )
    }

    /**
     * Creates point geometries from longitude a latitude columns.
     *
     * @example Basic usage
     * ```ts
     * // Uses the columns "lat" and "lon" to create point geometries in column "geom"
     * await table.points("lat", "lon", "geom")
     * ```
     * @param columnLat - The name of the column storing the latitude.
     * @param columnLon - The name of the column storing the longitude.
     * @param newColumn - The name of the new column storing the point geometries.
     *
     * @category Geospatial
     */
    async points(columnLat: string, columnLon: string, newColumn: string) {
        await queryDB(
            this,
            `ALTER TABLE ${this.name} ADD COLUMN ${newColumn} GEOMETRY; UPDATE ${this.name} SET ${newColumn} = ST_Point2D(${columnLon}, ${columnLat})`,
            mergeOptions(this, {
                table: this.name,
                method: "points()",
                parameters: { columnLat, columnLon, newColumn },
            })
        )
    }

    /**
     * Adds a column with TRUE/FALSE values depending on the validity of geometries.
     *
     * @example Basic usage
     * ```ts
     * // Checks if the geometries in column geom are valid and returns a boolean in column valid.
     * await table.isValidGeo("geom", "valid")
     * ```
     *
     * @param column - The name of the column storing the geometries.
     * @param newColumn - The name of the new column storing the results.
     *
     * @category Geospatial
     */
    async isValidGeo(column: string, newColumn: string) {
        await queryDB(
            this,
            `ALTER TABLE ${this.name} ADD COLUMN ${newColumn} BOOLEAN; UPDATE ${this.name} SET ${newColumn} = ST_IsValid(${column})`,
            mergeOptions(this, {
                table: this.name,
                method: "isValidGeo()",
                parameters: { column, newColumn },
            })
        )
    }

    /**
     * Adds a column with TRUE if the geometry is closed and FALSE if it's open.
     *
     * @example Basic usage
     * ```ts
     * // Checks if the geometries in column geom are closed and returns a boolean in column closed.
     * await table.isClosedGeo("geom", "closed")
     * ```
     *
     * @param column - The name of the column storing the geometries.
     * @param newColumn - The name of the new column storing the results.
     *
     * @category Geospatial
     */
    async isClosedGeo(column: string, newColumn: string) {
        await queryDB(
            this,
            `ALTER TABLE ${this.name} ADD COLUMN ${newColumn} BOOLEAN; UPDATE ${this.name} SET ${newColumn} = ST_IsClosed(${column})`,
            mergeOptions(this, {
                table: this.name,
                method: "isClosedGeo()",
                parameters: { column, newColumn },
            })
        )
    }

    /**
     * Adds a column with the geometry type.
     *
     * @example Basic usage
     * ```ts
     * // Returns the geometry type in column type.
     * await table.typeGeo("geom", "type")
     * ```
     *
     * @param column - The name of the column storing the geometries.
     * @param newColumn - The name of the new column storing the results.
     *
     * @category Geospatial
     */
    async typeGeo(column: string, newColumn: string) {
        await queryDB(
            this,
            `ALTER TABLE ${this.name} ADD COLUMN ${newColumn} VARCHAR; UPDATE ${this.name} SET ${newColumn} = ST_GeometryType(${column})`,
            mergeOptions(this, {
                table: this.name,
                method: "typeGeo()",
                parameters: { column, newColumn },
            })
        )
    }

    /**
     * Flips the coordinates of geometries. Useful for some geojson files which have lat and lon inverted.
     *
     * @example Basic usage
     * ```ts
     * await table.flipCoordinates("geom")
     * ```
     *
     * @param column - The name of the column storing the geometries.
     *
     * @category Geospatial
     */
    async flipCoordinates(column: string) {
        await queryDB(
            this,
            `UPDATE ${this.name} SET ${column} = ST_FlipCoordinates(${column})`,
            mergeOptions(this, {
                table: this.name,
                method: "flipCoordinates()",
                parameters: { column },
            })
        )
    }

    /**
     * Reduce the precision of geometries.
     *
     * @example Basic usage
     * ```ts
     * // Reduce the precision to 3 decimals.
     * await table.reducePrecision("geom", 3)
     * ```
     *
     * @param column - The name of the column storing the geometries.
     *
     * @category Geospatial
     */
    async reducePrecision(column: string, decimals: number) {
        await queryDB(
            this,
            `UPDATE ${this.name} SET ${column} = ST_ReducePrecision(${column}, ${1 / Math.pow(10, decimals)})`,
            mergeOptions(this, {
                table: this.name,
                method: "reducePrecision()",
                parameters: { column, decimals },
            })
        )
    }

    /**
     * Reprojects the data from one Spatial Reference System (SRS) to another.
     *
     * @example Basic usage
     * ```ts
     * // From EPSG:3347 (also called NAD83/Statistics Canada Lambert with coordinates in meters) to EPSG:4326 (also called WGS84, with lat and lon in degrees)
     * await table.reproject("geom", "EPSG:3347", "EPSG:4326")
     * ```
     *
     * @param column - The name of the column storing the geometries.
     * @param from - The original SRS.
     * @param to - The target SRS.
     *
     * @category Geospatial
     */
    async reproject(column: string, from: string, to: string) {
        await queryDB(
            this,
            `UPDATE ${this.name} SET ${column} = ST_Transform(${column}, '${from}', '${to}')`,
            mergeOptions(this, {
                table: this.name,
                method: "reproject()",
                parameters: { column, from, to },
            })
        )
    }

    /**
     * Computes the area of geometries in square meters or optionally square kilometers. The input geometry is assumed to be in the EPSG:4326 coordinate system (WGS84), with [latitude, longitude] axis order.
     *
     * @example Basic usage
     * ```ts
     * // Computes the area of the geometries in the column geom and returns the results in the column area.
     * await table.area("geom", "area")
     * ```
     *
     * @example With a different unit
     * ```ts
     * // Same things but in square kilometers.
     * await table.area("geom", "area", { unit: "km2" })
     * ```
     *
     * @param column - The name of the column storing the geometries.
     * @param newColumn - The name of the new column storing the computed areas.
     * @param options - An optional object with configuration options:
     *   @param options.unit - The area can be returned as square meters or square kilometers.
     *
     * @category Geospatial
     */
    async area(
        column: string,
        newColumn: string,
        options: { unit?: "m2" | "km2" } = {}
    ) {
        await queryDB(
            this,
            `ALTER TABLE ${this.name} ADD ${newColumn} DOUBLE; UPDATE ${this.name} SET ${newColumn} =  ST_Area_Spheroid(${column}) ${options.unit === "km2" ? "/ 1000000" : ""};`,
            mergeOptions(this, {
                table: this.name,
                method: "area()",
                parameters: { column, newColumn, options },
            })
        )
    }

    /**
     * Computes the length of line geometries in meters or optionally kilometers. The input geometry is assumed to be in the EPSG:4326 coordinate system (WGS84), with [latitude, longitude] axis order.
     *
     * @example Basic usage
     * ```ts
     * // Computes the length of the geometries in the column geom and returns the results in the column length.
     * await table.length("geom", "length")
     * ```
     *
     * @example With a different unit
     * ```ts
     * // Same things but in kilometers.
     * await table.length("geom", "length", { unit: "km" })
     * ```
     *
     * @param column - The name of the column storing the geometries.
     * @param newColumn - The name of the new column storing the computed lengths.
     * @param options - An optional object with configuration options:
     *   @param options.unit - The length can be returned as meters or kilometers.
     *
     * @category Geospatial
     */
    async length(
        column: string,
        newColumn: string,
        options: { unit?: "m" | "km" } = {}
    ) {
        await queryDB(
            this,
            `ALTER TABLE ${this.name} ADD ${newColumn} DOUBLE; UPDATE ${this.name} SET ${newColumn} =  ST_Length_Spheroid(${column}) ${options.unit === "km" ? "/ 1000" : ""};`,
            mergeOptions(this, {
                table: this.name,
                method: "length()",
                parameters: { column, newColumn, options },
            })
        )
    }

    /**
     * Computes the perimeter of polygon geometries in meters or optionally kilometers. The input geometry is assumed to be in the EPSG:4326 coordinate system (WGS84), with [latitude, longitude] axis order.
     *
     * @example Basic usage
     * ```ts
     * // Computes the perimeter of the geometries in the column geom, and returns the results in the column perim.
     * await table.perimeter("geom", "perim")
     * ```
     *
     * @example With a different unit
     * ```ts
     * // Same things but in kilometers.
     * await table.perimeter("geom", "perim", { unit: "km" })
     * ```
     *
     * @param column - The name of the column storing the geometries.
     * @param newColumn - The name of the new column storing the computed perimeters.
     * @param options - An optional object with configuration options:
     *   @param options.unit - The perimeter can be returned as meters or kilometers.
     *
     * @category Geospatial
     */
    async perimeter(
        column: string,
        newColumn: string,
        options: { unit?: "m" | "km" } = {}
    ) {
        await queryDB(
            this,
            `ALTER TABLE ${this.name} ADD ${newColumn} DOUBLE; UPDATE ${this.name} SET ${newColumn} =  ST_Perimeter_Spheroid(${column}) ${options.unit === "km" ? "/ 1000" : ""};`,
            mergeOptions(this, {
                table: this.name,
                method: "perimeter()",
                parameters: { column, newColumn, options },
            })
        )
    }

    /**
     * Computes a buffer around geometries based on a specified distance. The distance is in the SRS unit.
     *
     * @example Basic usage
     * ```ts
     * // Creates new geomeotries from the geometries in column geom with a buffer of 1 and puts the results in column buffer.
     * await table.buffer("geom", "buffer", 1)
     * ```
     *
     * @param column - The name of the column storing the geometries.
     * @param newColumn - The name of the new column to store the buffered geometries.
     * @param distance - The distance for the buffer, in SRS unit.
     *
     * @category Geospatial
     */
    async buffer(column: string, newColumn: string, distance: number) {
        await queryDB(
            this,
            `ALTER TABLE ${this.name} ADD ${newColumn} GEOMETRY; UPDATE ${this.name} SET ${newColumn} =  ST_Buffer(${column}, ${distance});`,
            mergeOptions(this, {
                table: this.name,
                method: "buffer()",
                parameters: { column, newColumn, distance },
            })
        )
    }

    /**
     * Merges the data of the table with another table based on a spatial join. Note that the returned data is not guaranteed to be in the same order as the original tables.
     *
     * By default, the method looks for columns named 'geom' storing the geometries in the two tables, does a left join and overwrites leftTable (the current table) with the results. The method also appends the name of the table to the 'geom' columns in the returned data.
     *
     * It might create a .tmp folder, so make sure to add .tmp to your gitignore.
     *
     * @example Basic usage
     * ```ts
     * // Merges data of tableA and tableB based on geometries that intersect. tableA is overwritten with the result.
     * await tableA.joinGeo(tableB, "intersect")
     *
     * // Merges data of tableA and tableB based on geometries that in tableA that are inside geometries in tableB. tableA is overwritten with the result.
     * await tableA.joinGeo(tableB, "inside" )
     * ```
     *
     * @example With options
     * ```ts
     * // Same thing but with specific column names storing geometries, a specific join type, and returning the results in a new table.
     * const tableC = await tableA.joinGeo(tableB, "intersect", { geoColumnLeft: "geometriesA", geoColumnRight: "geometriesB", type: "inner", outputTable: "tableC" })
     * ```
     *
     * @param method - The method for the spatial join.
     * @param rightTable - The right table to be joined.
     * @param options - An optional object with configuration options:
     *   @param options.columnLeftTable - The column storing the geometries in leftTable. It's 'geom' by default.
     *   @param options.columnRightTable - The column storing the geometries in rightTable. It's 'geom' by default.
     *   @param options.type - The type of join operation to perform. For some methods (like 'inside'), the table order is important.
     *   @param options.outputTable - The name of the new table that will store the result of the join operation. Default is the leftTable.
     *
     * @category Geospatial
     */
    async joinGeo(
        rightTable: SimpleWebTable,
        method: "intersect" | "inside",
        options: {
            columnLeftTable?: string
            columnRightTable?: string
            type?: "inner" | "left" | "right" | "full"
            outputTable?: string
        } = {}
    ) {
        await joinGeo(this, method, rightTable, options)
        if (typeof options.outputTable === "string") {
            return this.sdb.newTable(options.outputTable)
        } else {
            return this
        }
    }

    /**
     * Computes the intersection of geometries.
     *
     * @example Basic usage
     * ```ts
     * // Computes the intersection of geometries in geomA and geomB columns and puts the new geometries in column inter.
     * await table.intersection("geomA", "geomB", "inter")
     * ```
     * @param column1 - The names of a column storing geometries.
     * @param column2 - The name of a column storing  geometries.
     * @param newColumn - The name of the new column storing the computed intersections.
     *
     * @category Geospatial
     */
    async intersection(column1: string, column2: string, newColumn: string) {
        await queryDB(
            this,
            `ALTER TABLE ${this.name} ADD ${newColumn} GEOMETRY; UPDATE ${this.name} SET ${newColumn} = ST_Intersection(${column1}, ${column2})`,
            mergeOptions(this, {
                table: this.name,
                method: "intersection()",
                parameters: { column1, column2, newColumn },
            })
        )
    }

    /**
     * Removes the intersection of two geometries.
     *
     * @example Basic usage
     * ```ts
     * // Removes the intersection of geomA and geomB from geomA and returns the results in the new column noIntersection. The column order is important.
     * await table.removeIntersection("geomA", "geomB", "noIntersection")
     * ```
     *
     * @param column1 - The names of a column storing geometries. These are the reference geometries that will be returned without the intersection.
     * @param column2 - The name of a column storing  geometries. These are the geometries used to compute the intersection.
     * @param newColumn - The name of the new column storing the new geometries.
     *
     * @category Geospatial
     */
    async removeIntersection(
        column1: string,
        column2: string,
        newColumn: string
    ) {
        await queryDB(
            this,
            `ALTER TABLE ${this.name} ADD ${newColumn} GEOMETRY; UPDATE ${this.name} SET ${newColumn} = ST_Difference(${column1}, ${column2})`,
            mergeOptions(this, {
                table: this.name,
                method: "removeIntersection()",
                parameters: { column1, column2, newColumn },
            })
        )
    }

    /**
     * Returns true if two geometries intersect.
     *
     * @example Basic usage
     * ```ts
     * // Checks if geometries in geomA and in geomB intersect and return true or false in new column inter.
     * await table.intersect("geomA", "geomB", "inter")
     * ```
     *
     * @param column1 - The names of a column storing geometries.
     * @param column2 - The name of a column storing  geometries.
     * @param newColumn - The name of the new column with true or false values.
     *
     * @category Geospatial
     */
    async intersect(column1: string, column2: string, newColumn: string) {
        await queryDB(
            this,
            `ALTER TABLE ${this.name} ADD ${newColumn} BOOLEAN; UPDATE ${this.name} SET ${newColumn} = ST_Intersects(${column1}, ${column2})`,
            mergeOptions(this, {
                table: this.name,
                method: "intersect()",
                parameters: { column1, column2, newColumn },
            })
        )
    }

    /**
     * Returns true if all points of a geometry lies inside another geometry.
     *
     * @example Basic usage
     * ```ts
     * // Checks if geometries in column geomA are inside geometries in column geomB and return true or false in new column isInside.
     * await table.inside("geomA", "geomB", "isInside")
     * ```
     *
     * @param column1 - The first column holds the geometries that will be tested for containment.
     * @param column2 - The second column stores the geometries to be tested as containers.
     * @param newColumn - The name of the new column with true or false values.
     *
     * @category Geospatial
     */
    async inside(column1: string, column2: string, newColumn: string) {
        await queryDB(
            this,
            `ALTER TABLE ${this.name} ADD ${newColumn} BOOLEAN; UPDATE ${this.name} SET ${newColumn} = ST_Covers(${column2}, ${column1})`,
            mergeOptions(this, {
                table: this.name,
                method: "inside()",
                parameters: { column1, column2, newColumn },
            })
        )
    }

    /**
     * Computes the union of geometries.
     *
     * @example Basic usage
     * ```ts
     * // Computes the union of geometries in geomA and geomB columns and puts the new geometries in column union.
     * await tabele.union("geomA", "geomB", "union")
     * ```
     *
     * @param column1 - The names of a column storing geometries.
     * @param column2 - The name of a column storing  geometries.
     * @param newColumn - The name of the new column storing the computed unions.
     *
     * @category Geospatial
     */
    async union(column1: string, column2: string, newColumn: string) {
        await queryDB(
            this,
            `ALTER TABLE ${this.name} ADD ${newColumn} GEOMETRY; UPDATE ${this.name} SET ${newColumn} = ST_Union(${column1}, ${column2})`,
            mergeOptions(this, {
                table: this.name,
                method: "union()",
                parameters: { column1, column2, newColumn },
            })
        )
    }

    /**
     * Extracts the latitude and longitude of points.
     *
     * @example Basic usage
     * ```ts
     * // Extracts the latitude and longitude of points from the points in the "geom" column and put them in the columns "lat" and "lon".
     * await table.latLon("geom", "lat", "lon")
     * ```
     *
     * @param column - The name of the table storing the points.
     * @param columnLat - The name of the column storing the extracted latitude.
     * @param columnLon - The name of the column storing the extracted longitude.
     *
     * @category Geospatial
     */
    async latLon(column: string, columnLat: string, columnLon: string) {
        await queryDB(
            this,
            `ALTER TABLE ${this.name} ADD ${columnLat} DOUBLE; UPDATE ${this.name} SET ${columnLat} = ST_Y(${column});
             ALTER TABLE ${this.name} ADD ${columnLon} DOUBLE; UPDATE ${this.name} SET ${columnLon} = ST_X(${column});`,
            mergeOptions(this, {
                table: this.name,
                method: "latLon()",
                parameters: { column, columnLon, columnLat },
            })
        )
    }

    /**
     * Simplifies the geometries while preserving their topology. The simplification occurs on an object-by-object basis.
     *
     * @example Basic usage
     * ```ts
     * // Simplifies with a tolerance of 0.1.
     * await table.simplify("geomA", 0.1)
     * ```
     *
     * @param column - The name of the column storing the geometries.
     * @param tolerance - A number used for the simplification. A higher tolerance results in a more significant simplification.
     *
     * @category Geospatial
     */
    async simplify(column: string, tolerance: number) {
        await queryDB(
            this,
            `UPDATE ${this.name} SET ${column} = ST_SimplifyPreserveTopology(${column}, ${tolerance})`,
            mergeOptions(this, {
                table: this.name,
                method: "simplify()",
                parameters: { column, tolerance },
            })
        )
    }

    /**
     * Computes the centroid of geometries. The values are returned in the SRS unit.
     *
     * @example Basic usage
     * ```ts
     * // Computes the centroid of the geometries in the column geom and returns the results in the column centroid.
     * await table.centroid("geom", "centroid")
     * ```
     *
     * @param column - The name of the column storing the geometries.
     * @param newColumn - The name of the new column storing the centroids.
     *
     * @category Geospatial
     */
    async centroid(column: string, newColumn: string) {
        await queryDB(
            this,
            `ALTER TABLE ${this.name} ADD ${newColumn} GEOMETRY; UPDATE ${this.name} SET ${newColumn} =  ST_Centroid(${column});`,
            mergeOptions(this, {
                table: this.name,
                method: "centroid()",
                parameters: { column, newColumn },
            })
        )
    }

    /**
     * Computes the distance between geometries. By default, it uses the SRS unit. You can pass "spheroid" or "haversine" as options.method to get results in meters or optionally kilometers. If you do use these methods, the input geometries must use the EPSG:4326 coordinate system (WGS84), with [latitude, longitude] axis order.
     *
     * @example Basic usage (SRS unit)
     * ```ts
     * // Computes the distance between geometries in columns geomA and geomB. The distance is returned in the new column "distance" in the SRS unit.
     * await table.distance("geomA", "geomB", "distance")
     * ```
     *
     * @example Haversine (meters)
     * ```ts
     * // Same but using the haversine distance. The distance is returned in meters by default. The input geometries must use the EPSG:4326 coordinate system (WGS84), with [latitude, longitude] axis order.
     * await table.distance("geomA", "geomB", "distance", { method: "haversine" })
     * ```
     *
     * @example Haversine (kilometers)
     * ```
     * // Same but the distance is returned in kilometers. The input geometries must use the EPSG:4326 coordinate system (WGS84), with [latitude, longitude] axis order.
     * await table.distance("geomA", "geomB", "distance", { method: "haversine", unit: "km" })
     * ```
     *
     * @example Spheroid (meters and optionally kilometers)
     * ```ts
     * // Same but using an ellipsoidal model of the earth's surface. It's the most accurate but the slowest. By default, the distance is returned in meters and optionally as kilometers. The input geometries must use the EPSG:4326 coordinate system (WGS84), with [latitude, longitude] axis order.
     * await table.distance("geomA", "geomB", "distance", { method: "spheroid", unit: "km" })
     * ```
     *
     * @param column1 - The name of a column storing geometries.
     * @param column2 - The name of a column storing geometries.
     * @param newColumn - The name of the new column storing the centroids.
     * @param options - An optional object with configuration options:
     *   @param options.method - The method to be used for the distance calculations. "srs" returns the values in the SRS unit. "spheroid" and "haversine" return the values in meters by default and need the input geometries must use the EPSG:4326 coordinate system (WGS84), with [latitude, longitude] axis order..
     *   @param options.unit - If the method is "spheroid" or "haversine", you can choose between meters or kilometers. It's meters by default.
     *
     * @category Geospatial
     */
    async distance(
        column1: string,
        column2: string,
        newColumn: string,
        options: {
            unit?: "m" | "km"
            method?: "srs" | "haversine" | "spheroid"
        } = {}
    ) {
        await queryDB(
            this,
            distanceQuery(this.name, column1, column2, newColumn, options),
            mergeOptions(this, {
                table: this.name,
                method: "distance()",
                parameters: { column1, column2, newColumn },
            })
        )
    }

    /**
     * Unnests geometries recursively.
     *
     * @example Basic usage
     * ```ts
     * // Unnests geometries in the column "geom" and returns the same table with unnested items.
     * await table.unnestGeo("geom")
     * ```
     *
     * @param column - The name of a column storing geometries.
     *
     * @category Geospatial
     */
    async unnestGeo(column: string) {
        await queryDB(
            this,
            `CREATE OR REPLACE TABLE ${this.name} AS SELECT * EXCLUDE(${column}), UNNEST(ST_Dump(${column}), recursive := TRUE) FROM ${this.name}; ALTER TABLE ${this.name} DROP COLUMN path;`,
            mergeOptions(this, {
                table: this.name,
                method: "unnestGeo()",
                parameters: { column },
            })
        )
    }

    /**
     * Aggregates geometries.
     *
     * @example Basic usage
     * ```ts
     * // Returns the union of all geometries in the column geom.
     * await table.aggregateGeo("geom", "union")
     *
     * // Same thing but for intersection.
     * await table.aggregateGeo("geom", "intersection")
     * ```
     *
     * @example With categories
     * ```ts
     * // Returns the union of all geometries in the column geom and uses the values in the column country as categories.
     * await table.aggregateGeo("geom", "union", { categories: "country" })
     * ```
     *
     * @example Returning results in a new table
     * ```ts
     * // Same thing but results a return in tableA
     * const tableA = await table.aggregateGeo("geom", "union", { categories: "country", outputTable: "tableA" })
     * ```
     *
     * @param column - The name of the column storing geometries.
     * @param method - The method to use for the aggregation.
     * @param options - An optional object with configuration options:
     *   @param options.categories - The column or columns that define categories for the aggragation. This can be a single column name or an array of column names.
     *   @param options.outputTable - An option to store the results in a new table.
     *
     * @category Geospatial
     */
    async aggregateGeo(
        column: string,
        method: "union" | "intersection",
        options: { categories?: string | string[]; outputTable?: string } = {}
    ) {
        await queryDB(
            this,
            aggregateGeoQuery(this.name, column, method, options),
            mergeOptions(this, {
                table: this.name,
                method: "aggregateGeo()",
                parameters: { column, method, options },
            })
        )
        if (typeof options.outputTable === "string") {
            return this.sdb.newTable(options.outputTable)
        } else {
            return this
        }
    }

    /**
     * Transforms closed lines into polygons.
     *
     * @example Basic usage
     * ```ts
     * // Transforms geometries in the column "geom" into polygons.
     * await table.linesToPolygons("geom")
     * ```
     *
     * @param column - The name of a column storing geometries.
     *
     * @category Geospatial
     */
    async linesToPolygons(column: string) {
        await queryDB(
            this,
            `CREATE OR REPLACE TABLE ${this.name} AS SELECT * EXCLUDE(${column}), ST_MakePolygon(${column}) as ${column} FROM ${this.name};`,
            mergeOptions(this, {
                table: this.name,
                method: "linesToPolygons()",
                parameters: { column },
            })
        )
    }

    /**
     * Returns the data as a geojson.
     *
     * @example Basic usage
     * ```ts
     * // The colum geom will be used for the features geometries. The other columns in the table will be stored as properties.
     * const geojson = await table.getGeoData("geom")
     * ```
     *
     * @param column - The name of a column storing geometries.
     *
     * @category Geospatial
     */
    async getGeoData(column: string) {
        return await getGeoData(this, column)
    }

    /**
     * Returns the projection of a geospatial data file.
     *
     * @example Basic usage
     * ```ts
     * await table.getProjection("./some-data.shp")
     * // Returns something like
     * // {
     * //    name: 'WGS 84',
     * //    code: 'ESPG:4326',
     * //    unit: 'degree',
     * //    proj4: '+proj=longlat +datum=WGS84 +no_defs'
     * // }
     * ```
     *
     * @param file - The file storing the geospatial data.
     *
     * @category Geospatial
     */
    async getProjection(file: string) {
        return await getProjection(this, file)
    }

    // OTHERS

    /**
     * Executes a custom SQL query, providing flexibility for advanced users.
     *
     * @example Basic usage
     * ```ts
     * // You can use the returnDataFrom option to retrieve the data from the query, if needed.
     * await table.customQuery("SELECT * FROM employees WHERE Job = 'Clerk'", { returnDataFrom: "query" })
     * ```
     *
     * @param query - The custom SQL query to be executed.
     * @param options - An optional object with configuration options:
     *   @param options.returnDataFrom - Specifies whether to return data from the "query" or not. Defaults to "none".
     *   @param options.table - The name of the table associated with the query (if applicable). Needed when debug is true.
     *
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
     * Logs a specified number of rows. Default is 10 rows.
     *
     * @example Basic usage
     * ```ts
     * // Logs first 10 rows
     * await table.logTable();
     * ```
     *
     * @example Specific number of rows
     * ```ts
     * // Logs first 100 rows
     * await table.logTable({ nbRowsToLog: 100 });
     * ```
     *
     * @param options - An optional object with configuration options:
     *   @param options.nbRowsToLog - The number of rows to log when debugging. Defaults to 10 or the value set in the SimpleWebDB instance.
     */
    async logTable(
        options: {
            nbRowsToLog?: number
        } = {}
    ) {
        this.debug && console.log("\nlogTable()")
        options.nbRowsToLog = options.nbRowsToLog ?? this.nbRowsToLog
        this.debug && console.log("parameters:", { options })

        console.log(`\ntable ${this.name}:`)
        const data = await this.runQuery(
            `SELECT * FROM ${this.name} LIMIT ${options.nbRowsToLog}`,
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
            `SELECT COUNT(*) FROM ${this.name};`,
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
}
