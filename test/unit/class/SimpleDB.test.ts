import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"
import pkg from "duckdb"
const { Database, Connection } = pkg

describe("SimpleDB", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })

    it("should instantiate a SimpleDB class", () => {
        assert.deepStrictEqual(sdb instanceof SimpleDB, true)
    })
    it("should start and instantiate a db", async () => {
        await sdb.start()
        assert.deepStrictEqual(sdb.db instanceof Database, true)
    })
    it("should start and instantiate a connection", async () => {
        await sdb.start()
        assert.deepStrictEqual(sdb.connection instanceof Connection, true)
    })
    it("should run a custom query and return the result", async () => {
        const result = await sdb.customQuery(`select 42 as result`, {
            returnDataFrom: "query",
        })
        assert.deepStrictEqual(result, [{ result: 42 }])
    })

    it("should close the db", async () => {
        await sdb.done()
        // How to test?
    })
})
