import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("logTable", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should not throw an error when there is no table", async () => {
        const table = sdb.newTable()
        await table.logTable()

        // How to test?
        assert.deepStrictEqual(true, true)
    })
})
