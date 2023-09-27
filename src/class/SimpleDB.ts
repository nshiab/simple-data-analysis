import { AsyncDuckDB, AsyncDuckDBConnection } from "@duckdb/duckdb-wasm"
import { Database, Connection } from "duckdb"

import getDuckDB from "../helpers/getDuckDB.js"
import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"

import loadDataQuery from "../methods/importing/loadDataQuery.js"
import logDescriptionQuery from "../methods/cleaning/logDescriptionQuery.js"
import removeMissingQuery from "../methods/cleaning/removeMissingQuery.js"
import renameColumnQuery from "../methods/cleaning/renameColumnQuery.js"
import replaceTextQuery from "../methods/cleaning/replaceTextQuery.js"
import convertQuery from "../methods/cleaning/convertQuery.js"
import roundQuery from "../methods/cleaning/round.js"

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
    ) => Promise<unknown>

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
            // Specific type for web
            const data = await (connection as AsyncDuckDBConnection).query(
                query
            )
            // No difference on the Web. But different with NodeJS.
            if (returnDataFromQuery) {
                return data as unknown
            } else {
                return data as unknown
            }
        }
    }

    async start() {
        ;(this.verbose || this.debug) && console.log("\nstart()")
        const duckDB = await getDuckDB()
        this.db = duckDB.db
        this.connection = await this.db.connect()
        if (typeof window !== "undefined") {
            this.connection.query("INSTALL httpfs")
        } else {
            console.log("No window. Not running 'INSTALL httpfs'")
        }

        this.worker = duckDB.worker
        return this
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
                    [key: string]: unknown
                }[]
            ) => unknown
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\ncustomQuery()")
        return await queryDB(
            this.connection,
            this.runQuery,
            query,
            mergeOptions(this, options)
        )
    }

    async loadData(
        table: string,
        files: string[],
        options: {
            fileType?: "csv" | "dsv" | "json" | "parquet"
            autoDetect?: boolean
            fileName?: boolean
            unifyColumns?: boolean
            columns?: { [key: string]: string }
            // csv options
            header?: boolean
            allText?: boolean
            delim?: string
            skip?: number
            // json options
            format?: "unstructured" | "newlineDelimited" | "array"
            records?: boolean
            // others
            verbose?: boolean
            returnDataFrom?: "query" | "table" | "none"
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nloadData()")
        await queryDB(
            this.connection,
            this.runQuery,
            loadDataQuery(table, files, options),
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
        const { query, returnedDataModifier } = logDescriptionQuery(
            table,
            types
        )
        return await queryDB(
            this.connection,
            this.runQuery,
            query,
            mergeOptions(this, {
                ...options,
                table,
                returnedDataModifier,
                nbRowsToLog: Infinity,
                returnDataFrom: "query",
            })
        )
    }

    async renameColumns(
        table: string,
        oldColumns: string[],
        newColumns: string[],
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

        if (oldColumns.length !== newColumns.length) {
            throw new Error(
                "oldColumns and newColumns must have the same number of items."
            )
        }

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

    async removeMissing(
        table: string,
        columns: string[] = [],
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

    async replaceText(
        table: string,
        columns: string[],
        oldText: string[],
        newText: string[],
        options: {
            verbose?: boolean
            returnDataFrom?: "query" | "table" | "none"
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nreplaceText()")

        let start
        if (options.verbose || this.debug) {
            start = Date.now()
        }

        if (oldText.length !== newText.length) {
            throw new Error(
                "oldText and newText must have the same number of items."
            )
        }

        const lastColumn = columns[columns.length - 1]
        const lastOldText = oldText[oldText.length - 1]

        let data
        for (const column of columns) {
            for (let i = 0; i < oldText.length; i++) {
                if (column === lastColumn && oldText[i] === lastOldText) {
                    data = await queryDB(
                        this.connection,
                        this.runQuery,
                        replaceTextQuery(table, column, oldText[i], newText[i]),
                        mergeOptions(this, { ...options, table })
                    )
                } else {
                    await queryDB(
                        this.connection,
                        this.runQuery,
                        replaceTextQuery(table, column, oldText[i], newText[i]),
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

    async convert(
        table: string,
        columns: string[],
        types: (
            | "integer"
            | "float"
            | "string"
            | "date"
            | "time"
            | "datetime"
            | "datetimeTz"
        )[],
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

        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nconvert()")

        return await queryDB(
            this.connection,
            this.runQuery,
            convertQuery(table, columns, types, allColumns, allTypes, options),
            mergeOptions(this, { ...options, table })
        )
    }

    async round(
        table: string,
        columns: string[],
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
            roundQuery(table, columns, options),
            mergeOptions(this, { ...options, table })
        )
    }

    async getColumns(
        table: string,
        options: {
            verbose?: boolean
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\ngetColumns()")
        return (await queryDB(
            this.connection,
            this.runQuery,
            `DESCRIBE ${table}`,
            mergeOptions(this, {
                ...options,
                table,
                returnDataFrom: "query",
                returnedDataModifier: (rows) => rows.map((d) => d.column_name),
            })
        )) as unknown as string[]
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
                returnedDataModifier: (rows: { [key: string]: unknown }[]) => {
                    const types: { [key: string]: unknown } = {}
                    for (const row of rows) {
                        types[row.column_name as string] = row.column_type
                    }
                    return types
                },
            })
        )

        return types as unknown as { [key: string]: string }
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
            mergeOptions(this, { ...options, returnDataFrom: "query" })
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
        ;(options.verbose || options.verbose || this.verbose || this.debug) &&
            console.log("\nlogTable()")

        return await queryDB(
            this.connection,
            this.runQuery,
            `SELECT * FROM ${table} LIMIT ${options.nbRowsToLog}`,
            mergeOptions(this, { ...options, returnDataFrom: "table" })
        )
    }

    async done() {
        await (this.connection as AsyncDuckDBConnection)?.close()
        await (this.db as AsyncDuckDB)?.terminate()
        this.worker?.terminate()
    }
}
