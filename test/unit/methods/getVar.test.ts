import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("getVar", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = await new SimpleNodeDB().start()
        await simpleNodeDB.loadData("data", ["test/data/files/data.json"])
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should return the variance", async () => {
        assert.deepStrictEqual(
            await simpleNodeDB.getVar("data", "key1"),
            1.6666666666666667
        )
    })
    it("should return the variance rounded", async () => {
        assert.deepStrictEqual(
            await simpleNodeDB.getVar("data", "key1", { decimals: 6 }),
            1.666667
        )
    })
})
