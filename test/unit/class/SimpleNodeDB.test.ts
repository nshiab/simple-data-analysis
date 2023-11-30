import assert from "assert"
import { SimpleNodeDB } from "../../../src/index.js"
import pkg from "duckdb"
const { Database } = pkg

describe("SimpleNodeDB", () => {
    const simpleNodeDB = new SimpleNodeDB()
    it("should instantiate a SimpleNodeDB class", () => {
        assert.deepStrictEqual(simpleNodeDB instanceof SimpleNodeDB, true)
    })

    it("should start and instantiate a db", async () => {
        await simpleNodeDB.start()
        assert.deepStrictEqual(simpleNodeDB.db instanceof Database, true)
    })
    it("should close the db", async () => {
        await simpleNodeDB.done()
    })
})
