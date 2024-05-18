import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("getValuesCount", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
        await sdb.loadData("data", ["test/data/files/data.json"])
    })
    after(async function () {
        await sdb.done()
    })

    it("should return the number of data points", async () => {
        assert.deepStrictEqual(await sdb.getValuesCount("data"), 8)
    })
})
