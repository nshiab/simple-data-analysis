import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"
import { AsyncDuckDB, AsyncDuckDBConnection } from "@duckdb/duckdb-wasm"

describe("SimpleDB", () => {
    const simpleDB = new SimpleDB()
    it("should instantiate a SimpleDB class", () => {
        assert.deepStrictEqual(simpleDB instanceof SimpleDB, true)
    })

    it("should start and instantiate a db", async () => {
        await simpleDB.start()
        assert.deepStrictEqual(simpleDB.db instanceof AsyncDuckDB, true)
    })
    it("should instantiate a connection", async () => {
        assert.deepStrictEqual(
            simpleDB.connection instanceof AsyncDuckDBConnection,
            true
        )
    })
    it("should close the db", async () => {
        await simpleDB.done()
    })
})
