import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"
import SimpleTable from "../../../src/class/SimpleTable.js"

describe("SimpleTable", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })
    it("should create a new SimpleTable", async () => {
        const table = sdb.newTable("data")
        assert.deepStrictEqual(table instanceof SimpleTable, true)
    })
})
