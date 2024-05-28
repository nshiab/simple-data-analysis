import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("getMean", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should return the mean value", async () => {
        const table = sdb.newTable("data")
        await table.loadData("test/data/files/data.json")
        assert.deepStrictEqual(await table.getMean("key1"), 2.5)
    })

    it("should return the mean value rounded", async () => {
        const table = sdb.newTable("data")
        await table.loadData("test/data/files/data.json")
        assert.deepStrictEqual(await table.getMean("key1", { decimals: 0 }), 3)
    })
})
