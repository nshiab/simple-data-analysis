import { AsyncDuckDB, AsyncDuckDBConnection } from "@duckdb/duckdb-wasm"
import getDuckDB from "../helpers/getDuckDB.js"

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

    async query(query: string) {
        const result = await this.connection.query(query)
        return JSON.parse(result.toString())
    }

    async getData(table: string) {
        return await this.query(`SELECT * FROM ${table}`)
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
