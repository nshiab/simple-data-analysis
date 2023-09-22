import { Connection, Database } from "duckdb"
import queryNode from "../helpers/queryNode.js"
import writeDataQuery from "../methods/exporting/writeDataQuery.js"

export default class SimpleNodeTable {
    noLogs: boolean // Just to avoid logs in test
    protected tableName: string
    protected verbose: boolean
    protected nbRowsToLog: number
    protected db!: Database
    protected connection!: Connection

    constructor(
        tableName: string,
        db: Database,
        connection: Connection,
        options: { verbose?: boolean; nbRowsToLog?: number } = {
            verbose: false,
            nbRowsToLog: 10,
        }
    ) {
        this.tableName = tableName
        this.db = db
        this.connection = connection
        this.verbose = options.verbose ?? false
        this.nbRowsToLog = options.nbRowsToLog ?? 10
        this.noLogs = false
    }

    async query(query: string, options = { returnData: false }) {
        return await queryNode(
            { query },
            this.connection,
            this.verbose,
            this.nbRowsToLog,
            options
        )
    }

    async writeData(file: string, options: { compression?: boolean } = {}) {
        this.query(writeDataQuery(file, this.tableName, options))
    }

    async showSchema(returnData = false) {
        return await queryNode(
            { query: `DESCRIBE ${this.tableName}` },
            this.connection,
            !this.noLogs,
            Infinity,
            { returnData }
        )
    }

    async showTable(nbRowsToLog: number = this.nbRowsToLog) {
        return await queryNode(
            { query: `SELECT * FROM ${this.tableName} LIMIT ${nbRowsToLog}` },
            this.connection,
            true,
            nbRowsToLog,
            { returnData: true }
        )
    }

    async getColumns() {
        return (
            (await queryNode(
                { query: `DESCRIBE ${this.tableName}` },
                this.connection,
                false,
                Infinity,
                { returnData: true }
            )) as { column_name: string }[]
        ).map((d) => d.column_name)
    }

    async getData() {
        return await this.query(`SELECT * from ${this.tableName}`, {
            returnData: true,
        })
    }
}
