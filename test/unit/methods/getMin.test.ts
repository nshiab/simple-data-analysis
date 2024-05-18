import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("getMin", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
        await sdb.loadData("data", ["test/data/files/data.json"])
    })
    after(async function () {
        await sdb.done()
    })

    it("should return the min value", async () => {
        assert.deepStrictEqual(await sdb.getMin("data", "key1"), 1)
    })
})
