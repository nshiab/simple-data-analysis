import { Connection, Database } from "duckdb"
import queryNode from "../helpers/queryNode.js"

export default class SimpleNodeTable {
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

    async getData() {
        return await this.query(`SELECT * from ${this.tableName}`, {
            returnData: true,
        })
    }
}
