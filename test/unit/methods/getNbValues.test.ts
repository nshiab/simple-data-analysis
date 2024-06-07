import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("getNbValues", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should return the number of data points", async () => {
        const table = sdb.newTable("data")
        await table.loadData(["test/data/files/data.json"])
        assert.deepStrictEqual(await table.getNbValues(), 8)
    })
})
