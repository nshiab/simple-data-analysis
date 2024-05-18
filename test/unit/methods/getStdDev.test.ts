import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("getStdDev", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
        await sdb.loadData("data", ["test/data/files/data.json"])
    })
    after(async function () {
        await sdb.done()
    })

    it("should return the standard deviation", async () => {
        assert.deepStrictEqual(
            await sdb.getStdDev("data", "key1"),
            1.2909944487358056
        )
    })
    it("should return the standard deviation rounded", async () => {
        assert.deepStrictEqual(
            await sdb.getStdDev("data", "key1", { decimals: 3 }),
            1.291
        )
    })
})
