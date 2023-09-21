import { AsyncDuckDB, AsyncDuckDBConnection } from "@duckdb/duckdb-wasm"
import getDuckDB from "../helpers/getDuckDB.js"
import loadData from "../methods/importing/loadData.js"

export default class SimpleDB {
    ready!: boolean
    protected db!: AsyncDuckDB
    protected connection!: AsyncDuckDBConnection
    protected worker!: Worker | null

    constructor() {
        this.ready = false
    }

    async start(verbose = false) {
        const duckDB = await getDuckDB(verbose)
        this.db = duckDB.db
        this.connection = await this.db.connect()
        this.worker = duckDB.worker
        this.ready = true
        return this
    }

    async loadData(
        tableName: string,
        data: {
            [key: string]: string | number | Date | undefined | null | boolean
        }[]
    ) {
        await loadData(this.db, this.connection, tableName, data)

        return this
    }

    async query(query: string) {
        const result = await this.connection.query(query)
        return JSON.parse(result.toString())
    }

    async getTablesNames() {
        return this.connection.getTableNames("SHOW TABLES")
    }

    async getData(tableName: string) {
        return await this.query(`SELECT * FROM ${tableName}`)
    }

    getDB() {
        return this.db
    }

    async stop() {
        await this.connection?.close()
        await this.db?.terminate()
        this.worker?.terminate()
        this.ready = false
    }
}
