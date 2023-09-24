import duckdb, { Database, Connection } from "duckdb"
import loadDataQuery from "../methods/importing/loadDataQuery.js"
import { readdirSync } from "fs"
import SimpleNodeTable from "./SimpleNodeTable.js"
import queryNode from "../helpers/queryNode.js"
import writeDataQuery from "../methods/exporting/writeDataQuery.js"
import logDescriptionQuery from "../methods/cleaning/logDescriptionQuery.js"

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

    private async query(query: string, options = { returnData: false }) {
        return await queryNode(
            query,
            this.connection,
            this.verbose,
            this.nbRowsToLog,
            options
        )
    }

    async customQuery(
        query: string,
        options: {
            returnData?: boolean
            logTable?: boolean
            nbRowsToLog?: number
        } = {
            returnData: true,
            logTable: true,
            nbRowsToLog: this.nbRowsToLog,
        }
    ) {
        return await queryNode(
            query,
            this.connection,
            this.verbose,
            options.nbRowsToLog,
            options
        )
    }

    async loadData(
        tableName: string,
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
        } = {}
    ) {
        await this.query(loadDataQuery(tableName, files, options))
    }

    async loadDataFromDirectory(
        tableName: string,
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
        } = {}
    ) {
        const files = readdirSync(directory).map(
            (file) => `${directory}${file}`
        )
        this.query(loadDataQuery(tableName, files, options))
    }

    async logDescription(
        tableName: string,
        options: {
            returnData?: boolean
            logTable?: boolean
            nbRowsToLog?: number
        } = {
            returnData: true,
            logTable: true,
            nbRowsToLog: Infinity,
        }
    ) {
        const types = await this.getTypes(tableName)
        const { query, resParser } = logDescriptionQuery(tableName, types)
        return await queryNode(
            query,
            this.connection,
            options.logTable,
            options.nbRowsToLog,
            { returnData: options.returnData, resParser }
        )
    }

    async writeData(
        file: string,
        tableName: string,
        options: { compression?: boolean } = {}
    ) {
        this.query(writeDataQuery(file, tableName, options))
    }

    async getColumns(tableName: string) {
        return (
            (await queryNode(
                `DESCRIBE ${tableName}`,
                this.connection,
                false,
                Infinity,
                { returnData: true }
            )) as { column_name: string }[]
        ).map((d) => d.column_name)
    }

    async getTypes(tableName: string) {
        const schema = (await queryNode(
            `DESCRIBE ${tableName}`,
            this.connection,
            false,
            Infinity,
            { returnData: true }
        )) as { column_name: string; column_type: string }[]
        const types: { [key: string]: string } = {}
        for (const column of schema) {
            types[column.column_name] = column.column_type
        }
        return types
    }

    async getData(tableName: string) {
        return await this.query(`SELECT * from ${tableName}`, {
            returnData: true,
        })
    }

    getDB() {
        return this.db
    }

    getTable(
        tableName: string,
        options: { verbose?: boolean; nbRowsToLog?: number } = {
            verbose: this.verbose,
            nbRowsToLog: this.nbRowsToLog,
        }
    ) {
        return new SimpleNodeTable(tableName, this.db, this.connection, options)
    }

    async logTable(
        tableName: string,
        options: {
            returnData?: boolean
            logTable?: boolean
            nbRowsToLog?: number
        } = {
            returnData: true,
            logTable: true,
            nbRowsToLog: this.nbRowsToLog,
        }
    ) {
        return await queryNode(
            `SELECT * FROM ${tableName} LIMIT ${options.nbRowsToLog}`,
            this.connection,
            true,
            options.nbRowsToLog,
            { returnData: options.returnData }
        )
    }

    async logSchema(
        tableName: string,
        options: {
            returnData?: boolean
            logTable?: boolean
            nbRowsToLog?: number
        } = {
            returnData: true,
            logTable: true,
            nbRowsToLog: Infinity,
        }
    ) {
        return await queryNode(
            `DESCRIBE ${tableName}`,
            this.connection,
            options.logTable,
            options.nbRowsToLog,
            options
        )
    }

    done() {
        this.db.close()
    }
}
