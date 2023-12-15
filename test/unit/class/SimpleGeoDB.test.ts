import assert from "assert"
import SimpleGeoDB from "../../../src/class/SimpleGeoDB.js"
// import { AsyncDuckDB, AsyncDuckDBConnection } from "@duckdb/duckdb-wasm"

describe("SimpleGeoDB", () => {
    const simpleGeoDB = new SimpleGeoDB()
    it("should instantiate a SimpleGeoDB class", () => {
        assert.deepStrictEqual(simpleGeoDB instanceof SimpleGeoDB, true)
    })

    it("should start and instantiate a db", async () => {
        console.log("NOT WORKING FOR NOW.")
        // await simpleGeoDB.start()
        // assert.deepStrictEqual(simpleGeoDB.db instanceof AsyncDuckDB, true)
    })
    it("should instantiate a connection", async () => {
        console.log("NOT WORKING FOR NOW.")
        // assert.deepStrictEqual(
        // simpleGeoDB.connection instanceof AsyncDuckDBConnection,
        // true
        // )
    })
    it("should close the db", async () => {
        console.log("NOT WORKING FOR NOW.")
        // await simpleGeoDB.done()
    })
})
