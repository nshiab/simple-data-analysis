import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("getStdDev", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
        await simpleNodeDB.loadData("data", ["test/data/files/data.json"])
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should return the standard deviation", async () => {
        assert.deepStrictEqual(
            await simpleNodeDB.getStdDev("data", "key1"),
            1.2909944487358056
        )
    })
    it("should return the standard deviation rounded", async () => {
        assert.deepStrictEqual(
            await simpleNodeDB.getStdDev("data", "key1", { decimals: 3 }),
            1.291
        )
    })
})
