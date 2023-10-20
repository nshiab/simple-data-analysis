import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("getMedian", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = await new SimpleNodeDB().start()
        await simpleNodeDB.loadData("data", ["test/data/files/data.json"])
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should return the median value", async () => {
        assert.deepStrictEqual(
            await simpleNodeDB.getMedian("data", "key1"),
            2.5
        )
    })
    it("should return the median value rounded", async () => {
        assert.deepStrictEqual(
            await simpleNodeDB.getMedian("data", "key1", { decimals: 0 }),
            3
        )
    })
})
