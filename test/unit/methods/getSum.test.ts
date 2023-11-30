import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("getSum", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
        await simpleNodeDB.loadData("data", ["test/data/files/data.json"])
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should return the sum", async () => {
        assert.deepStrictEqual(await simpleNodeDB.getSum("data", "key1"), 10)
    })
})
