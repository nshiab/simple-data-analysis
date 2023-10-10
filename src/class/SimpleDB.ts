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

import logDescriptionQuery from "../methods/logDescriptionQuery.js"
import removeMissingQuery from "../methods/removeMissingQuery.js"
import renameColumnQuery from "../methods/renameColumnQuery.js"
import replaceTextQuery from "../methods/replaceStringQuery.js"
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

export default class SimpleDB {
    debug: boolean
    verbose: boolean
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
            verbose?: boolean
            nbRowsToLog?: number
            debug?: boolean
        } = {}
    ) {
        this.verbose = options.verbose ?? false
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
        ;(this.verbose || this.debug) && console.log("\nstart()")
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
            verbose?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nloadArray()")

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
            verbose?: boolean
            returnDataFrom?: "table" | "query" | "none"
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nloadData()")

        let start
        if (options.verbose || this.debug) {
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
            await this.runQuery(
                `CREATE TABLE ${table} AS SELECT * FROM "${url}"`,
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
            verbose?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\ninsertRows()")
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
            verbose?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\ninsertTable()")
        return await queryDB(
            this.connection,
            this.runQuery,
            `INSERT INTO ${table} SELECT * FROM ${tableToInsert}`,
            mergeOptions(this, { ...options, table })
        )
    }

    async logSchema(
        table: string,
        options: {
            verbose?: boolean
        } = {}
    ) {
        options.verbose = options.verbose ?? true
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nlogSchema()")
        return await queryDB(
            this.connection,
            this.runQuery,
            `DESCRIBE ${table}`,
            mergeOptions(this, {
                ...options,
                table,
                nbRowsToLog: Infinity,
                returnDataFrom: "query",
            })
        )
    }

    async logDescription(
        table: string,
        options: {
            verbose?: boolean
        } = {}
    ) {
        const types = await this.getTypes(table)

        options.verbose = options.verbose ?? true
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nlogDescription()")
        const { query, extraData } = logDescriptionQuery(table, types)

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

        return [extraData].concat(
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
    }

    async cloneTable(
        originalTable: string,
        newTable: string,
        options: {
            returnDataFrom?: "query" | "table" | "none"
            verbose?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\ncloneTable")
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
            verbose?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nselectColumns")

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
            verbose?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nsample")

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
            verbose?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nrenameColumns()")

        let start
        if (options.verbose || this.debug) {
            start = Date.now()
        }

        const oldColumns = Object.keys(names)
        const newColumns = Object.values(names)

        let data
        for (let i = 0; i < oldColumns.length; i++) {
            if (i === oldColumns.length - 1) {
                data = await queryDB(
                    this.connection,
                    this.runQuery,
                    renameColumnQuery(table, oldColumns[i], newColumns[i]),
                    mergeOptions(this, { ...options, table })
                )
            } else {
                await queryDB(
                    this.connection,
                    this.runQuery,
                    renameColumnQuery(table, oldColumns[i], newColumns[i]),
                    {
                        table,
                        returnDataFrom: "none",
                        verbose: false,
                        nbRowsToLog: 0,
                        returnedDataModifier: undefined,
                        debug: false,
                        noTiming: true,
                        justQuery: true,
                    }
                )
            }
        }

        if (start) {
            const end = Date.now()
            console.log(`Done in ${end - start} ms`)
        }

        return data
    }

    async tidy(
        table: string,
        columns: string[],
        columnsName: string,
        valuesName: string,
        options: {
            returnDataFrom?: "query" | "table" | "none"
            verbose?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\ntidy()")
        return await queryDB(
            this.connection,
            this.runQuery,
            `CREATE OR REPLACE TABLE ${table} AS SELECT * FROM (UNPIVOT ${table}
        ON ${columns.map((d) => `"${d}"`).join(", ")}
        INTO
            NAME ${columnsName}
            VALUE ${valuesName})`,
            mergeOptions(this, { ...options, table })
        )
    }

    async removeDuplicates(
        table: string,
        options: {
            returnDataFrom?: "query" | "table" | "none"
            verbose?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nremoveDuplicates()")
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
            invert?: boolean
            returnDataFrom?: "query" | "table" | "none"
            verbose?: boolean
            nbRowsToLog?: number
            otherMissingValues?: (string | number)[]
        } = {
            otherMissingValues: ["undefined", "NaN", "null", ""],
        }
    ) {
        const types = await this.getTypes(table)
        const allColumns = Object.keys(types)

        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nremoveMissing()")

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
            verbose?: boolean
            returnDataFrom?: "query" | "table" | "none"
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nreplaceStrings")

        let start
        if (options.verbose || this.debug) {
            start = Date.now()
        }

        options.entireString = options.entireString ?? false

        columns = stringToArray(columns)
        const oldText = Object.keys(strings)
        const newText = Object.values(strings)

        const lastColumn = columns[columns.length - 1]
        const lastOldText = oldText[oldText.length - 1]

        let data
        for (const column of columns) {
            for (let i = 0; i < oldText.length; i++) {
                if (column === lastColumn && oldText[i] === lastOldText) {
                    data = await queryDB(
                        this.connection,
                        this.runQuery,
                        replaceTextQuery(
                            table,
                            column,
                            oldText[i],
                            newText[i],
                            options
                        ),
                        mergeOptions(this, {
                            ...options,
                            table,
                            noTiming: true,
                        })
                    )
                } else {
                    await queryDB(
                        this.connection,
                        this.runQuery,
                        replaceTextQuery(
                            table,
                            column,
                            oldText[i],
                            newText[i],
                            options
                        ),
                        mergeOptions(this, {
                            ...options,
                            table,
                            returnDataFrom: "none",
                            noTiming: true,
                            justQuery: true,
                        })
                    )
                }
            }
        }

        if (start) {
            const end = Date.now()
            console.log(`Done in ${end - start} ms`)
        }

        return data
    }

    async filter(
        table: string,
        conditions: string,
        options: {
            verbose?: boolean
            returnDataFrom?: "query" | "table" | "none"
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nfilter()")
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
            verbose?: boolean
            returnDataFrom?: "query" | "table" | "none"
            nbRowsToLog?: number
            decimals?: number
            method?: "round" | "ceiling" | "floor"
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nround()")

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
            verbose?: boolean
            returnDataFrom?: "query" | "table" | "none"
            nbRowsToLog?: number
            datetimeFormat?: string
            try?: boolean
        } = {}
    ) {
        const allTypes = await this.getTypes(table)
        const allColumns = Object.keys(allTypes)

        const columns = Object.keys(types)
        const columnsTypes = Object.values(types)

        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nconvert()")

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
            verbose?: boolean
            returnDataFrom?: "query" | "table" | "none"
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nremoveTables()")

        let start
        if (options.verbose || this.debug) {
            start = Date.now()
        }

        tables = stringToArray(tables)
        const lastTable = tables[tables.length - 1]
        let data
        for (const table of tables) {
            if (table === lastTable) {
                data = await queryDB(
                    this.connection,
                    this.runQuery,
                    `DROP TABLE ${table}`,
                    mergeOptions(this, { ...options, table, noTiming: true })
                )
            } else {
                await queryDB(
                    this.connection,
                    this.runQuery,
                    `DROP TABLE ${table}`,
                    mergeOptions(this, {
                        ...options,
                        table,
                        returnDataFrom: "none",
                        noTiming: true,
                        justQuery: true,
                    })
                )
            }
        }

        if (start) {
            const end = Date.now()
            console.log(`Done in ${end - start} ms`)
        }

        return data
    }

    async removeColumns(
        table: string,
        columns: string | string[],
        options: {
            verbose?: boolean
            returnDataFrom?: "query" | "table" | "none"
            nbRowsToLog?: number
            noTiming?: boolean
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nremoveColumns()")

        let start
        if ((options.verbose || this.debug) && options.noTiming === false) {
            start = Date.now()
        }

        columns = stringToArray(columns)
        const lastColumn = columns[columns.length - 1]
        let data
        for (const column of columns) {
            if (column === lastColumn) {
                data = await queryDB(
                    this.connection,
                    this.runQuery,
                    `ALTER TABLE ${table} DROP "${column}"`,
                    mergeOptions(this, { ...options, table, noTiming: true })
                )
            } else {
                await queryDB(
                    this.connection,
                    this.runQuery,
                    `ALTER TABLE ${table} DROP "${column}"`,
                    mergeOptions(this, {
                        ...options,
                        table,
                        returnDataFrom: "none",
                        noTiming: true,
                        justQuery: true,
                    })
                )
            }
        }

        if (start) {
            const end = Date.now()
            console.log(`Done in ${end - start} ms`)
        }

        return data
    }

    async sort(
        table: string,
        order: { [key: string]: "asc" | "desc" },
        options: {
            lang?: { [key: string]: string }
            returnDataFrom?: "query" | "table" | "none"
            verbose?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nsort")

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
            verbose?: boolean
            returnDataFrom?: "query" | "table" | "none"
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\njoin()")

        let start
        if (options.verbose || this.debug) {
            start = Date.now()
        }

        await queryDB(
            this.connection,
            this.runQuery,
            joinQuery(leftTable, rightTable, commonColumn, outputTable, join),
            mergeOptions(this, {
                ...options,
                table: outputTable,
                returnDataFrom: "none",
                noTiming: true,
            })
        )

        const data = await this.removeColumns(
            outputTable,
            `${commonColumn}:1`,
            mergeOptions(this, {
                ...options,
                table: outputTable,
                noTiming: true,
            })
        )

        if (start) {
            const end = Date.now()
            console.log(`Done in ${end - start} ms`)
        }

        return data
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
            lang?: string
            verbose?: boolean
            returnDataFrom?: "query" | "table" | "none"
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nsummarize()")

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
            verbose?: boolean
            nbRowsToLog?: number
            returnDataFrom?: "query" | "table" | "none"
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\ncorrelation()")

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
            verbose?: boolean
            nbRowsToLog?: number
            returnDataFrom?: "query" | "table" | "none"
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nlinearRegression()")

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
            verbose?: boolean
            nbRowsToLog?: number
            returnDataFrom?: "query" | "table" | "none"
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\noutliersIQR()")

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
            verbose?: boolean
            nbRowsToLog?: number
            returnDataFrom?: "query" | "table" | "none"
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nzScore()")

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
            verbose?: boolean
            table?: string
            nbRowsToLog?: number
            returnedDataModifier?: (
                rows: {
                    [key: string]: number | string | Date | boolean | null
                }[]
            ) => {
                [key: string]: number | string | Date | boolean | null
            }[]
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\ncustomQuery()")

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
            verbose?: boolean
            returnDataFrom?: "query" | "table" | "none"
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nupdateWithJS()")

        let start
        if (options.verbose || this.debug) {
            start = Date.now()
        }

        const oldData = await this.getData(
            table,
            mergeOptions(this, { noTiming: true, verbose: false, table })
        )
        if (!oldData) {
            throw new Error("No data from getData.")
        }
        const newData = dataModifier(oldData)
        const updatedData = await queryDB(
            this.connection,
            this.runQuery,
            loadArrayQuery(table, newData),
            mergeOptions(this, { ...options, table, noTiming: true })
        )

        if (start) {
            const end = Date.now()
            console.log(`Done in ${end - start} ms`)
        }

        return updatedData
    }

    async getTables(
        options: {
            verbose?: boolean
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\ngetTables()")

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
        return queryResult.map((d) => d.name) as string[]
    }

    async getColumns(
        table: string,
        options: {
            verbose?: boolean
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\ngetColumns()")

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
        return queryResult.map((d) => d.column_name) as string[]
    }

    async getLength(
        table: string,
        options: {
            verbose?: boolean
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\ngetLength()")

        const queryResult = await queryDB(
            this.connection,
            this.runQuery,
            `SELECT COUNT(*) FROM ${table}`,
            mergeOptions(this, { ...options, table, returnDataFrom: "query" })
        )

        if (!queryResult) {
            throw new Error("No result")
        }

        return queryResult[0]["count_star()"] as number
    }

    async getTypes(
        table: string,
        options: {
            verbose?: boolean
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\ngetTypes()")

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
            return typesObj
        } else {
            return typesObj
        }
    }

    async getValues(
        table: string,
        column: string,
        options: {
            verbose?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\ngetValues()")

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

        return queryResult.map((d) => d[column])
    }

    async getUniques(
        table: string,
        column: string,
        options: {
            verbose?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\ngetUniques()")

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

        return queryResult.map((d) => d[column])
    }

    async getData(
        table: string,
        options: {
            verbose?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\ngetData()")

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
            verbose?: boolean
            returnData?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        options.verbose = options.verbose ?? true
        options.nbRowsToLog = options.nbRowsToLog ?? this.nbRowsToLog
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nlogTable()")

        return await queryDB(
            this.connection,
            this.runQuery,
            `SELECT * FROM ${table} LIMIT ${options.nbRowsToLog}`,
            mergeOptions(this, { ...options, returnDataFrom: "table", table })
        )
    }

    async done() {
        await (this.connection as AsyncDuckDBConnection)?.close()
        await (this.db as AsyncDuckDB)?.terminate()
        this.worker?.terminate()
    }
}
