import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("getQuantile", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
        await simpleNodeDB.loadData("data", ["test/data/files/data.json"])
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should return a quantile", async () => {
        assert.deepStrictEqual(
            await simpleNodeDB.getQuantile("data", "key1", 0.25),
            1.75
        )
    })
    it("should return a quantile rounded", async () => {
        assert.deepStrictEqual(
            await simpleNodeDB.getQuantile("data", "key1", 0.25, {
                decimals: 1,
            }),
            1.8
        )
    })
    it("should return the median with a quantile of 0.5", async () => {
        assert.deepStrictEqual(
            await simpleNodeDB.getQuantile("data", "key1", 0.5),
            2.5
        )
    })
})
