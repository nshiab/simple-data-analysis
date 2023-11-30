import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("getValuesCount", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
        await simpleNodeDB.loadData("data", ["test/data/files/data.json"])
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should return the number of data points", async () => {
        assert.deepStrictEqual(await simpleNodeDB.getValuesCount("data"), 8)
    })
})
