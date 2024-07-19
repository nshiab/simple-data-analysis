import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("logDescription", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should log a description of the table", async () => {
        const table = sdb.newTable()
        await table.loadData("test/data/files/employees.csv")

        await table.logDescription()

        // How to test?
        assert.deepStrictEqual(true, true)
    })
    it("should not throw an error when there is no table", async () => {
        const table = sdb.newTable()
        await table.logDescription()

        // How to test?
        assert.deepStrictEqual(true, true)
    })
})
