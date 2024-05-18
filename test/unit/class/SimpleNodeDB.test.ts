import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"
import pkg from "duckdb"
const { Database } = pkg

describe("SimpleDB", () => {
    const sdb = new SimpleDB()
    it("should instantiate a SimpleDB class", () => {
        assert.deepStrictEqual(sdb instanceof SimpleDB, true)
    })

    it("should start and instantiate a db", async () => {
        await sdb.start()
        assert.deepStrictEqual(sdb.db instanceof Database, true)
    })
    it("should close the db", async () => {
        await sdb.done()
    })
})
