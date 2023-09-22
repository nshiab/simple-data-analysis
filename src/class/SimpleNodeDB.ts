import duckdb, { Database, Connection } from "duckdb"
import loadDataQuery from "../methods/importing/loadDataQuery.js"
import { readdirSync } from "fs"
import SimpleNodeTable from "./SimpleNodeTable.js"
import queryNode from "../helpers/queryNode.js"
import writeDataQuery from "../methods/exporting/writeDataQuery.js"

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

    async query(query: string, options = { returnData: false }) {
        return await queryNode(
            query,
            this.connection,
            this.verbose,
            this.nbRowsToLog,
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

    async writeData(
        file: string,
        tableName: string,
        options: { compression?: boolean } = {}
    ) {
        this.query(writeDataQuery(file, tableName, options))
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
        options: { verbose?: boolean; nbRowsToLog?: number } = {}
    ) {
        return new SimpleNodeTable(tableName, this.db, this.connection, options)
    }

    async showTable(tableName: string, nbRowsToLog: number = this.nbRowsToLog) {
        return await queryNode(
            `SELECT * FROM ${tableName} LIMIT ${nbRowsToLog}`,
            this.connection,
            true,
            nbRowsToLog,
            { returnData: true }
        )
    }

    done() {
        this.db.close()
    }
}
