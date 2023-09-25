import duckdb, { Database, Connection } from "duckdb"
import loadDataQuery from "../methods/importing/loadDataQuery.js"
import { readdirSync } from "fs"
import SimpleNodeTable from "./SimpleNodeTable.js"
import queryNode from "../helpers/queryNode.js"
import writeDataQuery from "../methods/exporting/writeDataQuery.js"
import logDescriptionQuery from "../methods/cleaning/logDescriptionQuery.js"
import removeMissingQuery from "../methods/cleaning/removeMissingQuery.js"

export default class SimpleNodeDB {
    protected verbose: boolean
    protected nbRowsToLog: number
    protected db!: Database
    protected connection!: Connection

    constructor(options: { verbose?: boolean; nbRowsToLog?: number } = {}) {
        this.verbose = options.verbose ?? false
        this.nbRowsToLog = options.nbRowsToLog ?? 10
    }

    start() {
        this.db = new duckdb.Database(":memory:")
        this.db.exec("INSTALL httpfs")
        this.connection = this.db.connect()
        return this
    }

    private async query(
        query: string,
        options: {
            verbose: boolean
            nbRowsToLog: number
            returnData: boolean
        }
    ) {
        return await queryNode(query, this.connection, options)
    }

    async customQuery(
        query: string,
        options: {
            returnData?: boolean
            verbose?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        return await queryNode(query, this.connection, {
            verbose: this.verbose || (options.verbose ?? false),
            returnData: options.returnData ?? false,
            nbRowsToLog: options.nbRowsToLog ?? 10,
        })
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
        await this.query(loadDataQuery(table, files, options), {
            verbose: this.verbose || (options.verbose ?? false),
            returnData: options.returnData ?? false,
            nbRowsToLog: options.nbRowsToLog ?? 10,
        })
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
        const files = readdirSync(directory).map(
            (file) => `${directory}${file}`
        )
        this.query(loadDataQuery(table, files, options), {
            verbose: this.verbose || (options.verbose ?? false),
            returnData: options.returnData ?? false,
            nbRowsToLog: options.nbRowsToLog ?? 10,
        })
    }

    async logSchema(
        table: string,
        options: {
            verbose?: boolean
            returnData?: boolean
            nbRowsToLog?: number
        } = { verbose: true }
    ) {
        return await queryNode(`DESCRIBE ${table}`, this.connection, {
            verbose: this.verbose || (options.verbose ?? false),
            returnData: options.returnData ?? false,
            nbRowsToLog: options.nbRowsToLog ?? 10,
        })
    }

    async logDescription(
        table: string,
        options: {
            returnData?: boolean
            verbose?: boolean
            nbRowsToLog?: number
        } = {
            verbose: true,
        }
    ) {
        const types = await this.getTypes(table)
        const { query, resParser } = logDescriptionQuery(table, types)
        return await queryNode(query, this.connection, {
            verbose: this.verbose || (options.verbose ?? false),
            returnData: options.returnData ?? false,
            nbRowsToLog: options.nbRowsToLog ?? 10,
            resParser,
        })
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
        if (options.otherMissingValues === undefined) {
            options.otherMissingValues = ["undefined", "NaN", "null", ""]
        }
        this.query(
            removeMissingQuery(
                table,
                columns.length === 0 ? await this.getColumns(table) : columns,
                options
            ),
            {
                verbose: this.verbose || (options.verbose ?? false),
                returnData: options.returnData ?? false,
                nbRowsToLog: options.nbRowsToLog ?? 10,
            }
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
        this.query(writeDataQuery(file, table, options), {
            verbose: this.verbose || (options.verbose ?? false),
            returnData: options.returnData ?? false,
            nbRowsToLog: options.nbRowsToLog ?? 10,
        })
    }

    async getColumns(
        table: string,
        options: {
            verbose?: boolean
            returnData?: boolean
            nbRowsToLog?: number
        } = { returnData: true }
    ) {
        return (
            (await queryNode(`DESCRIBE ${table}`, this.connection, {
                verbose: this.verbose || (options.verbose ?? false),
                returnData: options.returnData ?? false,
                nbRowsToLog: options.nbRowsToLog ?? 10,
            })) as { column_name: string }[]
        ).map((d) => d.column_name)
    }

    async getTypes(
        table: string,
        options: {
            verbose?: boolean
            returnData?: boolean
            nbRowsToLog?: number
        } = { returnData: true }
    ) {
        const schema = (await queryNode(`DESCRIBE ${table}`, this.connection, {
            verbose: this.verbose || (options.verbose ?? false),
            returnData: options.returnData ?? false,
            nbRowsToLog: options.nbRowsToLog ?? 10,
        })) as { column_name: string; column_type: string }[]
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
        } = { returnData: true }
    ) {
        return await this.query(`SELECT * from ${table}`, {
            verbose: this.verbose || (options.verbose ?? false),
            returnData: options.returnData ?? false,
            nbRowsToLog: options.nbRowsToLog ?? 10,
        })
    }

    getDB() {
        return this.db
    }

    getTable(
        table: string,
        options: { verbose?: boolean; nbRowsToLog?: number } = {
            verbose: this.verbose,
            nbRowsToLog: this.nbRowsToLog,
        }
    ) {
        return new SimpleNodeTable(table, this.db, this.connection, options)
    }

    async logTable(
        table: string,
        options: {
            verbose?: boolean
            returnData?: boolean
            nbRowsToLog?: number
        } = {
            verbose: true,
        }
    ) {
        return await queryNode(
            `SELECT * FROM ${table} LIMIT ${options.nbRowsToLog}`,
            this.connection,
            {
                verbose: this.verbose || (options.verbose ?? false),
                returnData: options.returnData ?? false,
                nbRowsToLog: options.nbRowsToLog ?? 10,
            }
        )
    }

    done() {
        this.db.close()
    }
}
