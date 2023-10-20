import {
    AsyncDuckDB,
    AsyncDuckDBConnection,
    DuckDBDataProtocol,
} from "@duckdb/duckdb-wasm"
import { Database, Connection } from "duckdb"
import getDuckDB from "../helpers/getDuckDB.js"
import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import stringToArray from "../helpers/stringToArray.js"

import getDescription from "../methods/getDescriptionQuery.js"
import removeMissingQuery from "../methods/removeMissingQuery.js"
import renameColumnQuery from "../methods/renameColumnQuery.js"
import replaceStringsQuery from "../methods/replaceStringsQuery.js"
import convertQuery from "../methods/convertQuery.js"
import roundQuery from "../methods/round.js"
import joinQuery from "../methods/joinQuery.js"
import insertRowsQuery from "../methods/insertRowsQuery.js"
import sortQuery from "../methods/sortQuery.js"
import summarizeQuery from "../methods/summarizeQuery.js"
import loadArrayQuery from "../methods/loadArrayQuery.js"
import correlationsQuery from "../methods/correlationsQuery.js"
import getCombinations from "../helpers/getCombinations.js"
import keepNumericalColumns from "../helpers/keepNumericalColumns.js"
import linearRegressionQuery from "../methods/linearRegressionQuery.js"
import outliersIQRQuery from "../methods/outliersIQRQuery.js"
import zScoreQuery from "../methods/zScoreQuery.js"
import tableToArrayOfObjects from "../helpers/arraysToData.js"
import getExtension from "../helpers/getExtension.js"
import parseType from "../helpers/parseTypes.js"
import concatenateQuery from "../methods/concatenateQuery.js"

export default class SimpleDB {
    debug: boolean
    nbRowsToLog: number
    db!: AsyncDuckDB | Database
    connection!: AsyncDuckDBConnection | Connection
    worker!: Worker | null
    runQuery!: (
        query: string,
        connection: AsyncDuckDBConnection | Connection,
        returnDataFromQuery: boolean
    ) => Promise<
        | {
              [key: string]: number | string | Date | boolean | null
          }[]
        | undefined
    >

    constructor(
        options: {
            nbRowsToLog?: number
            debug?: boolean
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
            }
        }
    }

    async start() {
        this.debug && console.log("\nstart()")
        const duckDB = await getDuckDB()
        this.db = duckDB.db
        this.connection = await this.db.connect()

        this.worker = duckDB.worker
        return this
    }

    async loadArray(
        table: string,
        arrayOfObjects: { [key: string]: unknown }[],
        options: {
            returnDataFrom?: "query" | "table" | "none"
            nbRowsToLog?: number
            debug?: boolean
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nloadArray()")

        return await queryDB(
            this.connection,
            this.runQuery,
            loadArrayQuery(table, arrayOfObjects),
            mergeOptions(this, { ...options, table })
        )
    }

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
            debug?: boolean
            returnDataFrom?: "table" | "query" | "none"
            nbRowsToLog?: number
        } = {}
    ): Promise<
        | {
              [key: string]: string | number | boolean | Date | null
          }[]
        | undefined
        | null
    > {
        ;(options.debug || this.debug) && console.log("\nloadData()")

        let start
        if (options.debug || this.debug) {
            start = Date.now()
        }

        const fileExtension = getExtension(url)
        const filename = url.split("/")[url.split("/").length - 1]

        if (
            options.fileType === "csv" ||
            fileExtension === "csv" ||
            options.fileType === "dsv" ||
            typeof options.delim === "string"
        ) {
            await (this.db as AsyncDuckDB).registerFileURL(
                filename,
                url,
                DuckDBDataProtocol.HTTP,
                false
            )
            await (this.connection as AsyncDuckDBConnection).insertCSVFromPath(
                filename,
                {
                    name: table,
                    detect: options.autoDetect ?? true,
                    header: options.header ?? true,
                    delimiter: options.delim ?? ",",
                    skip: options.skip,
                }
            )
        } else if (options.fileType === "json" || fileExtension === "json") {
            const res = await fetch(url)
            await (this.db as AsyncDuckDB).registerFileText(
                filename,
                await res.text()
            )
            await (this.connection as AsyncDuckDBConnection).insertJSONFromPath(
                filename,
                {
                    name: table,
                }
            )
        } else if (
            options.fileType === "parquet" ||
            fileExtension === "parquet"
        ) {
            await (this.db as AsyncDuckDB).registerFileURL(
                filename,
                url,
                DuckDBDataProtocol.HTTP,
                false
            )
            await this.runQuery(
                `CREATE TABLE ${table} AS SELECT * FROM parquet_scan('${filename}')`,
                this.connection,
                false
            )
        } else {
            throw new Error(
                `Unknown options.fileType ${options.fileType} or fileExtension ${fileExtension}`
            )
        }

        if (start) {
            const end = Date.now()
            console.log(`Done in ${end - start} ms`)
        }

        if (
            options.returnDataFrom === "table" ||
            options.returnDataFrom === "query"
        ) {
            return await this.runQuery(
                `SELECT * FROM ${table}`,
                this.connection,
                true
            )
        }
    }

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

    async cloneTable(
        originalTable: string,
        newTable: string,
        options: {
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\ncloneTable")
        return await queryDB(
            this.connection,
            this.runQuery,
            `CREATE OR REPLACE TABLE ${newTable} AS SELECT * FROM ${originalTable}`,
            mergeOptions(this, { ...options, table: newTable })
        )
    }

    async selectColumns(
        table: string,
        columns: string | string[],
        options: {
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nselectColumns")

        return await queryDB(
            this.connection,
            this.runQuery,
            `CREATE OR REPLACE TABLE ${table} AS SELECT ${stringToArray(columns)
                .map((d) => `"${d}"`)
                .join(", ")} FROM ${table}`,
            mergeOptions(this, { ...options, table })
        )
    }

    async sample(
        table: string,
        numberRows: number,
        options: {
            seed?: number
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nsample")

        return await queryDB(
            this.connection,
            this.runQuery,
            `CREATE OR REPLACE TABLE ${table} AS SELECT * FROM ${table} USING SAMPLE reservoir(${numberRows} ROWS)${
                typeof options.seed === "number"
                    ? ` REPEATABLE(${options.seed})`
                    : ""
            }`,
            mergeOptions(this, { ...options, table })
        )
    }

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

        const oldColumns = Object.keys(names)
        const newColumns = Object.values(names)

        return await queryDB(
            this.connection,
            this.runQuery,
            renameColumnQuery(table, oldColumns, newColumns),
            mergeOptions(this, { ...options, table })
        )
    }

    async stack(
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
        ;(options.debug || this.debug) && console.log("\nstack()")
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

    async expand(
        table: string,
        columnsFrom: string,
        valuesFrom: string,
        options: {
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nexpand()")
        return await queryDB(
            this.connection,
            this.runQuery,
            `CREATE OR REPLACE TABLE ${table} AS SELECT * FROM (PIVOT ${table} ON "${columnsFrom}" USING FIRST("${valuesFrom}"))`,
            mergeOptions(this, { ...options, table })
        )
    }

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

    async removeMissing(
        table: string,
        columns: string | string[] = [],
        options: {
            otherMissingValues?: (string | number)[]
            invert?: boolean
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {
            otherMissingValues: ["undefined", "NaN", "null", ""],
        }
    ) {
        const types = await this.getTypes(table)
        const allColumns = Object.keys(types)

        ;(options.debug || this.debug) && console.log("\nremoveMissing()")

        options.otherMissingValues = options.otherMissingValues ?? [
            "undefined",
            "NaN",
            "null",
            "",
        ]

        columns = stringToArray(columns)

        return await queryDB(
            this.connection,
            this.runQuery,
            removeMissingQuery(
                table,
                allColumns,
                types,
                columns.length === 0 ? allColumns : columns,
                options
            ),
            mergeOptions(this, { ...options, table })
        )
    }

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
        ;(options.debug || this.debug) && console.log("\nreplaceStrings")

        options.entireString = options.entireString ?? false

        const oldText = Object.keys(strings)
        const newText = Object.values(strings)

        return await queryDB(
            this.connection,
            this.runQuery,
            replaceStringsQuery(
                table,
                stringToArray(columns),
                oldText,
                newText,
                options
            ),
            mergeOptions(this, {
                ...options,
                table,
            })
        )
    }

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
        ;(options.debug || this.debug) && console.log("\nfilter()")

        return await queryDB(
            this.connection,
            this.runQuery,
            concatenateQuery(table, columns, newColumn, options),
            mergeOptions(this, { ...options, table })
        )
    }

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

        if (
            (options.method === "ceiling" || options.method === "floor") &&
            typeof options.decimals === "number"
        ) {
            console.log(
                "Ceiling and floor methods round to the nearest integer. Your option decimals has no effect."
            )
        }

        return await queryDB(
            this.connection,
            this.runQuery,
            roundQuery(table, stringToArray(columns), options),
            mergeOptions(this, { ...options, table })
        )
    }

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
            debug?: boolean
            returnDataFrom?: "query" | "table" | "none"
            nbRowsToLog?: number
        } = {}
    ) {
        const allTypes = await this.getTypes(table)
        const allColumns = Object.keys(allTypes)

        const columns = Object.keys(types)
        const columnsTypes = Object.values(types)

        ;(options.debug || this.debug) && console.log("\nconvert()")

        return await queryDB(
            this.connection,
            this.runQuery,
            convertQuery(
                table,
                columns,
                columnsTypes,
                allColumns,
                allTypes,
                options
            ),
            mergeOptions(this, { ...options, table })
        )
    }

    async removeTables(
        tables: string | string[],
        options: {
            debug?: boolean
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nremoveTables()")

        let query = ""
        for (const table of stringToArray(tables)) {
            query += `DROP TABLE ${table};\n`
        }

        return await queryDB(
            this.connection,
            this.runQuery,
            query,
            mergeOptions(this, { ...options, table: null })
        )
    }

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

        let query = ""
        for (const column of stringToArray(columns)) {
            query += `ALTER TABLE ${table} DROP "${column}";\n`
        }
        return await queryDB(
            this.connection,
            this.runQuery,
            query,
            mergeOptions(this, { ...options, table })
        )
    }

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
        ;(options.debug || this.debug) && console.log("\nsort")

        return await queryDB(
            this.connection,
            this.runQuery,
            sortQuery(table, order, options),
            mergeOptions(this, { ...options, table })
        )
    }

    async join(
        leftTable: string,
        rightTable: string,
        commonColumn: string,
        outputTable: string,
        join: "inner" | "left" | "right" | "full",
        options: {
            debug?: boolean
            returnDataFrom?: "query" | "table" | "none"
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\njoin()")

        return await queryDB(
            this.connection,
            this.runQuery,
            joinQuery(leftTable, rightTable, commonColumn, outputTable, join),
            mergeOptions(this, {
                ...options,
                table: outputTable,
            })
        )
    }

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
                      | "avg"
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
                      | "avg"
                      | "median"
                      | "sum"
                      | "skew"
                      | "stdDev"
                      | "var"
                  )[]
            decimals?: number
            debug?: boolean
            returnDataFrom?: "query" | "table" | "none"
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nsummarize()")

        options.values = options.values ? stringToArray(options.values) : []
        options.categories = options.categories
            ? stringToArray(options.categories)
            : []
        if (options.summaries === undefined) {
            options.summaries = []
        } else if (typeof options.summaries === "string") {
            options.summaries = [options.summaries]
        }
        options.decimals = options.decimals ?? 2

        if (options.values.length === 0) {
            const types = await this.getTypes(table)
            options.values = keepNumericalColumns(types)
        }
        options.values = options.values.filter(
            (d) => !options.categories?.includes(d)
        )

        return await queryDB(
            this.connection,
            this.runQuery,
            summarizeQuery(
                table,
                outputTable,
                options.values,
                options.categories,
                options.summaries,
                options
            ),
            mergeOptions(this, { ...options, table: outputTable })
        )
    }

    async correlations(
        table: string,
        outputTable: string,
        options: {
            x?: string
            y?: string
            decimals?: number
            order?: "asc" | "desc"
            debug?: boolean
            nbRowsToLog?: number
            returnDataFrom?: "query" | "table" | "none"
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\ncorrelation()")

        options.decimals = options.decimals ?? 2

        let combinations: [string, string][] = []
        if (!options.x && !options.y) {
            const types = await this.getTypes(table)
            const columns = keepNumericalColumns(types)
            combinations = getCombinations(columns, 2)
        } else if (options.x && !options.y) {
            const types = await this.getTypes(table)
            const columns = keepNumericalColumns(types)
            combinations = []
            for (const col of columns) {
                if (col !== options.x) {
                    combinations.push([options.x, col])
                }
            }
        } else if (options.x && options.y) {
            combinations = [[options.x, options.y]]
        } else {
            throw new Error("No combinations of x and y")
        }

        return await queryDB(
            this.connection,
            this.runQuery,
            correlationsQuery(table, outputTable, combinations, options),
            mergeOptions(this, { ...options, table: outputTable })
        )
    }

    async linearRegressions(
        table: string,
        outputTable: string,
        options: {
            x?: string
            y?: string
            decimals?: number
            debug?: boolean
            nbRowsToLog?: number
            returnDataFrom?: "query" | "table" | "none"
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nlinearRegression()")

        options.decimals = options.decimals ?? 2

        const permutations: [string, string][] = []
        if (!options.x && !options.y) {
            const types = await this.getTypes(table)
            const columns = keepNumericalColumns(types)
            const combinations = getCombinations(columns, 2)
            for (const c of combinations) {
                permutations.push(c)
                permutations.push([c[1], c[0]])
            }
        } else if (options.x && !options.y) {
            const types = await this.getTypes(table)
            const columns = keepNumericalColumns(types)
            for (const col of columns) {
                if (col !== options.x) {
                    permutations.push([options.x, col])
                }
            }
        } else if (options.x && options.y) {
            permutations.push([options.x, options.y])
        } else {
            throw new Error("No combinations of x and y")
        }

        return await queryDB(
            this.connection,
            this.runQuery,
            linearRegressionQuery(table, outputTable, permutations, options),
            mergeOptions(this, { ...options, table: outputTable })
        )
    }

    async outliersIQR(
        table: string,
        column: string,
        options: {
            newColumn?: string
            debug?: boolean
            nbRowsToLog?: number
            returnDataFrom?: "query" | "table" | "none"
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\noutliersIQR()")

        options.newColumn = options.newColumn ?? "outliers"

        const length = await this.getLength(table)
        const parity = length % 2 === 0 ? "even" : "odd"

        return await queryDB(
            this.connection,
            this.runQuery,
            outliersIQRQuery(table, column, parity, options),
            mergeOptions(this, { ...options, table })
        )
    }

    async zScore(
        table: string,
        column: string,
        options: {
            newColumn?: string
            decimals?: number
            debug?: boolean
            nbRowsToLog?: number
            returnDataFrom?: "query" | "table" | "none"
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nzScore()")

        options.newColumn = options.newColumn ?? "zScore"
        options.decimals = options.decimals ?? 2

        return await queryDB(
            this.connection,
            this.runQuery,
            zScoreQuery(table, column, options),
            mergeOptions(this, { ...options, table })
        )
    }

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
            debug?: boolean
            returnDataFrom?: "query" | "table" | "none"
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
            loadArrayQuery(table, newData),
            mergeOptions(this, { ...options, table })
        )

        return updatedData
    }

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

    async getDescription(
        table: string,
        options: {
            debug?: boolean
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\ngetDescription()")

        const types = await this.getTypes(table)

        const { query, extraData } = getDescription(table, types)

        const queryResult = await queryDB(
            this.connection,
            this.runQuery,
            query,
            mergeOptions(this, {
                ...options,
                table,
                nbRowsToLog: Infinity,
                returnDataFrom: "query",
            })
        )

        const description = [extraData].concat(
            queryResult
                ? queryResult.sort((a, b) => {
                      if (
                          typeof a["_"] === "string" &&
                          typeof b["_"] === "string"
                      ) {
                          return a["_"].localeCompare(b["_"])
                      } else {
                          return 0
                      }
                  })
                : []
        )

        ;(options.debug || this.debug) &&
            console.log("\ndescription:", description)

        return description
    }

    async hasTable(table: string, options: { debug?: boolean } = {}) {
        ;(options.debug || this.debug) && console.log("\nhasTable()")

        const tables = await this.getTables(options)

        return tables.includes(table)
    }

    async getTables(
        options: {
            debug?: boolean
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\ngetTables()")

        const queryResult = await queryDB(
            this.connection,
            this.runQuery,
            `SHOW TABLES`,
            mergeOptions(this, {
                ...options,
                returnDataFrom: "query",
                table: null,
            })
        )

        if (!queryResult) {
            throw new Error("No result")
        }

        const tables = queryResult.map((d) => d.name) as string[]

        ;(options.debug || this.debug) && console.log("\ntables:", tables)

        return tables
    }

    async getColumns(
        table: string,
        options: {
            debug?: boolean
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\ngetColumns()")

        const queryResult = await queryDB(
            this.connection,
            this.runQuery,
            `DESCRIBE ${table}`,
            mergeOptions(this, {
                ...options,
                table,
                returnDataFrom: "query",
                returnedDataModifier: (rows) => rows,
            })
        )

        if (!queryResult) {
            throw new Error("No result")
        }

        const columns = queryResult.map((d) => d.column_name) as string[]

        ;(options.debug || this.debug) && console.log("\ncolumns:", columns)

        return columns
    }

    async getLength(
        table: string,
        options: {
            debug?: boolean
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\ngetLength()")

        const queryResult = await queryDB(
            this.connection,
            this.runQuery,
            `SELECT COUNT(*) FROM ${table}`,
            mergeOptions(this, { ...options, table, returnDataFrom: "query" })
        )

        if (!queryResult) {
            throw new Error("No result")
        }
        const length = queryResult[0]["count_star()"] as number

        ;(options.debug || this.debug) && console.log("\nlength:", length)

        return length
    }

    async getTypes(
        table: string,
        options: {
            debug?: boolean
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\ngetTypes()")

        const types = await queryDB(
            this.connection,
            this.runQuery,
            `DESCRIBE ${table}`,
            mergeOptions(this, {
                ...options,
                table,
                returnDataFrom: "query",
            })
        )

        const typesObj: { [key: string]: string } = {}
        if (types) {
            for (const t of types as { [key: string]: string }[]) {
                if (t.column_name) {
                    typesObj[t.column_name] = t.column_type
                }
            }
        }

        ;(options.debug || this.debug) && console.log("\ntypes:", typesObj)

        return typesObj
    }

    async getValues(
        table: string,
        column: string,
        options: {
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\ngetValues()")

        const queryResult = await queryDB(
            this.connection,
            this.runQuery,
            `SELECT ${column} FROM ${table}`,
            mergeOptions(this, {
                ...options,
                table,
                returnDataFrom: "query",
            })
        )
        if (!queryResult) {
            throw new Error("No result")
        }

        const values = queryResult.map((d) => d[column])

        ;(options.debug || this.debug) && console.log("\nvalues:", values)

        return values
    }

    async getUniques(
        table: string,
        column: string,
        options: {
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\ngetUniques()")

        const queryResult = await queryDB(
            this.connection,
            this.runQuery,
            `SELECT DISTINCT ${column} FROM ${table}`,
            mergeOptions(this, {
                ...options,
                table,
                returnDataFrom: "query",
            })
        )

        if (!queryResult) {
            throw new Error("No result.")
        }

        const uniques = queryResult.map((d) => d[column])

        ;(options.debug || this.debug) && console.log("\nuniques:", uniques)

        return uniques
    }

    async getData(
        table: string,
        options: {
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\ngetData()")

        return await queryDB(
            this.connection,
            this.runQuery,
            `SELECT * from ${table}`,
            mergeOptions(this, { ...options, returnDataFrom: "query", table })
        )
    }

    async logTable(
        table: string,
        options: {
            debug?: boolean
            returnData?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        options.debug = options.debug ?? true
        options.nbRowsToLog = options.nbRowsToLog ?? this.nbRowsToLog
        ;(options.debug || this.debug) && console.log("\nlogTable()")

        return await queryDB(
            this.connection,
            this.runQuery,
            `SELECT * FROM ${table} LIMIT ${options.nbRowsToLog}`,
            mergeOptions(this, { ...options, table })
        )
    }

    async done() {
        await (this.connection as AsyncDuckDBConnection)?.close()
        await (this.db as AsyncDuckDB)?.terminate()
        this.worker?.terminate()
    }
}
