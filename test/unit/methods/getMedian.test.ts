import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("getMedian", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
        await sdb.loadData("data", ["test/data/files/data.json"])
    })
    after(async function () {
        await sdb.done()
    })

    it("should return the median value", async () => {
        assert.deepStrictEqual(await sdb.getMedian("data", "key1"), 2.5)
    })
    it("should return the median value rounded", async () => {
        assert.deepStrictEqual(
            await sdb.getMedian("data", "key1", { decimals: 0 }),
            3
        )
    })
})
