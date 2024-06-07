import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("getStdDev", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should return the standard deviation", async () => {
        const table = sdb.newTable("data")
        await table.loadData(["test/data/files/data.json"])
        assert.deepStrictEqual(
            await table.getStdDev("key1"),
            1.2909944487358056
        )
    })
    it("should return the standard deviation rounded", async () => {
        const table = sdb.newTable("data")
        await table.loadData(["test/data/files/data.json"])
        assert.deepStrictEqual(
            await table.getStdDev("key1", { decimals: 3 }),
            1.291
        )
    })
})
