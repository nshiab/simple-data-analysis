import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"
import pkg from "duckdb"
const { Database } = pkg

describe("SimpleNodeDB", () => {
    const simpleNodeDB = new SimpleNodeDB()
    it("should instantiate a SimpleNodeDB class", () => {
        assert.deepStrictEqual(simpleNodeDB instanceof SimpleNodeDB, true)
    })

    it("should start and instantiate a db", () => {
        simpleNodeDB.start()
        assert.deepStrictEqual(simpleNodeDB.getDB() instanceof Database, true)
    })
    it("should close the db", () => {
        simpleNodeDB.done()
    })
})
