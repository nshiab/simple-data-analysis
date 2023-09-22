import { AsyncDuckDB, AsyncDuckDBConnection } from "@duckdb/duckdb-wasm"
import getDuckDB from "../helpers/getDuckDB.js"
import loadData from "../methods/importing/loadDataWeb.js"
import fetchData from "../methods/importing/fetchData.js"

export default class SimpleDB {
    ready!: boolean
    protected db!: AsyncDuckDB
    protected connection!: AsyncDuckDBConnection
    protected worker: Worker | null

    constructor() {
        this.ready = false
        this.worker = null
    }

    async start(verbose = false) {
        const duckDB = await getDuckDB(verbose)
        this.db = duckDB.db
        this.connection = await this.db.connect()
        this.worker = duckDB.worker
        this.ready = true
    }

    async loadData(
        tableName: string,
        data: {
            [key: string]: string | number | Date | undefined | null | boolean
        }[]
    ) {
        await loadData(this.db, this.connection, tableName, data)
    }

    async fetchData(tableName: string, url: string) {
        await fetchData(this.connection, tableName, url)
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
