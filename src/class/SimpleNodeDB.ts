import duckdb, { Database, Connection } from "duckdb"
import loadDataQuery from "../methods/importing/loadDataQuery.js"
import { readdirSync } from "fs"
import SimpleNodeTable from "./SimpleNodeTable.js"
import queryNode from "../helpers/queryNode.js"
import writeDataQuery from "../methods/exporting/writeDataQuery.js"
import logDescriptionQuery from "../methods/cleaning/logDescriptionQuery.js"
import removeMissingQuery from "../methods/cleaning/removeMissingQuery.js"
import renameColumnQuery from "../methods/cleaning/renameColumnQuery.js"
import replaceTextQuery from "../methods/cleaning/replaceTextQuery.js"
import convertQuery from "../methods/cleaning/convertQuery.js"

export default class SimpleNodeDB {
    protected debug: boolean
    protected verbose: boolean
    protected nbRowsToLog: number
    protected db!: Database
    protected connection!: Connection

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
    }

    start() {
        ;(this.verbose || this.debug) && console.log("\nstart()")
        this.db = new duckdb.Database(":memory:")
        this.db.exec("INSTALL httpfs")
        this.connection = this.db.connect()
        return this
    }

    private mergeOptions(options: {
        returnDataFrom?: "query" | "table" | "none"
        verbose?: boolean
        table?: string
        nbRowsToLog?: number
        returnedDataModifier?: (
            rows: {
                [key: string]: unknown
            }[]
        ) => unknown
        debug?: boolean
        noTiming?: boolean
        justQuery?: boolean
    }) {
        return {
            verbose: this.verbose || (options.verbose ?? false),
            table: options.table,
            returnDataFrom: options.returnDataFrom ?? "none",
            nbRowsToLog: options.nbRowsToLog ?? this.nbRowsToLog,
            returnedDataModifier: options.returnedDataModifier,
            debug: this.debug,
            noTiming: options.noTiming ?? false,
            justQuery: options.justQuery ?? false,
        }
    }

    private async query(
        query: string,
        options: {
            table?: string
            verbose: boolean
            nbRowsToLog: number
            returnDataFrom: "query" | "table" | "none"
            returnedDataModifier?: (
                rows: {
                    [key: string]: unknown
                }[]
            ) => unknown
            debug: boolean
            noTiming: boolean
            justQuery: boolean
        }
    ) {
        let start
        if ((options.verbose || options.debug) && !options.noTiming) {
            start = Date.now()
        }
        if (options.debug) {
            console.log(query)
        }

        let data = null

        if (
            options.returnDataFrom === "none" &&
            options.verbose === false &&
            options.debug === false
        ) {
            data = await queryNode(query, this.connection, false)
        } else if (options.returnDataFrom === "query") {
            data = await queryNode(query, this.connection, true)
        } else if (
            options.returnDataFrom === "table" ||
            (options.returnDataFrom === "none" &&
                (options.verbose || options.debug))
        ) {
            if (typeof options.table !== "string") {
                throw new Error("No options.table")
            }

            await queryNode(query, this.connection, false)
            if (options.nbRowsToLog === Infinity) {
                data = await queryNode(
                    `SELECT * FROM ${options.table};`,
                    this.connection,
                    true
                )
            } else {
                data = await queryNode(
                    `SELECT * FROM ${options.table} LIMIT ${options.nbRowsToLog};`,
                    this.connection,
                    true
                )
            }
        } else {
            throw new Error(
                "No condition handling the returned data in this.query!"
            )
        }

        if (options.returnedDataModifier) {
            if (data === null) {
                throw new Error(
                    "Data is null. Use option returnDataFrom with 'query' or 'table'."
                )
            }
            data = options.returnedDataModifier(
                data as {
                    [key: string]: unknown
                }[]
            ) as {
                [key: string]: unknown
            }[]
        }

        if ((options.verbose || options.debug) && !options.justQuery) {
            if (data === null) {
                throw new Error(
                    "Data is null. Use option returnDataFrom with 'query' or 'table'."
                )
            }
            if (Array.isArray(data)) {
                console.table(data)
                const nbRows = (
                    (await queryNode(
                        `SELECT COUNT(*) FROM ${options.table};`,
                        this.connection,
                        true
                    )) as { "count_star()": number }[]
                )[0]["count_star()"]
                console.log(
                    `${nbRows} rows in total ${
                        options.returnDataFrom === "none"
                            ? ""
                            : `(nbRowsToLog: ${options.nbRowsToLog})`
                    }`
                )
            } else {
                console.log(data)
            }

            if (start) {
                const end = Date.now()
                console.log(`Done in ${end - start} ms`)
            }
        }

        return data
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
        return await this.query(query, this.mergeOptions(options))
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
        await this.query(
            loadDataQuery(table, files, options),
            this.mergeOptions({ ...options, table })
        )
    }

    async loadDataFromDirectory(
        table: string,
        directory: string,
        options: {
            fileType?: "csv" | "dsv" | "json" | "parquet"
            autoDetect?: boolean
            fileName?: boolean
            unifyColumns?: boolean
            columns?: { [key: string]: string }
            // csv options
            header?: boolean
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
            console.log("\nloadDataFromDirectory()")
        const files = readdirSync(directory).map(
            (file) => `${directory}${file}`
        )
        this.query(
            loadDataQuery(table, files, options),
            this.mergeOptions({ ...options, table })
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
        return await this.query(
            `DESCRIBE ${table}`,
            this.mergeOptions({
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
        return await this.query(
            query,
            this.mergeOptions({
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
                data = await this.query(
                    renameColumnQuery(table, oldColumns[i], newColumns[i]),
                    this.mergeOptions({ ...options, table })
                )
            } else {
                await this.query(
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

        return await this.query(
            removeMissingQuery(
                table,
                allColumns,
                types,
                columns.length === 0 ? allColumns : columns,
                options
            ),
            this.mergeOptions({ ...options, table })
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
                    data = await this.query(
                        replaceTextQuery(table, column, oldText[i], newText[i]),
                        this.mergeOptions({ ...options, table })
                    )
                } else {
                    await this.query(
                        replaceTextQuery(table, column, oldText[i], newText[i]),
                        this.mergeOptions({
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

        return await this.query(
            convertQuery(table, columns, types, allColumns, allTypes, options),
            this.mergeOptions({ ...options, table })
        )
    }

    async writeData(
        file: string,
        table: string,
        options: {
            compression?: boolean
            verbose?: boolean
            returnDataFrom?: "query" | "table" | "none"
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nwriteData()")
        await this.query(
            writeDataQuery(file, table, options),
            this.mergeOptions({ ...options, table })
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
        return (await this.query(
            `DESCRIBE ${table}`,
            this.mergeOptions({
                ...options,
                table,
                returnDataFrom: "query",
                returnedDataModifier: (rows) => rows.map((d) => d.column_name),
            })
        )) as string[]
    }

    async getTypes(
        table: string,
        options: {
            verbose?: boolean
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\ngetTypes()")

        const types = await this.query(
            `DESCRIBE ${table}`,
            this.mergeOptions({
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

        return types as { [key: string]: string }
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

        return await this.query(
            `SELECT * from ${table}`,
            this.mergeOptions({ ...options, returnDataFrom: "query" })
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

        return await this.query(
            `SELECT * FROM ${table} LIMIT ${options.nbRowsToLog}`,
            this.mergeOptions({ ...options, returnDataFrom: "table" })
        )
    }

    getDB() {
        return this.db
    }

    done() {
        this.db.close()
    }

    // To return a Table class
    getTable(
        table: string,
        options: {
            verbose?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\ngetTable()")
        return new SimpleNodeTable(table, this.db, this.connection, options)
    }
}
