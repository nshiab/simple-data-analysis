import duckdb, { Database, Connection } from "duckdb"
import loadDataQuery from "../methods/importing/loadDataQuery.js"
import { readdirSync } from "fs"
import SimpleNodeTable from "./SimpleNodeTable.js"
import queryNode from "../helpers/queryNode.js"
import writeDataQuery from "../methods/exporting/writeDataQuery.js"
import logDescriptionQuery from "../methods/cleaning/logDescriptionQuery.js"
import removeMissingQuery from "../methods/cleaning/removeMissingQuery.js"

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
        rowsModifier?: (
            rows: {
                [key: string]: unknown
            }[]
        ) => unknown
        debug?: boolean
    }) {
        return {
            verbose: this.verbose || (options.verbose ?? false),
            table: options.table,
            returnDataFrom: options.returnDataFrom ?? "none",
            nbRowsToLog: options.nbRowsToLog ?? this.nbRowsToLog,
            rowsModifier: options.rowsModifier,
            debug: this.debug,
        }
    }

    private async query(
        query: string,
        options: {
            table?: string
            verbose: boolean
            nbRowsToLog: number
            returnDataFrom: "query" | "table" | "none"
            rowsModifier?: (
                rows: {
                    [key: string]: unknown
                }[]
            ) => unknown
            debug: boolean
        }
    ) {
        let start
        if (options.verbose || options.debug) {
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
        }

        if (options.rowsModifier) {
            if (data === null) {
                throw new Error(
                    "Data is null. Use option returnDataFrom with 'query' or 'table'."
                )
            }
            data = options.rowsModifier(
                data as {
                    [key: string]: unknown
                }[]
            ) as {
                [key: string]: unknown
            }[]
        }

        if (options.verbose || options.debug) {
            if (data === null) {
                throw new Error(
                    "Data is null. Use option returnDataFrom with 'query' or 'table'."
                )
            }
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
            rowsModifier?: (
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
        const { query, rowsModifier } = logDescriptionQuery(table, types)
        return await this.query(
            query,
            this.mergeOptions({
                ...options,
                table,
                rowsModifier,
                nbRowsToLog: Infinity,
                returnDataFrom: "query",
            })
        )
    }

    async removeMissing(
        table: string,
        columns: string[] = [],
        options: {
            otherMissingValues?: string[]
            invert?: boolean
            returnDataFrom?: "query" | "table" | "none"
            verbose?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        const allColumns = await this.getColumns(table)

        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nremoveMissing()")

        return await this.query(
            removeMissingQuery(
                table,
                allColumns,
                columns.length === 0 ? allColumns : columns,
                options
            ),
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
                rowsModifier: (rows) => rows.map((d) => d.column_name),
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

        const schema = (await this.query(
            `DESCRIBE ${table}`,
            this.mergeOptions({ ...options, table, returnDataFrom: "query" })
        )) as { column_name: string; column_type: string }[]

        const types: { [key: string]: string } = {}
        for (const column of schema) {
            types[column.column_name] = column.column_type
        }

        return types
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
