import { AsyncDuckDB } from "@duckdb/duckdb-wasm"
import getDuckDB from "../helpers/getDuckDB.js"

export default class SimpleDB {
    protected db: AsyncDuckDB | null
    protected worker: Worker | null

    constructor() {
        this.db = null
        this.worker = null
    }

    async start(verbose = false) {
        const duckDB = await getDuckDB(verbose)
        this.db = duckDB.db
        this.worker = duckDB.worker
        return this
    }

    getDB() {
        return this.db
    }

    async stop() {
        await this.db?.terminate()
        this.worker?.terminate()
    }
}
