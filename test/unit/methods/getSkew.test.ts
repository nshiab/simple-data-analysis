import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("getSkew", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should return the skew", async () => {
        const table = sdb.newTable("data")
        await table.loadData(["test/data/files/dataJustNumbers.csv"])
        assert.deepStrictEqual(await table.getSkew("key1"), 1.6460497551716866)
    })
    it("should return the skew rounded", async () => {
        const table = sdb.newTable("data")
        await table.loadData(["test/data/files/dataJustNumbers.csv"])
        assert.deepStrictEqual(
            await table.getSkew("key1", { decimals: 2 }),
            1.65
        )
    })
})
