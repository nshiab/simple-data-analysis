import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("getQuantile", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should return a quantile", async () => {
        const table = sdb.newTable("data")
        await table.loadData("test/data/files/data.json")
        assert.deepStrictEqual(await table.getQuantile("key1", 0.25), 1.75)
    })
    it("should return a quantile rounded", async () => {
        const table = sdb.newTable("data")
        await table.loadData("test/data/files/data.json")
        assert.deepStrictEqual(
            await table.getQuantile("key1", 0.25, {
                decimals: 1,
            }),
            1.8
        )
    })
    it("should return the median with a quantile of 0.5", async () => {
        const table = sdb.newTable("data")
        await table.loadData("test/data/files/data.json")
        assert.deepStrictEqual(await table.getQuantile("key1", 0.5), 2.5)
    })
})
