import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("getMean", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
        await simpleNodeDB.loadData("data", ["test/data/files/data.json"])
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should return the mean value", async () => {
        assert.deepStrictEqual(await simpleNodeDB.getMean("data", "key1"), 2.5)
    })

    it("should return the mean value rounded", async () => {
        assert.deepStrictEqual(
            await simpleNodeDB.getMean("data", "key1", { decimals: 0 }),
            3
        )
    })
})
