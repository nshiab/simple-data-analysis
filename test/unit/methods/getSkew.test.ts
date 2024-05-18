import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("getSkew", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
        await sdb.loadData("data", ["test/data/files/dataJustNumbers.csv"])
    })
    after(async function () {
        await sdb.done()
    })

    it("should return the skew", async () => {
        assert.deepStrictEqual(
            await sdb.getSkew("data", "key1"),
            1.6460497551716866
        )
    })
    it("should return the skew rounded", async () => {
        assert.deepStrictEqual(
            await sdb.getSkew("data", "key1", { decimals: 2 }),
            1.65
        )
    })
})
