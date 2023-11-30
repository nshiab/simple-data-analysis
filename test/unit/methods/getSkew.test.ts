import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("getSkew", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
        await simpleNodeDB.loadData("data", [
            "test/data/files/dataJustNumbers.csv",
        ])
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should return the skew", async () => {
        assert.deepStrictEqual(
            await simpleNodeDB.getSkew("data", "key1"),
            1.6460497551716866
        )
    })
    it("should return the skew rounded", async () => {
        assert.deepStrictEqual(
            await simpleNodeDB.getSkew("data", "key1", { decimals: 2 }),
            1.65
        )
    })
})
