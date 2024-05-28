import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("getVar", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should return the variance", async () => {
        const table = sdb.newTable("data")
        await table.loadData(["test/data/files/data.json"])
        assert.deepStrictEqual(await table.getVar("key1"), 1.6666666666666667)
    })
    it("should return the variance rounded", async () => {
        const table = sdb.newTable("data")
        await table.loadData(["test/data/files/data.json"])
        assert.deepStrictEqual(
            await table.getVar("key1", { decimals: 6 }),
            1.666667
        )
    })
})
