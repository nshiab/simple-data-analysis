import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"
import pkg from "duckdb"
const { Database } = pkg

describe("SimpleNodeDB", function () {
    const simpleNodeDB = new SimpleNodeDB()
    it("should instantiate a SimpleNodeDB class", function () {
        assert.deepStrictEqual(simpleNodeDB instanceof SimpleNodeDB, true)
    })

    it("should start and instantiate a db", function () {
        simpleNodeDB.start()
        assert.deepStrictEqual(simpleNodeDB.getDB() instanceof Database, true)
    })
})
