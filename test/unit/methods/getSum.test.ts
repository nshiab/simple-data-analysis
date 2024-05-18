import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("getSum", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
        await sdb.loadData("data", ["test/data/files/data.json"])
    })
    after(async function () {
        await sdb.done()
    })

    it("should return the sum", async () => {
        assert.deepStrictEqual(await sdb.getSum("data", "key1"), 10)
    })
})
