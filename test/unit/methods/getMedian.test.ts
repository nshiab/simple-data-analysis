import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("getMedian", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should return the median value", async () => {
        const table = sdb.newTable("data")
        await table.loadData("test/data/files/data.json")
        assert.deepStrictEqual(await table.getMedian("key1"), 2.5)
    })
    it("should return the median value rounded", async () => {
        const table = sdb.newTable("data")
        await table.loadData("test/data/files/data.json")
        assert.deepStrictEqual(
            await table.getMedian("key1", { decimals: 0 }),
            3
        )
    })
})
