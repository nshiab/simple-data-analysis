import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("getNbColumns", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should return the number of columns", async () => {
        const table = sdb.newTable("data")
        await table.loadData(["test/data/files/employees.json"])
        assert.deepStrictEqual(await table.getNbColumns(), 6)
    })
})
