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
        returnData?: boolean
        verbose?: boolean
        table?: string | null
        nbRowsToLog?: number
        rowsModifier?: (
            rows: {
                [key: string]: unknown
            }[]
        ) => {
            [key: string]: unknown
        }[]
        debug?: boolean
    }) {
        return {
            verbose: this.verbose || (options.verbose ?? false),
            table: options.table,
            returnData: options.returnData ?? false,
            nbRowsToLog: options.nbRowsToLog ?? this.nbRowsToLog,
            rowsModifier: options.rowsModifier,
            debug: this.debug,
        }
    }

    private async query(
        query: string,
        options: {
            table?: string | null
            verbose: boolean
            nbRowsToLog: number
            returnData: boolean
            rowsModifier?: (
                rows: {
                    [key: string]: unknown
                }[]
            ) => {
                [key: string]: unknown
            }[]
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

        let data = (await queryNode(
            query,
            this.connection,
            options.returnData
        )) as {
            [key: string]: unknown
        }[]
        if (options.rowsModifier) {
            data = options.rowsModifier(data)
        }

        if (options.verbose || options.debug) {
            if (options.table === undefined) {
                console.log(
                    "Can't log table. You need to specificy which table to log in options as 'table'. If you want to return the output of the SQL directly, put 'table' as null."
                )
            } else if (options.table === null) {
                console.log(data.slice(0, options.nbRowsToLog))
            } else if (typeof options.table === "string") {
                console.log(
                    await this.getData(options.table, {
                        nbRowsToLog: options.nbRowsToLog,
                    })
                )
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
            returnData?: boolean
            verbose?: boolean
            table?: string
            nbRowsToLog?: number
            rowsModifier?: (
                rows: {
                    [key: string]: unknown
                }[]
            ) => {
                [key: string]: unknown
            }[]
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
            returnData?: boolean
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
            returnData?: boolean
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
            returnData?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        options.verbose = options.verbose ?? true
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nlogSchema()")
        return await this.query(
            `DESCRIBE ${table}`,
            this.mergeOptions({ ...options, table })
        )
    }

    async logDescription(
        table: string,
        options: {
            returnData?: boolean
            verbose?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        options.verbose = options.verbose ?? true
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nlogDescription()")
        const types = await this.getTypes(table)
        const { query, rowsModifier } = logDescriptionQuery(table, types)
        return await this.query(
            query,
            this.mergeOptions({ ...options, table, rowsModifier })
        )
    }

    async removeMissing(
        table: string,
        columns = [],
        options: {
            otherMissingValues?: string[]
            invert?: boolean
            returnData?: boolean
            verbose?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nremoveMissing()")
        if (options.otherMissingValues === undefined) {
            options.otherMissingValues = ["undefined", "NaN", "null", ""]
        }
        this.query(
            removeMissingQuery(
                table,
                columns.length === 0 ? await this.getColumns(table) : columns,
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
            returnData?: boolean
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
            returnData?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        options.returnData = options.returnData ?? true
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\ngetColumns()")
        return (
            (await this.query(
                `DESCRIBE ${table}`,
                this.mergeOptions({ ...options, table: null })
            )) as { column_name: string }[]
        ).map((d) => d.column_name)
    }

    async getTypes(
        table: string,
        options: {
            verbose?: boolean
            returnData?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\ngetTypes()")
        options.returnData = options.returnData ?? true

        const schema = (await this.query(
            `DESCRIBE ${table}`,
            this.mergeOptions({ ...options, table: null })
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
            returnData?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\ngetData()")
        options.returnData = options.returnData ?? true

        if (typeof options.nbRowsToLog === "number") {
            return await this.query(
                `SELECT * FROM ${table} LIMIT ${options.nbRowsToLog}`,
                this.mergeOptions(options)
            )
        } else {
            return await this.query(
                `SELECT * from ${table}`,
                this.mergeOptions(options)
            )
        }
    }

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
            this.mergeOptions({ ...options, table: null })
        )
    }

    getDB() {
        return this.db
    }

    done() {
        this.db.close()
    }
}
