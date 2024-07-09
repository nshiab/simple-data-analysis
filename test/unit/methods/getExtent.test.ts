import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("getExtent", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should return the extent in [min, max] order", async () => {
        const table = sdb.newTable("data")
        await table.loadData(["test/data/files/data.json"])
        assert.deepStrictEqual(await table.getExtent("key1"), [1, 4])
    })
})
